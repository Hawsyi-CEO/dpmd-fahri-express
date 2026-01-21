const sequelize = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class BankeuProposalController {
  /**
   * Get master kegiatan list
   * GET /api/desa/bankeu/master-kegiatan
   */
  async getMasterKegiatan(req, res) {
    try {
      const [kegiatan] = await sequelize.query(`
        SELECT 
          id,
          jenis_kegiatan,
          urutan,
          nama_kegiatan,
          is_active
        FROM bankeu_master_kegiatan
        WHERE is_active = TRUE
        ORDER BY jenis_kegiatan, urutan
      `);

      // Group by jenis_kegiatan
      const grouped = {
        infrastruktur: [],
        non_infrastruktur: []
      };

      kegiatan.forEach(item => {
        grouped[item.jenis_kegiatan].push({
          id: item.id,
          jenis_kegiatan: item.jenis_kegiatan,
          urutan: item.urutan,
          nama_kegiatan: item.nama_kegiatan
        });
      });

      res.json({
        success: true,
        data: grouped
      });
    } catch (error) {
      logger.error('Error fetching master kegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data master kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Get all proposals for logged-in desa
   * GET /api/desa/bankeu/proposals
   */
  async getProposalsByDesa(req, res) {
    try {
      const userId = req.user.id;

      // Get desa_id from user
      const [users] = await sequelize.query(`
        SELECT desa_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].desa_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan desa'
        });
      }

      const desaId = users[0].desa_id;

      const [proposals] = await sequelize.query(`
        SELECT 
          bp.id,
          bp.jenis_kegiatan,
          bp.kegiatan_id,
          bp.kegiatan_nama,
          bp.judul_proposal,
          bp.deskripsi,
          bp.file_proposal,
          bp.file_size,
          bp.anggaran_usulan,
          bp.status,
          bp.submitted_to_kecamatan,
          bp.submitted_at,
          bp.catatan_verifikasi,
          bp.verified_at,
          bp.berita_acara_path,
          bp.berita_acara_generated_at,
          bp.created_at,
          bp.updated_at,
          u_verified.name as verified_by_name,
          d.nama as desa_nama,
          k.nama as kecamatan_nama
        FROM bankeu_proposals bp
        LEFT JOIN users u_verified ON bp.verified_by = u_verified.id
        LEFT JOIN desas d ON bp.desa_id = d.id
        LEFT JOIN kecamatans k ON bp.kecamatan_id = k.id
        WHERE bp.desa_id = ?
        ORDER BY bp.created_at DESC
      `, { replacements: [desaId] });

      res.json({
        success: true,
        data: proposals
      });
    } catch (error) {
      logger.error('Error fetching proposals:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data proposal',
        error: error.message
      });
    }
  }

  /**
   * Upload new proposal
   * POST /api/desa/bankeu/proposals
   */
  async uploadProposal(req, res) {
    try {
      const userId = req.user.id;
      const {
        jenis_kegiatan,
        kegiatan_id,
        kegiatan_nama,
        judul_proposal,
        deskripsi,
        anggaran_usulan
      } = req.body;

      // Validate required fields
      if (!jenis_kegiatan || !kegiatan_id || !judul_proposal) {
        return res.status(400).json({
          success: false,
          message: 'Jenis kegiatan, kegiatan ID, dan judul proposal wajib diisi'
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File proposal wajib diupload'
        });
      }

      // Get desa_id and kecamatan_id from user
      const [users] = await sequelize.query(`
        SELECT u.desa_id, d.kecamatan_id 
        FROM users u
        JOIN desas d ON u.desa_id = d.id
        WHERE u.id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].desa_id) {
        // Delete uploaded file
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan desa'
        });
      }

      const desaId = users[0].desa_id;
      const kecamatanId = users[0].kecamatan_id;

      const filePath = `bankeu/${req.file.filename}`;
      const fileSize = req.file.size;

      // Check if proposal already exists for this kegiatan_id and desa_id
      const [existingProposal] = await sequelize.query(`
        SELECT id, file_proposal FROM bankeu_proposals
        WHERE desa_id = ? AND kegiatan_id = ?
      `, { replacements: [desaId, kegiatan_id] });

      let proposalId;

      if (existingProposal.length > 0) {
        // Update existing proposal (replace file)
        proposalId = existingProposal[0].id;
        const oldFilePath = existingProposal[0].file_proposal;

        // Delete old file if exists
        if (oldFilePath) {
          const fullPath = path.join(__dirname, '../../storage/uploads', oldFilePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            logger.info(`🗑️ Deleted old file: ${oldFilePath}`);
          }
        }

        await sequelize.query(`
          UPDATE bankeu_proposals
          SET 
            jenis_kegiatan = ?,
            kegiatan_nama = ?,
            judul_proposal = ?,
            deskripsi = ?,
            file_proposal = ?,
            file_size = ?,
            anggaran_usulan = ?,
            status = 'pending',
            submitted_to_kecamatan = FALSE,
            submitted_at = NULL,
            verified_by = NULL,
            verified_at = NULL,
            catatan_verifikasi = NULL,
            berita_acara_path = NULL,
            berita_acara_generated_at = NULL,
            updated_at = NOW()
          WHERE id = ?
        `, {
          replacements: [
            jenis_kegiatan,
            kegiatan_nama,
            judul_proposal,
            deskripsi || null,
            filePath,
            fileSize,
            anggaran_usulan || null,
            proposalId
          ]
        });

        logger.info(`♻️ Bankeu proposal updated (replaced): ${proposalId} by user ${userId}`);
      } else {
        // Insert new proposal
        const [result] = await sequelize.query(`
          INSERT INTO bankeu_proposals (
            desa_id,
            kecamatan_id,
            jenis_kegiatan,
            kegiatan_id,
            kegiatan_nama,
            judul_proposal,
            deskripsi,
            file_proposal,
            file_size,
            anggaran_usulan,
            created_by,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, {
          replacements: [
            desaId,
            kecamatanId,
            jenis_kegiatan,
            kegiatan_id,
            kegiatan_nama,
            judul_proposal,
            deskripsi || null,
            filePath,
            fileSize,
            anggaran_usulan || null,
            userId
          ]
        });

        proposalId = result.insertId;
        logger.info(`✅ Bankeu proposal uploaded (new): ${proposalId} by user ${userId}`);
      }

      res.status(201).json({
        success: true,
        message: 'Proposal berhasil diupload',
        data: {
          id: proposalId
        }
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          logger.error('Error deleting file:', unlinkError);
        }
      }

      logger.error('Error uploading proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload proposal',
        error: error.message
      });
    }
  }

  /**
   * Delete proposal
   * DELETE /api/desa/bankeu/proposals/:id
   */
  async deleteProposal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get desa_id from user
      const [users] = await sequelize.query(`
        SELECT desa_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].desa_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan desa'
        });
      }

      const desaId = users[0].desa_id;

      // Get proposal data
      const [proposals] = await sequelize.query(`
        SELECT file_proposal, berita_acara_path, status, desa_id
        FROM bankeu_proposals
        WHERE id = ?
      `, { replacements: [id] });

      if (!proposals || proposals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      const proposal = proposals[0];

      // Check ownership
      if (proposal.desa_id !== desaId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk menghapus proposal ini'
        });
      }

      // Don't allow deletion if already verified
      if (proposal.status === 'verified') {
        return res.status(400).json({
          success: false,
          message: 'Proposal yang sudah diverifikasi tidak dapat dihapus'
        });
      }

      // Delete files
      const filesToDelete = [proposal.file_proposal];
      if (proposal.berita_acara_path) {
        filesToDelete.push(proposal.berita_acara_path);
      }

      filesToDelete.forEach(filePath => {
        const fullPath = path.join(__dirname, '../../storage/uploads', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

      // Delete from database
      await sequelize.query(`
        DELETE FROM bankeu_proposals WHERE id = ?
      `, { replacements: [id] });

      logger.info(`✅ Bankeu proposal deleted: ${id}`);

      res.json({
        success: true,
        message: 'Proposal berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error deleting proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus proposal',
        error: error.message
      });
    }
  }

  /**
   * Submit all proposals to kecamatan (bundle submission)
   * POST /api/desa/bankeu/submit-to-kecamatan
   */
  async submitToKecamatan(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.id;

      // Get desa_id from user
      const [users] = await sequelize.query(`
        SELECT desa_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].desa_id) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan desa'
        });
      }

      const desaId = users[0].desa_id;

      // Check if already submitted
      const [existingSubmission] = await sequelize.query(`
        SELECT id FROM bankeu_proposals 
        WHERE desa_id = ? AND submitted_to_kecamatan = TRUE
        LIMIT 1
      `, { replacements: [desaId] });

      if (existingSubmission.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Proposal sudah pernah dikirim ke kecamatan'
        });
      }

      // Check if all 23 kegiatan have been uploaded (count all proposals regardless of status)
      const [uploadedCount] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM bankeu_proposals
        WHERE desa_id = ?
      `, { replacements: [desaId] });

      if (uploadedCount[0].total < 23) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Belum semua kegiatan diupload. Saat ini baru ${uploadedCount[0].total} dari 23 kegiatan.`
        });
      }

      // Mark all proposals as submitted (all statuses, not just pending)
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET submitted_to_kecamatan = TRUE,
            submitted_at = NOW()
        WHERE desa_id = ?
      `, { 
        replacements: [desaId],
        transaction 
      });

      await transaction.commit();

      logger.info(`✅ All proposals from desa ${desaId} submitted to kecamatan`);

      res.json({
        success: true,
        message: 'Semua proposal berhasil dikirim ke kecamatan'
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Error submitting to kecamatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim proposal ke kecamatan',
        error: error.message
      });
    }
  }
}

module.exports = new BankeuProposalController();
