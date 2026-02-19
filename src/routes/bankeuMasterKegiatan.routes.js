const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all master kegiatan
router.get('/', async (req, res) => {
  try {
    const masterKegiatan = await prisma.bankeu_master_kegiatan.findMany({
      where: {
        is_active: true
      },
      orderBy: [
        { jenis_kegiatan: 'asc' },
        { urutan: 'asc' },
        { nama_kegiatan: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: masterKegiatan
    });
  } catch (error) {
    console.error('Error fetching master kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data master kegiatan',
      error: error.message
    });
  }
});

// Get single master kegiatan by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const masterKegiatan = await prisma.bankeu_master_kegiatan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!masterKegiatan) {
      return res.status(404).json({
        success: false,
        message: 'Master kegiatan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: masterKegiatan
    });
  } catch (error) {
    console.error('Error fetching master kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data master kegiatan',
      error: error.message
    });
  }
});

// Create new master kegiatan
router.post('/', async (req, res) => {
  try {
    const { nama_kegiatan, dinas_terkait, jenis_kegiatan, urutan } = req.body;

    if (!nama_kegiatan || !jenis_kegiatan) {
      return res.status(400).json({
        success: false,
        message: 'Nama kegiatan dan jenis kegiatan harus diisi'
      });
    }

    // Get next urutan if not provided
    let nextUrutan = urutan;
    if (!nextUrutan) {
      const maxUrutan = await prisma.bankeu_master_kegiatan.aggregate({
        _max: { urutan: true },
        where: { jenis_kegiatan }
      });
      nextUrutan = (maxUrutan._max.urutan || 0) + 1;
    }

    const masterKegiatan = await prisma.bankeu_master_kegiatan.create({
      data: {
        nama_kegiatan,
        dinas_terkait: dinas_terkait || null,
        jenis_kegiatan,
        urutan: parseInt(nextUrutan),
        is_active: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Master kegiatan berhasil ditambahkan',
      data: masterKegiatan
    });
  } catch (error) {
    console.error('Error creating master kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan master kegiatan',
      error: error.message
    });
  }
});

// Update master kegiatan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kegiatan, dinas_terkait, jenis_kegiatan, urutan, is_active } = req.body;

    // Check if exists
    const existing = await prisma.bankeu_master_kegiatan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Master kegiatan tidak ditemukan'
      });
    }

    const updateData = {};
    if (nama_kegiatan !== undefined) updateData.nama_kegiatan = nama_kegiatan;
    if (dinas_terkait !== undefined) updateData.dinas_terkait = dinas_terkait;
    if (jenis_kegiatan !== undefined) updateData.jenis_kegiatan = jenis_kegiatan;
    if (urutan !== undefined) updateData.urutan = parseInt(urutan);
    if (is_active !== undefined) updateData.is_active = is_active;

    const masterKegiatan = await prisma.bankeu_master_kegiatan.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Cascade update: jika nama_kegiatan berubah, update judul_proposal di semua proposal terkait
    if (nama_kegiatan !== undefined && nama_kegiatan !== existing.nama_kegiatan) {
      // Cari semua proposal yang terkait via pivot table
      const linkedProposals = await prisma.bankeu_proposal_kegiatan.findMany({
        where: { kegiatan_id: parseInt(id) },
        select: { proposal_id: true }
      });

      if (linkedProposals.length > 0) {
        const proposalIds = linkedProposals.map(lp => lp.proposal_id);

        // Update judul_proposal untuk proposal yang masih menggunakan nama lama
        // Hanya update jika judul_proposal = nama lama (bukan custom title dari user)
        const updated = await prisma.bankeu_proposals.updateMany({
          where: {
            id: { in: proposalIds },
            judul_proposal: existing.nama_kegiatan
          },
          data: {
            judul_proposal: nama_kegiatan,
            updated_at: new Date()
          }
        });

        console.log(`Cascade update: ${updated.count} proposals updated with new kegiatan name`);
      }
    }

    res.json({
      success: true,
      message: 'Master kegiatan berhasil diupdate',
      data: masterKegiatan
    });
  } catch (error) {
    console.error('Error updating master kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate master kegiatan',
      error: error.message
    });
  }
});

// Delete master kegiatan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const existing = await prisma.bankeu_master_kegiatan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Master kegiatan tidak ditemukan'
      });
    }

    // Check if used in proposals via bankeu_proposal_kegiatan
    const usedInProposals = await prisma.bankeu_proposal_kegiatan.count({
      where: { kegiatan_id: parseInt(id) }
    });

    if (usedInProposals > 0) {
      return res.status(400).json({
        success: false,
        message: `Master kegiatan tidak dapat dihapus karena masih digunakan di ${usedInProposals} proposal`
      });
    }

    await prisma.bankeu_master_kegiatan.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Master kegiatan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting master kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus master kegiatan',
      error: error.message
    });
  }
});

module.exports = router;
