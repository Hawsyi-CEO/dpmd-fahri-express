const express = require('express');
const router = express.Router();
const { login, verifyToken, checkVpnAccess } = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/login', login);
router.get('/check-vpn', checkVpnAccess);

// Protected routes
router.get('/verify', auth, verifyToken);

module.exports = router;
