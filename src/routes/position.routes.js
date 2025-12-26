// src/routes/position.routes.js
const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { auth } = require('../middlewares/auth');

// Middleware to check if user is admin or pegawai sekretariat
const isAdminOrSekretariat = (req, res, next) => {
  const userRole = req.user.role;
  const userBidangId = req.user.bidang_id;
  
  // Allow: superadmin, admin, or pegawai from sekretariat (bidang_id = 2)
  const isAdmin = ['superadmin', 'admin'].includes(userRole);
  const isPegawaiSekretariat = userRole === 'pegawai' && userBidangId && BigInt(userBidangId) === BigInt(2);
  
  if (!isAdmin && !isPegawaiSekretariat) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin atau pegawai sekretariat yang dapat mengakses fitur ini.'
    });
  }
  
  next();
};

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/positions
 * @desc    Get all positions
 * @access  Private (All authenticated users)
 */
router.get('/', positionController.getAllPositions);

/**
 * @route   GET /api/positions/stats
 * @desc    Get position statistics
 * @access  Private (Admin/Sekretariat only)
 */
router.get('/stats', isAdminOrSekretariat, positionController.getPositionStats);

/**
 * @route   GET /api/positions/users
 * @desc    Get all users with their positions
 * @access  Private (Admin/Sekretariat only)
 */
router.get('/users', isAdminOrSekretariat, positionController.getAllUsersWithPositions);

/**
 * @route   GET /api/positions/users/:userId/history
 * @desc    Get position history for a user
 * @access  Private (Admin/Sekretariat only)
 */
router.get('/users/:userId/history', isAdminOrSekretariat, positionController.getUserPositionHistory);

/**
 * @route   PUT /api/positions/users/:userId
 * @desc    Update user position
 * @access  Private (Admin/Sekretariat only)
 */
router.put('/users/:userId', isAdminOrSekretariat, positionController.updateUserPosition);

module.exports = router;
