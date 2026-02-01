const sequelize = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const beritaAcaraService = require('../services/beritaAcaraService');
const sharp = require('sharp');

class BankeuVerificationController {
  /**
   * Get all proposals for kecamatan
   * GET /api/kecamatan/bankeu/proposals
   */
  async getProposalsByKecamatan(req, res) {
    try {
      const userId = req.user.id;
      const { status, jenis_kegiatan, desa_id } = req.query;

      // Get kecamatan_id from user
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].kecamatan_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan kecamatan'
        });
      }

      const kecamatanId = users[0].kecamatan_id;

      // NEW FLOW 2026-01-30: Desa → Dinas → Kecamatan → DPMD
      // Show proposals where:
      // 1. dinas_status = 'approved' (sudah disetujui Dinas)
      // 2. submitted_to_kecamatan = TRUE (dikirim ke Kecamatan)
      // 3. kecamatan_status IS NULL or 'pending' or 'in_review' (belum diproses Kecamatan)
      let whereClause = `WHERE d.kecamatan_id = ? 
        AND bp.submitted_to_kecamatan = TRUE 
        AND bp.dinas_status = 'approved'
        AND (bp.kecamatan_status IS NULL OR bp.kecamatan_status IN ('pending', 'in_review'))`;
      const replacements = [kecamatanId];

      if (status) {
        whereClause += ' AND bp.kecamatan_status = ?';
        replacements.push(status);
      }

      if (desa_id) {
        whereClause += ' AND bp.desa_id = ?';
        replacements.push(desa_id);
      }

      const [proposals] = await sequelize.query(`
        SELECT 
          bp.id,
          bp.desa_id,
          bp.kegiatan_id,
          bp.judul_proposal,
          bp.deskripsi,
          bp.file_proposal,
          bp.file_size,
          bp.anggaran_usulan,
          bp.status,
          bp.dinas_status,
          bp.dinas_catatan,
          bp.dinas_verified_at,
          bp.kecamatan_status,
          bp.kecamatan_catatan,
          bp.submitted_to_kecamatan,
          bp.submitted_at,
          bp.catatan_verifikasi,
          bp.verified_at,
          bp.berita_acara_path,
          bp.berita_acara_generated_at,
          bp.created_at,
          bp.updated_at,
          u_created.name as created_by_name,
          u_verified.name as verified_by_name,
          u_dinas.name as dinas_verifier_name,
          d.nama as desa_nama,
          d.kecamatan_id,
          k.nama as kecamatan_nama,
          bmk.jenis_kegiatan,
          bmk.nama_kegiatan,
          bmk.dinas_terkait
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id
        INNER JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
        LEFT JOIN users u_created ON bp.created_by = u_created.id
        LEFT JOIN users u_verified ON bp.verified_by = u_verified.id
        LEFT JOIN users u_dinas ON bp.dinas_verified_by = u_dinas.id
        LEFT JOIN kecamatans k ON d.kecamatan_id = k.id
        ${whereClause}
        ORDER BY bp.created_at DESC
      `, { replacements });

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
   * Verify (approve/reject) proposal
   * PATCH /api/kecamatan/bankeu/proposals/:id/verify
   */
  async verifyProposal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { action, catatan } = req.body; // action: 'approved', 'rejected', 'revision'

      logger.info(`🔍 KECAMATAN VERIFY - ID: ${id}, Action: ${action}, User: ${userId}`);

      // Validate action
      if (!['approved', 'rejected', 'revision'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action tidak valid. Gunakan: approved, rejected, atau revision'
        });
      }

      // Get kecamatan_id from user
      const [users] = await sequelize.query(`
        SELECT kecamatan_id, name FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].kecamatan_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan kecamatan'
        });
      }

      const kecamatanId = users[0].kecamatan_id;

      // Get proposal
      const [proposals] = await sequelize.query(`
        SELECT bp.*, d.nama as desa_nama, d.kecamatan_id, k.nama as kecamatan_nama
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id
        INNER JOIN kecamatans k ON d.kecamatan_id = k.id
        WHERE bp.id = ? AND d.kecamatan_id = ?
      `, { replacements: [id, kecamatanId] });

      if (!proposals || proposals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan atau tidak termasuk dalam kecamatan Anda'
        });
      }

      const proposal = proposals[0];

      // NEW FLOW 2026-01-30: Desa → Dinas → Kecamatan → DPMD
      // Reject Kecamatan → RETURN to DESA (Desa upload ulang → Kecamatan langsung)
      // Reset submitted flags dan keep status untuk tracking
      if (action === 'rejected' || action === 'revision') {
        logger.info(`⬅️ Kecamatan returning proposal ${id} to DESA`);
        
        await sequelize.query(`
          UPDATE bankeu_proposals
          SET 
            kecamatan_status = ?,
            kecamatan_catatan = ?,
            kecamatan_verified_by = ?,
            kecamatan_verified_at = NOW(),
            submitted_to_kecamatan = FALSE,
            submitted_to_dinas_at = NULL,
            status = ?
          WHERE id = ?
        `, {
          replacements: [action, catatan || null, userId, action, id]
        });

        logger.info(`✅ Proposal ${id} dikembalikan ke Desa dengan status ${action}`);

        return res.json({
          success: true,
          message: `Proposal dikembalikan ke Desa untuk ${action === 'rejected' ? 'diperbaiki' : 'direvisi'}`,
          data: {
            id,
            kecamatan_status: action,
            returned_to: 'desa'
          }
        });
      }

      // NEW FLOW: If approved → SUBMIT to DPMD (status tetap pending sampai DPMD approve)
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET 
          kecamatan_status = 'approved',
          kecamatan_catatan = ?,
          kecamatan_verified_by = ?,
          kecamatan_verified_at = NOW(),
          submitted_to_dpmd = TRUE,
          submitted_to_dpmd_at = NOW(),
          dpmd_status = 'pending',
          status = 'pending'
        WHERE id = ?
      `, {
        replacements: [catatan || null, userId, id]
      });

      logger.info(`✅ Kecamatan approved proposal ${id} - SUBMITTED TO DPMD`);

      res.json({
        success: true,
        message: `Proposal disetujui dan dikirim ke DPMD`,
        data: {
          id,
          kecamatan_status: 'approved',
          submitted_to_dpmd: true
        }
      });
    } catch (error) {
      logger.error('Error verifying proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memverifikasi proposal',
        error: error.message
      });
    }
  }

  /**
   * Generate Berita Acara PDF
   */
  static async generateBeritaAcara(proposal, verifierName, userId) {
    try {
      const fileName = `BA_${proposal.desa_nama.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../storage/uploads/bankeu/berita_acara', fileName);
      
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('BERITA ACARA VERIFIKASI', { align: 'center' })
         .moveDown();

      doc.fontSize(14)
         .text('PROPOSAL BANTUAN KEUANGAN DESA', { align: 'center' })
         .moveDown(2);

      // Content
      doc.fontSize(11)
         .font('Helvetica');

      const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.text(`Pada hari ini, ${currentDate}, telah dilakukan verifikasi terhadap proposal Bantuan Keuangan dengan rincian sebagai berikut:`)
         .moveDown();

      // Proposal Details
      doc.font('Helvetica-Bold').text('I. DATA PROPOSAL', { underline: true }).moveDown(0.5);
      doc.font('Helvetica');

      const details = [
        ['Nama Desa', proposal.desa_nama],
        ['Kecamatan', proposal.kecamatan_nama],
        ['Jenis Kegiatan', proposal.jenis_kegiatan === 'infrastruktur' ? 'Infrastruktur' : 'Non-Infrastruktur'],
        ['Nama Kegiatan', proposal.kegiatan_nama],
        ['Judul Proposal', proposal.judul_proposal],
      ];

      if (proposal.anggaran_usulan) {
        details.push(['Anggaran Usulan', `Rp ${Number(proposal.anggaran_usulan).toLocaleString('id-ID')}`]);
      }

      details.forEach(([label, value]) => {
        doc.text(`${label.padEnd(25, ' ')}: ${value}`);
      });

      doc.moveDown(2);

      // Verification Result
      doc.font('Helvetica-Bold').text('II. HASIL VERIFIKASI', { underline: true }).moveDown(0.5);
      doc.font('Helvetica');
      doc.text(`Status: DISETUJUI`).moveDown(0.5);
      
      if (proposal.catatan_verifikasi) {
        doc.text(`Catatan: ${proposal.catatan_verifikasi}`).moveDown();
      }

      doc.moveDown(2);

      // Signature
      doc.text('Demikian Berita Acara ini dibuat untuk dapat dipergunakan sebagaimana mestinya.')
         .moveDown(2);

      const signatureY = doc.y;
      
      doc.text('Mengetahui,', 50, signatureY);
      doc.text('Yang Memverifikasi,', 350, signatureY);

      doc.moveDown(4);

      doc.text('(                                        )', 50, doc.y);
      doc.text(`( ${verifierName} )`, 350, doc.y - doc.currentLineHeight());

      doc.end();

      // Wait for file to be written
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      logger.info(`✅ Berita Acara generated: ${fileName}`);

      return `bankeu/berita_acara/${fileName}`;
    } catch (error) {
      logger.error('Error generating berita acara:', error);
      throw error;
    }
  }

  /**
   * Get statistics for kecamatan
   * GET /api/kecamatan/bankeu/statistics
   */
  async getStatistics(req, res) {
    try {
      const userId = req.user.id;

      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].kecamatan_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan kecamatan'
        });
      }

      const kecamatanId = users[0].kecamatan_id;

      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_proposals,
          SUM(CASE WHEN bp.status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN bp.status = 'verified' THEN 1 ELSE 0 END) as verified,
          SUM(CASE WHEN bp.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN bp.status = 'revision' THEN 1 ELSE 0 END) as revision,
          SUM(CASE WHEN bmk.jenis_kegiatan = 'infrastruktur' THEN 1 ELSE 0 END) as infrastruktur,
          SUM(CASE WHEN bmk.jenis_kegiatan = 'non_infrastruktur' THEN 1 ELSE 0 END) as non_infrastruktur
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id
        INNER JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
        WHERE d.kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik',
        error: error.message
      });
    }
  }

  /**
   * Generate Berita Acara per Desa
   * POST /api/kecamatan/bankeu/desa/:desaId/berita-acara
   */
  async generateBeritaAcaraDesa(req, res) {
    try {
      const { desaId } = req.params;
      const userId = req.user.id;

      // Get user info
      const [users] = await sequelize.query(`
        SELECT kecamatan_id, name FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].kecamatan_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan kecamatan'
        });
      }

      const kecamatanId = users[0].kecamatan_id;

      // Verify desa belongs to kecamatan
      const [desas] = await sequelize.query(`
        SELECT d.nama
        FROM desas d
        WHERE d.id = ? AND d.kecamatan_id = ?
      `, { replacements: [desaId, kecamatanId] });

      if (!desas || desas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Desa tidak ditemukan atau bukan wewenang kecamatan Anda'
        });
      }

      // Use service to generate berita acara
      const filePath = await beritaAcaraService.generateBeritaAcaraVerifikasi({
        desaId: parseInt(desaId),
        kecamatanId
      });

      // Update proposals with berita acara path
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET 
          berita_acara_path = ?,
          berita_acara_generated_at = NOW()
        WHERE desa_id = ?
      `, { replacements: [filePath, desaId] });

      logger.info(`✅ Berita Acara generated for desa ${desaId}: ${filePath}`);

      res.json({
        success: true,
        message: 'Berita Acara berhasil dibuat',
        data: {
          file_path: filePath,
          desa_nama: desas[0].nama,
          download_url: filePath
        }
      });
    } catch (error) {
      logger.error('Error generating berita acara:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat Berita Acara',
        error: error.message
      });
    }
  }

  /**
   * Submit review results (send to DPMD or return to Desa)
   * POST /api/kecamatan/bankeu/desa/:desaId/submit-review
   */
  async submitReview(req, res) {
    try {
      const { desaId } = req.params;
      const { action } = req.body; // 'submit' or 'return'
      const userId = req.user.id;

      logger.info(`🚀 SUBMIT REVIEW REQUEST - Desa: ${desaId}, Action: ${action}, User: ${userId}`);

      if (!['submit', 'return'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action tidak valid. Gunakan: submit atau return'
        });
      }

      // Get user info
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || !users[0].kecamatan_id) {
        return res.status(403).json({
          success: false,
          message: 'User tidak terkait dengan kecamatan'
        });
      }

      const kecamatanId = users[0].kecamatan_id;

      // Verify desa belongs to this kecamatan
      const [desas] = await sequelize.query(`
        SELECT * FROM desas WHERE id = ? AND kecamatan_id = ?
      `, { replacements: [desaId, kecamatanId] });

      if (!desas || desas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Desa tidak ditemukan'
        });
      }

      // Check if all proposals have been reviewed (no pending status)
      const [pendingCount] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM bankeu_proposals
        WHERE desa_id = ? AND kecamatan_id = ? AND status = 'pending'
      `, { replacements: [desaId, kecamatanId] });

      if (pendingCount[0].total > 0) {
        return res.status(400).json({
          success: false,
          message: `Masih ada ${pendingCount[0].total} proposal yang belum direview. Review semua proposal terlebih dahulu.`
        });
      }

      // Check if there are any proposals at all
      const [totalCount] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM bankeu_proposals
        WHERE desa_id = ? AND kecamatan_id = ?
      `, { replacements: [desaId, kecamatanId] });

      if (totalCount[0].total === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada proposal dari desa ini'
        });
      }

      // Update submitted_to_kecamatan based on action
      if (action === 'return') {
        // Kembalikan ke desa: set submitted_to_kecamatan = FALSE
        // Ini memungkinkan desa untuk upload ulang dan submit lagi
        await sequelize.query(`
          UPDATE bankeu_proposals
          SET submitted_to_kecamatan = FALSE, submitted_at = NULL
          WHERE desa_id = ? AND kecamatan_id = ?
        `, { replacements: [desaId, kecamatanId] });
        
        logger.info(`🔙 ${totalCount[0].total} proposals returned to desa ${desaId} by user ${userId}`);
      } else {
        // Kirim ke DPMD: set submitted_to_dpmd = TRUE (tetap submitted_to_kecamatan = TRUE)
        await sequelize.query(`
          UPDATE bankeu_proposals
          SET submitted_to_dpmd = TRUE, submitted_to_dpmd_at = NOW()
          WHERE desa_id = ? AND kecamatan_id = ?
        `, { replacements: [desaId, kecamatanId] });
        
        logger.info(`✅ ${totalCount[0].total} proposals submitted to DPMD from desa ${desaId} by user ${userId}`);
      }

      res.json({
        success: true,
        message: `Review berhasil ${action === 'submit' ? 'dikirim ke DPMD' : 'dikembalikan ke desa'}`,
        data: {
          action,
          desa_id: desaId
        }
      });
    } catch (error) {
      logger.error('Error submitting review:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim hasil review',
        error: error.message
      });
    }
  }

  /**
   * Get kecamatan configuration
   * GET /api/kecamatan/bankeu/config/:kecamatanId
   */
  async getConfig(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke kecamatan ini'
        });
      }

      const [config] = await sequelize.query(`
        SELECT * FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      // Return empty object if config doesn't exist yet (allow new configs to be created)
      const configData = config.length > 0 ? config[0] : {
        kecamatan_id: kecamatanId,
        nama_camat: '',
        nip_camat: '',
        alamat: '',
        logo_path: null,
        ttd_camat_path: null
      };

      res.json({
        success: true,
        data: configData
      });
    } catch (error) {
      logger.error('Error getting config:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil konfigurasi',
        error: error.message
      });
    }
  }

  /**
   * Save kecamatan configuration
   * POST /api/kecamatan/bankeu/config/:kecamatanId
   */
  async saveConfig(req, res) {
    try {
      const { kecamatanId } = req.params;
      const { nama_camat, nip_camat, alamat, telepon, email, website, kode_pos } = req.body;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke kecamatan ini'
        });
      }

      // Check if config exists
      const [existing] = await sequelize.query(`
        SELECT id FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      if (existing.length > 0) {
        // Update
        await sequelize.query(`
          UPDATE kecamatan_bankeu_config
          SET nama_camat = ?, nip_camat = ?, alamat = ?, telepon = ?, email = ?, website = ?, kode_pos = ?, updated_at = NOW()
          WHERE kecamatan_id = ?
        `, { replacements: [nama_camat, nip_camat, alamat, telepon, email, website, kode_pos, kecamatanId] });
      } else {
        // Insert
        await sequelize.query(`
          INSERT INTO kecamatan_bankeu_config (kecamatan_id, nama_camat, nip_camat, alamat, telepon, email, website, kode_pos, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, { replacements: [kecamatanId, nama_camat, nip_camat, alamat, telepon, email, website, kode_pos] });
      }

      const [updated] = await sequelize.query(`
        SELECT * FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Konfigurasi berhasil disimpan',
        data: updated[0]
      });
    } catch (error) {
      logger.error('Error saving config:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menyimpan konfigurasi',
        error: error.message
      });
    }
  }

  /**
   * Get tim verifikasi for kecamatan
   * GET /api/kecamatan/bankeu/tim-verifikasi/:kecamatanId
   */
  async getTimVerifikasi(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke kecamatan ini'
        });
      }

      const [timVerifikasi] = await sequelize.query(`
        SELECT * FROM tim_verifikasi_kecamatan
        WHERE kecamatan_id = ? AND is_active = TRUE
        ORDER BY FIELD(jabatan, 'ketua', 'sekretaris', 'anggota'), nama ASC
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        data: timVerifikasi
      });
    } catch (error) {
      logger.error('Error getting tim verifikasi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data tim verifikasi',
        error: error.message
      });
    }
  }

  /**
   * Add anggota tim verifikasi
   * POST /api/kecamatan/bankeu/tim-verifikasi/:kecamatanId
   */
  async addTimVerifikasi(req, res) {
    try {
      const { kecamatanId } = req.params;
      const { jabatan, nama, nip, jabatan_label } = req.body;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke kecamatan ini'
        });
      }

      // Validate required fields
      if (!jabatan || !nama || !nip) {
        return res.status(400).json({
          success: false,
          message: 'Jabatan, nama, dan NIP wajib diisi'
        });
      }

      // Check if ketua already exists (optional validation)
      if (jabatan.toLowerCase() === 'ketua') {
        const [existing] = await sequelize.query(`
          SELECT id FROM tim_verifikasi_kecamatan
          WHERE kecamatan_id = ? AND LOWER(jabatan) = 'ketua' AND is_active = TRUE
        `, { replacements: [kecamatanId] });

        if (existing.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Ketua tim verifikasi sudah ada'
          });
        }
      }

      const [result] = await sequelize.query(`
        INSERT INTO tim_verifikasi_kecamatan (kecamatan_id, jabatan, nama, nip, jabatan_label, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())
      `, { replacements: [kecamatanId, jabatan, nama, nip, jabatan_label || null] });

      res.status(201).json({
        success: true,
        message: 'Anggota tim verifikasi berhasil ditambahkan',
        data: {
          id: result.insertId,
          kecamatan_id: kecamatanId,
          jabatan,
          nama,
          nip,
          jabatan_label,
          is_active: true
        }
      });
    } catch (error) {
      logger.error('Error adding tim verifikasi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan anggota tim verifikasi',
        error: error.message
      });
    }
  }

  /**
   * Remove anggota tim verifikasi
   * DELETE /api/kecamatan/bankeu/tim-verifikasi/:id
   */
  async removeTimVerifikasi(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get tim data to verify access
      const [timData] = await sequelize.query(`
        SELECT kecamatan_id FROM tim_verifikasi_kecamatan
        WHERE id = ?
      `, { replacements: [id] });

      if (timData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data anggota tim tidak ditemukan'
        });
      }

      const kecamatanId = timData[0].kecamatan_id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      await sequelize.query(`
        UPDATE tim_verifikasi_kecamatan
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = ?
      `, { replacements: [id] });

      res.json({
        success: true,
        message: 'Anggota tim verifikasi berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error removing tim verifikasi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus anggota tim verifikasi',
        error: error.message
      });
    }
  }

  /**
   * Upload signature for tim member
   * POST /api/kecamatan/bankeu/tim-verifikasi/:id/upload-signature
   */
  async uploadTimSignature(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      // Get tim data to verify access
      const [timData] = await sequelize.query(`
        SELECT kecamatan_id FROM tim_verifikasi_kecamatan
        WHERE id = ?
      `, { replacements: [id] });

      if (timData.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Data anggota tim tidak ditemukan'
        });
      }

      const kecamatanId = timData[0].kecamatan_id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const filePath = `signatures/${req.file.filename}`;

      await sequelize.query(`
        UPDATE tim_verifikasi_kecamatan
        SET ttd_path = ?, updated_at = NOW()
        WHERE id = ?
      `, { replacements: [filePath, id] });

      res.json({
        success: true,
        message: 'Tanda tangan berhasil diupload',
        data: { ttd_path: filePath }
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      logger.error('Error uploading signature:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload tanda tangan',
        error: error.message
      });
    }
  }

  /**
   * Upload logo for kecamatan
   * POST /api/kecamatan/bankeu/config/:kecamatanId/upload-logo
   */
  async uploadLogo(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const filePath = `signatures/${req.file.filename}`;

      await sequelize.query(`
        UPDATE kecamatan_bankeu_config
        SET logo_path = ?, updated_at = NOW()
        WHERE kecamatan_id = ?
      `, { replacements: [filePath, kecamatanId] });

      const [updated] = await sequelize.query(`
        SELECT * FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Logo berhasil diupload',
        data: updated[0]
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      logger.error('Error uploading logo:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload logo',
        error: error.message
      });
    }
  }

  /**
   * Upload camat signature
   * POST /api/kecamatan/bankeu/config/:kecamatanId/upload-camat-signature
   */
  async uploadCamatSignature(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const filePath = `signatures/${req.file.filename}`;

      await sequelize.query(`
        UPDATE kecamatan_bankeu_config
        SET ttd_camat_path = ?, updated_at = NOW()
        WHERE kecamatan_id = ?
      `, { replacements: [filePath, kecamatanId] });

      const [updated] = await sequelize.query(`
        SELECT * FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Tanda tangan camat berhasil diupload',
        data: updated[0]
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      logger.error('Error uploading camat signature:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload tanda tangan camat',
        error: error.message
      });
    }
  }

  /**
   * Delete camat signature
   * DELETE /api/kecamatan/bankeu/config/:kecamatanId/delete-camat-signature
   */
  async deleteCamatSignature(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      // Get current signature path
      const [config] = await sequelize.query(`
        SELECT ttd_camat_path FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      // Delete file if exists
      if (config && config[0] && config[0].ttd_camat_path) {
        const filePath = path.join(__dirname, '../../storage/uploads', config[0].ttd_camat_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Update database
      await sequelize.query(`
        UPDATE kecamatan_bankeu_config
        SET ttd_camat_path = NULL, updated_at = NOW()
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Tanda tangan camat berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error deleting camat signature:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus tanda tangan',
        error: error.message
      });
    }
  }

  /**
   * Upload stempel (must be PNG transparent)
   * POST /api/kecamatan/bankeu/config/:kecamatanId/upload-stempel
   */
  async uploadStempel(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File wajib diupload'
        });
      }

      // Verify file is PNG
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.png') {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Stempel harus berformat PNG transparan'
        });
      }

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const filePath = `signatures/${req.file.filename}`;

      await sequelize.query(`
        UPDATE kecamatan_bankeu_config
        SET stempel_path = ?, updated_at = NOW()
        WHERE kecamatan_id = ?
      `, { replacements: [filePath, kecamatanId] });

      const [updated] = await sequelize.query(`
        SELECT * FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Stempel berhasil diupload',
        data: updated[0]
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      logger.error('Error uploading stempel:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload stempel',
        error: error.message
      });
    }
  }

  /**
   * Delete stempel
   * DELETE /api/kecamatan/bankeu/config/:kecamatanId/delete-stempel
   */
  async deleteStempel(req, res) {
    try {
      const { kecamatanId } = req.params;
      const userId = req.user.id;

      // Verify user is from this kecamatan
      const [users] = await sequelize.query(`
        SELECT kecamatan_id FROM users WHERE id = ?
      `, { replacements: [userId] });

      if (!users || users.length === 0 || users[0].kecamatan_id != kecamatanId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      // Get current stempel path
      const [config] = await sequelize.query(`
        SELECT stempel_path FROM kecamatan_bankeu_config
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      // Delete file if exists
      if (config && config[0] && config[0].stempel_path) {
        const filePath = path.join(__dirname, '../../storage/uploads', config[0].stempel_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Update database
      await sequelize.query(`
        UPDATE kecamatan_bankeu_config
        SET stempel_path = NULL, updated_at = NOW()
        WHERE kecamatan_id = ?
      `, { replacements: [kecamatanId] });

      res.json({
        success: true,
        message: 'Stempel berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error deleting stempel:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus stempel',
        error: error.message
      });
    }
  }
}

module.exports = new BankeuVerificationController();
