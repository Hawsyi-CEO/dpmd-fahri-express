const express = require('express');
const router = express.Router();
const kepalaDinasController = require('../controllers/kepalaDinas.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Dashboard statistics route - only for kepala_dinas
router.get('/dashboard', 
  auth, 
  checkRole('kepala_dinas', 'superadmin'), 
  kepalaDinasController.getDashboardStats.bind(kepalaDinasController)
);

module.exports = router;
