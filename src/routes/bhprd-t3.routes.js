// src/routes/bhprd-t3.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middlewares/auth');
const bhprdT3Controller = require('../controllers/bhprd-t3.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bhprd-t3-' + uniqueSuffix + path.extname(file.originalname));
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
 * @route   GET /api/bhprd-t3/data
 * @desc    Get bhprd-tahap3.json data
 * @access  Public
 */
router.get(
  '/data',
  bhprdT3Controller.getBhprdT3Data
);

/**
 * @route   POST /api/bhprd-t3/upload
 * @desc    Upload and replace bhprd-tahap3.json file
 * @access  Private - kepala_dinas, sarana_prasarana
 */
router.post(
  '/upload',
  auth,
  checkRole('kepala_dinas', 'sarana_prasarana'),
  upload.single('file'),
  bhprdT3Controller.uploadBhprdT3Data
);

/**
 * @route   GET /api/bhprd-t3/info
 * @desc    Get current BHPRD tahap 3 data information
 * @access  Private - authenticated users
 */
router.get(
  '/info',
  auth,
  bhprdT3Controller.getBhprdT3Info
);

/**
 * @route   GET /api/bhprd-t3/statistics
 * @desc    Get BHPRD Tahap 3 statistics
 * @access  Private - authenticated users
 */
router.get(
  '/statistics',
  auth,
  bhprdT3Controller.getBhprdT3Statistics
);

module.exports = router;
