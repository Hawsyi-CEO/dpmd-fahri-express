// Routes untuk Kecamatan review Surat Desa
const express = require('express');
const router = express.Router();
const kecamatanBankeuSuratController = require('../controllers/kecamatanBankeuSurat.controller');
const { auth, checkRole } = require('../middlewares/auth');

// GET all surat from desas in kecamatan
router.get('/', auth, checkRole('kecamatan'), kecamatanBankeuSuratController.getAllDesaSurat);

// GET statistics surat
router.get('/statistics', auth, checkRole('kecamatan'), kecamatanBankeuSuratController.getSuratStatistics);

// GET single surat detail
router.get('/:id', auth, checkRole('kecamatan'), kecamatanBankeuSuratController.getDesaSuratDetail);

// POST review surat (approve/reject)
router.post('/:id/review', auth, checkRole('kecamatan'), kecamatanBankeuSuratController.reviewSurat);

module.exports = router;
