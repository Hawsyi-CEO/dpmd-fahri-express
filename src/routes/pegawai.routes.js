/**
 * Pegawai Routes
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { auth } = require('../middlewares/auth');

// Get all pegawai
router.get('/', auth, async (req, res) => {
  try {
    const { bidang_id } = req.query;

    console.log('[Pegawai API] GET / - bidang_id:', bidang_id);

    const where = {};
    if (bidang_id) {
      where.id_bidang = BigInt(bidang_id);
    }

    const pegawai = await prisma.pegawai.findMany({
      where,
      select: {
        id_pegawai: true,
        id_bidang: true,
        nama_pegawai: true,
        bidangs: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        nama_pegawai: 'asc'
      }
    });

    console.log('[Pegawai API] Found', pegawai.length, 'pegawai');

    // Convert BigInt fields to Number for JSON serialization
    const serializedPegawai = pegawai.map(p => ({
      id_pegawai: Number(p.id_pegawai),
      id_bidang: p.id_bidang ? Number(p.id_bidang) : null,
      nama_pegawai: p.nama_pegawai,
      bidangs: p.bidangs ? {
        id: Number(p.bidangs.id),
        nama: p.bidangs.nama
      } : null
    }));

    console.log('[Pegawai API] Serialized data:', JSON.stringify(serializedPegawai.slice(0, 2)));

    res.json({
      success: true,
      message: 'Pegawai retrieved successfully',
      data: serializedPegawai
    });
  } catch (error) {
    console.error('[Pegawai API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pegawai',
      error: error.message
    });
  }
});

// Get pegawai by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const pegawai = await prisma.pegawai.findUnique({
      where: { id_pegawai: BigInt(id) },
      include: {
        bidangs: {
          select: {
            id: true,
            nama: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            desa_id: true,
            kecamatan_id: true,
            bidang_id: true,
            dinas_id: true,
            pegawai_id: true
          }
        }
      }
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai not found'
      });
    }

    // Convert BigInt fields to Number for JSON serialization
    const serializedPegawai = {
      id_pegawai: Number(pegawai.id_pegawai),
      id_bidang: pegawai.id_bidang ? Number(pegawai.id_bidang) : null,
      nama_pegawai: pegawai.nama_pegawai,
      bidangs: pegawai.bidangs ? {
        id: Number(pegawai.bidangs.id),
        nama: pegawai.bidangs.nama
      } : null,
      users: pegawai.users ? pegawai.users.map(user => ({
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        desa_id: user.desa_id ? Number(user.desa_id) : null,
        kecamatan_id: user.kecamatan_id ? Number(user.kecamatan_id) : null,
        bidang_id: user.bidang_id ? Number(user.bidang_id) : null,
        dinas_id: user.dinas_id ? Number(user.dinas_id) : null,
        pegawai_id: user.pegawai_id ? Number(user.pegawai_id) : null
      })) : []
    };

    res.json({
      success: true,
      message: 'Pegawai retrieved successfully',
      data: serializedPegawai
    });
  } catch (error) {
    console.error('Error fetching pegawai:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pegawai',
      error: error.message
    });
  }
});

// Create pegawai
router.post('/', auth, async (req, res) => {
  try {
    const { nama_pegawai, id_bidang } = req.body;

    if (!nama_pegawai || !id_bidang) {
      return res.status(400).json({
        success: false,
        message: 'nama_pegawai and id_bidang are required'
      });
    }

    const pegawai = await prisma.pegawai.create({
      data: {
        nama_pegawai,
        id_bidang: BigInt(id_bidang)
      },
      include: {
        bidangs: {
          select: {
            id: true,
            nama_bidang: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pegawai created successfully',
      data: pegawai
    });
  } catch (error) {
    console.error('Error creating pegawai:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pegawai',
      error: error.message
    });
  }
});

// Update pegawai
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pegawai, id_bidang } = req.body;

    const updateData = {};
    if (nama_pegawai) updateData.nama_pegawai = nama_pegawai;
    if (id_bidang) updateData.id_bidang = BigInt(id_bidang);

    const pegawai = await prisma.pegawai.update({
      where: { id_pegawai: BigInt(id) },
      data: updateData,
      include: {
        bidangs: {
          select: {
            id: true,
            nama_bidang: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Pegawai updated successfully',
      data: pegawai
    });
  } catch (error) {
    console.error('Error updating pegawai:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pegawai',
      error: error.message
    });
  }
});

// Delete pegawai
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.pegawai.delete({
      where: { id_pegawai: BigInt(id) }
    });

    res.json({
      success: true,
      message: 'Pegawai deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pegawai:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pegawai',
      error: error.message
    });
  }
});

module.exports = router;
