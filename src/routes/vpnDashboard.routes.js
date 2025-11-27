const express = require('express');
const router = express.Router();
const vpnDashboardController = require('../controllers/vpnDashboard.controller');

// Public routes (no auth required, but IP restricted)
router.get('/check-access', vpnDashboardController.checkVPNAccess);
router.get('/stats', vpnDashboardController.getVPNDashboardStats);

// Detailed statistics routes (IP restricted)
router.get('/bumdes', vpnDashboardController.getBumdesStats);
router.get('/perjadin', vpnDashboardController.getPerjadinStats);
router.get('/perjadin/kegiatan', vpnDashboardController.getPerjadinKegiatan);

module.exports = router;
