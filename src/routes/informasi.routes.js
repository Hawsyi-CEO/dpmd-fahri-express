// src/routes/informasi.routes.js
const express = require('express');
const router = express.Router();
const informasiController = require('../controllers/informasi.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadInformasi } = require('../middlewares/upload');

// Allowed roles for informasi management (Sekretariat bidang members + superadmin)
const INFORMASI_ROLES = ['superadmin', 'sekretariat', 'kepala_dinas', 'sekretaris_dinas', 'kepala_bidang', 'ketua_tim', 'pegawai'];

// Public routes (for dashboard banner)
router.get('/public', informasiController.getPublicInformasi);

// Admin routes - accessible by Sekretariat bidang members
router.get('/', auth, checkRole(...INFORMASI_ROLES), informasiController.getAllInformasi);
router.get('/:id', auth, checkRole(...INFORMASI_ROLES), informasiController.getInformasiById);
router.post('/', auth, checkRole(...INFORMASI_ROLES), uploadInformasi.single('gambar'), informasiController.createInformasi);
router.put('/:id', auth, checkRole(...INFORMASI_ROLES), uploadInformasi.single('gambar'), informasiController.updateInformasi);
router.delete('/:id', auth, checkRole(...INFORMASI_ROLES), informasiController.deleteInformasi);
router.patch('/:id/toggle', auth, checkRole(...INFORMASI_ROLES), informasiController.toggleActive);
router.put('/reorder/batch', auth, checkRole(...INFORMASI_ROLES), informasiController.reorderInformasi);

module.exports = router;
