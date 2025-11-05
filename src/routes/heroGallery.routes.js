const express = require('express');
const router = express.Router();
const heroGalleryController = require('../controllers/heroGallery.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadHeroGallery } = require('../middlewares/upload');

// Public routes
router.get('/public', heroGalleryController.getPublicGallery);

// Admin routes - hanya superadmin dan admin
router.get('/', auth, checkRole('admin', 'superadmin'), heroGalleryController.getAllGallery);
router.post('/', auth, checkRole('admin', 'superadmin'), uploadHeroGallery.single('image'), heroGalleryController.createGallery);
router.put('/:id', auth, checkRole('admin', 'superadmin'), uploadHeroGallery.single('image'), heroGalleryController.updateGallery);
router.delete('/:id', auth, checkRole('admin', 'superadmin'), heroGalleryController.deleteGallery);
router.patch('/:id/toggle-status', auth, checkRole('admin', 'superadmin'), heroGalleryController.toggleStatus);

module.exports = router;
