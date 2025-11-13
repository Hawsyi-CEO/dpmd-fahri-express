const express = require('express');
const router = express.Router();
const kepalaDinasController = require('../controllers/kepalaDinas.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Dashboard statistics route - only for dinas (kepala dinas) and superadmin
router.get('/dashboard', 
  auth, 
  checkRole('dinas', 'superadmin'), 
  kepalaDinasController.getDashboardStats.bind(kepalaDinasController)
);

module.exports = router;
