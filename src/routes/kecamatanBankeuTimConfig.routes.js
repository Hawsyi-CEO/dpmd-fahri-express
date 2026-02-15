const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const kecamatanBankeuTimConfigController = require('../controllers/kecamatanBankeuTimConfig.controller');
const { auth } = require('../middlewares/auth');

// Multer config for TTD upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/uploads/temp');
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PNG/JPG yang diperbolehkan'));
    }
  }
});

/**
 * Routes for Kecamatan Bankeu Tim Configuration
 * Base: /api/kecamatan/:kecamatanId/bankeu/tim-config
 */

// Get all tim config
router.get('/:kecamatanId/bankeu/tim-config', auth, kecamatanBankeuTimConfigController.getAllTimConfig);

// Get distinct anggota list (must be before :posisi route)
router.get('/:kecamatanId/bankeu/tim-config/anggota-list', auth, kecamatanBankeuTimConfigController.getAnggotaList);

// Get specific tim member config
router.get('/:kecamatanId/bankeu/tim-config/:posisi', auth, kecamatanBankeuTimConfigController.getTimMemberConfig);

// Create or update tim member config
router.post('/:kecamatanId/bankeu/tim-config/:posisi', auth, kecamatanBankeuTimConfigController.upsertTimMemberConfig);

// Upload TTD
router.post('/:kecamatanId/bankeu/tim-config/:posisi/upload-ttd', auth, upload.single('ttd'), kecamatanBankeuTimConfigController.uploadTTD);

// Delete TTD
router.delete('/:kecamatanId/bankeu/tim-config/:posisi/ttd', auth, kecamatanBankeuTimConfigController.deleteTTD);

// Delete anggota (only for proposal-specific anggota)
router.delete('/:kecamatanId/bankeu/tim-config/:posisi', auth, kecamatanBankeuTimConfigController.deleteAnggota);

module.exports = router;
