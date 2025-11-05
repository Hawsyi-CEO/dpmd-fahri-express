const express = require('express');
const router = express.Router();
const bumdesController = require('../controllers/bumdes.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadBumdes } = require('../middlewares/upload');

// PUBLIC/SHARED ROUTES (specific routes first before dynamic params)
router.get('/statistics', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.getStatistics);
router.get('/dokumen-badan-hukum', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.getDokumenBadanHukum);
router.get('/laporan-keuangan', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.getLaporanKeuangan);
router.get('/produk-hukum', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.getProdukHukum);

// DESA-SPECIFIC ROUTES
router.get('/produk-hukum-options', auth, checkRole('desa'), bumdesController.getProdukHukumForBumdes);

// ADMIN ROUTES
router.get('/all', auth, checkRole('sarpras', 'admin', 'superadmin'), bumdesController.getAllBumdes);

// DESA/ADMIN HYBRID ROUTES
// Check if user is desa (use getDesaBumdes) or admin (use getAllBumdes)
router.get('/', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), (req, res, next) => {
  // If user is desa, get their bumdes only
  if (req.user.role === 'desa') {
    return bumdesController.getDesaBumdes(req, res, next);
  }
  // If admin/sarpras/superadmin, get all bumdes
  return bumdesController.getAllBumdes(req, res, next);
});

router.post('/', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.storeDesaBumdes);
router.post(
  '/upload-file',
  auth,
  checkRole('desa', 'sarpras', 'admin', 'superadmin'),
  uploadBumdes.single('file'),
  bumdesController.uploadDesaBumdesFile
);
router.put('/:id', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.updateDesaBumdes);
router.delete('/:id', auth, checkRole('desa', 'sarpras', 'admin', 'superadmin'), bumdesController.deleteDesaBumdes);

module.exports = router;
