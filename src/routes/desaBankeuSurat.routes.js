// Routes untuk Surat Pengantar dan Surat Permohonan (per Desa)
const express = require('express');
const router = express.Router();
const desaBankeuSuratController = require('../controllers/desaBankeuSurat.controller');
const { auth, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// GET current surat desa (by desa_id from token) - Public for desa
router.get('/', auth, checkRole('desa'), desaBankeuSuratController.getDesaSurat);

// POST upload surat (pengantar atau permohonan)
router.post('/upload', auth, checkRole('desa'), upload.bankeuProposal, desaBankeuSuratController.uploadSuratDesa);

// POST submit surat to kecamatan
router.post('/submit-to-kecamatan', auth, checkRole('desa'), desaBankeuSuratController.submitSuratToKecamatan);

module.exports = router;
