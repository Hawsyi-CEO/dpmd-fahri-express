const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs').promises;
const { sendDisposisiNotification } = require('./pushNotifications.controller');

/**
 * @route POST /api/surat-masuk
 * @desc Create surat masuk (Sekretariat only)
 */
exports.createSuratMasuk = async (req, res, next) => {
  try {
    const {
      nomor_surat,
      tanggal_surat,
      tanggal_terima,
      pengirim,
      perihal,
      jenis_surat,
      keterangan,
    } = req.body;

    const created_by = req.user.id;

    // Validate nomor_surat unique
    const existingSurat = await prisma.surat_masuk.findUnique({
      where: { nomor_surat },
    });

    if (existingSurat) {
      return res.status(400).json({
        success: false,
        message: 'Nomor surat sudah terdaftar',
      });
    }

    const surat = await prisma.surat_masuk.create({
      data: {
        nomor_surat,
        tanggal_surat: new Date(tanggal_surat),
        tanggal_terima: tanggal_terima ? new Date(tanggal_terima) : new Date(),
        pengirim,
        perihal,
        jenis_surat: jenis_surat || 'biasa',
        keterangan,
        status: 'draft',
        created_by,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Surat masuk berhasil dibuat',
      data: surat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/surat-masuk/:id/upload
 * @desc Upload file surat (PDF/JPG/PNG)
 */
exports.uploadFileSurat = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan',
      });
    }

    const surat = await prisma.surat_masuk.findUnique({
      where: { id: BigInt(id) },
    });

    if (!surat) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Surat tidak ditemukan',
      });
    }

    // Delete old file if exists
    if (surat.file_path) {
      const oldFilePath = path.join(__dirname, '../../', surat.file_path);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.log('Old file not found, skip deletion');
      }
    }

    const updatedSurat = await prisma.surat_masuk.update({
      where: { id: BigInt(id) },
      data: {
        file_path: req.file.path.replace(/\\/g, '/'),
      },
    });

    res.json({
      success: true,
      message: 'File berhasil diupload',
      data: updatedSurat,
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};

/**
 * @route GET /api/surat-masuk
 * @desc Get all surat masuk with filters
 */
exports.getAllSuratMasuk = async (req, res, next) => {
  try {
    const { status, jenis_surat, search, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) where.status = status;
    if (jenis_surat) where.jenis_surat = jenis_surat;
    if (search) {
      where.OR = [
        { nomor_surat: { contains: search } },
        { pengirim: { contains: search } },
        { perihal: { contains: search } },
      ];
    }

    const [total, surat] = await Promise.all([
      prisma.surat_masuk.count({ where }),
      prisma.surat_masuk.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          disposisi: {
            select: { id: true, status: true, level_disposisi: true },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
        orderBy: { tanggal_terima: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({
      success: true,
      data: surat,
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
 * @route GET /api/surat-masuk/:id
 * @desc Get single surat masuk dengan history disposisi
 */
exports.getSuratMasukById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const surat = await prisma.surat_masuk.findUnique({
      where: { id: BigInt(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true },
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
        lampiran: {
          include: {
            uploader: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!surat) {
      return res.status(404).json({
        success: false,
        message: 'Surat tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data: surat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/surat-masuk/:id
 * @desc Update surat masuk
 */
exports.updateSuratMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert dates
    if (updateData.tanggal_surat) {
      updateData.tanggal_surat = new Date(updateData.tanggal_surat);
    }
    if (updateData.tanggal_terima) {
      updateData.tanggal_terima = new Date(updateData.tanggal_terima);
    }

    const surat = await prisma.surat_masuk.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Surat berhasil diupdate',
      data: surat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/surat-masuk/:id
 * @desc Delete surat masuk (cascade delete disposisi & lampiran)
 */
exports.deleteSuratMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;

    const surat = await prisma.surat_masuk.findUnique({
      where: { id: BigInt(id) },
    });

    if (!surat) {
      return res.status(404).json({
        success: false,
        message: 'Surat tidak ditemukan',
      });
    }

    // Delete file if exists
    if (surat.file_path) {
      const filePath = path.join(__dirname, '../../', surat.file_path);
      await fs.unlink(filePath).catch(console.error);
    }

    await prisma.surat_masuk.delete({
      where: { id: BigInt(id) },
    });

    res.json({
      success: true,
      message: 'Surat berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/surat-masuk/:id/kirim-kepala-dinas
 * @desc Kirim surat ke Kepala Dinas (create disposisi level 1)
 */
exports.kirimKeKepalaDinas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kepala_dinas_user_id, catatan, instruksi } = req.body;

    const dari_user_id = req.user.id;

    // Validate Kepala Dinas user
    const kepalaDinas = await prisma.users.findUnique({
      where: { id: BigInt(kepala_dinas_user_id) },
    });

    if (!kepalaDinas || kepalaDinas.role !== 'kepala_dinas') {
      return res.status(400).json({
        success: false,
        message: 'User Kepala Dinas tidak valid',
      });
    }

    // Create disposisi
    const disposisi = await prisma.disposisi.create({
      data: {
        surat_id: BigInt(id),
        dari_user_id: BigInt(dari_user_id),
        ke_user_id: BigInt(kepala_dinas_user_id),
        catatan,
        instruksi: instruksi || 'biasa',
        status: 'pending',
        level_disposisi: 1,
      },
      include: {
        dari_user: {
          select: { id: true, name: true, email: true },
        },
        ke_user: {
          select: { id: true, name: true, email: true },
        },
        surat: {
          select: { id: true, nomor_surat: true, perihal: true, pengirim: true },
        },
      },
    });

    // Update surat status
    await prisma.surat_masuk.update({
      where: { id: BigInt(id) },
      data: { status: 'dikirim' },
    });

    // Send push notification to recipient
    try {
      console.log('\n[SURAT] Attempting to send push notification to Kepala Dinas...');
      console.log('[SURAT] Disposisi created with ID:', disposisi.id?.toString());
      await sendDisposisiNotification(disposisi);
      console.log('[SURAT] ✅ Push notification sent to Kepala Dinas\n');
    } catch (notifError) {
      console.error('[SURAT] ❌ Error sending push notification:', notifError);
      console.error('[SURAT] Error stack:', notifError.stack);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Surat berhasil dikirim ke Kepala Dinas',
      data: disposisi,
    });
  } catch (error) {
    next(error);
  }
};