// src/routes/bankeu.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middlewares/auth');
const bankeuController = require('../controllers/bankeu.controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bankeu-' + uniqueSuffix + path.extname(file.originalname));
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
 * @route   POST /api/bankeu/upload
 * @desc    Upload and replace bankeu2025.json file
 * @access  Private - superadmin, sarana_prasarana only
 */
router.post(
  '/upload',
  auth,
  checkRole('superadmin', 'sarana_prasarana'),
  upload.single('file'),
  bankeuController.uploadBankeuData
);

/**
 * @route   GET /api/bankeu/data
 * @desc    Get bankeu2025.json data
 * @access  Private - authenticated users
 */
router.get(
  '/data',
  auth,
  bankeuController.getBankeuData
);

/**
 * @route   GET /api/bankeu/info
 * @desc    Get current bankeu data information
 * @access  Private - authenticated users
 */
router.get(
  '/info',
  auth,
  bankeuController.getBankeuInfo
);

/**
 * @route   GET /api/bankeu/backups
 * @desc    Get list of backup files
 * @access  Private - superadmin, sarana_prasarana only
 */
router.get(
  '/backups',
  auth,
  checkRole('superadmin', 'sarana_prasarana'),
  bankeuController.getBackupList
);

module.exports = router;
