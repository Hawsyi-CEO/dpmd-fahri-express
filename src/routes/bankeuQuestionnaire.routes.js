const express = require('express');
const router = express.Router();
const bankeuQuestionnaireController = require('../controllers/bankeuQuestionnaire.controller');
const { auth } = require('../middlewares/auth');

/**
 * Routes for Bankeu Verification Questionnaire
 * Base: /api/bankeu/questionnaire
 */

// Get questionnaire by proposal and verifier (query params: verifier_type, verifier_id)
router.get('/:proposalId', auth, bankeuQuestionnaireController.getQuestionnaire);

// Get all questionnaires for a proposal (for berita acara)
router.get('/:proposalId/all', auth, bankeuQuestionnaireController.getAllQuestionnaires);

// Check if dinas questionnaire + TTD is complete
router.get('/:proposalId/dinas/check', auth, bankeuQuestionnaireController.checkDinasQuestionnaireComplete);

// Check if ALL kecamatan tim verifikasi are complete (for berita acara button)
router.get('/:proposalId/kecamatan/check-all', auth, bankeuQuestionnaireController.checkKecamatanTimComplete);

// Create or update questionnaire
router.post('/:proposalId', auth, bankeuQuestionnaireController.upsertQuestionnaire);

module.exports = router;
