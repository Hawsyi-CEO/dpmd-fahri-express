/**
 * User Management Controller
 * Handles CRUD operations for user management
 */

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const path = require('path');

class UserController {
  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(req, res) {
    try {
      const { 
        role, 
        kecamatan_id, 
        desa_id, 
        bidang_id,
        search,
        page = 1, 
        limit = 50 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build filter conditions
      const where = {};
      
      if (role) {
        where.role = role;
      }
      
      if (kecamatan_id) {
        where.kecamatan_id = parseInt(kecamatan_id);
      }
      
      if (desa_id) {
        where.desa_id = parseInt(desa_id);
      }
      
      if (bidang_id) {
        where.bidang_id = parseInt(bidang_id);
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } }
        ];
      }

      // Get users without relations (users table has no defined relations in schema)
      const [users, total] = await Promise.all([
        prisma.users.findMany({
          where,
          skip,
          take: parseInt(limit),
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            bidang_id: true,
            kecamatan_id: true,
            desa_id: true,
            dinas_id: true,
            created_at: true,
            updated_at: true
          },
          orderBy: { created_at: 'desc' }
        }),
        prisma.users.count({ where })
      ]);

      // Transform data untuk response
      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bidang_id: user.bidang_id,
        kecamatan_id: user.kecamatan_id,
        desa_id: user.desa_id,
        dinas_id: user.dinas_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: transformedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bidang_id: true,
          kecamatan_id: true,
          desa_id: true,
          dinas_id: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  /**
   * Create new user
   */
  async createUser(req, res) {
    try {
      const { 
        name, 
        email, 
        password, 
        role, 
        bidang_id, 
        kecamatan_id, 
        desa_id,
        dinas_id,
        pegawai_id,
        is_active
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required'
        });
      }

      // Check if email already exists
      const existingUser = await prisma.users.findFirst({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          is_active: is_active !== undefined ? is_active : true,
          bidang_id: bidang_id ? parseInt(bidang_id) : null,
          kecamatan_id: kecamatan_id ? parseInt(kecamatan_id) : null,
          desa_id: desa_id ? BigInt(desa_id) : null,
          dinas_id: dinas_id ? parseInt(dinas_id) : null,
          pegawai_id: pegawai_id ? BigInt(pegawai_id) : null
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          bidang_id: true,
          kecamatan_id: true,
          desa_id: true,
          dinas_id: true,
          pegawai_id: true,
          created_at: true,
          updated_at: true
        }
      });

      // Return user without password
      const userWithoutPassword = newUser;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        email, 
        password, 
        role, 
        bidang_id, 
        kecamatan_id, 
        desa_id,
        dinas_id,
        pegawai_id,
        is_active
      } = req.body;

      // Check if user exists
      const existingUser = await prisma.users.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email already taken by another user
      if (email) {
        const duplicateUser = await prisma.users.findFirst({
          where: {
            AND: [
              { id: { not: parseInt(id) } },
              { email }
            ]
          }
        });

        if (duplicateUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Build update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (bidang_id !== undefined) updateData.bidang_id = bidang_id ? parseInt(bidang_id) : null;
      if (kecamatan_id !== undefined) updateData.kecamatan_id = kecamatan_id ? parseInt(kecamatan_id) : null;
      if (desa_id !== undefined) updateData.desa_id = desa_id ? BigInt(desa_id) : null;
      if (dinas_id !== undefined) updateData.dinas_id = dinas_id ? parseInt(dinas_id) : null;
      if (pegawai_id !== undefined) updateData.pegawai_id = pegawai_id ? BigInt(pegawai_id) : null;

      // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Update user
      const updatedUser = await prisma.users.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          bidang_id: true,
          kecamatan_id: true,
          desa_id: true,
          dinas_id: true,
          pegawai_id: true,
          created_at: true,
          updated_at: true
        }
      });

      // Return user without password
      const userWithoutPassword = updatedUser;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await prisma.users.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting superadmin if it's the last one
      if (existingUser.role === 'superadmin') {
        const superadminCount = await prisma.users.count({
          where: { role: 'superadmin' }
        });

        if (superadminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last superadmin user'
          });
        }
      }

      // Delete user
      await prisma.users.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      // Validate password
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      // Check if user exists
      const existingUser = await prisma.users.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      await prisma.users.update({
        where: { id: parseInt(id) },
        data: { password: hashedPassword }
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(req, res) {
    try {
      const [
        total,
        superadminCount,
        dinasCount,
        bidangCount,
        kecamatanCount,
        desaCount
      ] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { role: 'superadmin' } }),
        prisma.users.count({ 
          where: { 
            role: { 
              in: ['dinas', 'kepala_dinas', 'admin'] 
            } 
          } 
        }),
        prisma.users.count({ 
          where: { 
            role: { 
              in: [
                'sarpras',
                'sarana_prasarana',
                'kekayaan_keuangan',
                'pemberdayaan_masyarakat',
                'pemerintahan_desa',
                'sekretariat'
              ] 
            } 
          } 
        }),
        prisma.users.count({ where: { role: 'kecamatan' } }),
        prisma.users.count({ where: { role: 'desa' } })
      ]);

      res.json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          total,
          superadmin: superadminCount,
          dinas: dinasCount,
          bidang: bidangCount,
          kecamatan: kecamatanCount,
          desa: desaCount
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error.message
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password saat ini dan password baru harus diisi'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password baru minimal 6 karakter'
        });
      }

      // Get user from database
      const user = await prisma.users.findUnique({
        where: { id: BigInt(userId) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Password saat ini salah'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { password: hashedPassword }
      });

      res.json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengubah password',
        error: error.message
      });
    }
  }

  async uploadAvatar(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Check if user exists
      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old avatar if exists
      if (user.avatar) {
        const fs = require('fs');
        const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update user with new avatar path
      const avatarPath = `/storage/avatars/${req.file.filename}`;
      const updatedUser = await prisma.users.update({
        where: { id: parseInt(id) },
        data: { avatar: avatarPath },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          is_active: true,
          created_at: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
