const sequelize = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

      let whereClause = 'WHERE bp.kecamatan_id = ? AND bp.submitted_to_kecamatan = TRUE';
      const replacements = [kecamatanId];

      if (status) {
        whereClause += ' AND bp.status = ?';
        replacements.push(status);
      }

      if (jenis_kegiatan) {
        whereClause += ' AND bp.jenis_kegiatan = ?';
        replacements.push(jenis_kegiatan);
      }

      if (desa_id) {
        whereClause += ' AND bp.desa_id = ?';
        replacements.push(desa_id);
      }

      const [proposals] = await sequelize.query(`
        SELECT 
          bp.id,
          bp.desa_id,
          bp.kecamatan_id,
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
          u_created.name as created_by_name,
          u_verified.name as verified_by_name,
          d.nama as desa_nama,
          k.nama as kecamatan_nama
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id AND d.kecamatan_id = ?
        LEFT JOIN users u_created ON bp.created_by = u_created.id
        LEFT JOIN users u_verified ON bp.verified_by = u_verified.id
        LEFT JOIN kecamatans k ON bp.kecamatan_id = k.id
        ${whereClause}
        ORDER BY bp.created_at DESC
      `, { replacements: [kecamatanId, ...replacements] });

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
      const { status, catatan_verifikasi } = req.body;

      // Validate status
      if (!['verified', 'rejected', 'revision'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Gunakan: verified, rejected, atau revision'
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
      const verifierName = users[0].name;

      // Get proposal
      const [proposals] = await sequelize.query(`
        SELECT bp.*, d.nama as desa_nama, k.nama as kecamatan_nama
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id
        INNER JOIN kecamatans k ON bp.kecamatan_id = k.id
        WHERE bp.id = ? AND d.kecamatan_id = ?
      `, { replacements: [id, kecamatanId] });

      if (!proposals || proposals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan atau tidak termasuk dalam kecamatan Anda'
        });
      }

      const proposal = proposals[0];

      // Update status
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET 
          status = ?,
          catatan_verifikasi = ?,
          verified_by = ?,
          verified_at = NOW()
        WHERE id = ?
      `, {
        replacements: [status, catatan_verifikasi || null, userId, id]
      });

      logger.info(`✅ Bankeu proposal ${status}: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: `Proposal berhasil di${status === 'verified' ? 'verifikasi' : status === 'rejected' ? 'tolak' : 'minta revisi'}`,
        data: {
          id,
          status
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
          SUM(CASE WHEN bp.jenis_kegiatan = 'infrastruktur' THEN 1 ELSE 0 END) as infrastruktur,
          SUM(CASE WHEN bp.jenis_kegiatan = 'non_infrastruktur' THEN 1 ELSE 0 END) as non_infrastruktur
        FROM bankeu_proposals bp
        INNER JOIN desas d ON bp.desa_id = d.id
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
      const verifierName = users[0].name;

      // Get desa info
      const [desas] = await sequelize.query(`
        SELECT d.*, k.nama as kecamatan_nama
        FROM desas d
        INNER JOIN kecamatans k ON d.kecamatan_id = k.id
        WHERE d.id = ? AND d.kecamatan_id = ?
      `, { replacements: [desaId, kecamatanId] });

      if (!desas || desas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Desa tidak ditemukan'
        });
      }

      const desa = desas[0];

      // Get all proposals for this desa
      const [proposals] = await sequelize.query(`
        SELECT 
          bp.*,
          CASE 
            WHEN bp.jenis_kegiatan = 'infrastruktur' THEN 'Infrastruktur'
            ELSE 'Non-Infrastruktur'
          END as jenis_kegiatan_label
        FROM bankeu_proposals bp
        WHERE bp.desa_id = ?
        ORDER BY bp.jenis_kegiatan, bp.kegiatan_id
      `, { replacements: [desaId] });

      if (!proposals || proposals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada proposal untuk desa ini'
        });
      }

      // Generate PDF
      const fileName = `BA_${desa.nama.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../storage/uploads/bankeu/berita_acara', fileName);
      
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
      doc.fontSize(11).font('Helvetica');

      const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.text(`Pada hari ini, ${currentDate}, telah dilakukan verifikasi dan penelaahan terhadap proposal Bantuan Keuangan Desa dengan rincian sebagai berikut:`)
         .moveDown();

      // Desa Info
      doc.font('Helvetica-Bold').text('I. IDENTITAS DESA', { underline: true }).moveDown(0.5);
      doc.font('Helvetica');
      doc.text(`Nama Desa        : ${desa.nama}`);
      doc.text(`Kecamatan        : ${desa.kecamatan_nama}`);
      doc.text(`Jumlah Proposal  : ${proposals.length} kegiatan`);
      doc.moveDown(2);

      // Proposals by type
      doc.font('Helvetica-Bold').text('II. RINCIAN PROPOSAL DAN HASIL VERIFIKASI', { underline: true }).moveDown(0.5);
      
      const infrastruktur = proposals.filter(p => p.jenis_kegiatan === 'infrastruktur');
      const nonInfrastruktur = proposals.filter(p => p.jenis_kegiatan === 'non_infrastruktur');

      if (infrastruktur.length > 0) {
        doc.font('Helvetica-Bold').text('A. KEGIATAN INFRASTRUKTUR', { underline: true }).moveDown(0.3);
        doc.font('Helvetica');
        
        infrastruktur.forEach((p, idx) => {
          const statusText = p.status === 'verified' ? 'DISETUJUI' : 
                            p.status === 'rejected' ? 'DITOLAK' : 
                            p.status === 'revision' ? 'REVISI' : 'PENDING';
          
          doc.text(`${idx + 1}. ${p.kegiatan_nama}`);
          doc.text(`   Judul: ${p.judul_proposal}`);
          if (p.anggaran_usulan) {
            doc.text(`   Anggaran: Rp ${Number(p.anggaran_usulan).toLocaleString('id-ID')}`);
          }
          doc.text(`   Status: ${statusText}`);
          if (p.catatan_verifikasi) {
            doc.text(`   Catatan: ${p.catatan_verifikasi}`);
          }
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      if (nonInfrastruktur.length > 0) {
        doc.font('Helvetica-Bold').text('B. KEGIATAN NON-INFRASTRUKTUR', { underline: true }).moveDown(0.3);
        doc.font('Helvetica');
        
        nonInfrastruktur.forEach((p, idx) => {
          const statusText = p.status === 'verified' ? 'DISETUJUI' : 
                            p.status === 'rejected' ? 'DITOLAK' : 
                            p.status === 'revision' ? 'REVISI' : 'PENDING';
          
          doc.text(`${idx + 1}. ${p.kegiatan_nama}`);
          doc.text(`   Judul: ${p.judul_proposal}`);
          if (p.anggaran_usulan) {
            doc.text(`   Anggaran: Rp ${Number(p.anggaran_usulan).toLocaleString('id-ID')}`);
          }
          doc.text(`   Status: ${statusText}`);
          if (p.catatan_verifikasi) {
            doc.text(`   Catatan: ${p.catatan_verifikasi}`);
          }
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Summary
      const verified = proposals.filter(p => p.status === 'verified').length;
      const revision = proposals.filter(p => p.status === 'revision').length;
      const rejected = proposals.filter(p => p.status === 'rejected').length;
      const pending = proposals.filter(p => p.status === 'pending').length;

      doc.font('Helvetica-Bold').text('III. KESIMPULAN', { underline: true }).moveDown(0.5);
      doc.font('Helvetica');
      doc.text(`Total proposal yang diverifikasi: ${proposals.length} kegiatan`);
      doc.text(`- Disetujui: ${verified} kegiatan`);
      doc.text(`- Revisi: ${revision} kegiatan`);
      doc.text(`- Ditolak: ${rejected} kegiatan`);
      doc.text(`- Pending: ${pending} kegiatan`);
      doc.moveDown(2);

      doc.text('Demikian Berita Acara ini dibuat untuk dapat dipergunakan sebagaimana mestinya.');
      doc.moveDown(3);

      // Signature
      const signatureY = doc.y;
      doc.text('Mengetahui,', 50, signatureY);
      doc.text('Yang Memverifikasi,', 350, signatureY);
      doc.moveDown(4);
      doc.text('(                                        )', 50, doc.y);
      doc.text(`( ${verifierName} )`, 350, doc.y - doc.currentLineHeight());

      doc.end();

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const beritaAcaraPath = `bankeu/berita_acara/${fileName}`;

      // Update all proposals with berita acara path
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET 
          berita_acara_path = ?,
          berita_acara_generated_at = NOW()
        WHERE desa_id = ?
      `, { replacements: [beritaAcaraPath, desaId] });

      logger.info(`✅ Berita Acara generated for desa ${desaId}: ${fileName}`);

      res.json({
        success: true,
        message: 'Berita Acara berhasil dibuat',
        data: {
          file_path: beritaAcaraPath,
          file_name: fileName,
          desa_nama: desa.nama,
          total_proposals: proposals.length
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

      // Update submitted_to_kecamatan based on action
      const newStatus = action === 'submit' ? false : null; // false = sent to DPMD, null = returned to desa
      
      await sequelize.query(`
        UPDATE bankeu_proposals
        SET submitted_to_kecamatan = ?
        WHERE desa_id = ?
      `, { replacements: [newStatus, desaId] });

      logger.info(`✅ Review ${action} for desa ${desaId} by user ${userId}`);

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
}

module.exports = new BankeuVerificationController();
