const express = require('express');
const router = express.Router();
const bankeuProposalController = require('../controllers/bankeuProposal.controller');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes require authentication (desa role will be validated in controller)
router.use(auth);

// Get master kegiatan
router.get('/master-kegiatan', bankeuProposalController.getMasterKegiatan);

// Get proposals for logged-in desa
router.get('/proposals', bankeuProposalController.getProposalsByDesa);

// Upload new proposal
router.post('/proposals', upload.bankeuProposal, bankeuProposalController.uploadProposal);

// Update existing proposal (for revision)
router.patch('/proposals/:id', upload.bankeuProposal, bankeuProposalController.updateProposal);

// Replace file in existing proposal (before submission)
router.patch('/proposals/:id/replace-file', upload.bankeuProposal, bankeuProposalController.replaceFile);

// Submit all proposals to dinas terkait (NEW FLOW)
router.post('/submit-to-dinas', bankeuProposalController.submitToDinas);

// Submit all proposals to kecamatan (OLD - keep for backward compatibility)
router.post('/submit-to-kecamatan', bankeuProposalController.submitToKecamatan);

// Delete proposal
router.delete('/proposals/:id', bankeuProposalController.deleteProposal);

module.exports = router;
