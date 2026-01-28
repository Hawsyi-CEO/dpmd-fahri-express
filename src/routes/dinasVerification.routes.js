const express = require('express');
const router = express.Router();
const dinasVerificationController = require('../controllers/dinasVerification.controller');
const { auth, authorizeDinas } = require('../middlewares/auth');

// Public authenticated route - no dinas_terkait requirement
router.get('/list', auth, dinasVerificationController.getDinasList);

// All routes below require authentication and dinas_terkait role
router.use(auth);
router.use(authorizeDinas);

// Get all proposals for current dinas
router.get('/proposals', dinasVerificationController.getDinasProposals);

// Get statistics for dashboard
router.get('/statistics', dinasVerificationController.getDinasStatistics);

// Get proposal detail
router.get('/proposals/:proposalId', dinasVerificationController.getDinasProposalDetail);

// Questionnaire routes
router.get('/proposals/:proposalId/questionnaire', dinasVerificationController.getQuestionnaire);
router.post('/proposals/:proposalId/questionnaire/save', dinasVerificationController.saveQuestionnaire);
router.post('/proposals/:proposalId/questionnaire/submit', dinasVerificationController.submitVerification);

module.exports = router;
