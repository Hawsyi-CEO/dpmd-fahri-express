const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all dinas
router.get('/', async (req, res) => {
  try {
    const dinas = await prisma.master_dinas.findMany({
      where: { is_active: true },
      orderBy: { nama_dinas: 'asc' }
    });

    res.json({
      success: true,
      data: dinas.map(d => ({
        id: d.id,
        kode_dinas: d.kode_dinas,
        nama: d.nama_dinas,
        singkatan: d.singkatan,
        is_active: d.is_active,
        created_at: d.created_at,
        updated_at: d.updated_at
      }))
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

module.exports = router;