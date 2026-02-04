const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * Controller for Kecamatan Bankeu Tim Configuration
 */
class KecamatanBankeuTimConfigController {
  /**
   * Get all tim config for a kecamatan
   * GET /api/kecamatan/:kecamatanId/bankeu/tim-config
   */
  async getAllTimConfig(req, res) {
    try {
      const { kecamatanId } = req.params;
      
      const timConfig = await sequelize.query(`
        SELECT 
          id,
          kecamatan_id,
          posisi,
          nama,
          nip,
          jabatan,
          ttd_path,
          created_at,
          updated_at
        FROM kecamatan_bankeu_tim_config
        WHERE kecamatan_id = :kecamatanId
        ORDER BY 
          FIELD(posisi, 'ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3')
      `, {
        replacements: { kecamatanId },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: timConfig
      });
    } catch (error) {
      console.error('Error getting tim config:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil konfigurasi tim',
        error: error.message
      });
    }
  }

  /**
   * Get specific tim member config
   * GET /api/kecamatan/:kecamatanId/bankeu/tim-config/:posisi
   */
  async getTimMemberConfig(req, res) {
    try {
      const { kecamatanId, posisi } = req.params;
      
      const [config] = await sequelize.query(`
        SELECT 
          id,
          kecamatan_id,
          posisi,
          nama,
          nip,
          jabatan,
          ttd_path,
          created_at,
          updated_at
        FROM kecamatan_bankeu_tim_config
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
        LIMIT 1
      `, {
        replacements: { kecamatanId, posisi },
        type: sequelize.QueryTypes.SELECT
      });

      if (!config) {
        return res.json({
          success: true,
          data: null,
          message: 'Konfigurasi belum dibuat'
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting tim member config:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil konfigurasi anggota tim',
        error: error.message
      });
    }
  }

  /**
   * Create or update tim member config
   * POST /api/kecamatan/:kecamatanId/bankeu/tim-config/:posisi
   */
  async upsertTimMemberConfig(req, res) {
    try {
      const { kecamatanId, posisi } = req.params;
      const { nama, nip, jabatan } = req.body;

      if (!nama || !jabatan) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan Jabatan wajib diisi'
        });
      }

      // Check if exists
      const [existing] = await sequelize.query(`
        SELECT id FROM kecamatan_bankeu_tim_config 
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
        LIMIT 1
      `, {
        replacements: { kecamatanId, posisi },
        type: sequelize.QueryTypes.SELECT
      });

      if (existing) {
        // Update
        await sequelize.query(`
          UPDATE kecamatan_bankeu_tim_config 
          SET nama = :nama, nip = :nip, jabatan = :jabatan, updated_at = CURRENT_TIMESTAMP
          WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
        `, {
          replacements: { kecamatanId, posisi, nama, nip, jabatan }
        });

        res.json({
          success: true,
          message: 'Konfigurasi anggota tim berhasil diperbarui',
          data: { id: existing.id, kecamatan_id: kecamatanId, posisi, nama, nip, jabatan }
        });
      } else {
        // Insert
        const [result] = await sequelize.query(`
          INSERT INTO kecamatan_bankeu_tim_config (kecamatan_id, posisi, nama, nip, jabatan)
          VALUES (:kecamatanId, :posisi, :nama, :nip, :jabatan)
        `, {
          replacements: { kecamatanId, posisi, nama, nip, jabatan }
        });

        res.status(201).json({
          success: true,
          message: 'Konfigurasi anggota tim berhasil dibuat',
          data: { id: result.insertId, kecamatan_id: kecamatanId, posisi, nama, nip, jabatan }
        });
      }
    } catch (error) {
      console.error('Error upserting tim member config:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menyimpan konfigurasi anggota tim',
        error: error.message
      });
    }
  }

  /**
   * Upload TTD for tim member
   * POST /api/kecamatan/:kecamatanId/bankeu/tim-config/:posisi/upload-ttd
   */
  async uploadTTD(req, res) {
    try {
      const { kecamatanId, posisi } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File tanda tangan wajib diunggah'
        });
      }

      // Ensure config exists
      const [config] = await sequelize.query(`
        SELECT id, ttd_path FROM kecamatan_bankeu_tim_config
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
        LIMIT 1
      `, {
        replacements: { kecamatanId, posisi },
        type: sequelize.QueryTypes.SELECT
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Konfigurasi belum dibuat. Silakan isi data anggota tim terlebih dahulu.'
        });
      }

      // Delete old TTD if exists
      if (config.ttd_path) {
        const oldFilePath = path.join(__dirname, '../../storage/uploads', config.ttd_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Save file
      const fileName = `kecamatan_${kecamatanId}_${posisi}_${Date.now()}${path.extname(req.file.originalname)}`;
      const uploadDir = path.join(__dirname, '../../storage/uploads/kecamatan_bankeu_ttd');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.renameSync(req.file.path, filePath);

      const ttdPath = `kecamatan_bankeu_ttd/${fileName}`;

      // Update config
      await sequelize.query(`
        UPDATE kecamatan_bankeu_tim_config 
        SET ttd_path = :ttdPath, updated_at = CURRENT_TIMESTAMP
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
      `, {
        replacements: { kecamatanId, posisi, ttdPath }
      });

      res.json({
        success: true,
        message: 'Tanda tangan berhasil diunggah',
        data: { ttd_path: ttdPath }
      });
    } catch (error) {
      console.error('Error uploading TTD:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengunggah tanda tangan',
        error: error.message
      });
    }
  }

  /**
   * Delete TTD for tim member
   * DELETE /api/kecamatan/:kecamatanId/bankeu/tim-config/:posisi/ttd
   */
  async deleteTTD(req, res) {
    try {
      const { kecamatanId, posisi } = req.params;

      const [config] = await sequelize.query(`
        SELECT id, ttd_path FROM kecamatan_bankeu_tim_config
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
        LIMIT 1
      `, {
        replacements: { kecamatanId, posisi },
        type: sequelize.QueryTypes.SELECT
      });

      if (!config || !config.ttd_path) {
        return res.status(404).json({
          success: false,
          message: 'Tanda tangan tidak ditemukan'
        });
      }

      // Delete file
      const filePath = path.join(__dirname, '../../storage/uploads', config.ttd_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update config
      await sequelize.query(`
        UPDATE kecamatan_bankeu_tim_config 
        SET ttd_path = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
      `, {
        replacements: { kecamatanId, posisi }
      });

      res.json({
        success: true,
        message: 'Tanda tangan berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting TTD:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus tanda tangan',
        error: error.message
      });
    }
  }
}

module.exports = new KecamatanBankeuTimConfigController();
