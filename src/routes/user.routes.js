const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth');

/**
 * User Management Routes
 * Base path: /api/users
 */

// Get user statistics
router.get('/stats', auth, userController.getUserStats);

// Get all users (with filtering & pagination)
router.get('/', auth, userController.getAllUsers);

// Change own password (authenticated user) - MUST be before /:id routes
router.put('/change-password', auth, userController.changePassword);

// Get user by ID
router.get('/:id', auth, userController.getUserById);

// Create new user
router.post('/', auth, userController.createUser);

// Update user
router.put('/:id', auth, userController.updateUser);

// Reset user password (admin only)
router.put('/:id/reset-password', auth, userController.resetPassword);

// Delete user
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
