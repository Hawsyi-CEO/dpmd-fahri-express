// src/routes/bhprd-t1.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middlewares/auth');
const bhprdT1Controller = require('../controllers/bhprd-t1.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bhprd-t1-' + uniqueSuffix + path.extname(file.originalname));
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
 * @route   GET /api/bhprd-t1/data
 * @desc    Get bhprd-tahap1.json data
 * @access  Public
 */
router.get(
  '/data',
  bhprdT1Controller.getBhprdT1Data
);

/**
 * @route   POST /api/bhprd-t1/upload
 * @desc    Upload and replace bhprd-tahap1.json file
 * @access  Private - kepala_dinas, sarana_prasarana, kekayaan_keuangan, kepala_bidang (KKD)
 */
router.post(
  '/upload',
  auth,
  checkRole('kepala_dinas', 'sarana_prasarana', 'kekayaan_keuangan', 'kepala_bidang'),
  upload.single('file'),
  bhprdT1Controller.uploadBhprdT1Data
);

/**
 * @route   GET /api/bhprd-t1/info
 * @desc    Get current BHPRD tahap 1 data information
 * @access  Private - authenticated users
 */
router.get(
  '/info',
  auth,
  bhprdT1Controller.getBhprdT1Info
);

/**
 * @route   GET /api/bhprd-t1/statistics
 * @desc    Get BHPRD Tahap 1 statistics
 * @access  Private - authenticated users
 */
router.get(
  '/statistics',
  auth,
  bhprdT1Controller.getBhprdT1Statistics
);

module.exports = router;
