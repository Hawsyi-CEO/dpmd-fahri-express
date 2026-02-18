const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper function to generate random password
const generatePassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get all dinas with associated user account
router.get('/', async (req, res) => {
  try {
    const dinas = await prisma.master_dinas.findMany({
      where: { is_active: true },
      orderBy: { nama_dinas: 'asc' }
    });

    // Get user accounts and verifikator counts for all dinas
    const dinasWithAccounts = await Promise.all(dinas.map(async (d) => {
      const [userAccount, verifikatorCount] = await Promise.all([
        prisma.users.findFirst({
          where: { 
            dinas_id: d.id,
            role: 'dinas_terkait'
          },
          select: {
            id: true,
            name: true,
            email: true,
            plain_password: true,
            is_active: true,
            created_at: true
          }
        }),
        prisma.dinas_verifikator.count({
          where: { dinas_id: d.id, is_active: true }
        })
      ]);

      return {
        id: d.id,
        kode_dinas: d.kode_dinas,
        nama: d.nama_dinas,
        singkatan: d.singkatan,
        is_active: d.is_active,
        created_at: d.created_at,
        updated_at: d.updated_at,
        user_account: userAccount || null,
        verifikator_count: verifikatorCount
      };
    }));

    res.json({
      success: true,
      data: dinasWithAccounts
    });
  } catch (error) {
    console.error('Error fetching dinas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dinas',
      error: error.message
    });
  }
});

// Get single dinas by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dinas = await prisma.master_dinas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dinas) {
      return res.status(404).json({
        success: false,
        message: 'Dinas tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: {
        id: dinas.id,
        kode_dinas: dinas.kode_dinas,
        nama: dinas.nama_dinas,
        singkatan: dinas.singkatan,
        is_active: dinas.is_active,
        created_at: dinas.created_at,
        updated_at: dinas.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching dinas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dinas',
      error: error.message
    });
  }
});

// Create new dinas
router.post('/', async (req, res) => {
  try {
    const { nama, kode_dinas, singkatan } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama dinas harus diisi'
      });
    }

    // Generate kode_dinas if not provided
    const kode = kode_dinas || nama.trim().toUpperCase().replace(/\s+/g, '_').substring(0, 50);

    // Check for duplicate
    const existing = await prisma.master_dinas.findFirst({
      where: { 
        OR: [
          { nama_dinas: nama.trim() },
          { kode_dinas: kode }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Dinas dengan nama atau kode tersebut sudah ada'
      });
    }

    const dinas = await prisma.master_dinas.create({
      data: {
        nama_dinas: nama.trim(),
        kode_dinas: kode,
        singkatan: singkatan || nama.trim().substring(0, 100),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Dinas berhasil ditambahkan',
      data: {
        id: dinas.id,
        kode_dinas: dinas.kode_dinas,
        nama: dinas.nama_dinas,
        singkatan: dinas.singkatan,
        is_active: dinas.is_active,
        created_at: dinas.created_at,
        updated_at: dinas.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating dinas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan dinas',
      error: error.message
    });
  }
});

// Update dinas
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kode_dinas, singkatan, is_active } = req.body;

    // Check if exists
    const existing = await prisma.master_dinas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Dinas tidak ditemukan'
      });
    }

    // Build update data
    const updateData = { updated_at: new Date() };
    if (nama !== undefined) updateData.nama_dinas = nama.trim();
    if (kode_dinas !== undefined) updateData.kode_dinas = kode_dinas;
    if (singkatan !== undefined) updateData.singkatan = singkatan;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Check for duplicate name (excluding current)
    if (nama) {
      const duplicate = await prisma.master_dinas.findFirst({
        where: {
          nama_dinas: nama.trim(),
          NOT: { id: parseInt(id) }
        }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Dinas dengan nama tersebut sudah ada'
        });
      }
    }

    const dinas = await prisma.master_dinas.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Dinas berhasil diupdate',
      data: {
        id: dinas.id,
        kode_dinas: dinas.kode_dinas,
        nama: dinas.nama_dinas,
        singkatan: dinas.singkatan,
        is_active: dinas.is_active,
        created_at: dinas.created_at,
        updated_at: dinas.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating dinas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate dinas',
      error: error.message
    });
  }
});

// Delete dinas
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const existing = await prisma.master_dinas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Dinas tidak ditemukan'
      });
    }

    // Check if used in dinas_verifikator
    const usedInVerifikator = await prisma.dinas_verifikator.count({
      where: { dinas_id: parseInt(id) }
    });

    if (usedInVerifikator > 0) {
      return res.status(400).json({
        success: false,
        message: `Dinas tidak dapat dihapus karena masih memiliki ${usedInVerifikator} verifikator`
      });
    }

    // Check if used in questionnaires
    const usedInQuestionnaires = await prisma.bankeu_verification_questionnaires.count({
      where: { dinas_id: parseInt(id) }
    });

    if (usedInQuestionnaires > 0) {
      return res.status(400).json({
        success: false,
        message: `Dinas tidak dapat dihapus karena masih digunakan di ${usedInQuestionnaires} kuesioner verifikasi`
      });
    }

    await prisma.master_dinas.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Dinas berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting dinas:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus dinas',
      error: error.message
    });
  }
});

// Reset password for dinas account
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password harus minimal 6 karakter'
      });
    }

    // Find user account for this dinas
    const userAccount = await prisma.users.findFirst({
      where: { 
        dinas_id: parseInt(id),
        role: 'dinas_terkait'
      }
    });

    if (!userAccount) {
      return res.status(404).json({
        success: false,
        message: 'Akun dinas tidak ditemukan'
      });
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Update password
    await prisma.users.update({
      where: { id: userAccount.id },
      data: { 
        password: hashedPassword,
        plain_password: password.trim(),
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error resetting dinas password:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah password',
      error: error.message
    });
  }
});

// Update email for dinas account
router.put('/:id/update-account', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Find user account for this dinas
    const userAccount = await prisma.users.findFirst({
      where: { 
        dinas_id: parseInt(id),
        role: 'dinas_terkait'
      }
    });

    if (!userAccount) {
      return res.status(404).json({
        success: false,
        message: 'Akun dinas tidak ditemukan'
      });
    }

    // Check if email already used by other user
    const emailExists = await prisma.users.findFirst({
      where: { 
        email: email.trim(),
        id: { not: userAccount.id }
      }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan oleh akun lain'
      });
    }

    // Update email
    await prisma.users.update({
      where: { id: userAccount.id },
      data: { 
        email: email.trim(),
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Email akun berhasil diubah',
      data: {
        email: email.trim()
      }
    });
  } catch (error) {
    console.error('Error updating dinas account email:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah email akun',
      error: error.message
    });
  }
});

// Create user account for dinas
router.post('/:id/create-account', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Check if dinas exists
    const dinas = await prisma.master_dinas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dinas) {
      return res.status(404).json({
        success: false,
        message: 'Dinas tidak ditemukan'
      });
    }

    // Check if user account already exists
    const existingAccount = await prisma.users.findFirst({
      where: { 
        dinas_id: parseInt(id),
        role: 'dinas_terkait'
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Akun untuk dinas ini sudah ada'
      });
    }

    // Check if email already used
    const emailExists = await prisma.users.findFirst({
      where: { email: email }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }

    // Generate password if not provided
    const accountPassword = password || generatePassword(10);
    const hashedPassword = await bcrypt.hash(accountPassword, 10);

    // Create user account
    const newUser = await prisma.users.create({
      data: {
        name: dinas.nama_dinas,
        email: email,
        password: hashedPassword,
        plain_password: accountPassword,
        role: 'dinas_terkait',
        dinas_id: parseInt(id),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Akun dinas berhasil dibuat',
      data: {
        user_id: Number(newUser.id),
        email: newUser.email,
        password: accountPassword
      }
    });
  } catch (error) {
    console.error('Error creating dinas account:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat akun dinas',
      error: error.message
    });
  }
});

module.exports = router;