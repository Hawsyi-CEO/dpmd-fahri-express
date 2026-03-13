// src/routes/bankeuPublic.routes.js
// PUBLIC routes for Bantuan Keuangan - NO AUTH REQUIRED
// Used by public transparency page (landing page)

const express = require('express');
const router = express.Router();
const bankeuPublicController = require('../controllers/bankeuPublic.controller');

/**
 * @route   GET /api/public/bankeu/tracking-summary
 * @desc    Get aggregate proposal tracking data (public transparency)
 * @access  Public (no auth)
 * @query   tahun_anggaran - Year filter (default: 2027)
 */
router.get('/tracking-summary', bankeuPublicController.getTrackingSummary);

/**
 * @route   GET /api/public/bankeu/available-years
 * @desc    Get list of years with proposal data
 * @access  Public (no auth)
 */
router.get('/available-years', bankeuPublicController.getAvailableYears);

module.exports = router;
