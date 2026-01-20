const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Define roles yang bisa akses location data (hampir semua role authenticated)
const locationRoles = ['desa', 'kecamatan', 'dinas', 'superadmin', 'sarana_prasarana', 'pegawai', 'kepala_bidang', 'ketua_tim', 'kepala_dinas', 'kekayaan_keuangan', 'pemberdayaan_masyarakat', 'pemerintahan_desa'];

// Get all kecamatans
router.get('/kecamatans', auth, checkRole(...locationRoles), locationController.getKecamatans);

// Get all desas
router.get('/desas', auth, checkRole(...locationRoles), locationController.getDesas);

// Get single desa by ID
router.get('/desas/:id', auth, checkRole(...locationRoles), locationController.getDesaById);

// Get desas by kecamatan
router.get('/desas/kecamatan/:kecamatanId', auth, checkRole(...locationRoles), locationController.getDesasByKecamatan);

module.exports = router;
