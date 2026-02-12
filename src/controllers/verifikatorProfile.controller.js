const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Get current verifikator's profile
 * Only for verifikator_dinas role
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const dinasId = req.user.dinas_id;

    if (!dinasId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak terdaftar pada dinas manapun'
      });
    }

    // Get verifikator profile
    const verifikator = await prisma.$queryRaw`
      SELECT 
        dv.id,
        dv.dinas_id,
        dv.user_id,
        dv.nama,
        dv.nip,
        dv.jabatan,
        dv.pangkat_golongan,
        dv.email,
        dv.ttd_path,
        dv.is_active,
        dv.created_at,
        md.nama_dinas,
        md.singkatan as dinas_singkatan
      FROM dinas_verifikator dv
      JOIN master_dinas md ON dv.dinas_id = md.id
      WHERE dv.user_id = ${userId} AND dv.dinas_id = ${dinasId}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil verifikator tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: verifikator[0]
    });
  } catch (error) {
    logger.error('Error getting verifikator profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil verifikator',
      error: error.message
    });
  }
};

/**
 * Update current verifikator's profile
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const dinasId = req.user.dinas_id;
    const { nama, nip, jabatan, pangkat_golongan } = req.body;

    if (!dinasId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak terdaftar pada dinas manapun'
      });
    }

    // Validation
    if (!nama || !jabatan) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan jabatan wajib diisi'
      });
    }

    const nipValue = nip || null;
    const pangkatValue = pangkat_golongan || null;

    // Update verifikator profile
    await prisma.$executeRaw`
      UPDATE dinas_verifikator 
      SET nama = ${nama}, nip = ${nipValue}, jabatan = ${jabatan}, pangkat_golongan = ${pangkatValue}
      WHERE user_id = ${userId} AND dinas_id = ${dinasId}
    `;

    // Also update user name
    await prisma.users.update({
      where: { id: userId },
      data: { name: nama }
    });

    logger.info(`Verifikator profile updated: user_id ${userId}`);

    res.json({
      success: true,
      message: 'Profil berhasil diupdate'
    });
  } catch (error) {
    logger.error('Error updating verifikator profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate profil',
      error: error.message
    });
  }
};

/**
 * Upload TTD (tanda tangan) for verifikator
 */
exports.uploadTTD = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const dinasId = req.user.dinas_id;

    if (!dinasId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak terdaftar pada dinas manapun'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File TTD tidak ditemukan'
      });
    }

    // Get current verifikator to check for old TTD
    const verifikator = await prisma.$queryRaw`
      SELECT ttd_path FROM dinas_verifikator 
      WHERE user_id = ${userId} AND dinas_id = ${dinasId}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      // Delete uploaded file
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Profil verifikator tidak ditemukan'
      });
    }

    // Delete old TTD file if exists
    const oldTtdPath = verifikator[0].ttd_path;
    if (oldTtdPath) {
      const oldFullPath = path.join(__dirname, '../../storage', oldTtdPath);
      if (fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
        logger.info(`Deleted old TTD: ${oldTtdPath}`);
      }
    }

    // Move file from temp to permanent location
    const tempPath = req.file.path;
    const ext = path.extname(req.file.originalname);
    const filename = `ttd_verifikator_${userId}_${Date.now()}${ext}`;
    const uploadDir = path.join(__dirname, '../../storage/uploads/verifikator_ttd');
    const finalPath = path.join(uploadDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file
    fs.renameSync(tempPath, finalPath);

    // Store relative path in database
    const relativePath = `uploads/verifikator_ttd/${filename}`;

    // Update database
    await prisma.$executeRaw`
      UPDATE dinas_verifikator 
      SET ttd_path = ${relativePath}
      WHERE user_id = ${userId} AND dinas_id = ${dinasId}
    `;

    logger.info(`TTD uploaded for verifikator: user_id ${userId}, path: ${relativePath}`);

    res.json({
      success: true,
      message: 'Tanda tangan berhasil diupload',
      data: {
        ttd_path: relativePath
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    logger.error('Error uploading verifikator TTD:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupload tanda tangan',
      error: error.message
    });
  }
};

/**
 * Delete TTD for verifikator
 */
exports.deleteTTD = async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    const dinasId = req.user.dinas_id;

    if (!dinasId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak terdaftar pada dinas manapun'
      });
    }

    // Get current TTD path
    const verifikator = await prisma.$queryRaw`
      SELECT ttd_path FROM dinas_verifikator 
      WHERE user_id = ${userId} AND dinas_id = ${dinasId}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil verifikator tidak ditemukan'
      });
    }

    const ttdPath = verifikator[0].ttd_path;
    if (ttdPath) {
      // Delete file
      const fullPath = path.join(__dirname, '../../storage', ttdPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`Deleted TTD file: ${ttdPath}`);
      }

      // Clear from database
      await prisma.$executeRaw`
        UPDATE dinas_verifikator 
        SET ttd_path = NULL
        WHERE user_id = ${userId} AND dinas_id = ${dinasId}
      `;
    }

    res.json({
      success: true,
      message: 'Tanda tangan berhasil dihapus'
    });
  } catch (error) {
    logger.error('Error deleting verifikator TTD:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus tanda tangan',
      error: error.message
    });
  }
};
