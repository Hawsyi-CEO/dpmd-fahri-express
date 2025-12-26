// src/controllers/position.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all positions
 * GET /api/positions
 */
exports.getAllPositions = async (req, res) => {
  try {
    // Return static positions list since there's no positions table
    const positions = [
      { id: 1, name: 'Kepala Dinas', level: 1 },
      { id: 2, name: 'Sekretaris', level: 2 },
      { id: 3, name: 'Kepala Bidang', level: 3 },
      { id: 4, name: 'Kepala Sub Bagian', level: 4 },
      { id: 5, name: 'Ketua Tim', level: 5 },
      { id: 6, name: 'Staff', level: 6 }
    ];

    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('[Position Controller] Error getting positions:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data posisi',
      error: error.message
    });
  }
};

/**
 * Get all users with their positions (for admin)
 * GET /api/positions/users
 */
exports.getAllUsersWithPositions = async (req, res) => {
  try {
    const { search, position_id, page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      // Exclude superadmin, desa, kecamatan from management
      role: {
        notIn: ['superadmin', 'desa', 'kecamatan', 'admin', 'dinas', 'kkd']
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (position_id) {
      where.position_id = parseInt(position_id);
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          position_id: true,
          is_active: true,
          avatar: true,
          created_at: true,
          position: {
            select: {
              id: true,
              code: true,
              name: true,
              level: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.users.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Position Controller] Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pegawai',
      error: error.message
    });
  }
};

/**
 * Update user position
 * PUT /api/positions/users/:userId
 */
exports.updateUserPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    const { position_id, reason } = req.body;
    const changedBy = req.user.id; // From auth middleware

    // Validate userId
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        position_id: true,
        position: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Validate position_id if provided
    let newPosition = null;
    if (position_id) {
      newPosition = await prisma.positions.findUnique({
        where: { id: parseInt(position_id) }
      });

      if (!newPosition) {
        return res.status(404).json({
          success: false,
          message: 'Posisi tidak ditemukan'
        });
      }
    }

    const oldPositionId = user.position_id;

    // Update user position (don't change role, keep it as pegawai)
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        position_id: position_id ? parseInt(position_id) : null,
        updated_at: new Date()
      },
      include: {
        position: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          }
        }
      }
    });

    // Create history record
    await prisma.position_history.create({
      data: {
        user_id: BigInt(userId),
        old_position_id: oldPositionId,
        new_position_id: position_id ? parseInt(position_id) : null,
        changed_by: BigInt(changedBy),
        reason: reason || 'Perubahan posisi oleh admin',
        created_at: new Date()
      }
    });

    console.log(`[Position Controller] Position updated for user ${user.email}: ${user.position?.name || 'No Position'} -> ${newPosition?.name || 'No Position'}`);

    res.json({
      success: true,
      message: 'Posisi berhasil diupdate',
      data: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        position: updatedUser.position
      }
    });
  } catch (error) {
    console.error('[Position Controller] Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate posisi',
      error: error.message
    });
  }
};

/**
 * Get position history for a user
 * GET /api/positions/users/:userId/history
 */
exports.getUserPositionHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await prisma.position_history.findMany({
      where: {
        user_id: BigInt(userId)
      },
      include: {
        old_position: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        new_position: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        changer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Convert BigInt to string for JSON serialization
    const formattedHistory = history.map(h => ({
      ...h,
      user_id: h.user_id.toString(),
      changed_by: h.changed_by.toString(),
      changer: {
        ...h.changer,
        id: h.changer.id.toString()
      }
    }));

    res.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('[Position Controller] Error getting history:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat posisi',
      error: error.message
    });
  }
};

/**
 * Get position statistics
 * GET /api/positions/stats
 */
exports.getPositionStats = async (req, res) => {
  try {
    // Get user count per position
    const stats = await prisma.positions.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    });

    // Get users without position
    const usersWithoutPosition = await prisma.users.count({
      where: {
        position_id: null,
        role: {
          notIn: ['superadmin', 'desa', 'kecamatan', 'admin', 'dinas', 'kkd']
        }
      }
    });

    res.json({
      success: true,
      data: {
        positions: stats.map(s => ({
          ...s,
          user_count: s._count.users
        })),
        users_without_position: usersWithoutPosition
      }
    });
  } catch (error) {
    console.error('[Position Controller] Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik posisi',
      error: error.message
    });
  }
};

module.exports = exports;
