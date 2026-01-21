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

// Submit all proposals to kecamatan
router.post('/submit-to-kecamatan', bankeuProposalController.submitToKecamatan);

// Delete proposal
router.delete('/proposals/:id', bankeuProposalController.deleteProposal);

module.exports = router;
