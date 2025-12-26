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
    
    const where = {};
    if (bidang_id) {
      where.id_bidang = BigInt(bidang_id);
    }

    const pegawai = await prisma.pegawai.findMany({
      where,
      include: {
        bidangs: {
          select: {
            id: true,
            nama: true
          }
        },
        users: true
      },
      orderBy: {
        nama_pegawai: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Pegawai retrieved successfully',
      data: pegawai
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
          include: {
            position: true
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

    res.json({
      success: true,
      message: 'Pegawai retrieved successfully',
      data: pegawai
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
