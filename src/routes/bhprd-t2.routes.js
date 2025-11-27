// src/routes/bhprd-t2.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middlewares/auth');
const bhprdT2Controller = require('../controllers/bhprd-t2.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bhprd-t2-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.json') {
      return cb(new Error('Hanya file JSON yang diperbolehkan'));
    }
    cb(null, true);
  }
});

/**
 * @route   GET /api/bhprd-t2/data
 * @desc    Get bhprd-tahap2.json data
 * @access  Public
 */
router.get(
  '/data',
  bhprdT2Controller.getBhprdT2Data
);

/**
 * @route   POST /api/bhprd-t2/upload
 * @desc    Upload and replace bhprd-tahap2.json file
 * @access  Private - kepala_dinas, sarana_prasarana, kekayaan_keuangan
 */
router.post(
  '/upload',
  auth,
  checkRole('kepala_dinas', 'sarana_prasarana', 'kekayaan_keuangan'),
  upload.single('file'),
  bhprdT2Controller.uploadBhprdT2Data
);

/**
 * @route   GET /api/bhprd-t2/info
 * @desc    Get current BHPRD tahap 2 data information
 * @access  Private - authenticated users
 */
router.get(
  '/info',
  auth,
  bhprdT2Controller.getBhprdT2Info
);

/**
 * @route   GET /api/bhprd-t2/statistics
 * @desc    Get BHPRD Tahap 2 statistics
 * @access  Private - authenticated users
 */
router.get(
  '/statistics',
  auth,
  bhprdT2Controller.getBhprdT2Statistics
);

module.exports = router;
