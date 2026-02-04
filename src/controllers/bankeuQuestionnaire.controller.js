const { sequelize } = require('../models');

/**
 * Controller for Bankeu Verification Questionnaire (13 Item Checklist)
 */
class BankeuQuestionnaireController {
  /**
   * Get questionnaire by proposal and verifier
   * GET /api/bankeu/questionnaire/:proposalId?verifier_type=dinas&verifier_id=1
   */
  async getQuestionnaire(req, res) {
    try {
      const { proposalId } = req.params;
      const { verifier_type, verifier_id } = req.query;

      if (!verifier_type) {
        return res.status(400).json({
          success: false,
          message: 'verifier_type wajib diisi (dinas, ketua, sekretaris, anggota_1, dll)'
        });
      }

      let whereClause = 'proposal_id = :proposalId AND verifier_type = :verifier_type';
      let replacements = { proposalId, verifier_type };

      if (verifier_id) {
        whereClause += ' AND verifier_id = :verifier_id';
        replacements.verifier_id = verifier_id;
      }

      const [questionnaire] = await sequelize.query(`
        SELECT * FROM bankeu_verification_questionnaire
        WHERE ${whereClause}
        LIMIT 1
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      if (!questionnaire) {
        return res.json({
          success: true,
          data: null,
          message: 'Quisioner belum diisi'
        });
      }

      res.json({
        success: true,
        data: questionnaire
      });
    } catch (error) {
      console.error('Error getting questionnaire:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data quisioner',
        error: error.message
      });
    }
  }

  /**
   * Get all questionnaires for a proposal (for berita acara aggregation)
   * GET /api/bankeu/questionnaire/:proposalId/all
   */
  async getAllQuestionnaires(req, res) {
    try {
      const { proposalId } = req.params;

      const questionnaires = await sequelize.query(`
        SELECT * FROM bankeu_verification_questionnaire
        WHERE proposal_id = :proposalId
        ORDER BY 
          CASE verifier_type
            WHEN 'dinas' THEN 1
            WHEN 'ketua' THEN 2
            WHEN 'sekretaris' THEN 3
            WHEN 'anggota_1' THEN 4
            WHEN 'anggota_2' THEN 5
            WHEN 'anggota_3' THEN 6
          END
      `, {
        replacements: { proposalId },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: questionnaires
      });
    } catch (error) {
      console.error('Error getting all questionnaires:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data quisioner',
        error: error.message
      });
    }
  }

  /**
   * Create or update questionnaire
   * POST /api/bankeu/questionnaire/:proposalId
   */
  async upsertQuestionnaire(req, res) {
    try {
      const { proposalId } = req.params;
      const {
        verifier_type,
        verifier_id,
        item_1, item_2, item_3, item_4, item_5, item_6, item_7,
        item_8, item_9, item_10, item_11, item_12, item_13,
        catatan
      } = req.body;

      // Validate required fields
      if (!verifier_type) {
        return res.status(400).json({
          success: false,
          message: 'verifier_type wajib diisi'
        });
      }

      const validTypes = ['dinas', 'ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3', 'kecamatan_tim'];
      if (!validTypes.includes(verifier_type)) {
        return res.status(400).json({
          success: false,
          message: `verifier_type harus salah satu dari: ${validTypes.join(', ')}`
        });
      }

      // Check if questionnaire exists
      const [existing] = await sequelize.query(`
        SELECT id FROM bankeu_verification_questionnaire
        WHERE proposal_id = :proposalId 
          AND verifier_type = :verifier_type
          AND (verifier_id = :verifier_id OR (:verifier_id IS NULL AND verifier_id IS NULL))
        LIMIT 1
      `, {
        replacements: { proposalId, verifier_type, verifier_id },
        type: sequelize.QueryTypes.SELECT
      });

      const items = {
        item_1: item_1 || 'ok',
        item_2: item_2 || 'ok',
        item_3: item_3 || 'ok',
        item_4: item_4 || 'ok',
        item_5: item_5 || 'ok',
        item_6: item_6 || 'ok',
        item_7: item_7 || 'ok',
        item_8: item_8 || 'ok',
        item_9: item_9 || 'ok',
        item_10: item_10 || 'ok',
        item_11: item_11 || 'ok',
        item_12: item_12 || 'ok',
        item_13: item_13 || 'ok'
      };

      if (existing) {
        // Update existing questionnaire
        await sequelize.query(`
          UPDATE bankeu_verification_questionnaire
          SET
            item_1 = :item_1, item_2 = :item_2, item_3 = :item_3, item_4 = :item_4,
            item_5 = :item_5, item_6 = :item_6, item_7 = :item_7, item_8 = :item_8,
            item_9 = :item_9, item_10 = :item_10, item_11 = :item_11, item_12 = :item_12,
            item_13 = :item_13, catatan = :catatan, updated_at = CURRENT_TIMESTAMP
          WHERE id = :id
        `, {
          replacements: { ...items, catatan, id: existing.id }
        });

        res.json({
          success: true,
          message: 'Quisioner berhasil diperbarui',
          data: { id: existing.id, ...items, catatan }
        });
      } else {
        // Insert new questionnaire
        await sequelize.query(`
          INSERT INTO bankeu_verification_questionnaire 
          (proposal_id, verifier_type, verifier_id, 
           item_1, item_2, item_3, item_4, item_5, item_6, item_7,
           item_8, item_9, item_10, item_11, item_12, item_13, catatan)
          VALUES 
          (:proposalId, :verifier_type, :verifier_id,
           :item_1, :item_2, :item_3, :item_4, :item_5, :item_6, :item_7,
           :item_8, :item_9, :item_10, :item_11, :item_12, :item_13, :catatan)
        `, {
          replacements: { proposalId, verifier_type, verifier_id, ...items, catatan }
        });

        res.status(201).json({
          success: true,
          message: 'Quisioner berhasil disimpan',
          data: { proposal_id: proposalId, verifier_type, verifier_id, ...items, catatan }
        });
      }
    } catch (error) {
      console.error('Error upserting questionnaire:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menyimpan quisioner',
        error: error.message
      });
    }
  }

  /**
   * Check if dinas questionnaire is complete (for validation before submit to kecamatan)
   * GET /api/bankeu/questionnaire/:proposalId/dinas/check
   */
  async checkDinasQuestionnaireComplete(req, res) {
    try {
      const { proposalId } = req.params;
      const { dinasId } = req.query;

      if (!dinasId) {
        return res.status(400).json({
          success: false,
          message: 'dinasId wajib diisi'
        });
      }

      const [questionnaire] = await sequelize.query(`
        SELECT id FROM bankeu_verification_questionnaire
        WHERE proposal_id = :proposalId 
          AND verifier_type = 'dinas'
          AND verifier_id = :dinasId
        LIMIT 1
      `, {
        replacements: { proposalId, dinasId },
        type: sequelize.QueryTypes.SELECT
      });

      const [dinasConfig] = await sequelize.query(`
        SELECT id FROM dinas_config
        WHERE dinas_id = :dinasId AND ttd_path IS NOT NULL
        LIMIT 1
      `, {
        replacements: { dinasId },
        type: sequelize.QueryTypes.SELECT
      });

      const isComplete = questionnaire && dinasConfig;

      res.json({
        success: true,
        data: {
          questionnaire_filled: !!questionnaire,
          ttd_uploaded: !!dinasConfig,
          is_complete: isComplete
        },
        message: isComplete 
          ? 'Quisioner dan TTD sudah lengkap' 
          : 'Quisioner atau TTD belum lengkap'
      });
    } catch (error) {
      console.error('Error checking dinas questionnaire:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memeriksa kelengkapan quisioner',
        error: error.message
      });
    }
  }

  /**
   * Check if ALL kecamatan tim verifikasi questionnaires are complete (for berita acara generation)
   * GET /api/bankeu/questionnaire/:proposalId/kecamatan/check-all
   */
  async checkKecamatanTimComplete(req, res) {
    try {
      const { proposalId } = req.params;
      const { kecamatanId } = req.query;

      if (!kecamatanId) {
        return res.status(400).json({
          success: false,
          message: 'kecamatanId wajib diisi'
        });
      }

      // Check all 5 tim members (ketua, sekretaris, anggota_1, anggota_2, anggota_3)
      const posisi = ['ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3'];
      const timStatus = [];
      let allComplete = true;

      for (const pos of posisi) {
        // Get tim member config
        const [timMember] = await sequelize.query(`
          SELECT id, nama, ttd_path FROM kecamatan_bankeu_tim_config
          WHERE kecamatan_id = :kecamatanId AND posisi = :posisi
          LIMIT 1
        `, {
          replacements: { kecamatanId, posisi: pos },
          type: sequelize.QueryTypes.SELECT
        });

        if (!timMember) {
          timStatus.push({
            posisi: pos,
            configured: false,
            questionnaire_filled: false,
            ttd_uploaded: false,
            is_complete: false
          });
          allComplete = false;
          continue;
        }

        // Check questionnaire
        const [questionnaire] = await sequelize.query(`
          SELECT id FROM bankeu_verification_questionnaire
          WHERE proposal_id = :proposalId 
            AND verifier_type = 'kecamatan'
            AND verifier_id = :timMemberId
          LIMIT 1
        `, {
          replacements: { proposalId, timMemberId: timMember.id },
          type: sequelize.QueryTypes.SELECT
        });

        const isComplete = !!questionnaire && !!timMember.ttd_path;

        timStatus.push({
          posisi: pos,
          nama: timMember.nama,
          configured: true,
          questionnaire_filled: !!questionnaire,
          ttd_uploaded: !!timMember.ttd_path,
          is_complete: isComplete
        });

        if (!isComplete) allComplete = false;
      }

      res.json({
        success: true,
        data: {
          all_complete: allComplete,
          tim_status: timStatus
        },
        message: allComplete 
          ? 'Semua tim verifikasi sudah lengkap' 
          : 'Beberapa tim verifikasi belum lengkap'
      });
    } catch (error) {
      console.error('Error checking kecamatan tim completion:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memeriksa kelengkapan tim verifikasi',
        error: error.message
      });
    }
  }
}

module.exports = new BankeuQuestionnaireController();
