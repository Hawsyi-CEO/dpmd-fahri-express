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
// ADMIN ROUTES (requires role: admin, sarpras, or superadmin)
// ======================
router.get(
  '/all',
  auth,
  checkRole('sarpras', 'admin', 'superadmin'),
  musdesusController.getAllMusdesus
);

router.get(
  '/statistics',
  auth,
  checkRole('sarpras', 'admin', 'superadmin'),
  musdesusController.getStatistics
);

router.put(
  '/:id/status',
  auth,
  checkRole('sarpras', 'admin', 'superadmin'),
  musdesusController.updateStatus
);

router.delete(
  '/:id',
  auth,
  checkRole('sarpras', 'admin', 'superadmin'),
  musdesusController.deleteMusdesus
);

router.get(
  '/check-upload/:desa_id',
  auth,
  checkRole('sarpras', 'admin', 'superadmin'),
  musdesusController.checkDesaUploadStatus
);

module.exports = router;
