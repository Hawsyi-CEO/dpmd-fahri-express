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
   * @param {number} params.kegiatanId - ID kegiatan (optional, jika per kegiatan)
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateBeritaAcaraVerifikasi({ desaId, kecamatanId, kegiatanId }) {
    try {
      // Fetch data
      const [desaData, kecamatanConfig, timVerifikasi, proposalData] = await Promise.all([
        this.getDesaData(desaId),
        this.getKecamatanConfig(kecamatanId),
        this.getTimVerifikasi(kecamatanId),
        kegiatanId 
          ? this.getProposalByKegiatan(desaId, kegiatanId)
          : this.getProposalsByDesa(desaId)
      ]);

      // Ensure proposalData is array
      const proposals = Array.isArray(proposalData) ? proposalData : [proposalData];

      // Create PDF
      const fileName = kegiatanId 
        ? `berita-acara-${desaId}-kegiatan-${kegiatanId}-${Date.now()}.pdf`
        : `berita-acara-${desaId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../storage/uploads', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ 
        size: [595.28, 935.43], // F4 paper size: 210mm x 330mm in points (1mm = 2.83465 points)
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        bufferPages: true 
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Generate single page with all content
      this.generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi);

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
        bp.lokasi,
        bp.volume,
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
   * Get single proposal by kegiatan
   */
  async getProposalByKegiatan(desaId, kegiatanId) {
    const results = await sequelize.query(`
      SELECT 
        bp.id,
        mk.nama_kegiatan,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      WHERE bp.desa_id = :desaId
        AND bp.kegiatan_id = :kegiatanId
        AND bp.submitted_to_kecamatan = TRUE
      LIMIT 1
    `, {
      replacements: { desaId, kegiatanId },
      type: sequelize.QueryTypes.SELECT
    });

    return results[0] || null;
  }

  /**
   * Generate Page 1 - Berita Acara Header and Checklist
   */
  generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi) {
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // KOP Header - dari konfigurasi kecamatan
    let headerY = 40;
    
    // Logo Kabupaten Bogor (di kiri) - try from config first, then fallback to default
    let logoLoaded = false;
    if (kecamatanConfig.logo_path) {
      try {
        const logoPath = path.join(__dirname, '../../storage', kecamatanConfig.logo_path);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, marginLeft, headerY, { width: 65, height: 65 });
          logoLoaded = true;
        }
      } catch (err) {
        console.error('Error loading config logo:', err);
      }
    }
    
    // Fallback to default logo from public folder
    if (!logoLoaded) {
      try {
        const defaultLogoPath = path.join(__dirname, '../../public/logo-bogor.png');
        if (fs.existsSync(defaultLogoPath)) {
          doc.image(defaultLogoPath, marginLeft, headerY, { width: 65, height: 65 });
          logoLoaded = true;
        }
      } catch (err) {
        console.error('Error loading default logo:', err);
      }
    }
    
    // Header text - ALWAYS centered (independent of logo position)
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', marginLeft, headerY, { 
      width: contentWidth, 
      align: 'center' 
    });
    
    doc.fontSize(13).font('Helvetica-Bold');
    doc.text(`KECAMATAN ${(kecamatanConfig.nama_kecamatan || '').toUpperCase()}`, marginLeft, headerY + 18, { 
      width: contentWidth, 
      align: 'center' 
    });

    // Address and contact info
    headerY += 38;
    doc.fontSize(9).font('Helvetica');
    
    // Alamat
    if (kecamatanConfig.alamat) {
      doc.text(kecamatanConfig.alamat, marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 11;
    }
    
    // Contact line
    const contactInfo = [];
    if (kecamatanConfig.telepon) contactInfo.push(`Telp: ${kecamatanConfig.telepon}`);
    if (kecamatanConfig.email) contactInfo.push(`Email: ${kecamatanConfig.email}`);
    if (kecamatanConfig.website) contactInfo.push(`Website: ${kecamatanConfig.website}`);
    
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

    // Line separator - single thick line
    const lineY = headerY + 5;
    doc.lineWidth(2);
    doc.moveTo(marginLeft, lineY)
       .lineTo(pageWidth - marginRight, lineY)
       .stroke();
    doc.lineWidth(1);

    // Title - dynamic Y position based on header height
    let titleY = lineY + 15;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('BERITA ACARA VERIFIKASI', marginLeft, titleY, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.text('PROPOSAL PERMOHONAN BANTUAN KEUANGAN KHUSUS AKSELERASI', marginLeft, titleY + 14, { 
      width: contentWidth, 
      align: 'center' 
    });
    doc.text('PEMBANGUNAN PERDESAAN', marginLeft, titleY + 28, { 
      width: contentWidth, 
      align: 'center' 
    });
    
    // Generate current date first for tahun anggaran
    const today = new Date();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = dayNames[today.getDay()];
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    
    doc.text(`TAHUN ANGGARAN ${year}`, marginLeft, titleY + 42, { 
      width: contentWidth, 
      align: 'center' 
    });

    // Opening paragraph
    doc.fontSize(10).font('Helvetica');
    let yPos = titleY + 65;
    
    // First proposal untuk data di header (ambil yang pertama)
    const firstProposal = proposals[0] || {};
    
    const paragraphText = `Pada hari ini ${dayName} Tanggal ${today.getDate()} Bulan ${monthName} Tahun ${year} bertempat di Kecamatan ${kecamatanConfig.nama_kecamatan || '................'}, telah dilakukan verifikasi administrasi, teknis dan lapangan Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan Tahun Anggaran ${year}, dengan hasil sebagai berikut :`;
    
    doc.text(paragraphText, marginLeft, yPos, { 
      width: contentWidth, 
      align: 'justify',
      lineGap: 2
    });

    // Desa info - format seperti screenshot dengan data real
    yPos += 50;
    doc.fontSize(10).font('Helvetica');
    const leftCol = marginLeft + 5;
    const colonCol = marginLeft + 110;
    
    doc.text('1. Desa', leftCol, yPos);
    doc.text(':', colonCol, yPos);
    doc.text(desaData?.nama_desa || '...............................................', colonCol + 15, yPos);

    yPos += 14;
    doc.text('2. Kegiatan', leftCol, yPos);
    doc.text(':', colonCol, yPos);
    doc.text(firstProposal.judul_proposal || '...............................................', colonCol + 15, yPos);

    yPos += 14;
    doc.text('3. Lokasi kegiatan', leftCol, yPos);
    doc.text(':', colonCol, yPos);
    doc.text(firstProposal.lokasi || '...............................................', colonCol + 15, yPos);

    yPos += 14;
    doc.text('4. Volume', leftCol, yPos);
    doc.text(':', colonCol, yPos);
    doc.text(firstProposal.volume || '...............................................', colonCol + 15, yPos);

    yPos += 14;
    doc.text('5. Nilai RAB', leftCol, yPos);
    doc.text(':', colonCol, yPos);
    const nilaiRAB = firstProposal.anggaran_usulan 
      ? `Rp. ${Number(firstProposal.anggaran_usulan).toLocaleString('id-ID')}` 
      : 'Rp. .......................';
    doc.text(nilaiRAB, colonCol + 15, yPos);

    // Checklist Table
    yPos += 25;
    const tableTop = yPos;
    const tableHeaders = ['NO', 'URAIAN', 'HASIL', 'KET'];
    
    // Column widths - HASIL dibagi 2 untuk √ dan -
    const colWidths = {
      no: 35,
      uraian: contentWidth - 160,
      hasil: 50,  // Total HASIL width
      hasilCheck: 25,  // Sub-kolom √
      hasilX: 25,      // Sub-kolom -
      ket: 75
    };
    
    // Table header
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = marginLeft;
    
    // Draw header background (row 1)
    doc.rect(marginLeft, tableTop, contentWidth, 20).fill('#f0f0f0');
    
    // Draw header text
    doc.fillColor('#000000');
    
    xPos = marginLeft;
    
    // NO (centered vertically for rowspan 2)
    doc.text('NO', xPos + 5, tableTop + 10, { 
      width: colWidths.no - 10, 
      align: 'center' 
    });
    xPos += colWidths.no;
    
    // URAIAN (centered vertically for rowspan 2)
    doc.text('URAIAN', xPos + 5, tableTop + 10, { 
      width: colWidths.uraian - 10, 
      align: 'center' 
    });
    xPos += colWidths.uraian;
    
    // HASIL (merged header)
    doc.text('HASIL', xPos + 5, tableTop + 5, { 
      width: colWidths.hasil - 10, 
      align: 'center' 
    });
    xPos += colWidths.hasil;
    
    // KET (centered vertically for rowspan 2)
    doc.text('KET', xPos + 5, tableTop + 10, { 
      width: colWidths.ket - 10, 
      align: 'center' 
    });

    // Draw header borders - only outer borders and vertical separators
    doc.lineWidth(1);
    
    // Outer border of header row 1
    doc.rect(marginLeft, tableTop, contentWidth, 20).stroke();
    
    // Vertical line after NO
    doc.moveTo(marginLeft + colWidths.no, tableTop)
       .lineTo(marginLeft + colWidths.no, tableTop + 20)
       .stroke();
    
    // Vertical line after URAIAN
    doc.moveTo(marginLeft + colWidths.no + colWidths.uraian, tableTop)
       .lineTo(marginLeft + colWidths.no + colWidths.uraian, tableTop + 20)
       .stroke();
    
    // Vertical line after HASIL
    doc.moveTo(marginLeft + colWidths.no + colWidths.uraian + colWidths.hasil, tableTop)
       .lineTo(marginLeft + colWidths.no + colWidths.uraian + colWidths.hasil, tableTop + 20)
       .stroke();
    
    // Sub-header row for HASIL (√ and -)
    yPos = tableTop + 20;
    xPos = marginLeft + colWidths.no + colWidths.uraian;
    
    // Background for sub-header row
    doc.rect(xPos, yPos, colWidths.hasil, 15).fill('#f0f0f0');
    doc.fillColor('#000000');
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('√', xPos + 8, yPos + 3, { width: colWidths.hasilCheck - 5, align: 'center' });
    doc.rect(xPos, yPos, colWidths.hasilCheck, 15).stroke();
    xPos += colWidths.hasilCheck;
    doc.text('-', xPos + 8, yPos + 3, { width: colWidths.hasilX - 5, align: 'center' });
    doc.rect(xPos, yPos, colWidths.hasilX, 15).stroke();
    
    // Extend NO column border down to cover sub-header row
    doc.rect(marginLeft, tableTop, colWidths.no, 35).stroke();
    
    // Extend URAIAN column border down to cover sub-header row
    doc.rect(marginLeft + colWidths.no, tableTop, colWidths.uraian, 35).stroke();
    
    // Extend KET column border down to cover sub-header row
    const ketX = marginLeft + colWidths.no + colWidths.uraian + colWidths.hasil;
    doc.rect(ketX, tableTop, colWidths.ket, 35).stroke();

    // Checklist items - sesuai screenshot
    const checklistItems = [
      { no: 1, text: 'Surat Pengantar dari Kepala Desa' },
      { no: 2, text: 'Surat Permohonan Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan' },
      { 
        no: 3, 
        text: 'Proposal Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan',
        subItems: [
          '- Latar Belakang',
          '- Maksud dan Tujuan',
          '- Bentuk Kegiatan',
          '- Rencana Pelaksanaan'
        ]
      },
      { no: 4, text: 'Rencana Penggunaan Bantuan Keuangan dan RAB' },
      { no: 5, text: 'Foto lokasi rencana pelaksanaan kegiatan (0%)', ket: 'Infrastruktur' },
      { no: 6, text: 'Peta dan titik lokasi rencana kegiatan', ket: 'Infrastruktur' },
      { no: 7, text: 'Berita Acara Hasil Musyawarah Desa' },
      { no: 8, text: 'SK Kepala Desa tentang Penetapan Tim Pelaksana Kegiatan (TPK)' },
      { 
        no: 9, 
        text: 'Ketersediaan lahan dan kepastian status lahan :',
        subItems: [
          '- surat pernyataan dari Kepala Desa yang menyatakan bahwa lokasi kegiatan tidak dalam keadaan bermasalah apabila merupakan Aset Desa',
          '- surat izin/persetujuan pemanfaatan dari perorangan selaku pemilik lahan, yang menyatakan tidak keberatan lahannya akan dipergunakan untuk pembangunan infrastruktur desa dan tanpa persyaratan apa pun, yang disetujui oleh keluarga; persetujuan pemanfaatan barang milik Daerah/Negara dalam hal lahan yang akan dipergunakan untuk pembangunan infrastruktur merupakan milik/dikuasai Pemerintah Daerah/Negara.',
          '- persetujuan pemanfaatan/penggunaan dari Badan Usaha/Badan Hukum selaku pemilik lahan, yang menyatakan tidak keberatan lahannya akan dipergunakan untuk pembangunan infrastruktur desa dan tanpa persyaratan apa pun.'
        ],
        ket: 'Infrastruktur'
      },
      { no: 10, text: 'Tidak Duplikasi Anggaran' },
      { no: 11, text: 'Kesesuaian antara lokasi dan usulan' },
      { no: 12, text: 'Kesesuaian RAB dengan standar harga yang telah ditetapkan di desa' },
      { no: 13, text: 'Kesesuaian dengan standar teknis konstruksi', ket: 'Infrastruktur' }
    ];

    yPos = tableTop + 35; // Start after sub-header
    doc.font('Helvetica').fontSize(9);

    checklistItems.forEach((item) => {
      const hasSubItems = item.subItems && item.subItems.length > 0;
      
      // Calculate row height dynamically based on actual text height
      let estimatedHeight = 22;
      if (hasSubItems) {
        // Item 9 has 3 long wrapped text in sub-items
        if (item.no === 9) {
          estimatedHeight = 170; // Increased agar semua text masuk dalam table
        } else if (item.no === 3) {
          // Item 3 has 4 short sub-items
          estimatedHeight = 90; // Increased dari 75 untuk lebih rapi
        }
      } else if (item.no === 2) {
        // Item 2 has long text that needs wrapping
        estimatedHeight = 35; // Increased untuk text panjang
      }
      const rowHeight = estimatedHeight;
      
      // Check if we need a new page
      if (yPos + rowHeight > doc.page.height - doc.page.margins.bottom - 50) {
        doc.addPage();
        yPos = doc.page.margins.top + 20;
      }

      xPos = marginLeft;
      
      // NO column
      doc.fontSize(9).font('Helvetica');
      doc.text(`${item.no}`, xPos + 5, yPos + 7, { 
        width: colWidths.no - 10, 
        align: 'center' 
      });
      doc.rect(xPos, yPos, colWidths.no, rowHeight).stroke();
      xPos += colWidths.no;
      
      // URAIAN column
      let uraianY = yPos + 5;
      doc.fontSize(9).font('Helvetica');
      
      // For items without sub-items, calculate actual text height
      if (!hasSubItems) {
        const textHeight = doc.heightOfString(item.text, { 
          width: colWidths.uraian - 8, 
          lineGap: 2
        });
      }
      
      doc.text(item.text, xPos + 4, uraianY, { 
        width: colWidths.uraian - 8, 
        align: 'left',
        lineGap: 2
      });
      
      // Sub-items
      if (hasSubItems) {
        // Calculate spacing after main text
        const mainTextHeight = doc.heightOfString(item.text, { 
          width: colWidths.uraian - 8, 
          lineGap: 2
        });
        uraianY += mainTextHeight + 8; // More spacing after main text
        
        doc.fontSize(8).font('Helvetica');
        item.subItems.forEach((subItem, idx) => {
          const textHeight = doc.heightOfString(subItem, { 
            width: colWidths.uraian - 12, 
            lineGap: 2
          });
          
          doc.text(subItem, xPos + 8, uraianY, { 
            width: colWidths.uraian - 12, 
            align: 'left',
            lineGap: 2
          });
          uraianY += textHeight + 4; // Spacing between sub-items
        });
        doc.fontSize(9);
      }
      
      doc.rect(xPos, yPos, colWidths.uraian, rowHeight).stroke();
      xPos += colWidths.uraian;
      
      // HASIL column - split ke 2 (√ dan -)
      // Sub-kolom √
      doc.rect(xPos, yPos, colWidths.hasilCheck, rowHeight).stroke();
      xPos += colWidths.hasilCheck;
      // Sub-kolom -
      doc.rect(xPos, yPos, colWidths.hasilX, rowHeight).stroke();
      xPos += colWidths.hasilX;
      
      // KET column
      if (item.ket) {
        doc.fontSize(8).font('Helvetica');
        doc.text(item.ket, xPos + 3, yPos + 4, { 
          width: colWidths.ket - 6, 
          align: 'left' 
        });
        doc.fontSize(9);
      }
      doc.rect(xPos, yPos, colWidths.ket, rowHeight).stroke();
      
      yPos += rowHeight;
    });
    
    // Add Tim Verifikasi section below the table
    yPos += 20;
    
    // TIM VERIFIKASI Section
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('TIM VERIFIKASI KECAMATAN', marginLeft, yPos);
    
    // Right side - Dibuat di and Pada tanggal
    const dateString = `${dayName}, ${today.getDate()} ${monthName} ${year}`;
    
    const rightColX = pageWidth - marginRight - 200;
    doc.fontSize(10).font('Helvetica');
    doc.text('Dibuat di', rightColX, yPos);
    doc.text(`: ${kecamatanConfig.nama_kecamatan || 'Kecamatan'}`, rightColX + 80, yPos);
    yPos += 15;
    doc.text('Pada tanggal', rightColX, yPos);
    doc.text(`: ${dateString}`, rightColX + 80, yPos);
    
    yPos += 25;

    // Group tim by jabatan
    const ketua = timVerifikasi.find(t => t.jabatan === 'ketua');
    const sekretaris = timVerifikasi.find(t => t.jabatan === 'sekretaris');
    const anggota = timVerifikasi.filter(t => t.jabatan === 'anggota');

    // 1. Ketua
    doc.fontSize(10).font('Helvetica');
    doc.text('1. Ketua', marginLeft, yPos);
    if (ketua) {
      doc.text(`: ${ketua.jabatan_label || 'Sekretaris Kecamatan'}`, marginLeft + 80, yPos);
      
      if (ketua.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', ketua.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
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
      
      if (sekretaris.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', sekretaris.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
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
      
      if (member.ttd) {
        try {
          const ttdPath = path.join(__dirname, '../../storage/uploads', member.ttd);
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
            doc.fontSize(8).font('Helvetica');
            doc.text(member.nama || '', marginLeft + 50, yPos, { width: 120, align: 'center' });
          }
        } catch (err) {}
      }
      
      yPos += 25;
    });

    // PENANGGUNG JAWAB Section - positioned on right side
    const headerYPos = yPos - (25 * (2 + anggota.length)) - 50;
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
    
    camatY += 10;
    if (kecamatanConfig.ttd_camat) {
      try {
        const ttdPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.ttd_camat);
        
        if (fs.existsSync(ttdPath)) {
          const signatureWidth = 130;
          const signatureHeight = 60;
          const ttdX = camatSectionX + (camatSectionWidth - signatureWidth) / 2;
          const ttdY = camatY + 10;
          
          doc.image(ttdPath, ttdX, ttdY, { width: signatureWidth, height: signatureHeight });
          
          if (kecamatanConfig.stempel_path) {
            const stempelPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.stempel_path);
            
            if (fs.existsSync(stempelPath)) {
              const stempelSize = 70;
              const stempelX = ttdX + 5;
              const stempelY = ttdY - 10;
              
              try {
                doc.image(stempelPath, stempelX, stempelY, { 
                  width: stempelSize, 
                  height: stempelSize 
                });
              } catch (stempelErr) {
                console.error('Error rendering stempel:', stempelErr.message);
              }
            }
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
