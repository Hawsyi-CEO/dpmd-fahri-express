const express = require('express');
const router = express.Router();
const heroGalleryController = require('../controllers/heroGallery.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadHeroGallery } = require('../middlewares/upload');

// Public routes
router.get('/public', heroGalleryController.getPublicGallery);

// Admin routes - hanya superadmin dan dinas (kepala dinas)
router.get('/', auth, checkRole('dinas', 'superadmin'), heroGalleryController.getAllGallery);
router.post('/', auth, checkRole('dinas', 'superadmin'), uploadHeroGallery.single('image'), heroGalleryController.createGallery);
router.put('/:id', auth, checkRole('dinas', 'superadmin'), uploadHeroGallery.single('image'), heroGalleryController.updateGallery);
router.delete('/:id', auth, checkRole('dinas', 'superadmin'), heroGalleryController.deleteGallery);
router.patch('/:id/toggle-status', auth, checkRole('dinas', 'superadmin'), heroGalleryController.toggleStatus);

module.exports = router;
