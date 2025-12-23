const prisma = require('../config/prisma');
const PushNotificationService = require('../services/pushNotificationService');

/**
 * Helper function: Get role hierarchy level
 * Level 1 = Kepala Dinas
 * Level 2 = Sekretaris Dinas  
 * Level 3 = Kepala Bidang (kabid_*)
 * Level 4+ = Staff/Pegawai
 */
const getRoleLevel = (role) => {
  if (role === 'kepala_dinas') return 1;
  if (role === 'sekretaris_dinas') return 2;
  if (role.startsWith('kabid_')) return 3;
  if (role === 'pegawai' || role === 'sekretariat') return 4;
  return 5; // Other roles
};

/**
 * Helper function: Validate workflow transition
 */
const validateWorkflowTransition = (fromRole, toRole) => {
  const fromLevel = getRoleLevel(fromRole);
  const toLevel = getRoleLevel(toRole);

  // Workflow rules:
  // Level 1 (Kepala Dinas) → can only send to Level 2 (Sekretaris Dinas)
  // Level 2 (Sekretaris Dinas) → can only send to Level 3 (Kepala Bidang)
  // Level 3 (Kepala Bidang) → can send to Level 4+ (Staff/Pegawai)
  // Level 4+ (Pegawai/Staff) → CANNOT create disposisi

  // Block pegawai/staff from creating disposisi
  if (fromLevel >= 4) {
    return { valid: false, message: 'Pegawai/Staff tidak memiliki akses untuk membuat disposisi' };
  }

  if (fromLevel === 1 && toLevel !== 2) {
    return { valid: false, message: 'Kepala Dinas hanya bisa mendisposisi ke Sekretaris Dinas' };
  }

  if (fromLevel === 2 && toLevel !== 3) {
    return { valid: false, message: 'Sekretaris Dinas hanya bisa mendisposisi ke Kepala Bidang' };
  }

  if (fromLevel === 3 && toLevel < 4) {
    return { valid: false, message: 'Kepala Bidang hanya bisa mendisposisi ke Staff/Pegawai' };
  }

  return { valid: true };
};

/**
 * @route POST /api/disposisi
 * @desc Create disposisi (disposisi ke level berikutnya)
 */
exports.createDisposisi = async (req, res, next) => {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('📝 [DISPOSISI] CREATE REQUEST RECEIVED');
    console.log('═══════════════════════════════════════');
    
    const {
      surat_id,
      ke_user_id,
      catatan,
      instruksi,
      level_disposisi,
    } = req.body;

    const dari_user_id = req.user.id;
    const dari_user_role = req.user.role;
    
    console.log('📋 Request Data:', {
      surat_id,
      dari_user_id: dari_user_id.toString(),
      dari_user_role,
      ke_user_id: ke_user_id.toString(),
      instruksi,
      level_disposisi
    });

    // Block pegawai/staff from creating disposisi
    const userLevel = getRoleLevel(dari_user_role);
    if (userLevel >= 4) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk membuat disposisi. Hanya Kepala Dinas, Sekretaris Dinas, dan Kepala Bidang yang dapat membuat disposisi.',
      });
    }

    // Validate ke_user exists
    const keUser = await prisma.users.findUnique({
      where: { id: BigInt(ke_user_id) },
    });

    if (!keUser) {
      return res.status(404).json({
        success: false,
        message: 'User tujuan tidak ditemukan',
      });
    }

    // Validate workflow hierarchy
    const workflowValidation = validateWorkflowTransition(dari_user_role, keUser.role);
    if (!workflowValidation.valid) {
      return res.status(400).json({
        success: false,
        message: workflowValidation.message,
      });
    }

    // Create disposisi
    const disposisi = await prisma.disposisi.create({
      data: {
        surat_id: BigInt(surat_id),
        dari_user_id: BigInt(dari_user_id),
        ke_user_id: BigInt(ke_user_id),
        catatan,
        instruksi: instruksi || 'biasa',
        status: 'pending',
        level_disposisi: parseInt(level_disposisi),
      },
      include: {
        surat_masuk: {
          select: {
            id: true,
            nomor_surat: true,
            perihal: true,
            pengirim: true,
            tanggal_surat: true,
          },
        },
        users_disposisi_dari_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
        users_disposisi_ke_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Send push notification to recipient
    console.log('\n📨 [DISPOSISI] Starting push notification process...');
    try {
      console.log('📋 [PUSH] Notification data preparation:', {
        disposisi_id: disposisi.id.toString(),
        ke_user_id: ke_user_id.toString(),
        dari_user: disposisi.users_disposisi_dari_user_idTousers?.name,
        perihal: disposisi.surat_masuk?.perihal
      });

      const notificationData = {
        id: disposisi.id,
        perihal: disposisi.surat_masuk?.perihal || 'Disposisi baru',
        nomor_surat: disposisi.surat_masuk?.nomor_surat,
        dari_user: disposisi.users_disposisi_dari_user_idTousers?.name,
        instruksi: disposisi.instruksi,
        catatan: disposisi.catatan
      };
      
      console.log('📤 [PUSH] Calling PushNotificationService.notifyNewDisposisi...');
      console.log('📤 [PUSH] Target user IDs:', [Number(ke_user_id)]);

      const result = await PushNotificationService.notifyNewDisposisi(
        notificationData,
        [Number(ke_user_id)]
      );
      
      console.log('✅ [PUSH] Notification sent! Result:', JSON.stringify(result, null, 2));
      console.log('═══════════════════════════════════════\n');
    } catch (notifError) {
      console.error('\n❌ [PUSH] ERROR sending push notification!');
      console.error('Error message:', notifError.message);
      console.error('Error stack:', notifError.stack);
      console.error('═══════════════════════════════════════\n');
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Disposisi berhasil dibuat',
      data: disposisi,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/disposisi/masuk
 * @desc Get disposisi yang diterima user (inbox)
 */
exports.getDisposisiMasuk = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    console.log('[getDisposisiMasuk] Query params:', {
      userId: userId?.toString(),
      userRole: req.user.role,
      status,
      page,
      limit,
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ke_user_id: BigInt(userId),
    };

    if (status) where.status = status;

    console.log('[getDisposisiMasuk] Where clause:', {
      ke_user_id: where.ke_user_id?.toString(),
      status: where.status,
    });

    const [total, disposisi] = await Promise.all([
      prisma.disposisi.count({ where }),
      prisma.disposisi.findMany({
        where,
        include: {
          surat_masuk: {
            select: {
              id: true,
              nomor_surat: true,
              tanggal_surat: true,
              pengirim: true,
              perihal: true,
              jenis_surat: true,
              file_path: true,
            },
          },
          users_disposisi_dari_user_idTousers: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { tanggal_disposisi: 'desc' },
        skip,
        take,
      }),
    ]);

    console.log(`[getDisposisiMasuk] Found ${total} total disposisi, returning ${disposisi.length} items`);

    // Transform response untuk frontend compatibility
    const transformedDisposisi = disposisi.map(d => ({
      ...d,
      surat: d.surat_masuk, // Alias untuk frontend
      dari_user: d.users_disposisi_dari_user_idTousers, // Alias untuk frontend
    }));

    res.json({
      success: true,
      data: transformedDisposisi,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[getDisposisiMasuk] Error:', error.message);
    console.error('[getDisposisiMasuk] Stack:', error.stack);
    next(error);
  }
};

/**
 * @route GET /api/disposisi/keluar
 * @desc Get disposisi yang dikirim user (outbox)
 */
exports.getDisposisiKeluar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      dari_user_id: BigInt(userId),
    };

    if (status) where.status = status;

    const [total, disposisi] = await Promise.all([
      prisma.disposisi.count({ where }),
      prisma.disposisi.findMany({
        where,
        include: {
          surat_masuk: {
            select: {
              id: true,
              nomor_surat: true,
              tanggal_surat: true,
              pengirim: true,
              perihal: true,
              jenis_surat: true,
            },
          },
          users_disposisi_ke_user_idTousers: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { tanggal_disposisi: 'desc' },
        skip,
        take,
      }),
    ]);

    // Transform response untuk frontend compatibility
    const transformedDisposisi = disposisi.map(d => ({
      ...d,
      surat: d.surat_masuk, // Alias untuk frontend
      ke_user: d.users_disposisi_ke_user_idTousers, // Alias untuk frontend
    }));

    res.json({
      success: true,
      data: transformedDisposisi,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/disposisi/:id
 * @desc Get detail disposisi dengan history lengkap
 */
exports.getDisposisiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disposisi = await prisma.disposisi.findUnique({
      where: { id: BigInt(id) },
      include: {
        surat_masuk: {
          include: {
            users: {
              select: { id: true, name: true, email: true },
            },
            disposisi: {
              include: {
                users_disposisi_dari_user_idTousers: {
                  select: { id: true, name: true, email: true, role: true },
                },
                users_disposisi_ke_user_idTousers: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { level_disposisi: 'asc' },
            },
          },
        },
        users_disposisi_dari_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
        users_disposisi_ke_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!disposisi) {
      return res.status(404).json({
        success: false,
        message: 'Disposisi tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: disposisi,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/disposisi/:id/baca
 * @desc Mark disposisi as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const disposisi = await prisma.disposisi.findUnique({
      where: { id: BigInt(id) },
    });

    if (!disposisi) {
      return res.status(404).json({
        success: false,
        message: 'Disposisi tidak ditemukan',
      });
    }

    if (disposisi.ke_user_id !== BigInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke disposisi ini',
      });
    }

    const updated = await prisma.disposisi.update({
      where: { id: BigInt(id) },
      data: {
        status: 'dibaca',
        tanggal_dibaca: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Disposisi ditandai sudah dibaca',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/disposisi/:id/status
 * @desc Update status disposisi (proses, selesai, teruskan)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const disposisi = await prisma.disposisi.findUnique({
      where: { id: BigInt(id) },
    });

    if (!disposisi) {
      return res.status(404).json({
        success: false,
        message: 'Disposisi tidak ditemukan',
      });
    }

    if (disposisi.ke_user_id !== BigInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke disposisi ini',
      });
    }

    const updateData = { status };

    if (status === 'selesai') {
      updateData.tanggal_selesai = new Date();
    }

    const updated = await prisma.disposisi.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Status disposisi berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/disposisi/history/:surat_id
 * @desc Get complete disposisi history untuk tracking
 */
exports.getDisposisiHistory = async (req, res, next) => {
  try {
    const { surat_id } = req.params;

    const disposisi = await prisma.disposisi.findMany({
      where: { surat_id: BigInt(surat_id) },
      include: {
        users_disposisi_dari_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
        users_disposisi_ke_user_idTousers: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { level_disposisi: 'asc' },
    });

    res.json({
      success: true,
      data: disposisi,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/disposisi/statistik
 * @desc Get statistik disposisi user (untuk dashboard)
 */
exports.getStatistik = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [pending, dibaca, proses, selesai, totalMasuk, totalKeluar] = await Promise.all([
      prisma.disposisi.count({
        where: { ke_user_id: BigInt(userId), status: 'pending' },
      }),
      prisma.disposisi.count({
        where: { ke_user_id: BigInt(userId), status: 'dibaca' },
      }),
      prisma.disposisi.count({
        where: { ke_user_id: BigInt(userId), status: 'proses' },
      }),
      prisma.disposisi.count({
        where: { ke_user_id: BigInt(userId), status: 'selesai' },
      }),
      prisma.disposisi.count({
        where: { ke_user_id: BigInt(userId) },
      }),
      prisma.disposisi.count({
        where: { dari_user_id: BigInt(userId) },
      }),
    ]);

    res.json({
      success: true,
      data: {
        masuk: {
          pending,
          dibaca,
          proses,
          selesai,
          total: totalMasuk,
        },
        keluar: {
          total: totalKeluar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/disposisi/available-users
 * @desc Get users yang boleh menerima disposisi berdasarkan workflow hierarchy
 */
exports.getAvailableUsers = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const fromLevel = getRoleLevel(userRole);

    let whereClause = {};

    // Kepala Dinas (level 1) → only Sekretaris Dinas
    if (fromLevel === 1) {
      whereClause = {
        role: 'sekretaris_dinas'
      };
    }
    // Sekretaris Dinas (level 2) → only Kepala Bidang
    else if (fromLevel === 2) {
      whereClause = {
        role: {
          in: [
            'kabid_sekretariat',
            'kabid_pemerintahan_desa',
            'kabid_spked',
            'kabid_kekayaan_keuangan_desa',
            'kabid_pemberdayaan_masyarakat_desa'
          ]
        }
      };
    }
    // Kepala Bidang (level 3) → Staff/Pegawai DALAM BIDANG YANG SAMA
    else if (fromLevel === 3) {
      // Get current user's bidang_id
      const currentUser = await prisma.users.findUnique({
        where: { id: BigInt(userId) },
        select: { bidang_id: true }
      });

      if (!currentUser || !currentUser.bidang_id) {
        return res.status(400).json({
          success: false,
          message: 'Kepala Bidang harus terdaftar dalam bidang tertentu'
        });
      }

      // Filter pegawai/sekretariat dalam bidang yang sama
      whereClause = {
        role: { in: ['pegawai', 'sekretariat'] },
        bidang_id: currentUser.bidang_id
      };
    }
    // Others → all users except self
    else {
      const allUsers = await prisma.users.findMany({
        where: {
          id: { not: BigInt(userId) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bidang_id: true,
        },
      });

      return res.json({
        success: true,
        data: allUsers,
      });
    }

    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bidang_id: true,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
