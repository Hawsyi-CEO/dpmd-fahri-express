const express = require('express');
const router = express.Router();
const beritaAcaraController = require('../controllers/beritaAcara.controller');
const { auth } = require('../middlewares/auth');

/**
 * Routes for Berita Acara Management
 * Base: /api/berita-acara
 */

// Validate tim completion before generate (preview validation)
router.get('/validate/:desaId/:proposalId', auth, beritaAcaraController.validateBeforeGenerate);

// Get aggregated questionnaire for preview
router.get('/preview/:desaId/:proposalId', auth, beritaAcaraController.getPreviewData);

// Get history for a desa
router.get('/history/:desaId', auth, beritaAcaraController.getHistory);

// Generate berita acara with auto-filled checklist and history
router.post('/generate/:desaId', auth, beritaAcaraController.generateWithQRCode);

// Generate surat pengantar proposal
router.post('/surat-pengantar/:proposalId', auth, beritaAcaraController.generateSuratPengantar);

// Send notification to desa after generate
router.post('/notify/:desaId/:historyId', auth, beritaAcaraController.notifyDesa);

module.exports = router;
