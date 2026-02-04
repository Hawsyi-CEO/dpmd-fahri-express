const express = require('express');
const router = express.Router();
const dinasVerifikatorController = require('../controllers/dinasVerifikator.controller');
const { auth, checkRole } = require('../middlewares/auth');

// All routes require authentication and dinas role
router.use(auth);
router.use(checkRole(['kepala_dinas', 'sekretaris_dinas', 'dinas_terkait', 'superadmin']));

// Get all verifikator for a dinas
router.get('/:dinasId/verifikator', dinasVerifikatorController.getAllVerifikator);

// Create new verifikator
router.post('/:dinasId/verifikator', dinasVerifikatorController.createVerifikator);

// Update verifikator info
router.put('/:dinasId/verifikator/:verifikatorId', dinasVerifikatorController.updateVerifikator);

// Toggle verifikator active status
router.patch('/:dinasId/verifikator/:verifikatorId/toggle-status', dinasVerifikatorController.toggleVerifikatorStatus);

// Reset verifikator password
router.post('/:dinasId/verifikator/:verifikatorId/reset-password', dinasVerifikatorController.resetVerifikatorPassword);

// Delete verifikator
router.delete('/:dinasId/verifikator/:verifikatorId', dinasVerifikatorController.deleteVerifikator);

module.exports = router;
