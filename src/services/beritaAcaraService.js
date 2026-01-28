const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

class BeritaAcaraService {
  /**
   * Generate Berita Acara Verifikasi PDF
   * @param {Object} params
   * @param {number} params.desaId - ID desa
   * @param {number} params.kecamatanId - ID kecamatan
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateBeritaAcaraVerifikasi({ desaId, kecamatanId }) {
    try {
      // Fetch data
      const [desaData, kecamatanConfig, timVerifikasi, proposals] = await Promise.all([
        this.getDesaData(desaId),
        this.getKecamatanConfig(kecamatanId),
        this.getTimVerifikasi(kecamatanId),
        this.getProposalsByDesa(desaId)
      ]);

      // Create PDF
      const fileName = `berita-acara-${desaId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../storage/uploads', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        bufferPages: true 
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Generate pages
      this.generatePage1(doc, desaData, kecamatanConfig, proposals);
      doc.addPage();
      this.generatePage2(doc, timVerifikasi, kecamatanConfig);

      doc.end();

      // Wait for file to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      return `/uploads/${fileName}`;
    } catch (error) {
      console.error('Error generating berita acara:', error);
      throw error;
    }
  }

  /**
   * Get desa data
   */
  async getDesaData(desaId) {
    const results = await sequelize.query(`
      SELECT 
        d.id,
        d.nama as nama_desa,
        k.nama as nama_kecamatan
      FROM desas d
      LEFT JOIN kecamatans k ON d.kecamatan_id = k.id
      WHERE d.id = :desaId
      LIMIT 1
    `, {
      replacements: { desaId },
      type: sequelize.QueryTypes.SELECT
    });

    return results[0] || null;
  }

  /**
   * Get kecamatan config
   */
  async getKecamatanConfig(kecamatanId) {
    const results = await sequelize.query(`
      SELECT 
        kbc.id,
        k.nama as nama_kecamatan,
        kbc.nama_camat,
        kbc.nip_camat,
        kbc.logo_path,
        kbc.alamat,
        kbc.telepon,
        kbc.email,
        kbc.website,
        kbc.kode_pos,
        kbc.ttd_camat_path as ttd_camat,
        kbc.stempel_path
      FROM kecamatans k
      LEFT JOIN kecamatan_bankeu_config kbc ON k.id = kbc.kecamatan_id
      WHERE k.id = :kecamatanId
      LIMIT 1
    `, {
      replacements: { kecamatanId },
      type: sequelize.QueryTypes.SELECT
    });

    const config = results[0];

    // Return default if not found
    if (!config) {
      return {
        nama_kecamatan: 'KECAMATAN',
        nama_camat: 'CAMAT',
        nip_camat: '',
        alamat: '',
        telepon: null,
        email: null,
        website: null,
        kode_pos: null,
        logo_path: null,
        ttd_camat: null,
        stempel_path: null
      };
    }

    // Use default values if columns are null
    return {
      nama_kecamatan: config.nama_kecamatan || 'KECAMATAN',
      nama_camat: config.nama_camat || 'CAMAT',
      nip_camat: config.nip_camat || '',
      alamat: config.alamat || '',
      telepon: config.telepon || null,
      email: config.email || null,
      website: config.website || null,
      kode_pos: config.kode_pos || null,
      logo_path: config.logo_path || null,
      ttd_camat: config.ttd_camat || null,
      stempel_path: config.stempel_path || null
    };
  }

  /**
   * Get tim verifikasi
   */
  async getTimVerifikasi(kecamatanId) {
    const results = await sequelize.query(`
      SELECT 
        tv.id,
        tv.jabatan,
        tv.jabatan_label,
        tv.nama,
        tv.nip,
        tv.ttd_path as ttd
      FROM tim_verifikasi_kecamatan tv
      WHERE tv.kecamatan_id = :kecamatanId
        AND tv.is_active = TRUE
      ORDER BY 
        CASE tv.jabatan 
          WHEN 'ketua' THEN 1
          WHEN 'sekretaris' THEN 2
          ELSE 3
        END,
        tv.id ASC
    `, {
      replacements: { kecamatanId },
      type: sequelize.QueryTypes.SELECT
    });

    // Return default if not configured
    if (results.length === 0) {
      return [
        { jabatan: 'ketua', nama: 'KETUA TIM', nip: '', ttd: null },
        { jabatan: 'sekretaris', nama: 'SEKRETARIS', nip: '', ttd: null },
        { jabatan: 'anggota', nama: 'ANGGOTA 1', nip: '', ttd: null },
        { jabatan: 'anggota', nama: 'ANGGOTA 2', nip: '', ttd: null },
        { jabatan: 'anggota', nama: 'ANGGOTA 3', nip: '', ttd: null }
      ];
    }

    return results;
  }

  /**
   * Get proposals by desa
   */
  async getProposalsByDesa(desaId) {
    const results = await sequelize.query(`
      SELECT 
        bp.id,
        mk.nama_kegiatan,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.status,
        bp.catatan_verifikasi
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      WHERE bp.desa_id = :desaId
        AND bp.submitted_to_kecamatan = TRUE
      ORDER BY mk.jenis_kegiatan, mk.urutan
    `, {
      replacements: { desaId },
      type: sequelize.QueryTypes.SELECT
    });

    return results;
  }

  /**
   * Generate Page 1 - Berita Acara Header and Checklist
   */
  generatePage1(doc, desaData, kecamatanConfig, proposals) {
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // KOP Header
    let headerY = 50;
    
    // Logo (if exists) - positioned on the left
    if (kecamatanConfig.logo_path) {
      try {
        const logoPath = path.join(__dirname, '../../public', kecamatanConfig.logo_path);
        if (fs.existsSync(logoPath)) {
          // Logo di kiri dengan ukuran lebih besar
          doc.image(logoPath, marginLeft, headerY, { width: 70, height: 70 });
        }
      } catch (err) {
        console.error('Error loading logo:', err);
      }
    }
    
    // Main header - ALWAYS centered on full page width (not affected by logo position)
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', marginLeft, headerY + 5, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.fontSize(15).font('Helvetica-Bold');
    doc.text(`KECAMATAN ${kecamatanConfig.nama_kecamatan.toUpperCase()}`, marginLeft, headerY + 25, { 
      width: contentWidth, 
      align: 'center' 
    });

    // Address and contact info - closer spacing to header
    headerY += 45;
    doc.fontSize(9).font('Helvetica');
    
    // Alamat
    if (kecamatanConfig.alamat) {
      doc.text(kecamatanConfig.alamat, marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 11;
    }
    
    // Contact line (telepon, email, website) in one compact line
    const contactInfo = [];
    if (kecamatanConfig.telepon) contactInfo.push(`Telp: ${kecamatanConfig.telepon}`);
    if (kecamatanConfig.email) contactInfo.push(`Email: ${kecamatanConfig.email}`);
    if (kecamatanConfig.website) contactInfo.push(`Web: ${kecamatanConfig.website}`);
    
    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' | '), marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 11;
    }
    
    // Kode Pos
    if (kecamatanConfig.kode_pos) {
      doc.text(`Kode Pos: ${kecamatanConfig.kode_pos}`, marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 8;
    }

    // Line separator
    const lineY = headerY + 5;
    doc.moveTo(marginLeft, lineY)
       .lineTo(pageWidth - marginRight, lineY)
       .stroke();
    doc.moveTo(marginLeft, lineY + 3)
       .lineTo(pageWidth - marginRight, lineY + 3)
       .stroke();

    // Title - dynamic Y position based on header height
    let titleY = lineY + 20;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('BERITA ACARA VERIFIKASI', marginLeft, titleY, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.text('PROPOSAL PERMOHONAN BANTUAN KEUANGAN KHUSUS', marginLeft, titleY + 15, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.text('AKSELERASI PEMBANGUNAN PERDESAAN', marginLeft, titleY + 30, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.text('TAHUN ANGGARAN 2025', marginLeft, titleY + 45, { 
      width: contentWidth, 
      align: 'center' 
    });

    // Date
    const today = new Date();
    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
    const monthName = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()];
    
    doc.fontSize(10).font('Helvetica');
    let yPos = titleY + 70;
    doc.text(`Pada hari ini, ${dayName}, tanggal ${today.getDate()} ${monthName} ${today.getFullYear()}, Kami Tim Verifikasi`, marginLeft, yPos, { 
      width: contentWidth, 
      align: 'justify' 
    });
    
    yPos += 15;
    doc.text(`Kecamatan ${kecamatanConfig.nama_kecamatan}, telah melakukan verifikasi terhadap proposal Bantuan Keuangan`, marginLeft, yPos, { 
      width: contentWidth, 
      align: 'justify' 
    });
    
    yPos += 15;
    doc.text('Khusus Akselerasi Pembangunan Perdesaan dengan data sebagai berikut:', marginLeft, yPos, { 
      width: contentWidth, 
      align: 'justify' 
    });

    // Desa info
    yPos += 25;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Desa', marginLeft, yPos);
    doc.font('Helvetica');
    doc.text(`: ${desaData?.nama_desa || '-'}`, marginLeft + 120, yPos);

    yPos += 15;
    doc.font('Helvetica-Bold');
    doc.text('Jumlah Kegiatan', marginLeft, yPos);
    doc.font('Helvetica');
    doc.text(`: ${proposals.length} Kegiatan`, marginLeft + 120, yPos);

    // Checklist Table
    yPos += 30;
    const tableTop = yPos;
    const tableHeaders = ['NO', 'URAIAN', 'HASIL', 'KET'];
    const colWidths = [30, contentWidth - 140, 50, 60];
    
    // Table header
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = marginLeft;
    
    // Draw header background
    doc.rect(xPos, tableTop, contentWidth, 20).fill('#f0f0f0');
    
    // Draw header text
    doc.fillColor('#000000');
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 5, tableTop + 5, { 
        width: colWidths[i] - 10, 
        align: 'center' 
      });
      xPos += colWidths[i];
    });

    // Draw header borders
    xPos = marginLeft;
    tableHeaders.forEach((_, i) => {
      doc.rect(xPos, tableTop, colWidths[i], 20).stroke();
      xPos += colWidths[i];
    });

    // Checklist items
    const checklistItems = [
      'Proposal telah ditandatangani oleh Kepala Desa dan diketahui oleh Camat',
      'Foto copy dokumen kelengkapan proposal',
      'RAB sesuai dengan format yang telah ditentukan',
      'Volume pekerjaan realistis dan dapat dipertanggungjawabkan',
      'Harga satuan sesuai dengan harga yang berlaku di daerah',
      'Lokasi kegiatan jelas dan tidak bermasalah',
      'Kegiatan bersifat fisik infrastruktur atau pemberdayaan masyarakat',
      'Kegiatan tidak tumpang tindih dengan program lain',
      'Swakelola dilaksanakan oleh desa',
      'Masyarakat ikut berpartisipasi (gotong royong)',
      'Dampak kegiatan dapat dirasakan oleh masyarakat luas',
      'Kegiatan mendukung pencapaian tujuan pembangunan desa',
      'Proposal dapat direkomendasikan untuk dibiayai'
    ];

    yPos = tableTop + 20;
    doc.font('Helvetica').fontSize(8);

    checklistItems.forEach((item, index) => {
      const rowHeight = 25;
      
      // Check if we need a new page
      if (yPos + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        yPos = doc.page.margins.top;
      }

      xPos = marginLeft;
      
      // NO column
      doc.text(`${index + 1}`, xPos + 5, yPos + 8, { 
        width: colWidths[0] - 10, 
        align: 'center' 
      });
      doc.rect(xPos, yPos, colWidths[0], rowHeight).stroke();
      xPos += colWidths[0];
      
      // URAIAN column
      doc.text(item, xPos + 5, yPos + 5, { 
        width: colWidths[1] - 10, 
        align: 'left' 
      });
      doc.rect(xPos, yPos, colWidths[1], rowHeight).stroke();
      xPos += colWidths[1];
      
      // HASIL column (checkbox)
      doc.text('√', xPos + 20, yPos + 8, { 
        width: colWidths[2] - 10, 
        align: 'center' 
      });
      doc.rect(xPos, yPos, colWidths[2], rowHeight).stroke();
      xPos += colWidths[2];
      
      // KET column
      doc.rect(xPos, yPos, colWidths[3], rowHeight).stroke();
      
      yPos += rowHeight;
    });
  }

  /**
   * Generate Page 2 - Signatures
   */
  generatePage2(doc, timVerifikasi, kecamatanConfig) {
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    let yPos = doc.page.margins.top + 30;

    // Header dengan "Dibuat di" dan "Pada tanggal" di kanan
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('TIM VERIFIKASI KECAMATAN', marginLeft, yPos);
    
    // Right side - Dibuat di and Pada tanggal
    const rightColX = pageWidth - marginRight - 200;
    const headerYPos = yPos;
    
    // Generate current date
    const today = new Date();
    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
    const monthName = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()];
    const dateString = `${dayName}, ${today.getDate()} ${monthName} ${today.getFullYear()}`;
    
    doc.fontSize(10).font('Helvetica');
    doc.text('Dibuat di', rightColX, yPos);
    doc.text(`: ${kecamatanConfig.nama_kecamatan || 'Kecamatan'}`, rightColX + 80, yPos);
    yPos += 15;
    doc.text('Pada tanggal', rightColX, yPos);
    doc.text(`: ${dateString}`, rightColX + 80, yPos);
    
    yPos += 30;

    // Group tim by jabatan
    const ketua = timVerifikasi.find(t => t.jabatan === 'ketua');
    const sekretaris = timVerifikasi.find(t => t.jabatan === 'sekretaris');
    const anggota = timVerifikasi.filter(t => t.jabatan === 'anggota');

    // 1. Ketua
    doc.fontSize(10).font('Helvetica');
    doc.text('1. Ketua', marginLeft, yPos);
    if (ketua) {
      doc.text(`: ${ketua.jabatan_label || 'Sekretaris Kecamatan'}`, marginLeft + 80, yPos);
      
      // Add signature if available
      if (ketua.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', ketua.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
            // Add name below signature (centered)
            doc.fontSize(8).font('Helvetica');
            doc.text(ketua.nama || '', marginLeft + 50, yPos, { width: 120, align: 'center' });
          }
        } catch (err) {}
      }
    } else {
      doc.text(': ......................................', marginLeft + 80, yPos);
    }
    
    yPos += 25;

    // 2. Sekretaris
    doc.fontSize(10).font('Helvetica');
    doc.text('2. Sekretaris', marginLeft, yPos);
    if (sekretaris) {
      doc.text(`: ${sekretaris.jabatan_label || 'Kepala Seksi Ekbang'}`, marginLeft + 80, yPos);
      
      // Add signature if available
      if (sekretaris.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', sekretaris.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
            // Add name below signature (centered)
            doc.fontSize(8).font('Helvetica');
            doc.text(sekretaris.nama || '', marginLeft + 50, yPos, { width: 120, align: 'center' });
          }
        } catch (err) {}
      }
    } else {
      doc.text(': ......................................', marginLeft + 80, yPos);
    }
    
    yPos += 25;

    // 3. & 4. Anggota
    anggota.forEach((member, index) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(`${index + 3}. Anggota`, marginLeft, yPos);
      doc.text(`: ${member.jabatan_label || member.nama}`, marginLeft + 80, yPos);
      
      // Add signature if available
      if (member.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', member.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
            // Add name below signature (centered)
            doc.fontSize(8).font('Helvetica');
            doc.text(member.nama || '', marginLeft + 50, yPos, { width: 120, align: 'center' });
          }
        } catch (err) {}
      }
      
      yPos += 25;
    });

    // Keterangan anggota
    yPos += 5;
    doc.fontSize(8).font('Helvetica-Oblique');
    doc.text('*Anggota yang memverifikasi disesuaikan dengan program/kegiatan yang diusulkan', marginLeft, yPos, {
      width: 300
    });

    // PENANGGUNG JAWAB Section - positioned on right side at same level as "Pada tanggal"
    const camatYPos = headerYPos + 50;
    const camatSectionWidth = 230;
    const camatSectionX = rightColX + 10;
    
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('PENANGGUNG JAWAB', camatSectionX, camatYPos, { 
      width: camatSectionWidth, 
      align: 'center' 
    });

    let camatY = camatYPos + 20;
    doc.fontSize(10).font('Helvetica');
    doc.text('CAMAT,', camatSectionX, camatY, {
      width: camatSectionWidth,
      align: 'center'
    });
    
    // Add camat signature with stamp overlay
    camatY += 10;
    if (kecamatanConfig.ttd_camat) {
      try {
        const ttdPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.ttd_camat);
        
        if (fs.existsSync(ttdPath)) {
          // Signature dimensions and position
          const signatureWidth = 130;
          const signatureHeight = 60;
          const ttdX = camatSectionX + (camatSectionWidth - signatureWidth) / 2;
          const ttdY = camatY + 10;
          
          // Render signature
          doc.image(ttdPath, ttdX, ttdY, { width: signatureWidth, height: signatureHeight });
          
          // Render stempel on left side of signature (formal document standard)
          console.log('🏛️  [BeritaAcara] Checking stempel_path:', kecamatanConfig.stempel_path);
          if (kecamatanConfig.stempel_path) {
            const stempelPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.stempel_path);
            console.log('🏛️  [BeritaAcara] Stempel full path:', stempelPath);
            console.log('🏛️  [BeritaAcara] File exists:', fs.existsSync(stempelPath));
            
            if (fs.existsSync(stempelPath)) {
              // Stempel dimensions
              const stempelSize = 70; // Size for clear visibility
              
              // Position: Overlay on LEFT part of signature (menimpa tanda tangan)
              // Stempel must overlap/cover part of the signature, positioned higher
              const stempelX = ttdX + 5; // Start slightly inside the signature (overlap)
              const stempelY = ttdY - 10; // Positioned higher to overlap more on signature
              
              console.log('🏛️  [BeritaAcara] Rendering stempel at position:', { stempelX, stempelY, stempelSize });
              
              try {
                // Render stempel (PNG with transparency)
                doc.image(stempelPath, stempelX, stempelY, { 
                  width: stempelSize, 
                  height: stempelSize 
                });
                console.log('✅ [BeritaAcara] Stempel rendered successfully at left-bottom position!');
              } catch (stempelErr) {
                console.error('❌ [BeritaAcara] Error rendering stempel:', stempelErr.message);
              }
            } else {
              console.log('❌ [BeritaAcara] Stempel file not found!');
            }
          } else {
            console.log('ℹ️  [BeritaAcara] No stempel_path configured');
          }
          
          camatY += 90;
        } else {
          camatY += 60;
        }
      } catch (err) {
        console.error('Error loading camat signature:', err);
        camatY += 60;
      }
    } else {
      camatY += 60;
    }
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`( ${kecamatanConfig.nama_camat || '......................................'} )`, camatSectionX, camatY, {
      align: 'center',
      width: camatSectionWidth
    });
    
    camatY += 15;
    doc.text(`NIP: ${kecamatanConfig.nip_camat || '.......................'}`, camatSectionX, camatY, {
      align: 'center',
      width: camatSectionWidth
    });
  }
}

module.exports = new BeritaAcaraService();
