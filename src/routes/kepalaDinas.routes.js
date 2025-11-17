const express = require('express');
const router = express.Router();
const kepalaDinasController = require('../controllers/kepalaDinas.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Dashboard statistics route - for dinas, kepala_dinas, and superadmin
router.get('/dashboard', 
  auth, 
  checkRole('dinas', 'kepala_dinas', 'superadmin'), 
  kepalaDinasController.getDashboardStats.bind(kepalaDinasController)
);

module.exports = router;
