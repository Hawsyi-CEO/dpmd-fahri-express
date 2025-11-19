// src/routes/bankeu-t2.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middlewares/auth');
const bankeuT2Controller = require('../controllers/bankeu-t2.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bankeu-t2-' + uniqueSuffix + path.extname(file.originalname));
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
 * @route   GET /api/bankeu-t2/data
 * @desc    Get bankeu-tahap2.json data (PUBLIC - untuk landing page)
 * @access  Public
 */
router.get(
  '/data',
  bankeuT2Controller.getBankeuT2Data
);

/**
 * @route   POST /api/bankeu-t2/upload
 * @desc    Upload and replace bankeu-tahap2.json file
 * @access  Private - kepala_dinas, sarana_prasarana
 */
router.post(
  '/upload',
  auth,
  checkRole('kepala_dinas', 'sarana_prasarana'),
  upload.single('file'),
  bankeuT2Controller.uploadBankeuT2Data
);

/**
 * @route   GET /api/bankeu-t2/info
 * @desc    Get current bankeu tahap 2 data information
 * @access  Private - authenticated users
 */
router.get(
  '/info',
  auth,
  bankeuT2Controller.getBankeuT2Info
);

/**
 * @route   GET /api/bankeu-t2/backups
 * @desc    Get list of backup files
 * @access  Private - kepala_dinas, sarana_prasarana
 */
router.get(
  '/backups',
  auth,
  checkRole('kepala_dinas', 'sarana_prasarana'),
  bankeuT2Controller.getBankeuT2BackupList
);

module.exports = router;
