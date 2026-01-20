/**
 * Profil Desa Routes
 * Routes for managing village profile information
 */

const express = require('express');
const router = express.Router();
const profilDesaController = require('../controllers/profil-desa.controller');
const { auth } = require('../middlewares/auth');
const { uploadProfilDesa } = require('../middlewares/upload');

// All routes require authentication
router.use(auth);

// GET /api/profil-desa - Get profil desa for logged-in user's desa
router.get('/', profilDesaController.getProfilDesa);

// POST /api/profil-desa - Update profil desa with optional file upload
router.post('/', uploadProfilDesa.single('foto_kantor_desa'), profilDesaController.updateProfilDesa);

module.exports = router;
