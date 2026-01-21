const express = require('express');
const router = express.Router();
const bankeuVerificationController = require('../controllers/bankeuVerification.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication (kecamatan role will be validated in controller)
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

module.exports = router;
