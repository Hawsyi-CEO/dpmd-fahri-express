const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * @route   GET /api/public/stats
 * @desc    Get public statistics (Kecamatan, Desa, Kelurahan counts)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM kecamatan WHERE deleted_at IS NULL) as kecamatan,
        (SELECT COUNT(*) FROM desa WHERE deleted_at IS NULL AND jenis_wilayah = 'desa') as desa,
        (SELECT COUNT(*) FROM desa WHERE deleted_at IS NULL AND jenis_wilayah = 'kelurahan') as kelurahan
    `);

    res.status(200).json({
      success: true,
      data: results[0] || { kecamatan: 0, desa: 0, kelurahan: 0 }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/public/hero-gallery
 * @desc    Get active hero gallery images for public display
 * @access  Public
 */
router.get('/hero-gallery', async (req, res) => {
  try {
    const [galleries] = await db.query(
      'SELECT id, title, image_path, `order` as display_order FROM hero_galleries WHERE is_active = 1 ORDER BY `order` ASC'
    );

    res.status(200).json({
      success: true,
      data: galleries
    });
  } catch (error) {
    console.error('Error fetching public hero gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil galeri hero',
      error: error.message
    });
  }
});

module.exports = router;
