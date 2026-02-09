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
   * @param {number} params.proposalId - ID proposal (optional, untuk tim verifikasi per proposal)
   * @param {Object} params.qrCode - QR code data { code, imagePath, verificationUrl }
   * @param {Object} params.checklistData - Aggregated checklist data from questionnaires { q1: true, q2: false, ... }
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateBeritaAcaraVerifikasi({ desaId, kecamatanId, kegiatanId, proposalId = null, qrCode = null, checklistData = null }) {
    try {
      // Fetch data
      const [desaData, kecamatanConfig, timVerifikasi, proposalData] = await Promise.all([
        this.getDesaData(desaId),
        this.getKecamatanConfig(kecamatanId),
        this.getTimVerifikasi(kecamatanId, proposalId),
        proposalId
          ? this.getProposalById(proposalId)
          : kegiatanId 
            ? this.getProposalByKegiatan(desaId, kegiatanId)
            : this.getProposalsByDesa(desaId)
      ]);

      // Ensure proposalData is array
      const proposals = Array.isArray(proposalData) ? proposalData : [proposalData];

      // Create PDF
      const fileName = proposalId
        ? `berita-acara-${desaId}-proposal-${proposalId}-${Date.now()}.pdf`
        : kegiatanId 
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

      // Generate single page with all content, including QR code and auto-filled checklist
      this.generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi, qrCode, checklistData);

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
   * @param {number} kecamatanId - ID kecamatan
   * @param {number} proposalId - ID proposal (optional) untuk mengambil anggota per proposal
   */
  async getTimVerifikasi(kecamatanId, proposalId = null) {
    // Query untuk mengambil:
    // - Ketua & Sekretaris yang shared (proposal_id IS NULL)
    // - Anggota yang sesuai proposal_id (jika proposalId diberikan)
    // - Atau semua anggota jika proposalId tidak diberikan (backward compatibility)
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
        AND tv.jabatan != 'anggota'
        AND (
          -- Ketua & Sekretaris selalu shared (proposal_id IS NULL)
          tv.proposal_id IS NULL
          OR
          -- Anggota sesuai proposal_id jika diberikan
          ${proposalId ? 'tv.proposal_id = :proposalId' : '1=1'}
        )
      ORDER BY 
        CASE tv.jabatan 
          WHEN 'ketua' THEN 1
          WHEN 'sekretaris' THEN 2
          ELSE 3
        END,
        tv.id ASC
    `, {
      replacements: { kecamatanId, proposalId },
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
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        dv.nama as dinas_verifikator_nama,
        dv.nip as dinas_verifikator_nip,
        dv.jabatan as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        dv.ttd_path as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
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
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        dv.nama as dinas_verifikator_nama,
        dv.nip as dinas_verifikator_nip,
        dv.jabatan as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        dv.ttd_path as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
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
   * Get single proposal by ID
   */
  async getProposalById(proposalId) {
    const results = await sequelize.query(`
      SELECT 
        bp.id,
        mk.nama_kegiatan,
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        dv.nama as dinas_verifikator_nama,
        dv.nip as dinas_verifikator_nip,
        dv.jabatan as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        dv.ttd_path as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
      WHERE bp.id = :proposalId
        AND bp.submitted_to_kecamatan = TRUE
      LIMIT 1
    `, {
      replacements: { proposalId },
      type: sequelize.QueryTypes.SELECT
    });

    return results[0] || null;
  }

  /**
   * Generate Page 1 - Berita Acara Header and Checklist
   * @param {Object} qrCode - QR code data { code, imagePath, verificationUrl }
   * @param {Object} checklistData - Aggregated checklist data { q1: true/false/null, ... }
   */
  generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi, qrCode = null, checklistData = null) {
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
    doc.text('HASIL', xPos + (colWidths.hasil / 2) - 15, tableTop + 10, { 
      width: 30, 
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
    
    // Extend NO column border down 
    doc.rect(marginLeft, tableTop, colWidths.no, 20).stroke();
    
    // Extend URAIAN column border down
    doc.rect(marginLeft + colWidths.no, tableTop, colWidths.uraian, 20).stroke();
    
    // Extend KET column border down
    const ketX = marginLeft + colWidths.no + colWidths.uraian + colWidths.hasil;
    doc.rect(ketX, tableTop, colWidths.ket, 20).stroke();

    // Checklist items - sesuai screenshot dengan mapping ke questionnaire
    const checklistItems = [
      { no: 1, qKey: 'q1', text: 'Surat Pengantar dari Kepala Desa' },
      { no: 2, qKey: 'q2', text: 'Surat Permohonan Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan' },
      { 
        no: 3, 
        qKey: 'q3',
        text: 'Proposal Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan',
        subItems: [
          '- Latar Belakang',
          '- Maksud dan Tujuan',
          '- Bentuk Kegiatan',
          '- Rencana Pelaksanaan'
        ]
      },
      { no: 4, qKey: 'q4', text: 'Rencana Penggunaan Bantuan Keuangan dan RAB' },
      { no: 5, qKey: 'q5', text: 'Foto lokasi rencana pelaksanaan kegiatan (0%)', ket: 'Infrastruktur' },
      { no: 6, qKey: 'q6', text: 'Peta dan titik lokasi rencana kegiatan', ket: 'Infrastruktur' },
      { no: 7, qKey: 'q7', text: 'Berita Acara Hasil Musyawarah Desa' },
      { no: 8, qKey: 'q8', text: 'SK Kepala Desa tentang Penetapan Tim Pelaksana Kegiatan (TPK)' },
      { 
        no: 9, 
        qKey: 'q9',
        text: 'Ketersediaan lahan dan kepastian status lahan :',
        subItems: [
          '- surat pernyataan dari Kepala Desa yang menyatakan bahwa lokasi kegiatan tidak dalam keadaan bermasalah apabila merupakan Aset Desa',
          '- surat izin/persetujuan pemanfaatan dari perorangan selaku pemilik lahan, yang menyatakan tidak keberatan lahannya akan dipergunakan untuk pembangunan infrastruktur desa dan tanpa persyaratan apa pun, yang disetujui oleh keluarga; persetujuan pemanfaatan barang milik Daerah/Negara dalam hal lahan yang akan dipergunakan untuk pembangunan infrastruktur merupakan milik/dikuasai Pemerintah Daerah/Negara.',
          '- persetujuan pemanfaatan/penggunaan dari Badan Usaha/Badan Hukum selaku pemilik lahan, yang menyatakan tidak keberatan lahannya akan dipergunakan untuk pembangunan infrastruktur desa dan tanpa persyaratan apa pun.'
        ],
        ket: 'Infrastruktur'
      },
      { no: 10, qKey: 'q10', text: 'Tidak Duplikasi Anggaran' },
      { no: 11, qKey: 'q11', text: 'Kesesuaian antara lokasi dan usulan' },
      { no: 12, qKey: 'q12', text: 'Kesesuaian RAB dengan standar harga yang telah ditetapkan di desa' },
      { no: 13, qKey: 'q13', text: 'Kesesuaian dengan standar teknis konstruksi', ket: 'Infrastruktur' }
    ];

    yPos = tableTop + 20; // Start after header
    doc.font('Helvetica').fontSize(9);

    // Debug log
    console.log('🔍 Checklist Data:', JSON.stringify(checklistData, null, 2));

    checklistItems.forEach((item) => {
      const hasSubItems = item.subItems && item.subItems.length > 0;
      
      // Get checklist status from aggregated questionnaire data
      // checklistData uses item_1, item_2 format, so convert qKey (q1) to item_1 format
      const itemKey = `item_${item.no}`;
      const checkStatus = checklistData ? checklistData[itemKey] : null;
      
      console.log(`📋 Item ${item.no}: key=${itemKey}, status=${checkStatus}`);
      
      // Calculate row height dynamically based on actual text height
      let estimatedHeight = 22;
      if (hasSubItems) {
        // Item 9 has 3 long wrapped text in sub-items
        if (item.no === 9) {
          estimatedHeight = 170; // Increased agar semua text masuk dalam table
        } else if (item.no === 3) {
          // Item 3 has 4 short sub-items
          estimatedHeight = 100; // Increased untuk ruang lebih di rencana pelaksanaan
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
      
      // HASIL column - single checkbox
      const checkCenterX = xPos + (colWidths.hasil / 2);
      const markY = yPos + (rowHeight / 2);
      
      // Draw checkmark if status is true
      if (checkStatus === true) {
        // Draw checkmark using path (V shape)
        doc.save();
        doc.strokeColor('#008000'); // Green
        doc.lineWidth(2);
        
        // Draw V checkmark
        const checkX = checkCenterX - 6;
        const checkY = markY - 3;
        doc.moveTo(checkX, checkY)
           .lineTo(checkX + 4, checkY + 6)
           .lineTo(checkX + 12, checkY - 4)
           .stroke();
        
        doc.restore();
      }
      doc.rect(xPos, yPos, colWidths.hasil, rowHeight).stroke();
      xPos += colWidths.hasil;
      
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
    
    // TIM VERIFIKASI Section - with MENGETAHUI on right side
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
    
    // MENGETAHUI Section - positioned on right side, below tanggal
    const camatSectionWidth = 200;
    const camatSectionX = rightColX;
    let camatY = yPos + 25;
    
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('MENGETAHUI', camatSectionX, camatY, { 
      width: camatSectionWidth, 
      align: 'center' 
    });

    camatY += 18;
    doc.fontSize(10).font('Helvetica');
    doc.text('CAMAT,', camatSectionX, camatY, {
      width: camatSectionWidth,
      align: 'center'
    });
    
    camatY += 15;
    if (kecamatanConfig.ttd_camat) {
      try {
        const ttdPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.ttd_camat);
        
        if (fs.existsSync(ttdPath)) {
          const signatureWidth = 100;
          const signatureHeight = 50;
          // Move TTD more to the right so it's not covered by stempel
          const ttdX = camatSectionX + (camatSectionWidth - signatureWidth) / 2 + 30;
          const ttdY = camatY;
          
          doc.image(ttdPath, ttdX, ttdY, { width: signatureWidth, height: signatureHeight });
          
          if (kecamatanConfig.stempel_path) {
            const stempelPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.stempel_path);
            
            if (fs.existsSync(stempelPath)) {
              const stempelSize = 60;
              // Stempel overlaps signature from left side (sesuai aturan resmi)
              const stempelX = ttdX - 20; // Overlap into signature area
              const stempelY = ttdY + 5; // Slightly lower to overlap bottom of signature
              
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
          
          camatY += 55;
        } else {
          camatY += 50;
        }
      } catch (err) {
        console.error('Error loading camat signature:', err);
        camatY += 50;
      }
    } else {
      camatY += 50;
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
    
    yPos += 25;

    // Group tim by jabatan - support both "anggota" and "anggota_X" formats
    const ketua = timVerifikasi.find(t => t.jabatan === 'ketua');
    const sekretaris = timVerifikasi.find(t => t.jabatan === 'sekretaris');
    const anggota = timVerifikasi.filter(t => 
      t.jabatan === 'anggota' || 
      t.jabatan === 'anggota_1' || 
      t.jabatan === 'anggota_2' || 
      t.jabatan === 'anggota_3'
    );
    
    // Add Verifikator Dinas as first anggota if available from proposals
    // Use dinas_terkait (e.g., "UPT_PU") as jabatan_label instead of verifikator's jabatan
    if (proposals && proposals.length > 0 && proposals[0].dinas_verifikator_nama) {
      anggota.unshift({
        jabatan: 'verifikator_dinas',
        jabatan_label: proposals[0].dinas_terkait || 'Dinas Terkait',
        nama: proposals[0].dinas_verifikator_nama,
        nip: proposals[0].dinas_verifikator_nip,
        ttd: proposals[0].dinas_verifikator_ttd
      });
    }

    // Debug log
    console.log('🔍 Tim Verifikasi Data:');
    console.log('Ketua:', ketua);
    console.log('Sekretaris:', sekretaris);
    console.log('Anggota:', anggota);

    // 1. Ketua
    doc.fontSize(10).font('Helvetica');
    doc.text('1. Ketua', marginLeft, yPos);
    if (ketua) {
      doc.text(`: ${ketua.jabatan_label || ketua.nama || 'Ketua Tim'}`, marginLeft + 80, yPos);
      
      if (ketua.ttd) {
        try {
          // Handle various path formats: 'uploads/xxx', 'xxx', or full path
          let ttdFile = ketua.ttd;
          if (ttdFile.startsWith('uploads/')) {
            ttdFile = ttdFile.substring(8); // Remove 'uploads/' prefix
          }
          const ttdPath = path.join(__dirname, '../../storage/uploads', ttdFile);
          console.log('🔍 Ketua TTD Path:', ttdPath, '| Original:', ketua.ttd, '| Exists:', fs.existsSync(ttdPath));
          
          if (fs.existsSync(ttdPath)) {
            yPos += 20;
            doc.image(ttdPath, marginLeft + 80, yPos, { width: 60, height: 25 });
            yPos += 30;
            doc.fontSize(8).font('Helvetica');
            doc.text(ketua.nama || '', marginLeft + 50, yPos, { width: 120, align: 'center' });
          }
        } catch (err) {
          console.error('❌ Error loading Ketua TTD:', err.message);
        }
      }
    } else {
      doc.text(': ......................................', marginLeft + 80, yPos);
    }
    
    yPos += 25;

    // 2. Sekretaris
    doc.fontSize(10).font('Helvetica');
    doc.text('2. Sekretaris', marginLeft, yPos);
    if (sekretaris) {
      doc.text(`: ${sekretaris.jabatan_label || sekretaris.nama || 'Sekretaris'}`, marginLeft + 80, yPos);
      
      if (sekretaris.ttd) {
        try {
          let ttdFile = sekretaris.ttd;
          if (ttdFile.startsWith('uploads/')) {
            ttdFile = ttdFile.substring(8);
          }
          const ttdPath = path.join(__dirname, '../../storage/uploads', ttdFile);
          console.log('🔍 Sekretaris TTD Path:', ttdPath, '| Original:', sekretaris.ttd, '| Exists:', fs.existsSync(ttdPath));
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
      doc.text(`: ${member.jabatan_label || member.nama || 'Anggota Tim'}`, marginLeft + 80, yPos);
      
      if (member.ttd) {
        try {
          let ttdFile = member.ttd;
          if (ttdFile.startsWith('uploads/')) {
            ttdFile = ttdFile.substring(8);
          }
          const ttdPath = path.join(__dirname, '../../storage/uploads', ttdFile);
          console.log(`🔍 Anggota ${index + 1} TTD Path:`, ttdPath, '| Original:', member.ttd, '| Exists:', fs.existsSync(ttdPath));
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
    const anggota = timVerifikasi.filter(t => 
      t.jabatan === 'anggota' || 
      t.jabatan === 'anggota_1' || 
      t.jabatan === 'anggota_2' || 
      t.jabatan === 'anggota_3'
    );

    // 1. Ketua
    doc.fontSize(10).font('Helvetica');
    doc.text('1. Ketua', marginLeft, yPos);
    if (ketua) {
      doc.text(`: ${ketua.jabatan_label || ketua.nama || 'Ketua Tim'}`, marginLeft + 80, yPos);
      
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
      doc.text(`: ${sekretaris.jabatan_label || sekretaris.nama || 'Sekretaris'}`, marginLeft + 80, yPos);
      
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
      doc.text(`: ${member.jabatan_label || member.nama || 'Anggota Tim'}`, marginLeft + 80, yPos);
      
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
              // Stempel must overlap/cover part of the signature as per regulation
              const stempelX = ttdX + 10; // Overlap into signature from left
              const stempelY = ttdY + 5; // Slightly lower to overlap signature properly
              
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

  /**
   * Generate Surat Pengantar Proposal PDF
   * @param {Object} params
   * @param {number} params.proposalId - ID proposal
   * @param {number} params.kecamatanId - ID kecamatan
   * @param {string} params.nomorSurat - Nomor surat
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateSuratPengantar({ proposalId, kecamatanId, nomorSurat }) {
    try {
      // Fetch data
      const [proposalData, kecamatanConfig] = await Promise.all([
        this.getProposalWithDesa(proposalId),
        this.getKecamatanConfig(kecamatanId)
      ]);

      if (!proposalData) {
        throw new Error('Proposal tidak ditemukan');
      }

      // Add nomor surat to proposal data
      proposalData.nomor_surat = nomorSurat;

      // Create PDF
      const fileName = `surat-pengantar-${proposalId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../storage/uploads', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ 
        size: [595.28, 935.43], // F4 paper size
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        bufferPages: true 
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Generate content
      this.generateSuratPengantarContent(doc, proposalData, kecamatanConfig);

      doc.end();

      // Wait for file to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      return `/uploads/${fileName}`;
    } catch (error) {
      console.error('Error generating surat pengantar:', error);
      throw error;
    }
  }

  /**
   * Get proposal with desa data
   */
  async getProposalWithDesa(proposalId) {
    const results = await sequelize.query(`
      SELECT 
        bp.id,
        bp.judul_proposal,
        d.nama as nama_desa,
        k.nama as nama_kecamatan,
        YEAR(bp.created_at) as tahun_anggaran
      FROM bankeu_proposals bp
      INNER JOIN desas d ON bp.desa_id = d.id
      INNER JOIN kecamatans k ON d.kecamatan_id = k.id
      WHERE bp.id = :proposalId
      LIMIT 1
    `, {
      replacements: { proposalId },
      type: sequelize.QueryTypes.SELECT
    });

    return results[0] || null;
  }

  /**
   * Generate Surat Pengantar content
   */
  generateSuratPengantarContent(doc, proposalData, kecamatanConfig) {
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // KOP Header
    let headerY = 40;
    
    // Logo
    let logoLoaded = false;
    if (kecamatanConfig.logo_path) {
      try {
        const logoPath = path.join(__dirname, '../../storage', kecamatanConfig.logo_path);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, marginLeft, headerY, { width: 65, height: 65 });
          logoLoaded = true;
        }
      } catch (err) {
        console.error('Error loading logo:', err);
      }
    }
    
    if (!logoLoaded) {
      try {
        const defaultLogoPath = path.join(__dirname, '../../public/logo-bogor.png');
        if (fs.existsSync(defaultLogoPath)) {
          doc.image(defaultLogoPath, marginLeft, headerY, { width: 65, height: 65 });
        }
      } catch (err) {}
    }

    // Header text
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

    // Address and contact
    headerY += 38;
    doc.fontSize(9).font('Helvetica');
    
    if (kecamatanConfig.alamat) {
      doc.text(kecamatanConfig.alamat, marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 11;
    }
    
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
    
    if (kecamatanConfig.kode_pos) {
      doc.text(`Kode Pos: ${kecamatanConfig.kode_pos}`, marginLeft, headerY, { 
        width: contentWidth, 
        align: 'center' 
      });
      headerY += 8;
    }

    // Line separator
    const lineY = headerY + 5;
    doc.lineWidth(2);
    doc.moveTo(marginLeft, lineY)
       .lineTo(pageWidth - marginRight, lineY)
       .stroke();
    doc.lineWidth(1);

    // Date - right aligned
    let yPos = lineY + 25;
    const today = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateStr = `${kecamatanConfig.nama_kecamatan || '.....................'}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    
    // Kepada section - positioned at right side, same alignment as date
    const kepadaX = pageWidth - marginRight - 200;
    
    doc.fontSize(11).font('Helvetica');
    doc.text(dateStr, kepadaX, yPos);

    yPos += 30;
    doc.text('Kepada', kepadaX, yPos);
    doc.text(':', kepadaX + 45, yPos);
    yPos += 15;
    doc.text('Yth.', kepadaX, yPos);
    doc.font('Helvetica-Bold').text('BUPATI BOGOR', kepadaX + 30, yPos);
    yPos += 15;
    doc.font('Helvetica').text('Melalui', kepadaX + 30, yPos);
    yPos += 15;
    doc.text('Kepala DPMD Kabupaten', kepadaX + 30, yPos);
    yPos += 15;
    doc.text('Bogor', kepadaX + 30, yPos);
    yPos += 15;
    doc.text('Di-', kepadaX + 30, yPos);
    yPos += 15;
    doc.text('Cibinong', kepadaX + 50, yPos);

    // Title
    yPos += 40;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('SURAT PENGANTAR', marginLeft, yPos, { 
      width: contentWidth, 
      align: 'center',
      underline: true
    });
    yPos += 15;
    doc.fontSize(11).font('Helvetica');
    doc.text(`Nomor : ${proposalData.nomor_surat || '............................'}`, marginLeft, yPos, { 
      width: contentWidth, 
      align: 'center' 
    });

    // Table
    yPos += 30;
    const tableLeft = marginLeft;
    const colWidths = {
      no: 35,
      jenis: 230,
      banyak: 100,
      ket: contentWidth - 365
    };

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    
    // Header row
    doc.rect(tableLeft, yPos, colWidths.no, 25).stroke();
    doc.text('No', tableLeft, yPos + 8, { width: colWidths.no, align: 'center' });
    
    doc.rect(tableLeft + colWidths.no, yPos, colWidths.jenis, 25).stroke();
    doc.text('Jenis yang dikirim', tableLeft + colWidths.no, yPos + 8, { width: colWidths.jenis, align: 'center' });
    
    doc.rect(tableLeft + colWidths.no + colWidths.jenis, yPos, colWidths.banyak, 25).stroke();
    doc.text('Banyaknya', tableLeft + colWidths.no + colWidths.jenis, yPos + 8, { width: colWidths.banyak, align: 'center' });
    
    doc.rect(tableLeft + colWidths.no + colWidths.jenis + colWidths.banyak, yPos, colWidths.ket, 25).stroke();
    doc.text('Keterangan', tableLeft + colWidths.no + colWidths.jenis + colWidths.banyak, yPos + 8, { width: colWidths.ket, align: 'center' });

    // Data row
    yPos += 25;
    const rowHeight = 80;
    
    doc.font('Helvetica');
    
    // No column
    doc.rect(tableLeft, yPos, colWidths.no, rowHeight).stroke();
    doc.text('1.', tableLeft, yPos + 8, { width: colWidths.no, align: 'center' });
    
    // Jenis column
    doc.rect(tableLeft + colWidths.no, yPos, colWidths.jenis, rowHeight).stroke();
    const jenisText = `Proposal Permohonan Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan Tahun Anggaran ${proposalData.tahun_anggaran || '20....'}
Desa ${proposalData.nama_desa || '.....'}`;
    doc.text(jenisText, tableLeft + colWidths.no + 5, yPos + 8, { 
      width: colWidths.jenis - 10, 
      align: 'left' 
    });
    
    // Banyak column
    doc.rect(tableLeft + colWidths.no + colWidths.jenis, yPos, colWidths.banyak, rowHeight).stroke();
    doc.text('1 (satu) berkas', tableLeft + colWidths.no + colWidths.jenis, yPos + 30, { 
      width: colWidths.banyak, 
      align: 'center' 
    });
    
    // Keterangan column
    doc.rect(tableLeft + colWidths.no + colWidths.jenis + colWidths.banyak, yPos, colWidths.ket, rowHeight).stroke();

    // Diterima pada tanggal
    yPos += rowHeight + 25;
    doc.text('Diterima pada tanggal : ............................', marginLeft, yPos);

    // Signature section
    yPos += 30;
    const sigWidth = contentWidth / 2 - 20;
    const camatSectionX = marginLeft + sigWidth + 40;
    
    // Left - Penerima
    doc.fontSize(11).font('Helvetica');
    doc.text('Penerima', marginLeft, yPos, { width: sigWidth, align: 'center' });
    
    // Right - CAMAT
    doc.font('Helvetica-Bold');
    doc.text('CAMAT,', camatSectionX, yPos, { width: sigWidth, align: 'center' });

    // Signature and stamp for CAMAT
    let camatSignY = yPos + 15;
    
    if (kecamatanConfig.ttd_camat) {
      try {
        let ttdFile = kecamatanConfig.ttd_camat;
        if (ttdFile.startsWith('uploads/')) {
          ttdFile = ttdFile.substring(8);
        }
        const ttdPath = path.join(__dirname, '../../storage/uploads', ttdFile);
        
        if (fs.existsSync(ttdPath)) {
          const signatureWidth = 120;
          const signatureHeight = 60;
          // Center TTD but move slightly right for stempel overlap
          const ttdX = camatSectionX + (sigWidth - signatureWidth) / 2 + 30;
          const ttdY = camatSignY;
          
          doc.image(ttdPath, ttdX, ttdY, { width: signatureWidth, height: signatureHeight });
          
          // Stempel - overlay on the left of TTD, positioned higher
          if (kecamatanConfig.stempel_path) {
            try {
              const stempelPath = path.join(__dirname, '../../storage/uploads', kecamatanConfig.stempel_path);
              if (fs.existsSync(stempelPath)) {
                const stempelSize = 70;
                const stempelX = ttdX - 30; // Overlap into signature
                const stempelY = ttdY - 15; // Move UP to be higher than signature
                doc.image(stempelPath, stempelX, stempelY, { width: stempelSize, height: stempelSize });
              }
            } catch (stempelErr) {
              console.error('Error loading stempel:', stempelErr);
            }
          }
        }
      } catch (err) {
        console.error('Error loading TTD camat:', err);
      }
    }

    // Signature space
    yPos += 70;

    // Penerima name placeholder
    doc.font('Helvetica');
    doc.text('( ...................................... )', marginLeft, yPos, { width: sigWidth, align: 'center' });
    
    // Camat name
    doc.text(`( ${kecamatanConfig.nama_camat || '......................................'} )`, camatSectionX, yPos, { 
      width: sigWidth, 
      align: 'center' 
    });

    // NIP
    yPos += 15;
    if (kecamatanConfig.nip_camat) {
      doc.text(`NIP. ${kecamatanConfig.nip_camat}`, camatSectionX, yPos, { 
        width: sigWidth, 
        align: 'center' 
      });
    } else {
      doc.text('NIP. ...............................', camatSectionX, yPos, { 
        width: sigWidth, 
        align: 'center' 
      });
    }
  }
}

module.exports = new BeritaAcaraService();
