const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Get all verifikator for a dinas
 */
exports.getAllVerifikator = async (req, res) => {
  try {
    const { dinasId } = req.params;
    const dinasIdInt = parseInt(dinasId);
    
    // Check if table exists first
    const tableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as cnt FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'dinas_verifikator'
    `;
    
    if (!tableExists[0] || tableExists[0].cnt === 0n) {
      // Table doesn't exist, return empty array
      return res.json({
        success: true,
        data: []
      });
    }
    
    const verifikators = await prisma.$queryRaw`
      SELECT 
        dv.id,
        dv.dinas_id,
        dv.user_id,
        dv.nama,
        dv.nip,
        dv.jabatan,
        dv.email,
        dv.is_active,
        dv.created_at,
        u.name as username,
        u.email as user_email
      FROM dinas_verifikator dv
      JOIN users u ON dv.user_id = u.id
      WHERE dv.dinas_id = ${dinasIdInt}
      ORDER BY dv.created_at DESC
    `;
    
    res.json({
      success: true,
      data: verifikators
    });
  } catch (error) {
    logger.error('Error getting verifikators:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data verifikator',
      error: error.message
    });
  }
};

/**
 * Create new verifikator account
 */
exports.createVerifikator = async (req, res) => {
  try {
    const { dinasId } = req.params;
    const { nama, nip, jabatan, email, password } = req.body;
    const createdBy = BigInt(req.user.id);
    const dinasIdInt = parseInt(dinasId);

    // Validation
    if (!nama || !jabatan || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, jabatan, email, dan password wajib diisi'
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.users.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account (use 'name' not 'username')
    const newUser = await prisma.users.create({
      data: {
        name: nama,
        email,
        password: hashedPassword,
        role: 'verifikator_dinas',
        dinas_id: dinasIdInt,
        is_active: true
      }
    });

    // Create verifikator record
    const newUserId = BigInt(newUser.id);
    const nipValue = nip || null;
    const now = new Date();
    const verifikator = await prisma.$executeRaw`
      INSERT INTO dinas_verifikator (dinas_id, user_id, nama, nip, jabatan, email, created_by, created_at, updated_at)
      VALUES (${dinasIdInt}, ${newUserId}, ${nama}, ${nipValue}, ${jabatan}, ${email}, ${createdBy}, ${now}, ${now})
    `;

    logger.info(`Verifikator created: ${nama} (${email}) by user ${createdBy}`);

    res.status(201).json({
      success: true,
      message: 'Verifikator berhasil dibuat',
      data: {
        user_id: newUser.id,
        name: newUser.name,
        nama,
        email
      }
    });
  } catch (error) {
    logger.error('Error creating verifikator:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat verifikator',
      error: error.message
    });
  }
};

/**
 * Update verifikator info
 */
exports.updateVerifikator = async (req, res) => {
  try {
    const { dinasId, verifikatorId } = req.params;
    const { nama, nip, jabatan, email } = req.body;
    const dinasIdInt = parseInt(dinasId);
    const verifikatorIdInt = parseInt(verifikatorId);
    const nipValue = nip || null;

    // Get verifikator to find user_id
    const verifikator = await prisma.$queryRaw`
      SELECT user_id FROM dinas_verifikator 
      WHERE id = ${verifikatorIdInt} AND dinas_id = ${dinasIdInt}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Verifikator tidak ditemukan'
      });
    }

    const userId = verifikator[0].user_id;

    // Update verifikator info
    await prisma.$executeRaw`
      UPDATE dinas_verifikator 
      SET nama = ${nama}, nip = ${nipValue}, jabatan = ${jabatan}, email = ${email}
      WHERE id = ${verifikatorIdInt}
    `;

    // Update user email and name if changed
    if (email || nama) {
      const updateData = {};
      if (email) updateData.email = email;
      if (nama) updateData.name = nama;
      
      await prisma.users.update({
        where: { id: userId },
        data: updateData
      });
    }

    logger.info(`Verifikator updated: ID ${verifikatorId}`);

    res.json({
      success: true,
      message: 'Verifikator berhasil diupdate'
    });
  } catch (error) {
    logger.error('Error updating verifikator:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate verifikator',
      error: error.message
    });
  }
};

/**
 * Toggle verifikator active status
 */
exports.toggleVerifikatorStatus = async (req, res) => {
  try {
    const { dinasId, verifikatorId } = req.params;
    const dinasIdInt = parseInt(dinasId);
    const verifikatorIdInt = parseInt(verifikatorId);

    // Get current status and user_id
    const verifikator = await prisma.$queryRaw`
      SELECT user_id, is_active FROM dinas_verifikator 
      WHERE id = ${verifikatorIdInt} AND dinas_id = ${dinasIdInt}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Verifikator tidak ditemukan'
      });
    }

    const newStatus = !verifikator[0].is_active;
    const userId = verifikator[0].user_id;

    // Update verifikator status
    await prisma.$executeRaw`
      UPDATE dinas_verifikator 
      SET is_active = ${newStatus}
      WHERE id = ${verifikatorIdInt}
    `;

    // Update user active status too
    await prisma.users.update({
      where: { id: userId },
      data: { is_active: newStatus }
    });

    logger.info(`Verifikator status toggled: ID ${verifikatorId} to ${newStatus}`);

    res.json({
      success: true,
      message: `Verifikator berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: { is_active: newStatus }
    });
  } catch (error) {
    logger.error('Error toggling verifikator status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status verifikator',
      error: error.message
    });
  }
};

/**
 * Reset verifikator password
 */
exports.resetVerifikatorPassword = async (req, res) => {
  try {
    const { dinasId, verifikatorId } = req.params;
    let { new_password } = req.body || {};
    const dinasIdInt = parseInt(dinasId);
    const verifikatorIdInt = parseInt(verifikatorId);

    // Auto-generate password if not provided
    if (!new_password) {
      new_password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Get user_id
    const verifikator = await prisma.$queryRaw`
      SELECT user_id FROM dinas_verifikator 
      WHERE id = ${verifikatorIdInt} AND dinas_id = ${dinasIdInt}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Verifikator tidak ditemukan'
      });
    }

    const userId = verifikator[0].user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    logger.info(`Verifikator password created: ID ${verifikatorId}`);

    res.json({
      success: true,
      message: 'Password baru berhasil dibuat',
      data: { newPassword: new_password }
    });
  } catch (error) {
    logger.error('Error resetting verifikator password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal reset password verifikator',
      error: error.message
    });
  }
};

/**
 * Delete verifikator
 */
exports.deleteVerifikator = async (req, res) => {
  try {
    const { dinasId, verifikatorId } = req.params;
    const dinasIdInt = parseInt(dinasId);
    const verifikatorIdInt = parseInt(verifikatorId);

    // Get user_id before deleting
    const verifikator = await prisma.$queryRaw`
      SELECT user_id FROM dinas_verifikator 
      WHERE id = ${verifikatorIdInt} AND dinas_id = ${dinasIdInt}
      LIMIT 1
    `;

    if (!verifikator || verifikator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Verifikator tidak ditemukan'
      });
    }

    const userId = verifikator[0].user_id;

    // Delete verifikator record (will cascade to user if needed)
    await prisma.$executeRaw`
      DELETE FROM dinas_verifikator WHERE id = ${verifikatorIdInt}
    `;

    // Delete user account
    await prisma.users.delete({
      where: { id: userId }
    });

    logger.info(`Verifikator deleted: ID ${verifikatorId}, User ID ${userId}`);

    res.json({
      success: true,
      message: 'Verifikator berhasil dihapus'
    });
  } catch (error) {
    logger.error('Error deleting verifikator:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus verifikator',
      error: error.message
    });
  }
};
