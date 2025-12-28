/**
 * Jadwal Kegiatan Routes - REBUILT
 */

const express = require('express');
const router = express.Router();
const jadwalKegiatanController = require('../controllers/jadwalKegiatan.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Get all jadwal (with role-based filtering)
router.get('/', jadwalKegiatanController.getAllJadwal);

// Get single jadwal by ID
router.get('/:id', jadwalKegiatanController.getJadwalById);

// Create new jadwal
router.post('/', jadwalKegiatanController.createJadwal);

// Update jadwal
router.put('/:id', jadwalKegiatanController.updateJadwal);

// Delete jadwal
router.delete('/:id', jadwalKegiatanController.deleteJadwal);

module.exports = router;
