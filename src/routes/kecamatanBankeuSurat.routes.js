// Routes untuk Kecamatan review Surat Desa
const express = require('express');
const router = express.Router();
const kecamatanBankeuSuratController = require('../controllers/kecamatanBankeuSurat.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Allowed roles untuk kecamatan
const KECAMATAN_ROLES = ['kecamatan', 'superadmin', 'camat'];

// GET all surat from desas in kecamatan
router.get('/', auth, checkRole(...KECAMATAN_ROLES), kecamatanBankeuSuratController.getAllDesaSurat);

// GET statistics surat
router.get('/statistics', auth, checkRole(...KECAMATAN_ROLES), kecamatanBankeuSuratController.getSuratStatistics);

// GET single surat detail
router.get('/:id', auth, checkRole(...KECAMATAN_ROLES), kecamatanBankeuSuratController.getDesaSuratDetail);

// POST review surat (approve/reject)
router.post('/:id/review', auth, checkRole(...KECAMATAN_ROLES), kecamatanBankeuSuratController.reviewSurat);

module.exports = router;
