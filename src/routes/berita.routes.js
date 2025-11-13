// src/routes/berita.routes.js
const express = require('express');
const router = express.Router();
const beritaController = require('../controllers/berita.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { uploadBerita } = require('../middlewares/upload');

// Public routes (for landing page)
router.get('/public', beritaController.getAllBerita);
router.get('/public/terbaru', beritaController.getBeritaTerbaru);
router.get('/public/:slug', beritaController.getBeritaBySlug);

// Admin routes (protected) - only superadmin and kepala_dinas
router.get('/admin', auth, checkRole('superadmin', 'kepala_dinas'), beritaController.getAllBeritaAdmin);
router.get('/admin/stats', auth, checkRole('superadmin', 'kepala_dinas'), beritaController.getBeritaStats);
router.post('/admin', auth, checkRole('superadmin', 'kepala_dinas'), uploadBerita.single('gambar'), beritaController.createBerita);
router.put('/admin/:id', auth, checkRole('superadmin', 'kepala_dinas'), uploadBerita.single('gambar'), beritaController.updateBerita);
router.delete('/admin/:id', auth, checkRole('superadmin', 'kepala_dinas'), beritaController.deleteBerita);

module.exports = router;
