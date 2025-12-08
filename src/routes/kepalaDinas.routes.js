const express = require('express');
const router = express.Router();
const kepalaDinasController = require('../controllers/kepalaDinas.controller');
const { auth } = require('../middlewares/auth');

// Dashboard statistics route - accessible by all authenticated users
router.get('/dashboard', 
  auth, 
  kepalaDinasController.getDashboardStats.bind(kepalaDinasController)
);

module.exports = router;
