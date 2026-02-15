const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const ActivityLogger = require('../utils/activityLogger');

/**
 * GET /api/activity-logs
 * Query params:
 *   - module: filter by module (e.g., 'bankeu', 'bumdes', 'kelembagaan')
 *   - action: filter by action (e.g., 'create', 'update', 'delete', 'approve', 'reject')
 *   - user_id: filter by user
 *   - limit: max results (default 100)
 *   - page: pagination (default 1)
 * Requires: superadmin, admin, kepala_dinas, sarpras, sekretariat role
 */
router.get('/', auth, async (req, res) => {
  try {
    const allowedRoles = ['superadmin', 'admin', 'kepala_dinas', 'sarpras', 'sekretariat'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat log aktivitas'
      });
    }

    const { module, action, user_id, limit = 100, page = 1 } = req.query;
    const filters = {};
    if (module) filters.module = module;
    if (action) filters.action = action;
    if (user_id) filters.userId = parseInt(user_id);

    const activities = await ActivityLogger.getRecent(
      parseInt(limit),
      filters
    );

    // Simple pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = activities.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      meta: {
        total: activities.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log aktivitas',
      error: error.message
    });
  }
});

/**
 * GET /api/activity-logs/bankeu
 * Shortcut to get bankeu-specific activity logs
 * Accessible by: superadmin, admin, kepala_dinas, sarpras, sekretariat
 */
router.get('/bankeu', auth, async (req, res) => {
  try {
    const allowedRoles = ['superadmin', 'admin', 'kepala_dinas', 'sarpras', 'sekretariat'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat log aktivitas'
      });
    }

    const { action, user_id, limit = 200 } = req.query;
    const filters = { module: 'bankeu' };
    if (action) filters.action = action;
    if (user_id) filters.userId = parseInt(user_id);

    const activities = await ActivityLogger.getRecent(parseInt(limit), filters);

    res.json({
      success: true,
      data: activities,
      meta: { total: activities.length }
    });
  } catch (error) {
    console.error('Error fetching bankeu activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log aktivitas bankeu',
      error: error.message
    });
  }
});

module.exports = router;
