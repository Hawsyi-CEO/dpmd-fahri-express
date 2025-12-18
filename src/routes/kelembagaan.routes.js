const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

// Import new modular controllers
const {
  rwController,
  rtController,
  posyanduController,
  karangTarunaController,
  lpmController,
  pkkController,
  satlinmasController,
  summaryController,
  pengurusController
} = require('../controllers/kelembagaan/index');

// All kelembagaan routes require authentication
router.use(auth);

// Summary and overview endpoints
router.get('/', summaryController.index.bind(summaryController));
router.get('/summary', summaryController.summary.bind(summaryController));
router.get('/kecamatan/:id', summaryController.byKecamatan.bind(summaryController));

// Desa-specific endpoints
router.get('/desa/:id/summary', summaryController.summaryByDesa.bind(summaryController));
router.get('/desa-detail/:id', summaryController.getDesaKelembagaanDetail.bind(summaryController));
router.get('/desa/:id/rw', summaryController.getDesaRW.bind(summaryController));
router.get('/desa/:id/rt', summaryController.getDesaRT.bind(summaryController));
router.get('/desa/:id/posyandu', summaryController.getDesaPosyandu.bind(summaryController));
router.get('/desa/:id/karang-taruna', summaryController.getDesaKarangTaruna.bind(summaryController));
router.get('/desa/:id/lpm', summaryController.getDesaLPM.bind(summaryController));
router.get('/desa/:id/satlinmas', summaryController.getDesaSatlinmas.bind(summaryController));
router.get('/desa/:id/pkk', summaryController.getDesaPKK.bind(summaryController));

// List endpoints (with optional desa_id query parameter)
router.get('/rt', rtController.listRT.bind(rtController));
router.get('/posyandu', posyanduController.listPosyandu.bind(posyanduController));
router.get('/karang-taruna', karangTarunaController.list.bind(karangTarunaController));
router.get('/lpm', lpmController.list.bind(lpmController));
router.get('/satlinmas', satlinmasController.list.bind(satlinmasController));
router.get('/pkk', pkkController.list.bind(pkkController));

// Detail endpoints
router.get('/rw/:id', rwController.showRW.bind(rwController));
router.get('/rt/:id', rtController.showRT.bind(rtController));
router.get('/posyandu/:id', posyanduController.showPosyandu.bind(posyanduController));
router.get('/karang-taruna/:id', karangTarunaController.show.bind(karangTarunaController));
router.get('/lpm/:id', lpmController.show.bind(lpmController));
router.get('/satlinmas/:id', satlinmasController.show.bind(satlinmasController));
router.get('/pkk/:id', pkkController.show.bind(pkkController));

// Pengurus endpoints (polymorphic relation)
router.get('/pengurus', pengurusController.getPengurusByKelembagaan.bind(pengurusController));
router.get('/pengurus/history', pengurusController.getPengurusHistory.bind(pengurusController));
router.get('/pengurus/:id', pengurusController.showPengurus.bind(pengurusController));

module.exports = router;
