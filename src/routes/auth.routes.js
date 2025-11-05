const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/verify', auth, verifyToken);

module.exports = router;
