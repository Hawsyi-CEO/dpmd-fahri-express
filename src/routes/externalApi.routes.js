/**
 * External API Proxy Routes
 * Routes for fetching data from external DPMD API (https://dpmd.bogorkab.go.id/api/)
 */

const express = require('express');
const router = express.Router();
const externalController = require('../controllers/externalAparaturDesa.controller');
const { auth, checkRole } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// ===== Aparatur Desa Routes =====

// GET /api/external/aparatur-desa - Get all aparatur desa from external API
router.get('/aparatur-desa', externalController.getAparaturDesa);

// GET /api/external/aparatur-desa/stats - Get aparatur desa statistics
router.get('/aparatur-desa/stats', externalController.getAparaturDesaStats);

// GET /api/external/aparatur-desa/:id - Get single aparatur desa by ID
router.get('/aparatur-desa/:id', externalController.getAparaturDesaById);

// ===== Dashboard Statistics Routes =====

// GET /api/external/dashboard - Get dashboard statistics (Kepala Desa, Perangkat Desa, BPD)
router.get('/dashboard', externalController.getDashboardStats);

// ===== Location Routes =====

// GET /api/external/kecamatan - Get list of kecamatan
router.get('/kecamatan', externalController.getKecamatanList);

// GET /api/external/desa - Get list of desa by kecamatan
router.get('/desa', externalController.getDesaByKecamatan);

// ===== Admin Routes =====

// GET /api/external/status - Check external API connection status
router.get('/status', externalController.getConnectionStatus);

// POST /api/external/clear-cache - Clear token cache (admin only)
router.post('/clear-cache', checkRole(['superadmin', 'kepala_dinas']), externalController.clearCache);

module.exports = router;
