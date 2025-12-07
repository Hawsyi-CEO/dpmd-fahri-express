const express = require('express');
const router = express.Router();
const suratController = require('../controllers/surat.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadSuratMasuk } = require('../middlewares/upload');

/**
 * @route POST /api/surat-masuk
 * @access Sekretariat only
 */
router.post(
  '/',
  auth,
  checkRole('sekretariat', 'superadmin'),
  suratController.createSuratMasuk
);

/**
 * @route POST /api/surat-masuk/:id/upload
 * @access Sekretariat only
 */
router.post(
  '/:id/upload',
  auth,
  checkRole('sekretariat', 'superadmin'),
  uploadSuratMasuk.single('file'),
  suratController.uploadFileSurat
);

/**
 * @route GET /api/surat-masuk
 * @access All authenticated users
 */
router.get(
  '/',
  auth,
  suratController.getAllSuratMasuk
);

/**
 * @route GET /api/surat-masuk/:id
 * @access All authenticated users
 */
router.get(
  '/:id',
  auth,
  suratController.getSuratMasukById
);

/**
 * @route PUT /api/surat-masuk/:id
 * @access Sekretariat only
 */
router.put(
  '/:id',
  auth,
  checkRole('sekretariat', 'superadmin'),
  suratController.updateSuratMasuk
);

/**
 * @route DELETE /api/surat-masuk/:id
 * @access Superadmin only
 */
router.delete(
  '/:id',
  auth,
  checkRole('superadmin'),
  suratController.deleteSuratMasuk
);

/**
 * @route POST /api/surat-masuk/:id/kirim-kepala-dinas
 * @access Sekretariat only
 */
router.post(
  '/:id/kirim-kepala-dinas',
  auth,
  checkRole('sekretariat', 'superadmin'),
  suratController.kirimKeKepalaDinas
);

module.exports = router;
