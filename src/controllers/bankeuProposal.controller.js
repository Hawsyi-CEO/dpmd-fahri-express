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
          bp.kegiatan_id,
          bp.judul_proposal,
          bp.nama_kegiatan_spesifik,
          bp.volume,
          bp.lokasi,
          bp.deskripsi,
          bp.file_proposal,
          bp.file_size,
          bp.anggaran_usulan,
          bp.status,
          bp.submitted_to_kecamatan,
          bp.submitted_at,
          bp.submitted_to_dinas_at,
          bp.dinas_status,
          bp.dinas_catatan,
          bp.dinas_verified_at,
          bp.kecamatan_status,
          bp.kecamatan_catatan,
          bp.kecamatan_verified_at,
          bp.dpmd_status,
          bp.dpmd_catatan,
          bp.dpmd_verified_at,
          bp.catatan_verifikasi,
          bp.verified_at,
          bp.berita_acara_path,
          bp.berita_acara_generated_at,
          bp.created_at,
          bp.updated_at,
          u_verified.name as verified_by_name,
          u_dinas.name as dinas_verified_by_name,
          u_kecamatan.name as kecamatan_verified_by_name,
          u_dpmd.name as dpmd_verified_by_name,
          d.nama as desa_nama,
          d.kecamatan_id,
          k.nama as kecamatan_nama,
          bmk.jenis_kegiatan,
          bmk.nama_kegiatan
        FROM bankeu_proposals bp
        LEFT JOIN users u_verified ON bp.verified_by = u_verified.id
        LEFT JOIN users u_dinas ON bp.dinas_verified_by = u_dinas.id
        LEFT JOIN users u_kecamatan ON bp.kecamatan_verified_by = u_kecamatan.id
        LEFT JOIN users u_dpmd ON bp.dpmd_verified_by = u_dpmd.id
        LEFT JOIN desas d ON bp.desa_id = d.id
        LEFT JOIN kecamatans k ON d.kecamatan_id = k.id
        LEFT JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
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
        kegiatan_id,
        judul_proposal,
        nama_kegiatan_spesifik,
        volume,
        lokasi,
        deskripsi,
        anggaran_usulan
      } = req.body;

      // Validate required fields
      if (!kegiatan_id || !judul_proposal) {
        return res.status(400).json({
          success: false,
          message: 'Kegiatan ID dan judul proposal wajib diisi'
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
            judul_proposal = ?,
            nama_kegiatan_spesifik = ?,
            volume = ?,
            lokasi = ?,
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
            judul_proposal,
            nama_kegiatan_spesifik || null,
            volume || null,
            lokasi || null,
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
            kegiatan_id,
            judul_proposal,
            nama_kegiatan_spesifik,
            volume,
            lokasi,
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
            kegiatan_id,
            judul_proposal,
            nama_kegiatan_spesifik || null,
            volume || null,
            lokasi || null,
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
   * Update existing proposal (for revision)
   * PATCH /api/desa/bankeu/proposals/:id
   */
  async updateProposal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { anggaran_usulan, nama_kegiatan_spesifik, volume, lokasi } = req.body;

      logger.info(`♻️ UPDATE REVISION REQUEST - ID: ${id}, User: ${userId}, Anggaran: ${anggaran_usulan}`);

      // Get desa_id from user
      const [users] = await sequelize.query(`
        SELECT desa_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].desa_id) {
        // Delete uploaded file if exists
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        logger.warn(`❌ User ${userId} tidak terkait dengan desa`);
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan desa'
        });
      }

      const desaId = users[0].desa_id;

      // Get existing proposal
      const [proposals] = await sequelize.query(`
        SELECT file_proposal, status, desa_id, submitted_to_kecamatan, dinas_status
        FROM bankeu_proposals
        WHERE id = ?
      `, { replacements: [id] });

      if (!proposals || proposals.length === 0) {
        // Delete uploaded file if exists
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        logger.warn(`❌ Proposal ${id} tidak ditemukan`);
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      const proposal = proposals[0];
      logger.info(`📋 Proposal info - Status: ${proposal.status}, Dinas Status: ${proposal.dinas_status}, Submitted: ${proposal.submitted_to_kecamatan}`);

      // Check ownership
      if (proposal.desa_id !== desaId) {
        // Delete uploaded file if exists
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        logger.warn(`❌ User ${userId} tidak memiliki akses untuk proposal ${id}`);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk mengupdate proposal ini'
        });
      }

      // Allow update if:
      // 1. Kecamatan status is revision/rejected, OR
      // 2. Dinas status is revision/rejected
      // AND submitted_to_kecamatan must be FALSE (returned to desa)
      const isKecamatanRejected = proposal.status === 'revision' || proposal.status === 'rejected';
      const isDinasRejected = proposal.dinas_status === 'revision' || proposal.dinas_status === 'rejected';
      const isReturnedToDesa = !proposal.submitted_to_kecamatan;
      
      logger.info(`🔍 Validation check - Kec rejected: ${isKecamatanRejected}, Dinas rejected: ${isDinasRejected}, Returned: ${isReturnedToDesa}`);
      
      if (!isReturnedToDesa || (!isKecamatanRejected && !isDinasRejected)) {
        // Delete uploaded file if exists
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        logger.warn(`❌ Proposal ${id} tidak memenuhi syarat untuk diupdate`);
        return res.status(400).json({
          success: false,
          message: 'Hanya proposal dengan status revisi atau ditolak yang dapat diupdate',
          error: `Status: ${proposal.status}, Dinas Status: ${proposal.dinas_status}, Submitted: ${proposal.submitted_to_kecamatan}`
        });
      }

      // Detect: If returned from Kecamatan, need to send back to Kecamatan
      // If returned from Dinas, need to send to Dinas
      const returnedFromKecamatan = isKecamatanRejected;
      logger.info(`📍 Return detection - From Kecamatan: ${returnedFromKecamatan}, From Dinas: ${isDinasRejected && !returnedFromKecamatan}`);

      // Build update query
      const updates = [];
      const replacements = [];

      // Update anggaran if provided
      if (anggaran_usulan) {
        updates.push('anggaran_usulan = ?');
        replacements.push(anggaran_usulan);
      }

      // Update nama kegiatan spesifik if provided
      if (nama_kegiatan_spesifik) {
        updates.push('nama_kegiatan_spesifik = ?');
        replacements.push(nama_kegiatan_spesifik);
      }

      // Update volume if provided
      if (volume) {
        updates.push('volume = ?');
        replacements.push(volume);
      }

      // Update lokasi if provided
      if (lokasi) {
        updates.push('lokasi = ?');
        replacements.push(lokasi);
      }

      // Update file if uploaded
      if (req.file) {
        const filePath = `bankeu/${req.file.filename}`;
        const fileSize = req.file.size;

        updates.push('file_proposal = ?', 'file_size = ?');
        replacements.push(filePath, fileSize);

        // Delete old file
        const oldFilePath = proposal.file_proposal;
        if (oldFilePath) {
          const fullPath = path.join(__dirname, '../../storage/uploads', oldFilePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            logger.info(`🗑️ Deleted old file: ${oldFilePath}`);
          }
        }
      }

      // Reset status to pending, clear verification data
      // IMPORTANT: Keep verified_at for Kecamatan case so frontend can detect it
      if (returnedFromKecamatan) {
        // Returned from Kecamatan - Keep verified_at and verified_by to track origin
        logger.info(`🔄 Revisi dari Kecamatan - siap kirim kembali ke Kecamatan`);
        updates.push(
          'status = ?',
          'submitted_to_kecamatan = ?',  // Set to FALSE, will submit manually
          'submitted_at = NULL',
          'catatan_verifikasi = NULL',
          'updated_at = NOW()'
        );
        // DON'T reset: verified_by, verified_at (keep for detection)
        replacements.push('pending', false);
      } else {
        // Returned from Dinas - Keep dinas_status untuk tracking origin
        logger.info(`🔄 Revisi dari Dinas - siap kirim kembali ke Dinas`);
        updates.push(
          'status = ?',
          'submitted_to_kecamatan = ?',
          'submitted_at = NULL',
          'submitted_to_dinas_at = NULL',
          // KEEP verified_by and verified_at (track kecamatan approval)
          // KEEP dinas_status ('rejected'/'revision') untuk tracking bahwa ini dari dinas
          // KEEP dinas_catatan untuk info
          // Reset verified_by dan verified_at untuk dinas saja
          'dinas_verified_by = NULL',
          'dinas_verified_at = NULL',
          'updated_at = NOW()'
        );
        replacements.push('pending', false);
      }

      // Add id at the end for WHERE clause
      replacements.push(id);

      // Execute update
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET ${updates.join(', ')}
        WHERE id = ?
      `, { replacements });

      logger.info(`♻️ Bankeu proposal updated (revision): ${id} by user ${userId}`);
      
      // Log untuk debugging
      const destination = returnedFromKecamatan ? 'Kecamatan' : 'Dinas Terkait';
      logger.info(`📋 Revision upload - proposal ${id} siap dikirim ke ${destination}`);

      res.json({
        success: true,
        message: returnedFromKecamatan 
          ? 'Revisi proposal berhasil diupload. Gunakan tombol "Kirim ke Kecamatan" untuk mengirim.'
          : 'Revisi proposal berhasil diupload. Gunakan tombol "Kirim ke Dinas Terkait" untuk mengirim.',
        data: { 
          id: parseInt(id),
          send_to: returnedFromKecamatan ? 'kecamatan' : 'dinas',
          returned_from: returnedFromKecamatan ? 'kecamatan' : 'dinas'
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

      logger.error('Error updating proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate proposal',
        error: error.message
      });
    }
  }

  /**
   * Replace file in existing proposal (before submission to kecamatan)
   * PATCH /api/desa/bankeu/proposals/:id/replace-file
   */
  async replaceFile(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { anggaran_usulan, keep_status } = req.body;

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File proposal wajib diupload'
        });
      }

      // Get desa_id from user
      const [users] = await sequelize.query(`
        SELECT desa_id FROM users WHERE id = ?
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

      // Get existing proposal
      const [existingProposal] = await sequelize.query(`
        SELECT file_proposal, status, desa_id, submitted_to_kecamatan
        FROM bankeu_proposals
        WHERE id = ?
      `, { replacements: [id] });

      if (!existingProposal || existingProposal.length === 0) {
        // Delete uploaded file
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      const proposal = existingProposal[0];

      // Check ownership
      if (proposal.desa_id !== desaId) {
        // Delete uploaded file
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk mengupdate proposal ini'
        });
      }

      // Only allow replace for pending status and not yet submitted to kecamatan
      if (proposal.submitted_to_kecamatan) {
        // Delete uploaded file
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Proposal yang sudah dikirim ke kecamatan tidak dapat diganti filenya'
        });
      }

      if (proposal.status !== 'pending') {
        // Delete uploaded file
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Hanya proposal dengan status pending yang dapat diganti filenya'
        });
      }

      const filePath = `bankeu/${req.file.filename}`;
      const fileSize = req.file.size;
      const oldFilePath = proposal.file_proposal;

      // Delete old file if exists
      if (oldFilePath) {
        const fullPath = path.join(__dirname, '../../storage/uploads', oldFilePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          logger.info(`🗑️ Deleted old file: ${oldFilePath}`);
        }
      }

      // Update proposal - only file and optionally anggaran
      const updateFields = ['file_proposal = ?', 'file_size = ?', 'updated_at = NOW()'];
      const updateValues = [filePath, fileSize];

      if (anggaran_usulan) {
        updateFields.push('anggaran_usulan = ?');
        updateValues.push(anggaran_usulan);
      }

      updateValues.push(id);

      await sequelize.query(`
        UPDATE bankeu_proposals
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, { replacements: updateValues });

      logger.info(`🔄 Bankeu proposal file replaced: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: 'File proposal berhasil diganti',
        data: {
          id: parseInt(id)
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

      logger.error('Error replacing file:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengganti file proposal',
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
   * Submit all proposals to kecamatan (FIRST SUBMISSION - NEW FLOW)
   * POST /api/desa/bankeu/submit-to-kecamatan
   * Flow: Desa → KECAMATAN → Dinas Terkait → DPMD
   */
  /**
   * Submit proposals to DINAS TERKAIT (FIRST SUBMISSION)
   * POST /api/desa/bankeu/submit-to-dinas-terkait
   * NEW FLOW 2026-01-30: Desa → Dinas Terkait (bukan Kecamatan)
   */
  async submitToDinasTerkait(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.id;

      logger.info(`📤 SUBMIT TO DINAS TERKAIT (FIRST SUBMISSION) - User: ${userId}`);

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

      // NEW FLOW 2026-01-30: Submit proposal yang belum pernah submit
      // Kondisi: submitted_to_dinas_at IS NULL (belum pernah dikirim ke dinas)
      const [notSubmittedCount] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM bankeu_proposals
        WHERE desa_id = ? 
          AND submitted_to_dinas_at IS NULL
          AND (dinas_status IS NULL OR dinas_status = 'pending')
      `, { replacements: [desaId] });

      if (notSubmittedCount[0].total < 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tidak ada proposal yang perlu dikirim'
        });
      }

      const count = notSubmittedCount[0].total;

      // Submit to Dinas Terkait
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET submitted_to_dinas_at = NOW(),
            dinas_status = 'pending',
            status = 'pending'
        WHERE desa_id = ? 
          AND submitted_to_dinas_at IS NULL
          AND (dinas_status IS NULL OR dinas_status = 'pending')
      `, { 
        replacements: [desaId],
        transaction 
      });

      await transaction.commit();

      logger.info(`✅ ${count} proposals from desa ${desaId} submitted to DINAS TERKAIT`);

      res.json({
        success: true,
        message: `${count} proposal berhasil dikirim ke Dinas Terkait`
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Error submitting to dinas:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim proposal ke dinas terkait',
        error: error.message
      });
    }
  }

  /**
   * DEPRECATED: Kept for backward compatibility
   * Use submitToDinasTerkait instead
   */
  async submitToKecamatan(req, res) {
    return this.submitToDinasTerkait(req, res);
  }

  /**
   * Resubmit proposals (REVISI dari Dinas/Kecamatan/DPMD)
   * POST /api/desa/bankeu/resubmit
   * NEW FLOW 2026-01-30: Desa upload ulang → Dinas Terkait
   */
  async resubmitProposal(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.id;

      logger.info(`📤 RESUBMIT PROPOSAL (REVISI) - User: ${userId}`);

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

      // Get all revision proposals to detect origin
      // Proposal yang SUDAH UPLOAD ULANG: status='pending' tapi punya dinas_status/kecamatan_status/dpmd_status
      // DAN belum dikirim ulang (submitted_to_dinas_at IS NULL AND submitted_to_kecamatan = FALSE)
      const [proposals] = await sequelize.query(`
        SELECT id, dinas_status, kecamatan_status, dpmd_status, status
        FROM bankeu_proposals
        WHERE desa_id = ? 
          AND status = 'pending'
          AND submitted_to_dinas_at IS NULL
          AND submitted_to_kecamatan = FALSE
          AND (dinas_status IS NOT NULL OR kecamatan_status IS NOT NULL OR dpmd_status IS NOT NULL)
      `, { replacements: [desaId] });

      if (proposals.length < 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tidak ada proposal revisi yang perlu dikirim ulang. Upload ulang proposal yang ditolak terlebih dahulu.'
        });
      }

      // Detect rejection origin from first proposal (all should be same level)
      const firstProposal = proposals[0];
      const fromDPMD = firstProposal.dpmd_status && 
                       ['rejected', 'revision'].includes(firstProposal.dpmd_status);
      const fromKecamatan = !fromDPMD && 
                           firstProposal.kecamatan_status && 
                           ['rejected', 'revision'].includes(firstProposal.kecamatan_status);
      const fromDinas = !fromDPMD && !fromKecamatan && 
                       firstProposal.dinas_status && 
                       ['rejected', 'revision'].includes(firstProposal.dinas_status);

      logger.info(`🔍 Rejection Origin - DPMD: ${fromDPMD}, Kecamatan: ${fromKecamatan}, Dinas: ${fromDinas}`);

      let updateQuery = '';
      let destination = '';

      if (fromKecamatan) {
        // REJECT DARI KECAMATAN → Kirim langsung ke Kecamatan (skip Dinas)
        destination = 'Kecamatan';
        updateQuery = `
          UPDATE bankeu_proposals
          SET submitted_to_kecamatan = TRUE,
              submitted_to_dinas_at = NOW(),
              kecamatan_status = 'pending',
              kecamatan_catatan = NULL,
              kecamatan_verified_by = NULL,
              kecamatan_verified_at = NULL,
              dpmd_status = NULL,
              dpmd_catatan = NULL,
              dpmd_verified_by = NULL,
              dpmd_verified_at = NULL,
              submitted_to_dpmd = FALSE,
              status = 'pending',
              updated_at = NOW()
          WHERE desa_id = ? 
            AND status = 'pending'
            AND submitted_to_dinas_at IS NULL
            AND submitted_to_kecamatan = FALSE
            AND (dinas_status IS NOT NULL OR kecamatan_status IS NOT NULL OR dpmd_status IS NOT NULL)
        `;
      } else {
        // REJECT DARI DINAS atau DPMD → Kirim ke Dinas (flow normal dari awal)
        destination = fromDPMD ? 'Dinas Terkait (dari DPMD)' : 'Dinas Terkait';
        updateQuery = `
          UPDATE bankeu_proposals
          SET submitted_to_dinas_at = NOW(),
              dinas_status = 'pending',
              dinas_catatan = NULL,
              dinas_verified_by = NULL,
              dinas_verified_at = NULL,
              kecamatan_status = NULL,
              kecamatan_catatan = NULL,
              kecamatan_verified_by = NULL,
              kecamatan_verified_at = NULL,
              dpmd_status = NULL,
              dpmd_catatan = NULL,
              dpmd_verified_by = NULL,
              dpmd_verified_at = NULL,
              submitted_to_kecamatan = FALSE,
              submitted_to_dpmd = FALSE,
              status = 'pending',
              updated_at = NOW()
          WHERE desa_id = ? 
            AND status = 'pending'
            AND submitted_to_dinas_at IS NULL
            AND submitted_to_kecamatan = FALSE
            AND (dinas_status IS NOT NULL OR kecamatan_status IS NOT NULL OR dpmd_status IS NOT NULL)
        `;
      }

      await sequelize.query(updateQuery, { 
        replacements: [desaId],
        transaction 
      });

      await transaction.commit();

      const count = proposals.length;
      logger.info(`✅ ${count} revised proposals from desa ${desaId} resubmitted to ${destination}`);

      res.json({
        success: true,
        message: `${count} proposal revisi berhasil dikirim ulang ke ${destination}`
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Error resubmitting proposals:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim ulang proposal',
        error: error.message
      });
    }
  }

  /**
   * DEPRECATED: Kept for backward compatibility
   * Use resubmitProposal instead
   */
  async submitToDinas(req, res) {
    return this.resubmitProposal(req, res);
  }
}

module.exports = new BankeuProposalController();
