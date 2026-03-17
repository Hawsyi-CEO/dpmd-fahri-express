const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { auth, requireSuperadmin } = require('../middlewares/auth');

/**
 * Role Management Routes
 * Base path: /api/roles
 */

// Get all roles (authenticated users can read)
router.get('/', auth, roleController.getAllRoles);

// Get role by ID
router.get('/:id', auth, roleController.getRoleById);

// Create new role (superadmin only)
router.post('/', auth, requireSuperadmin, roleController.createRole);

// Update role (superadmin only)
router.put('/:id', auth, requireSuperadmin, roleController.updateRole);

// Delete role (superadmin only)
router.delete('/:id', auth, requireSuperadmin, roleController.deleteRole);

module.exports = router;
