const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Get all kecamatans
router.get('/kecamatans', auth, checkRole('desa', 'dinas', 'superadmin'), locationController.getKecamatans);

// Get all desas
router.get('/desas', auth, checkRole('desa', 'dinas', 'superadmin'), locationController.getDesas);

// Get desas by kecamatan
router.get('/desas/kecamatan/:kecamatanId', auth, checkRole('desa', 'dinas', 'superadmin'), locationController.getDesasByKecamatan);

module.exports = router;
