const express = require('express');
const router = express.Router();
const { login, verifyToken, checkVpnAccess, checkTailscaleVpn } = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/login', login);
router.get('/check-vpn', checkVpnAccess);
router.get('/check-vpn-tailscale', checkTailscaleVpn); // Strict VPN check

// Protected routes
router.get('/verify', auth, verifyToken);

module.exports = router;
