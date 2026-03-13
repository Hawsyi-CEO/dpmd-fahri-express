const express = require('express');
const router = express.Router();
const contohProposalController = require('../controllers/contohProposal.controller');
const { auth, checkRole } = require('../middlewares/auth');
const { contohProposalUpload } = require('../middlewares/upload');

// Public routes - no auth required (anyone can download examples)
router.get('/list', contohProposalController.getListContohProposal);
router.get('/download/:filename', contohProposalController.downloadContohProposal);

// Admin routes - requires auth + roles that can access SPKED config
const ADMIN_ROLES = ['superadmin', 'admin', 'sarpras', 'kepala_dinas', 'kepala_bidang', 'ketua_tim', 'pegawai'];
router.get('/admin/list', auth, checkRole(...ADMIN_ROLES), contohProposalController.getAdminList);
router.post('/admin/upload', auth, checkRole(...ADMIN_ROLES), contohProposalUpload, contohProposalController.uploadFile);
router.put('/admin/rename', auth, checkRole(...ADMIN_ROLES), contohProposalController.renameFile);
router.delete('/admin/:filename', auth, checkRole(...ADMIN_ROLES), contohProposalController.deleteFile);

module.exports = router;
