const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const controller = require('../controllers/bankeuSuratTemplate.controller');

// Public route for desa to view active templates
router.get('/public/desa', controller.getDesaTemplates.bind(controller));

// Protected routes - require auth
router.get('/', auth, controller.getAll.bind(controller));
router.get('/:idOrKode', auth, controller.getOne.bind(controller));

// Admin-only routes (superadmin + bidang spked)
router.post('/', auth, controller.create.bind(controller));
router.put('/:id', auth, controller.update.bind(controller));
router.delete('/:id', auth, controller.delete.bind(controller));

module.exports = router;
