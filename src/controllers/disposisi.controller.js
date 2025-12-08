const prisma = require('../models/prisma');

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
  // Level 4+ can send anywhere

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
    const {
      surat_id,
      ke_user_id,
      catatan,
      instruksi,
      level_disposisi,
    } = req.body;

    const dari_user_id = req.user.id;
    const dari_user_role = req.user.role;

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
        surat: {
          select: {
            id: true,
            nomor_surat: true,
            perihal: true,
            pengirim: true,
            tanggal_surat: true,
          },
        },
        dari_user: {
          select: { id: true, name: true, email: true, role: true },
        },
        ke_user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ke_user_id: BigInt(userId),
    };

    if (status) where.status = status;

    const [total, disposisi] = await Promise.all([
      prisma.disposisi.count({ where }),
      prisma.disposisi.findMany({
        where,
        include: {
          surat: {
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
          dari_user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { tanggal_disposisi: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({
      success: true,
      data: disposisi,
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
          surat: {
            select: {
              id: true,
              nomor_surat: true,
              tanggal_surat: true,
              pengirim: true,
              perihal: true,
              jenis_surat: true,
            },
          },
          ke_user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { tanggal_disposisi: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({
      success: true,
      data: disposisi,
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
        surat: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
            disposisi: {
              include: {
                dari_user: {
                  select: { id: true, name: true, email: true, role: true },
                },
                ke_user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { level_disposisi: 'asc' },
            },
          },
        },
        dari_user: {
          select: { id: true, name: true, email: true, role: true },
        },
        ke_user: {
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
        dari_user: {
          select: { id: true, name: true, email: true, role: true },
        },
        ke_user: {
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
    const fromLevel = getRoleLevel(userRole);

    let roleFilter = [];

    // Kepala Dinas (level 1) → only Sekretaris Dinas
    if (fromLevel === 1) {
      roleFilter = ['sekretaris_dinas'];
    }
    // Sekretaris Dinas (level 2) → only Kepala Bidang
    else if (fromLevel === 2) {
      roleFilter = [
        'kabid_sekretariat',
        'kabid_pemerintahan_desa',
        'kabid_spked',
        'kabid_kekayaan_keuangan_desa',
        'kabid_pemberdayaan_masyarakat_desa'
      ];
    }
    // Kepala Bidang (level 3) → Staff/Pegawai
    else if (fromLevel === 3) {
      roleFilter = ['pegawai', 'sekretariat'];
    }
    // Others → all users except self
    else {
      const allUsers = await prisma.users.findMany({
        where: {
          id: { not: BigInt(req.user.id) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return res.json({
        success: true,
        data: allUsers,
      });
    }

    const users = await prisma.users.findMany({
      where: {
        role: { in: roleFilter },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
