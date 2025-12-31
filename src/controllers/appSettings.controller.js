const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AppSettingsController {
  /**
   * Get setting by key
   * GET /api/app-settings/:key
   */
  async getSetting(req, res) {
    try {
      const { key } = req.params;

      const setting = await prisma.app_settings.findUnique({
        where: { setting_key: key }
      });

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: `Setting '${key}' not found`
        });
      }

      // Parse boolean values
      let value = setting.setting_value;
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      }

      res.json({
        success: true,
        data: {
          key: setting.setting_key,
          value: value,
          description: setting.description,
          updated_at: setting.updated_at
        }
      });
    } catch (error) {
      console.error('Error getting setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get setting',
        error: error.message
      });
    }
  }

  /**
   * Update setting by key
   * PUT /api/app-settings/:key
   * Body: { value: string | boolean }
   */
  async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const userId = req.user?.id?.toString() || null;

      if (value === undefined || value === null) {
        return res.status(400).json({
          success: false,
          message: 'Value is required'
        });
      }

      // Check if user has permission (only superadmin and pemberdayaan_masyarakat)
      const userRole = req.user?.role;
      const allowedRoles = ['superadmin', 'pemberdayaan_masyarakat', 'pmd'];
      
      console.log('🔐 [App Settings] Update attempt - User role:', userRole, 'Allowed:', allowedRoles);
      
      if (!allowedRoles.includes(userRole)) {
        console.log('❌ [App Settings] Access denied for role:', userRole);
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only superadmin and pemberdayaan_masyarakat can update settings',
          debug: { userRole, allowedRoles }
        });
      }

      // Convert boolean to string for storage
      const valueStr = typeof value === 'boolean' ? value.toString() : value.toString();

      const setting = await prisma.app_settings.upsert({
        where: { setting_key: key },
        update: {
          setting_value: valueStr,
          updated_by_user_id: userId
        },
        create: {
          setting_key: key,
          setting_value: valueStr,
          updated_by_user_id: userId
        }
      });

      // Parse response value
      let responseValue = setting.setting_value;
      if (responseValue === 'true' || responseValue === 'false') {
        responseValue = responseValue === 'true';
      }

      res.json({
        success: true,
        message: 'Setting updated successfully',
        data: {
          key: setting.setting_key,
          value: responseValue,
          description: setting.description,
          updated_at: setting.updated_at,
          updated_by: userId
        }
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update setting',
        error: error.message
      });
    }
  }

  /**
   * Get all settings
   * GET /api/app-settings
   */
  async getAllSettings(req, res) {
    try {
      const settings = await prisma.app_settings.findMany({
        orderBy: { setting_key: 'asc' }
      });

      const formattedSettings = settings.map(setting => {
        let value = setting.setting_value;
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
        return {
          key: setting.setting_key,
          value: value,
          description: setting.description,
          updated_at: setting.updated_at
        };
      });

      res.json({
        success: true,
        data: formattedSettings
      });
    } catch (error) {
      console.error('Error getting all settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get settings',
        error: error.message
      });
    }
  }
}

module.exports = new AppSettingsController();
