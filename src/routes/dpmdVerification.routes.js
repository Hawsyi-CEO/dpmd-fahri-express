const express = require('express');
const router = express.Router();
const dpmdVerificationController = require('../controllers/dpmdVerification.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

/**
 * DPMD/SPKED Bankeu Verification Routes
 * Flow: Desa → Dinas Terkait → Kecamatan → DPMD (Final Approval)
 * 
 * DPMD receives proposals that have been approved by:
 * - Dinas Terkait (dinas_status = 'approved')
 * - Kecamatan (kecamatan_status = 'approved')
 * - submitted_to_dpmd = true
 */

// Get all proposals submitted to DPMD
// Query params: status, kecamatan_id, desa_id
router.get('/proposals', dpmdVerificationController.getProposals);

// Get all proposals for tracking (ALL stages, not just DPMD)
// Query params: tahun_anggaran
router.get('/tracking', dpmdVerificationController.getTrackingProposals);

// Get single proposal detail
router.get('/proposals/:id', dpmdVerificationController.getProposalDetail);

// Verify proposal (Final Approval)
// Body: { action: 'approved' | 'rejected' | 'revision', catatan: string }
router.patch('/proposals/:id/verify', dpmdVerificationController.verifyProposal);

// Get statistics
router.get('/statistics', dpmdVerificationController.getStatistics);

// Delete single proposal (DPMD troubleshooting)
router.delete('/proposals/:id', dpmdVerificationController.deleteProposal);

// Delete all proposals from a desa (DPMD bulk delete)
// Query: ?all=true to delete proposals at ALL stages
router.delete('/desa/:desaId/proposals', dpmdVerificationController.deleteDesaProposals);

// Delete surat (pengantar & permohonan) from a desa
router.delete('/desa/:desaId/surat', dpmdVerificationController.deleteDesaSurat);

module.exports = router;
