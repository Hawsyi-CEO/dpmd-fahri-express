const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const dinasConfigController = require('../controllers/dinasConfig.controller');
const { auth, checkRole } = require('../middlewares/auth'); // Fix: use 'auth' not 'authenticateToken'

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
 * Routes for Dinas Configuration
 * Base: /api/dinas/:dinasId/config
 */

// Get dinas config
router.get('/:dinasId/config', auth, dinasConfigController.getConfig);

// Create or update dinas config (PIC info)
router.post('/:dinasId/config', auth, dinasConfigController.upsertConfig);

// Upload TTD
router.post('/:dinasId/config/upload-ttd', auth, upload.single('ttd'), dinasConfigController.uploadTTD);

// Delete TTD
router.delete('/:dinasId/config/ttd', auth, dinasConfigController.deleteTTD);

module.exports = router;
