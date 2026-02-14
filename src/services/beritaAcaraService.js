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
   * @param {Object} params.optionalItems - Optional infra items to include { item_5: true/false, item_7: true, ... }
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateBeritaAcaraVerifikasi({ desaId, kecamatanId, kegiatanId, proposalId = null, qrCode = null, checklistData = null, optionalItems = null }) {
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
      this.generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi, qrCode, checklistData, optionalItems);

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
        mk.jenis_kegiatan,
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        COALESCE(dv.nama, dc.nama_pic) as dinas_verifikator_nama,
        COALESCE(dv.nip, dc.nip_pic) as dinas_verifikator_nip,
        COALESCE(dv.jabatan, dc.jabatan_pic) as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        COALESCE(dv.ttd_path, dc.ttd_path) as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
      LEFT JOIN users u ON bp.dinas_verified_by = u.id
      LEFT JOIN dinas_config dc ON u.dinas_id = dc.dinas_id
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
        mk.jenis_kegiatan,
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        COALESCE(dv.nama, dc.nama_pic) as dinas_verifikator_nama,
        COALESCE(dv.nip, dc.nip_pic) as dinas_verifikator_nip,
        COALESCE(dv.jabatan, dc.jabatan_pic) as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        COALESCE(dv.ttd_path, dc.ttd_path) as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
      LEFT JOIN users u ON bp.dinas_verified_by = u.id
      LEFT JOIN dinas_config dc ON u.dinas_id = dc.dinas_id
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
        mk.jenis_kegiatan,
        mk.dinas_terkait,
        bp.judul_proposal,
        bp.deskripsi,
        bp.anggaran_usulan,
        bp.lokasi,
        bp.volume,
        bp.status,
        bp.catatan_verifikasi,
        COALESCE(dv.nama, dc.nama_pic) as dinas_verifikator_nama,
        COALESCE(dv.nip, dc.nip_pic) as dinas_verifikator_nip,
        COALESCE(dv.jabatan, dc.jabatan_pic) as dinas_verifikator_jabatan,
        dv.pangkat_golongan as dinas_verifikator_pangkat,
        COALESCE(dv.ttd_path, dc.ttd_path) as dinas_verifikator_ttd
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan mk ON bp.kegiatan_id = mk.id
      LEFT JOIN dinas_verifikator dv ON bp.dinas_verified_by = dv.user_id
      LEFT JOIN users u ON bp.dinas_verified_by = u.id
      LEFT JOIN dinas_config dc ON u.dinas_id = dc.dinas_id
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
  generatePage1(doc, desaData, kecamatanConfig, proposals, timVerifikasi, qrCode = null, checklistData = null, optionalItems = null) {
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // KOP Header - dari konfigurasi kecamatan
    let headerY = 40;
    const logoWidth = 45;
    const logoHeight = 45;
    const logoGap = 8; // gap antara logo dan teks
    
    // Logo Kabupaten Bogor (di kiri) - try from config first, then fallback to default
    let logoLoaded = false;
    if (kecamatanConfig.logo_path) {
      try {
        const logoPath = path.join(__dirname, '../../storage', kecamatanConfig.logo_path);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, marginLeft, headerY, { width: logoWidth, height: logoHeight });
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
          doc.image(defaultLogoPath, marginLeft, headerY, { width: logoWidth, height: logoHeight });
          logoLoaded = true;
        }
      } catch (err) {
        console.error('Error loading default logo:', err);
      }
    }
    
    // Header text - centered in area AFTER logo (agar tidak menabrak logo)
    const textStartX = marginLeft + logoWidth + logoGap;
    const textWidth = contentWidth - logoWidth - logoGap;
    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', textStartX, headerY + 2, { 
      width: textWidth, 
      align: 'center' 
    });
    
    doc.fontSize(13).font('Helvetica-Bold');
    doc.text(`KECAMATAN ${(kecamatanConfig.nama_kecamatan || '').toUpperCase()}`, textStartX, headerY + 19, { 
      width: textWidth, 
      align: 'center' 
    });

    // Address and contact - centered in text area after logo (matching reference format)
    let subHeaderY = headerY + 38;
    doc.fontSize(8).font('Helvetica');
    
    // Line 1: Alamat + Kab. Bogor + Kode Pos (regular)
    if (kecamatanConfig.alamat) {
      let alamatLine = kecamatanConfig.alamat;
      if (kecamatanConfig.kode_pos) alamatLine += ` Kode Pos ${kecamatanConfig.kode_pos}`;
      doc.text(alamatLine, textStartX, subHeaderY, { 
        width: textWidth, 
        align: 'center' 
      });
      subHeaderY += 11;
    }
    
    // Line 2: Telp | Website | Email - semua dalam 1 baris
    const contactParts = [];
    if (kecamatanConfig.telepon) contactParts.push(`Telp. ${kecamatanConfig.telepon}`);
    if (kecamatanConfig.website) contactParts.push(kecamatanConfig.website);
    if (kecamatanConfig.email) contactParts.push(kecamatanConfig.email);
    if (contactParts.length > 0) {
      doc.font('Helvetica-Oblique');
      doc.text(contactParts.join('  |  '), textStartX, subHeaderY, { 
        width: textWidth, 
        align: 'center' 
      });
      doc.font('Helvetica');
      subHeaderY += 11;
    }

    // Hitung headerY akhir = max antara bottom logo dan bottom teks
    const logoBottom = headerY + logoHeight;
    headerY = Math.max(logoBottom, subHeaderY) + 2;

    // Line separator - double line (tebal atas, tipis bawah) seperti kop surat resmi
    const lineY = headerY;
    doc.lineWidth(2.5);
    doc.moveTo(marginLeft, lineY)
       .lineTo(pageWidth - marginRight, lineY)
       .stroke();
    doc.lineWidth(0.8);
    doc.moveTo(marginLeft, lineY + 4)
       .lineTo(pageWidth - marginRight, lineY + 4)
       .stroke();
    doc.lineWidth(1);

    // Title - dynamic Y position based on header height
    let titleY = lineY + 20;
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

    // Determine jenis kegiatan from proposal data
    const jenisKegiatan = proposals[0]?.jenis_kegiatan || 'infrastruktur';
    const isInfrastruktur = jenisKegiatan === 'infrastruktur';
    
    console.log(`📌 Jenis Kegiatan: ${jenisKegiatan}, isInfrastruktur: ${isInfrastruktur}`);

    // Checklist items berbeda berdasarkan jenis kegiatan
    let checklistItems = [];
    
    if (isInfrastruktur) {
      // INFRASTRUKTUR - 12 items, items 5,7,8,9 optional (controlled by optionalItems)
      checklistItems = [
        { no: 1, itemKey: 'item_1', text: 'Surat Pengantar dari Kepala Desa' },
        { no: 2, itemKey: 'item_2', text: 'Surat Permohonan Bantuan Keuangan' },
        { 
          no: 3, itemKey: 'item_3',
          text: 'Proposal (Latar Belakang, Maksud dan Tujuan, Bentuk Kegiatan, Jadwal Pelaksanaan)',
          subItems: [
            '- Latar Belakang',
            '- Maksud dan Tujuan',
            '- Bentuk Kegiatan',
            '- Jadwal Pelaksanaan'
          ]
        },
        { no: 4, itemKey: 'item_4', text: 'RPA dan RAB' },
        { no: 5, itemKey: 'item_5', text: 'Surat Pernyataan dari Kepala Desa yang menyatakan bahwa lokasi kegiatan tidak dalam keadaan sengketa/bermasalah apabila merupakan Aset Desa', optional: true },
        { no: 6, itemKey: 'item_6', text: 'Bukti kepemilikan Aset Desa sesuai ketentuan peraturan perundang-undangan, dalam hal usulan kegiatan yang diusulkan berupa Rehab Kantor Desa' },
        { no: 7, itemKey: 'item_7', text: 'Dokumen kesediaan peralihan hak melalui hibah dari warga masyarakat baik perorangan maupun Badan Usaha/Badan Hukum kepada Desa atas lahan/tanah yang menjadi Aset Desa sebagai dampak kegiatan pembangunan infrastruktur desa', optional: true },
        { no: 8, itemKey: 'item_8', text: 'Dokumen pernyataan kesanggupan dari warga masyarakat untuk tidak meminta ganti rugi', optional: true },
        { no: 9, itemKey: 'item_9', text: 'Persetujuan pemanfaatan barang milik Daerah/Negara dalam hal lahan yang akan dipergunakan untuk pembangunan infrastruktur desa', optional: true },
        { no: 10, itemKey: 'item_10', text: 'Foto lokasi rencana pelaksanaan kegiatan' },
        { no: 11, itemKey: 'item_11', text: 'Peta lokasi rencana kegiatan' },
        { no: 12, itemKey: 'item_12', text: 'Berita Acara Musyawarah Desa' },
      ];
    } else {
      // NON INFRASTRUKTUR - 5 items
      checklistItems = [
        { no: 1, itemKey: 'item_1', text: 'Surat Pengantar dari Kepala Desa' },
        { no: 2, itemKey: 'item_2', text: 'Surat Permohonan Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan' },
        { 
          no: 3, itemKey: 'item_3',
          text: 'Proposal Bantuan Keuangan (Latar Belakang, Maksud dan Tujuan, Bentuk Kegiatan, Jadwal Pelaksanaan)',
          subItems: [
            '- Latar Belakang',
            '- Maksud dan Tujuan',
            '- Bentuk Kegiatan',
            '- Jadwal Pelaksanaan'
          ]
        },
        { no: 4, itemKey: 'item_4', text: 'Rencana Anggaran Biaya' },
        { no: 5, itemKey: 'item_5', text: 'Tidak Duplikasi Anggaran' },
      ];
    }

    yPos = tableTop + 20; // Start after header
    doc.font('Helvetica').fontSize(9);

    // Debug log
    console.log('🔍 Checklist Data:', JSON.stringify(checklistData, null, 2));
    console.log('🔍 Optional Items:', JSON.stringify(optionalItems, null, 2));

    checklistItems.forEach((item) => {
      const hasSubItems = item.subItems && item.subItems.length > 0;
      
      // For optional items (infra 5,7,8,9), check if included via optionalItems
      // If optionalItems provided and item is optional but not selected, show with dash/empty
      const isOptional = item.optional === true;
      const optionalIncluded = isOptional ? (optionalItems && optionalItems[item.itemKey] === true) : true;
      
      // Get checklist status from aggregated questionnaire data
      const checkStatus = checklistData ? checklistData[item.itemKey] : null;
      
      console.log(`📋 Item ${item.no}: key=${item.itemKey}, status=${checkStatus}, optional=${isOptional}, included=${optionalIncluded}`);
      
      // Calculate row height dynamically based on actual text height
      const textHeight = doc.heightOfString(item.text, { width: colWidths.uraian - 8, lineGap: 2 });
      let estimatedHeight = Math.max(22, textHeight + 10);
      if (hasSubItems) {
        estimatedHeight = 100;
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
      
      if (isOptional && !optionalIncluded) {
        // Optional item not included - show dash "-"
        doc.save();
        doc.fontSize(12).font('Helvetica');
        doc.text('-', checkCenterX - 4, markY - 6, { width: 10, align: 'center' });
        doc.restore();
      } else if (checkStatus === true) {
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
      
      // KET column - show "Opsional" for optional items
      if (isOptional) {
        doc.fontSize(7).font('Helvetica-Oblique');
        doc.text(optionalIncluded ? 'Ada' : 'Tidak Ada', xPos + 3, yPos + 4, { 
          width: colWidths.ket - 6, 
          align: 'left' 
        });
        doc.font('Helvetica').fontSize(9);
      } else if (item.ket) {
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
    const logoWidth = 45;
    const logoHeight = 45;
    const logoGap = 8;
    
    // Logo
    let logoLoaded = false;
    if (kecamatanConfig.logo_path) {
      try {
        const logoPath = path.join(__dirname, '../../storage', kecamatanConfig.logo_path);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, marginLeft, headerY, { width: logoWidth, height: logoHeight });
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
          doc.image(defaultLogoPath, marginLeft, headerY, { width: logoWidth, height: logoHeight });
        }
      } catch (err) {}
    }

    // Header text - centered in area AFTER logo
    const textStartX = marginLeft + logoWidth + logoGap;
    const textWidth = contentWidth - logoWidth - logoGap;
    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('PEMERINTAH KABUPATEN BOGOR', textStartX, headerY + 2, { 
      width: textWidth, 
      align: 'center' 
    });
    
    doc.fontSize(13).font('Helvetica-Bold');
    doc.text(`KECAMATAN ${(kecamatanConfig.nama_kecamatan || '').toUpperCase()}`, textStartX, headerY + 19, { 
      width: textWidth, 
      align: 'center' 
    });

    // Address and contact - centered in text area after logo (matching reference format)
    let subHeaderY = headerY + 38;
    doc.fontSize(8).font('Helvetica');
    
    // Line 1: Alamat + Kab. Bogor + Kode Pos (regular)
    if (kecamatanConfig.alamat) {
      let alamatLine = kecamatanConfig.alamat;
      if (kecamatanConfig.kode_pos) alamatLine += ` Kode Pos ${kecamatanConfig.kode_pos}`;
      doc.text(alamatLine, textStartX, subHeaderY, { 
        width: textWidth, 
        align: 'center' 
      });
      subHeaderY += 11;
    }
    
    // Line 2: Telp | Website | Email - semua dalam 1 baris
    const spContactParts = [];
    if (kecamatanConfig.telepon) spContactParts.push(`Telp. ${kecamatanConfig.telepon}`);
    if (kecamatanConfig.website) spContactParts.push(kecamatanConfig.website);
    if (kecamatanConfig.email) spContactParts.push(kecamatanConfig.email);
    if (spContactParts.length > 0) {
      doc.font('Helvetica-Oblique');
      doc.text(spContactParts.join('  |  '), textStartX, subHeaderY, { 
        width: textWidth, 
        align: 'center' 
      });
      doc.font('Helvetica');
      subHeaderY += 11;
    }

    // Hitung headerY akhir = max antara bottom logo dan bottom teks
    const logoBottom = headerY + logoHeight;
    headerY = Math.max(logoBottom, subHeaderY) + 2;

    // Line separator - double line (tebal atas, tipis bawah)
    const lineY = headerY;
    doc.lineWidth(2.5);
    doc.moveTo(marginLeft, lineY)
       .lineTo(pageWidth - marginRight, lineY)
       .stroke();
    doc.lineWidth(0.8);
    doc.moveTo(marginLeft, lineY + 4)
       .lineTo(pageWidth - marginRight, lineY + 4)
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
