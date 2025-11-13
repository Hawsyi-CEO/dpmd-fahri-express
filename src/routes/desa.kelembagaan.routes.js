/**
 * Desa Kelembagaan Routes
 * Routes for desa role to manage their own kelembagaan
 * Matches Laravel pattern: /api/desa/rw, /api/desa/rt, etc.
 */

const express = require('express');
const router = express.Router();
const kelembagaanController = require('../controllers/kelembagaan.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Summary endpoint for logged-in desa
router.get('/kelembagaan/summary', kelembagaanController.getDesaSummary);

// RW routes
router.get('/rw', kelembagaanController.listDesaRW);
router.post('/rw', kelembagaanController.createRW);
router.get('/rw/:id', kelembagaanController.showDesaRW);
router.put('/rw/:id', kelembagaanController.updateRW);
router.delete('/rw/:id', kelembagaanController.deleteRW);
router.put('/rw/:id/toggle-status', kelembagaanController.toggleRWStatus);

// RT routes
router.get('/rt', kelembagaanController.listDesaRT);
router.post('/rt', kelembagaanController.createRT);
router.get('/rt/:id', kelembagaanController.showDesaRT);
router.put('/rt/:id', kelembagaanController.updateRT);
router.delete('/rt/:id', kelembagaanController.deleteRT);
router.put('/rt/:id/toggle-status', kelembagaanController.toggleRTStatus);

// Posyandu routes
router.get('/posyandu', kelembagaanController.listDesaPosyandu);
router.post('/posyandu', kelembagaanController.createPosyandu);
router.get('/posyandu/:id', kelembagaanController.showDesaPosyandu);
router.put('/posyandu/:id', kelembagaanController.updatePosyandu);
router.delete('/posyandu/:id', kelembagaanController.deletePosyandu);
router.put('/posyandu/:id/toggle-status', kelembagaanController.togglePosyanduStatus);

// Karang Taruna routes (singleton - usually only 1 per desa)
router.get('/karang-taruna', kelembagaanController.listDesaKarangTaruna);
router.post('/karang-taruna', kelembagaanController.createKarangTaruna);
router.get('/karang-taruna/:id', kelembagaanController.showDesaKarangTaruna);
router.put('/karang-taruna/:id', kelembagaanController.updateKarangTaruna);
router.delete('/karang-taruna/:id', kelembagaanController.deleteKarangTaruna);
router.put('/karang-taruna/:id/toggle-status', kelembagaanController.toggleKarangTarunaStatus);

// LPM routes (singleton)
router.get('/lpm', kelembagaanController.listDesaLPM);
router.post('/lpm', kelembagaanController.createLPM);
router.get('/lpm/:id', kelembagaanController.showDesaLPM);
router.put('/lpm/:id', kelembagaanController.updateLPM);
router.delete('/lpm/:id', kelembagaanController.deleteLPM);
router.put('/lpm/:id/toggle-status', kelembagaanController.toggleLPMStatus);

// Satlinmas routes (singleton)
router.get('/satlinmas', kelembagaanController.listDesaSatlinmas);
router.post('/satlinmas', kelembagaanController.createSatlinmas);
router.get('/satlinmas/:id', kelembagaanController.showDesaSatlinmas);
router.put('/satlinmas/:id', kelembagaanController.updateSatlinmas);
router.delete('/satlinmas/:id', kelembagaanController.deleteSatlinmas);
router.put('/satlinmas/:id/toggle-status', kelembagaanController.toggleSatlinmasStatus);

// PKK routes (singleton)
router.get('/pkk', kelembagaanController.listDesaPKK);
router.post('/pkk', kelembagaanController.createPKK);
router.get('/pkk/:id', kelembagaanController.showDesaPKK);
router.put('/pkk/:id', kelembagaanController.updatePKK);
router.delete('/pkk/:id', kelembagaanController.deletePKK);
router.put('/pkk/:id/toggle-status', kelembagaanController.togglePKKStatus);

// Pengurus routes (polymorphic - can be attached to any kelembagaan)
router.get('/pengurus', kelembagaanController.listDesaPengurus);
router.post('/pengurus', kelembagaanController.createPengurus);
router.get('/pengurus/:id', kelembagaanController.showDesaPengurus);
router.put('/pengurus/:id', kelembagaanController.updatePengurus);
router.delete('/pengurus/:id', kelembagaanController.deletePengurus);
router.put('/pengurus/:id/status', kelembagaanController.updatePengurusStatus);

module.exports = router;
