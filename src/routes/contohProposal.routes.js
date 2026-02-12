const express = require('express');
const router = express.Router();
const contohProposalController = require('../controllers/contohProposal.controller');

// Public routes - no auth required (anyone can download examples)
router.get('/list', contohProposalController.getListContohProposal);
router.get('/download/:filename', contohProposalController.downloadContohProposal);

module.exports = router;
