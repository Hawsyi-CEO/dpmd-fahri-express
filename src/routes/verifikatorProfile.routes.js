const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifikatorProfileController = require('../controllers/verifikatorProfile.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Multer config for TTD upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/uploads/temp');
  },
  filename: (req, file, cb) => {
    cb(null, `temp_ttd_${Date.now()}${path.extname(file.originalname)}`);
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
 * Routes for Verifikator Profile
 * Base: /api/verifikator/profile
 * Only for verifikator_dinas role
 */

// All routes require authentication and verifikator_dinas role
router.use(auth);
router.use(checkRole(['verifikator_dinas']));

// Get my profile
router.get('/', verifikatorProfileController.getMyProfile);

// Update my profile
router.put('/', verifikatorProfileController.updateMyProfile);

// Upload TTD
router.post('/upload-ttd', upload.single('ttd'), verifikatorProfileController.uploadTTD);

// Delete TTD
router.delete('/ttd', verifikatorProfileController.deleteTTD);

module.exports = router;
