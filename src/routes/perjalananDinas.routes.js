const express = require('express');
const router = express.Router();
const perjadinController = require('../controllers/perjalananDinas.controller');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * PERJALANAN DINAS (PERJADIN) ROUTES
 * Base path: /api/perjadin
 * 
 * Access: superadmin (full), dinas (read-only), pemberdayaan_masyarakat (manage)
 */

// ======================
// DASHBOARD ROUTES (Read-only access for dinas role)
// ======================
router.get(
  '/dashboard',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getDashboardStats
);

router.get(
  '/dashboard/weekly-schedule',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getWeeklySchedule
);

router.get(
  '/statistik',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getStatistik
);

// ======================
// MASTER DATA ROUTES (Read-only access for dinas)
// ======================
router.get(
  '/bidang',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getAllBidang
);

router.get(
  '/personil/:id_bidang',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getPersonilByBidang
);

// ======================
// CONFLICT CHECK ROUTE
// ======================
router.get(
  '/check-personnel-conflict',
  auth,
  checkRole('superadmin', 'pemberdayaan_masyarakat'),
  perjadinController.checkPersonnelConflict
);

// ======================
// STATISTIK ROUTES
// ======================
router.get(
  '/statistik',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getStatistik
);

// ======================
// KEGIATAN ROUTES (Read access for dinas, full access for superadmin and pemberdayaan_masyarakat)
// ======================
router.get(
  '/kegiatan',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getAllKegiatan
);

router.get(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'dinas', 'kepala_dinas', 'pemberdayaan_masyarakat'),
  perjadinController.getKegiatanById
);

router.post(
  '/kegiatan',
  auth,
  checkRole('superadmin', 'pemberdayaan_masyarakat'),
  perjadinController.createKegiatan
);

router.put(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'pemberdayaan_masyarakat'),
  perjadinController.updateKegiatan
);

router.delete(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'pemberdayaan_masyarakat'),
  perjadinController.deleteKegiatan
);

module.exports = router;
