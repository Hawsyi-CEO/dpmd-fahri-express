/**
 * Perjadin (Perjalanan Dinas) Routes
 */

const express = require('express');
const router = express.Router();
const perjadinController = require('../controllers/perjadin.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Dashboard statistics
router.get('/dashboard', perjadinController.getDashboard);

// Export kegiatan
router.get('/export', perjadinController.exportKegiatan);

// CRUD operations
router.get('/kegiatan', perjadinController.getAllKegiatan);
router.post('/kegiatan', perjadinController.createKegiatan);
router.get('/kegiatan/:id', perjadinController.getKegiatanById);
router.put('/kegiatan/:id', perjadinController.updateKegiatan);
router.delete('/kegiatan/:id', perjadinController.deleteKegiatan);

module.exports = router;
