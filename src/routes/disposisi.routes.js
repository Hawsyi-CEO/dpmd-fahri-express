const express = require('express');
const router = express.Router();
const disposisiController = require('../controllers/disposisi.controller');
const { auth } = require('../middlewares/auth');

/**
 * @route POST /api/disposisi
 * @access Authenticated users (role-based in controller)
 */
router.post(
  '/',
  auth,
  disposisiController.createDisposisi
);

/**
 * @route GET /api/disposisi/masuk
 * @access All authenticated users
 */
router.get(
  '/masuk',
  auth,
  disposisiController.getDisposisiMasuk
);

/**
 * @route GET /api/disposisi/keluar
 * @access All authenticated users
 */
router.get(
  '/keluar',
  auth,
  disposisiController.getDisposisiKeluar
);

/**
 * @route GET /api/disposisi/statistik
 * @access All authenticated users
 */
router.get(
  '/statistik',
  auth,
  disposisiController.getStatistik
);

/**
 * @route GET /api/disposisi/history/:surat_id
 * @access All authenticated users
 */
router.get(
  '/history/:surat_id',
  auth,
  disposisiController.getDisposisiHistory
);

/**
 * @route GET /api/disposisi/:id
 * @access All authenticated users
 */
router.get(
  '/:id',
  auth,
  disposisiController.getDisposisiById
);

/**
 * @route PUT /api/disposisi/:id/baca
 * @access Disposisi recipient only
 */
router.put(
  '/:id/baca',
  auth,
  disposisiController.markAsRead
);

/**
 * @route PUT /api/disposisi/:id/status
 * @access Disposisi recipient only
 */
router.put(
  '/:id/status',
  auth,
  disposisiController.updateStatus
);

module.exports = router;
