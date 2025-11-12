const express = require('express');
const router = express.Router();
const perjadinController = require('../controllers/perjalananDinas.controller');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * PERJALANAN DINAS (PERJADIN) ROUTES
 * Base path: /api/perjadin
 * 
 * Access: superadmin, sekretariat, sarana_prasarana, kekayaan_keuangan, 
 *         pemberdayaan_masyarakat, pemerintahan_desa
 */

// ======================
// DASHBOARD ROUTES (Read-only access for kepala_dinas)
// ======================
router.get(
  '/dashboard',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getDashboardStats
);

router.get(
  '/dashboard/weekly-schedule',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getWeeklySchedule
);

router.get(
  '/statistik',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getStatistik
);

// ======================
// MASTER DATA ROUTES (Read-only access for kepala_dinas)
// ======================
router.get(
  '/bidang',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getAllBidang
);

router.get(
  '/personil/:id_bidang',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getPersonilByBidang
);

// ======================
// CONFLICT CHECK ROUTE
// ======================
router.get(
  '/check-personnel-conflict',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin'),
  perjadinController.checkPersonnelConflict
);

// ======================
// STATISTIK ROUTES
// ======================
router.get(
  '/statistik',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin'),
  perjadinController.getStatistik
);

// ======================
// KEGIATAN ROUTES (Read access for kepala_dinas, full access for others)
// ======================
router.get(
  '/kegiatan',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getAllKegiatan
);

router.get(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa'),
  perjadinController.getKegiatanById
);

router.post(
  '/kegiatan',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin'),
  perjadinController.createKegiatan
);

router.put(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin'),
  perjadinController.updateKegiatan
);

router.delete(
  '/kegiatan/:id',
  auth,
  checkRole('superadmin', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 
            'pemberdayaan_masyarakat', 'pemerintahan_desa', 'admin'),
  perjadinController.deleteKegiatan
);

module.exports = router;
