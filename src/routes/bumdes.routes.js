const express = require('express');
const router = express.Router();
const bumdesController = require('../controllers/bumdes.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadBumdes } = require('../middlewares/upload');

// PUBLIC/SHARED ROUTES (specific routes first before dynamic params)
router.get('/statistics', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getStatistics);
router.get('/dokumen-badan-hukum', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getDokumenBadanHukum);
router.get('/laporan-keuangan', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getLaporanKeuangan);
router.get('/produk-hukum', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getProdukHukum);
router.get('/check-desa/:kode_desa', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.checkDesaBumdes);

// DELETE ROUTES
router.delete('/delete-file', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.deleteFile);

// DESA-SPECIFIC ROUTES
router.get('/produk-hukum-options', auth, checkRole('desa'), bumdesController.getProdukHukumForBumdes);

// ADMIN ROUTES
router.get('/all', auth, checkRole('dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getAllBumdes);

// DESA/ADMIN HYBRID ROUTES
// Check if user is desa (use getDesaBumdes) or admin (use getAllBumdes)
router.get('/', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), (req, res, next) => {
  // If user is desa, get their bumdes only
  if (req.user.role === 'desa') {
    return bumdesController.getDesaBumdes(req, res, next);
  }
  // If admin/dinas/superadmin, get all bumdes
  return bumdesController.getAllBumdes(req, res, next);
});

router.post('/', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.storeDesaBumdes);
router.post(
  '/upload-file',
  auth,
  checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'),
  uploadBumdes.single('file'),
  bumdesController.uploadDesaBumdesFile
);
router.get('/:id', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.getBumdesById);
router.put('/:id', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.updateDesaBumdes);
router.delete('/:id', auth, checkRole('desa', 'dinas', 'superadmin', 'sarana_prasarana'), bumdesController.deleteDesaBumdes);

module.exports = router;
