const express = require('express');
const router = express.Router();
const bankeuVerificationController = require('../controllers/bankeuVerification.controller');
const { auth } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for signature uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../storage/uploads/signatures');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sig-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PNG dan JPG yang diizinkan'));
    }
  }
});

// All routes require authentication
router.use(auth);

// Get proposals for kecamatan
router.get('/proposals', bankeuVerificationController.getProposalsByKecamatan);

// Verify (approve/reject) proposal
router.patch('/proposals/:id/verify', bankeuVerificationController.verifyProposal);

// Get statistics
router.get('/statistics', bankeuVerificationController.getStatistics);

// Generate Berita Acara per Desa
router.post('/desa/:desaId/berita-acara', bankeuVerificationController.generateBeritaAcaraDesa);

// Submit review (send to DPMD or return to Desa)
router.post('/desa/:desaId/submit-review', bankeuVerificationController.submitReview);

// Konfigurasi Kecamatan
router.get('/config/:kecamatanId', bankeuVerificationController.getConfig);
router.post('/config/:kecamatanId', bankeuVerificationController.saveConfig);

// Tim Verifikasi
router.get('/tim-verifikasi/:kecamatanId', bankeuVerificationController.getTimVerifikasi);
router.post('/tim-verifikasi/:kecamatanId', bankeuVerificationController.addTimVerifikasi);
router.delete('/tim-verifikasi/:id', bankeuVerificationController.removeTimVerifikasi);
router.post('/tim-verifikasi/:id/upload-signature', upload.single('file'), bankeuVerificationController.uploadTimSignature);

// Konfigurasi Signature
router.post('/config/:kecamatanId/upload-logo', upload.single('file'), bankeuVerificationController.uploadLogo);
router.post('/config/:kecamatanId/upload-camat-signature', upload.single('file'), bankeuVerificationController.uploadCamatSignature);
router.delete('/config/:kecamatanId/delete-camat-signature', bankeuVerificationController.deleteCamatSignature);

// Konfigurasi Stempel
router.post('/config/:kecamatanId/upload-stempel', upload.single('file'), bankeuVerificationController.uploadStempel);
router.delete('/config/:kecamatanId/delete-stempel', bankeuVerificationController.deleteStempel);

module.exports = router;
