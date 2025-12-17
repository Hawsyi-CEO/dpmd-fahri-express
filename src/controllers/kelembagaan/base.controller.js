/**
 * Base Kelembagaan Controller
 * Shared utilities and helpers for all kelembagaan controllers
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

// Activity Log Types
const ACTIVITY_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  TOGGLE_STATUS: 'toggle_status',
  VERIFY: 'verify',
  ADD_PENGURUS: 'add_pengurus',
  UPDATE_PENGURUS: 'update_pengurus',
  TOGGLE_PENGURUS_STATUS: 'toggle_pengurus_status',
  VERIFY_PENGURUS: 'verify_pengurus'
};

const ENTITY_TYPES = {
  LEMBAGA: 'lembaga',
  PENGURUS: 'pengurus'
};

/**
 * Log kelembagaan activity
 */
async function logKelembagaanActivity({
  kelembagaanType,
  kelembagaanId,
  kelembagaanNama,
  desaId,
  activityType,
  entityType,
  entityId,
  entityName,
  oldValue,
  newValue,
  userId,
  userName,
  userRole
}) {
  try {
    // Build action description
    let actionDescription = '';
    
    switch (activityType) {
      case ACTIVITY_TYPES.CREATE:
        actionDescription = `${userName} membuat ${entityType === ENTITY_TYPES.LEMBAGA ? 'kelembagaan' : 'pengurus'} ${entityName}`;
        break;
      case ACTIVITY_TYPES.UPDATE:
        actionDescription = `${userName} mengubah data ${entityType === ENTITY_TYPES.LEMBAGA ? 'kelembagaan' : 'pengurus'} ${entityName}`;
        break;
      case ACTIVITY_TYPES.TOGGLE_STATUS:
        actionDescription = `${userName} mengubah status ${entityType === ENTITY_TYPES.LEMBAGA ? 'kelembagaan' : 'pengurus'} ${entityName} menjadi ${newValue?.status_kelembagaan || newValue?.status_pengurus || 'aktif'}`;
        break;
      case ACTIVITY_TYPES.VERIFY:
        actionDescription = `${userName} ${newValue?.status_verifikasi === 'verified' ? 'memverifikasi' : 'membatalkan verifikasi'} ${entityType === ENTITY_TYPES.LEMBAGA ? 'kelembagaan' : 'pengurus'} ${entityName}`;
        break;
      case ACTIVITY_TYPES.ADD_PENGURUS:
        actionDescription = `${userName} menambahkan pengurus ${entityName}`;
        break;
      case ACTIVITY_TYPES.UPDATE_PENGURUS:
        actionDescription = `${userName} mengubah data pengurus ${entityName}`;
        break;
      case ACTIVITY_TYPES.TOGGLE_PENGURUS_STATUS:
        actionDescription = `${userName} mengubah status pengurus ${entityName} menjadi ${newValue?.status_pengurus || 'aktif'}`;
        break;
      case ACTIVITY_TYPES.VERIFY_PENGURUS:
        actionDescription = `${userName} ${newValue?.status_verifikasi === 'verified' ? 'memverifikasi' : 'membatalkan verifikasi'} pengurus ${entityName}`;
        break;
      default:
        actionDescription = `${userName} melakukan aktivitas pada ${entityName}`;
    }

    await prisma.kelembagaan_activity_logs.create({
      data: {
        id: uuidv4(), // Generate UUID for primary key
        kelembagaan_type: kelembagaanType,
        kelembagaan_id: kelembagaanId,
        kelembagaan_nama: kelembagaanNama,
        desa_id: desaId,
        activity_type: activityType,
        action_description: actionDescription,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging kelembagaan activity:', error);
    // Don't throw - logging should not break the main operation
  }
}

/**
 * Get desa_id from request (supports both desa users and admin)
 */
function getDesaId(req) {
  return req.desaId || req.user?.desa_id;
}

/**
 * Validate desa access
 */
function validateDesaAccess(req, res) {
  const desaId = getDesaId(req);
  if (!desaId) {
    res.status(403).json({ success: false, message: 'User tidak memiliki akses desa' });
    return null;
  }
  return desaId;
}

module.exports = {
  prisma,
  ACTIVITY_TYPES,
  ENTITY_TYPES,
  logKelembagaanActivity,
  getDesaId,
  validateDesaAccess
};
