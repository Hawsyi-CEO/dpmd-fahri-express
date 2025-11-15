const express = require('express');
const router = express.Router();
const kelembagaanController = require('../controllers/kelembagaan.controller');
const { auth } = require('../middlewares/auth');

// All kelembagaan routes require authentication
router.use(auth);

// Summary and overview endpoints
router.get('/', kelembagaanController.index);
router.get('/summary', kelembagaanController.summary);
router.get('/kecamatan/:id', kelembagaanController.byKecamatan);

// Desa-specific endpoints
router.get('/desa/:id/summary', kelembagaanController.summaryByDesa);
router.get('/desa-detail/:id', kelembagaanController.getDesaKelembagaanDetail); // Admin detail endpoint
router.get('/desa/:id/rw', kelembagaanController.getDesaRW);
router.get('/desa/:id/rt', kelembagaanController.getDesaRT);
router.get('/desa/:id/posyandu', kelembagaanController.getDesaPosyandu);
router.get('/desa/:id/karang-taruna', kelembagaanController.getDesaKarangTaruna);
router.get('/desa/:id/lpm', kelembagaanController.getDesaLPM);
router.get('/desa/:id/satlinmas', kelembagaanController.getDesaSatlinmas);
router.get('/desa/:id/pkk', kelembagaanController.getDesaPKK);

// List endpoints (with optional desa_id query parameter)
router.get('/rt', kelembagaanController.listRT);
router.get('/posyandu', kelembagaanController.listPosyandu);
router.get('/karang-taruna', kelembagaanController.listKarangTaruna);
router.get('/lpm', kelembagaanController.listLPM);
router.get('/satlinmas', kelembagaanController.listSatlinmas);
router.get('/pkk', kelembagaanController.listPKK);

// Detail endpoints
router.get('/rw/:id', kelembagaanController.showRW);
router.get('/rt/:id', kelembagaanController.showRT);
router.get('/posyandu/:id', kelembagaanController.showPosyandu);
router.get('/karang-taruna/:id', kelembagaanController.showKarangTaruna);
router.get('/lpm/:id', kelembagaanController.showLPM);
router.get('/satlinmas/:id', kelembagaanController.showSatlinmas);
router.get('/pkk/:id', kelembagaanController.showPKK);

// Pengurus endpoints (polymorphic relation)
router.get('/pengurus', kelembagaanController.getPengurusByKelembagaan);
router.get('/pengurus/history', kelembagaanController.getPengurusHistory);
router.get('/pengurus/:id', kelembagaanController.showPengurus);

module.exports = router;
