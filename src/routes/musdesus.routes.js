const express = require('express');
const router = express.Router();
const musdesusController = require('../controllers/musdesus.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadMusdesus } = require('../middlewares/upload');

/**
 * MUSDESUS ROUTES
 * Base path: /api/musdesus or /api/desa/musdesus
 */

// ======================
// DESA ROUTES (requires role: desa)
// ======================
router.get(
  '/desa',
  auth,
  checkRole('desa'),
  musdesusController.getDesaMusdesus
);

router.post(
  '/desa',
  auth,
  checkRole('desa'),
  uploadMusdesus.single('file'),
  musdesusController.uploadMusdesusFile
);

router.delete(
  '/desa/:id',
  auth,
  checkRole('desa'),
  musdesusController.deleteMusdesus
);

// ======================
// ADMIN ROUTES (requires role: dinas or superadmin)
// ======================
router.get(
  '/all',
  auth,
  checkRole('dinas', 'superadmin', 'pemerintahan_desa', 'kepala_bidang', 'kepala_dinas'),
  musdesusController.getAllMusdesus
);

router.get(
  '/statistics',
  auth,
  checkRole('dinas', 'superadmin', 'pemerintahan_desa', 'kepala_bidang', 'kepala_dinas'),
  musdesusController.getStatistics
);

router.put(
  '/:id/status',
  auth,
  checkRole('dinas', 'superadmin', 'pemerintahan_desa', 'kepala_bidang', 'kepala_dinas'),
  musdesusController.updateStatus
);

router.delete(
  '/:id',
  auth,
  checkRole('dinas', 'superadmin', 'pemerintahan_desa', 'kepala_bidang', 'kepala_dinas'),
  musdesusController.deleteMusdesus
);

router.get(
  '/check-upload/:desa_id',
  auth,
  checkRole('dinas', 'superadmin', 'pemerintahan_desa', 'kepala_bidang', 'kepala_dinas'),
  musdesusController.checkDesaUploadStatus
);

module.exports = router;
