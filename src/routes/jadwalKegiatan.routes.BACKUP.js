/**
 * Jadwal Kegiatan Routes
 */

const express = require('express');
const router = express.Router();
const jadwalKegiatanController = require('../controllers/jadwalKegiatan.controller');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Get all jadwal (with role-based filtering)
router.get('/', jadwalKegiatanController.getAllJadwal);

// Get calendar view
router.get('/calendar', jadwalKegiatanController.getCalendarView);

// Get single jadwal
router.get('/:id', jadwalKegiatanController.getJadwalById);

// Create jadwal (Sekretariat and above)
router.post('/', jadwalKegiatanController.createJadwal);

// Update jadwal
router.put('/:id', jadwalKegiatanController.updateJadwal);

// Approve/Reject jadwal (Kepala Dinas, Sekretaris Dinas only)
router.patch('/:id/approve', jadwalKegiatanController.approveJadwal);

// Delete jadwal
router.delete('/:id', jadwalKegiatanController.deleteJadwal);

module.exports = router;
