/**
 * Role Management Controller
 * CRUD operations for dynamic role management (superadmin only)
 */

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

class RoleController {
  /**
   * Get all roles
   */
  async getAllRoles(req, res) {
    try {
      const roles = await prisma.roles.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });

      res.json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      logger.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await prisma.roles.findUnique({
        where: { id: parseInt(id) }
      });

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      logger.error('Error fetching role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      });
    }
  }

  /**
   * Create new role (superadmin only)
   */
  async createRole(req, res) {
    try {
      const { name, label, color, description, category, needs_entity } = req.body;

      if (!name || !label) {
        return res.status(400).json({
          success: false,
          message: 'Name dan label harus diisi'
        });
      }

      // Validate name format: lowercase, underscores, no spaces
      const nameRegex = /^[a-z][a-z0-9_]*$/;
      if (!nameRegex.test(name)) {
        return res.status(400).json({
          success: false,
          message: 'Name harus lowercase, tanpa spasi (gunakan underscore). Contoh: kepala_bidang'
        });
      }

      // Check for duplicate name
      const existing = await prisma.roles.findUnique({
        where: { name }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Role dengan nama "${name}" sudah ada`
        });
      }

      const newRole = await prisma.roles.create({
        data: {
          name,
          label,
          color: color || 'gray',
          description: description || null,
          category: category || 'other',
          is_system: false, // User-created roles are never system roles
          needs_entity: needs_entity || false
        }
      });

      logger.info(`✅ Role created: ${name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Role berhasil ditambahkan',
        data: newRole
      });
    } catch (error) {
      logger.error('Error creating role:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan role',
        error: error.message
      });
    }
  }

  /**
   * Update role (superadmin only)
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { label, color, description, category, needs_entity } = req.body;

      const existingRole = await prisma.roles.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Build update data (name and is_system cannot be changed)
      const updateData = {};
      if (label !== undefined) updateData.label = label;
      if (color !== undefined) updateData.color = color;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (needs_entity !== undefined) updateData.needs_entity = needs_entity;

      const updatedRole = await prisma.roles.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.info(`✅ Role updated: ${existingRole.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Role berhasil diupdate',
        data: updatedRole
      });
    } catch (error) {
      logger.error('Error updating role:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate role',
        error: error.message
      });
    }
  }

  /**
   * Delete role (superadmin only, non-system roles only)
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const existingRole = await prisma.roles.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      if (existingRole.is_system) {
        return res.status(400).json({
          success: false,
          message: 'Role sistem tidak dapat dihapus'
        });
      }

      // Check if any users are using this role
      const usersWithRole = await prisma.users.count({
        where: { role: existingRole.name }
      });

      if (usersWithRole > 0) {
        return res.status(400).json({
          success: false,
          message: `Tidak dapat menghapus role "${existingRole.label}" karena masih digunakan oleh ${usersWithRole} user`
        });
      }

      await prisma.roles.delete({
        where: { id: parseInt(id) }
      });

      logger.info(`✅ Role deleted: ${existingRole.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Role berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error deleting role:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus role',
        error: error.message
      });
    }
  }
}

module.exports = new RoleController();
