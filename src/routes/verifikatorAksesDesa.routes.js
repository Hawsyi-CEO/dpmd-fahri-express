const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const verifikatorAksesDesaController = require('../controllers/verifikatorAksesDesa.controller');

// All routes require authentication and dinas_terkait role
router.use(auth.authorizeDinas);

// Get all akses desa for a verifikator
router.get('/:verifikatorId/akses-desa', verifikatorAksesDesaController.getVerifikatorAksesDesa);

// Get available desas (not yet assigned)
router.get('/:verifikatorId/akses-desa/available', verifikatorAksesDesaController.getAvailableDesas);

// Add akses desa (batch)
router.post('/:verifikatorId/akses-desa', verifikatorAksesDesaController.addVerifikatorAksesDesa);

// Batch remove akses desa
router.post('/:verifikatorId/akses-desa/batch-remove', verifikatorAksesDesaController.batchRemoveVerifikatorAksesDesa);

// Remove single akses desa
router.delete('/:verifikatorId/akses-desa/:aksesId', verifikatorAksesDesaController.removeVerifikatorAksesDesa);

module.exports = router;
