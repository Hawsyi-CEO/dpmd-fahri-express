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
  perjadinController.getDashboardStats
);

router.get(
  '/dashboard/weekly-schedule',
  auth,
  perjadinController.getWeeklySchedule
);

router.get(
  '/statistik',
  auth,
  perjadinController.getStatistik
);

// ======================
// MASTER DATA ROUTES (Accessible by all authenticated users)
// ======================
router.get(
  '/bidang',
  auth,
  perjadinController.getAllBidang
);

router.get(
  '/pegawai/:id_bidang',
  auth,
  perjadinController.getPegawaiByBidang
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
// KEGIATAN ROUTES (Read access for all, write access restricted)
// ======================
router.get(
  '/kegiatan',
  auth,
  perjadinController.getAllKegiatan
);

router.get(
  '/kegiatan/:id',
  auth,
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
