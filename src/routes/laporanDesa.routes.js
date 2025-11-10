const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanDesa.controller');
const { auth } = require('../middlewares/auth');

// Public routes (read-only)
router.get('/stats', laporanController.getLaporanStats);
router.get('/jenis-laporan', laporanController.getAllJenisLaporan);
router.get('/jenis-laporan/bidang/:id_bidang', laporanController.getJenisLaporanByBidang);

// Protected routes (require authentication)
router.get('/', auth, laporanController.getAllLaporan);
router.get('/:id', auth, laporanController.getLaporanById);
router.post('/', auth, laporanController.createLaporan);
router.put('/:id', auth, laporanController.updateLaporan);
router.delete('/:id', auth, laporanController.deleteLaporan);

module.exports = router;
