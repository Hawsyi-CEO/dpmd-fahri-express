const Bumdes = require('../models/Bumdes');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class BumdesController {
  
  // GET /api/desa/bumdes - Get BUMDES for logged in desa
  async getDesaBumdes(req, res, next) {
    try {
      const userId = req.user.id;
      const desaId = req.user.desa_id;
      
      if (!desaId) {
        return res.status(403).json({
          success: false,
          message: 'User tidak memiliki desa_id'
        });
      }

      logger.info(`Fetching BUMDES for desa_id: ${desaId}`);

      const bumdes = await Bumdes.findOne({
        where: { desa_id: desaId }
      });

      return res.json({
        success: true,
        data: bumdes,
        message: bumdes ? 'Data BUMDES ditemukan' : 'Belum ada data BUMDES'
      });

    } catch (error) {
      logger.error('Error getting desa BUMDES:', error);
      next(error);
    }
  }

  // POST /api/desa/bumdes - Create/Update BUMDES (STEP 1: Data only, no files)
  async storeDesaBumdes(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const desaId = req.user.desa_id;

      logger.info('BUMDES Store Request Received', {
        user_id: userId,
        user_role: userRole,
        desa_id: desaId,
        has_data: !!req.body
      });

      const data = req.body;
      
      // For role 'desa', use their desa_id
      // For role 'sarpras' or 'admin', use desa_id from form data
      let targetDesaId;
      
      if (userRole === 'desa') {
        if (!desaId) {
          return res.status(403).json({
            success: false,
            message: 'User desa tidak memiliki desa_id'
          });
        }
        targetDesaId = desaId;
        data.desa_id = desaId;
      } else if (['sarpras', 'admin', 'superadmin'].includes(userRole)) {
        // Sarpras/Admin must provide desa_id in the form data
        if (!data.desa_id) {
          return res.status(400).json({
            success: false,
            message: 'desa_id harus disertakan dalam data'
          });
        }
        targetDesaId = data.desa_id;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Role tidak memiliki akses untuk menyimpan BUMDes'
        });
      }

      // Check if BUMDES already exists for this desa_id
      const existing = await Bumdes.findOne({
        where: { desa_id: targetDesaId }
      });

      let bumdes;
      
      if (existing) {
        // Update existing
        await existing.update(data);
        bumdes = existing;
        logger.info(`BUMDES updated for desa_id: ${targetDesaId} by user ${userId} (${userRole})`);
      } else {
        // Create new
        bumdes = await Bumdes.create(data);
        logger.info(`BUMDES created for desa_id: ${targetDesaId}, id: ${bumdes.id} by user ${userId} (${userRole})`);
      }

      return res.json({
        success: true,
        data: bumdes,
        message: existing ? 'Data BUMDES berhasil diperbarui' : 'Data BUMDES berhasil disimpan'
      });

    } catch (error) {
      logger.error('Error storing BUMDES:', error);
      next(error);
    }
  }

  // POST /api/desa/bumdes/upload-file - Upload single file (STEP 2)
  async uploadDesaBumdesFile(req, res, next) {
    try {
      const userId = req.user.id;
      const desaId = req.user.desa_id;

      logger.info('=== BUMDES UPLOAD FILE REQUEST ===', {
        has_file: !!req.file,
        bumdes_id: req.body.bumdes_id,
        field_name: req.body.field_name,
        desa_id: desaId
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { bumdes_id, field_name } = req.body;

      if (!bumdes_id || !field_name) {
        return res.status(400).json({
          success: false,
          message: 'bumdes_id and field_name required'
        });
      }

      // Find BUMDES and verify ownership
      const bumdes = await Bumdes.findOne({
        where: { 
          id: bumdes_id,
          desa_id: desaId 
        }
      });

      if (!bumdes) {
        return res.status(404).json({
          success: false,
          message: 'BUMDES not found or access denied'
        });
      }

      // Determine folder based on field name
      const laporanKeuanganFields = ['LaporanKeuangan2021', 'LaporanKeuangan2022', 'LaporanKeuangan2023', 'LaporanKeuangan2024'];
      const dokumenBadanHukumFields = ['ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 'AnggaranRumahTangga', 'ProgramKerja', 'Perdes', 'SK_BUM_Desa'];
      
      let folder = 'bumdes';
      if (laporanKeuanganFields.includes(field_name)) {
        folder = 'bumdes_laporan_keuangan';
      } else if (dokumenBadanHukumFields.includes(field_name)) {
        folder = 'bumdes_dokumen_badanhukum';
      }

      // Delete old file if exists
      const currentFilePath = bumdes[field_name];
      if (currentFilePath) {
        const oldFilePath = path.join(__dirname, '../../storage/uploads', currentFilePath);
        try {
          await fs.unlink(oldFilePath);
          logger.info('Old file deleted:', currentFilePath);
        } catch (err) {
          logger.warn('Could not delete old file:', err.message);
        }
      }

      // New file path (relative)
      const newFilePath = `${folder}/${req.file.filename}`;

      // Update database
      bumdes[field_name] = newFilePath;
      await bumdes.save();

      logger.info('BUMDES File uploaded successfully', {
        bumdes_id,
        field_name,
        file_path: newFilePath
      });

      return res.json({
        success: true,
        message: 'File berhasil diupload',
        data: {
          field_name,
          file_path: newFilePath
        }
      });

    } catch (error) {
      logger.error('Error uploading BUMDES file:', error);
      next(error);
    }
  }

  // PUT /api/desa/bumdes/:id - Update BUMDES
  async updateDesaBumdes(req, res, next) {
    try {
      const { id } = req.params;
      const desaId = req.user.desa_id;

      const bumdes = await Bumdes.findOne({
        where: { 
          id,
          desa_id: desaId 
        }
      });

      if (!bumdes) {
        return res.status(404).json({
          success: false,
          message: 'BUMDES not found or access denied'
        });
      }

      await bumdes.update(req.body);

      logger.info(`BUMDES updated: ${id}`);

      return res.json({
        success: true,
        data: bumdes,
        message: 'Data BUMDES berhasil diperbarui'
      });

    } catch (error) {
      logger.error('Error updating BUMDES:', error);
      next(error);
    }
  }

  // DELETE /api/desa/bumdes/:id - Delete BUMDES
  async deleteDesaBumdes(req, res, next) {
    try {
      const { id } = req.params;
      const desaId = req.user.desa_id;

      const bumdes = await Bumdes.findOne({
        where: { 
          id,
          desa_id: desaId 
        }
      });

      if (!bumdes) {
        return res.status(404).json({
          success: false,
          message: 'BUMDES not found or access denied'
        });
      }

      // Delete all associated files
      const fileFields = [
        'LaporanKeuangan2021', 'LaporanKeuangan2022', 'LaporanKeuangan2023', 'LaporanKeuangan2024',
        'ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 'AnggaranRumahTangga', 'ProgramKerja',
        'Perdes', 'SK_BUM_Desa'
      ];

      for (const field of fileFields) {
        if (bumdes[field]) {
          const filePath = path.join(__dirname, '../../storage/uploads', bumdes[field]);
          try {
            await fs.unlink(filePath);
            logger.info(`Deleted file: ${bumdes[field]}`);
          } catch (err) {
            logger.warn(`Could not delete file: ${bumdes[field]}`);
          }
        }
      }

      await bumdes.destroy();

      logger.info(`BUMDES deleted: ${id}`);

      return res.json({
        success: true,
        message: 'Data BUMDES berhasil dihapus'
      });

    } catch (error) {
      logger.error('Error deleting BUMDES:', error);
      next(error);
    }
  }

  // GET /api/bumdes - Get all BUMDES (Admin)
  async getAllBumdes(req, res, next) {
    try {
      logger.info('Getting all BUMDES data', {
        user_role: req.user.role,
        user_id: req.user.id
      });

      const bumdes = await Bumdes.findAll({
        order: [['created_at', 'DESC']]
      });

      logger.info(`Found ${bumdes.length} BUMDES records`);

      return res.json({
        success: true,
        data: bumdes
      });

    } catch (error) {
      logger.error('Error getting all BUMDES:', error);
      next(error);
    }
  }

  // GET /api/bumdes/dokumen-badan-hukum - Get dokumen badan hukum files (OPTIMIZED - Lazy Load)
  async getDokumenBadanHukum(req, res, next) {
    try {
      const { bumdes_id } = req.query; // Optional: filter by specific BUMDes
      
      logger.info('Getting dokumen badan hukum files (optimized)', { bumdes_id });

      // Get base URL for file serving
      const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

      // Build where clause
      const whereClause = {};
      if (bumdes_id) {
        whereClause.id = bumdes_id;
      }

      // Get all BUMDES data once (cached in memory)
      const allBumdes = await Bumdes.findAll({
        where: whereClause,
        attributes: ['id', 'namabumdesa', 'desa', 'kecamatan', 
                     'ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 
                     'AnggaranRumahTangga', 'ProgramKerja', 'Perdes', 'SK_BUM_Desa']
      });

      // Build lightweight file list from database (no filesystem scan)
      const documents = [];
      const seenFiles = new Set(); // Track seen files to prevent duplicates
      const fileFields = [
        { field: 'ProfilBUMDesa', label: 'Profil BUMDesa' },
        { field: 'BeritaAcara', label: 'Berita Acara' },
        { field: 'AnggaranDasar', label: 'Anggaran Dasar' },
        { field: 'AnggaranRumahTangga', label: 'Anggaran Rumah Tangga' },
        { field: 'ProgramKerja', label: 'Program Kerja' },
        { field: 'Perdes', label: 'Peraturan Desa' },
        { field: 'SK_BUM_Desa', label: 'SK BUM Desa' }
      ];

      for (const bumdes of allBumdes) {
        for (const { field, label } of fileFields) {
          if (bumdes[field]) {
            const filename = bumdes[field].split('/').pop();
            
            // Create unique key: bumdes_id + filename + field to prevent duplicates
            const uniqueKey = `${bumdes.id}_${filename}_${field}`;
            
            if (!seenFiles.has(uniqueKey)) {
              seenFiles.add(uniqueKey);
              
              documents.push({
                filename,
                document_type: label,
                original_path: `uploads/bumdes_dokumen_badanhukum/${filename}`,
                url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
                download_url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
                file_exists: true, // File ada di database
                status: 'available',
                bumdes_name: bumdes.namabumdesa || 'Tidak Diketahui',
                desa: bumdes.desa || '',
                kecamatan: bumdes.kecamatan || '',
                bumdes_id: bumdes.id, // Change from 'id' to 'bumdes_id' to be more explicit
                field: field
              });
            }
          }
        }
      }

      // Sort by bumdes name
      documents.sort((a, b) => a.bumdes_name.localeCompare(b.bumdes_name));

      logger.info(`Found ${documents.length} dokumen badan hukum records`);

      return res.json({
        status: 'success',
        message: 'Dokumen badan hukum berhasil diambil',
        data: documents,
        total: documents.length
      });

    } catch (error) {
      logger.error('Error getting dokumen badan hukum:', error);
      next(error);
    }
  }

  // GET /api/bumdes/laporan-keuangan - Get laporan keuangan files (OPTIMIZED - Lazy Load)
  async getLaporanKeuangan(req, res, next) {
    try {
      const { bumdes_id } = req.query; // Optional: filter by specific BUMDes
      
      logger.info('Getting laporan keuangan files (optimized)', { bumdes_id });

      // Get base URL for file serving
      const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

      // Build where clause
      const whereClause = {};
      if (bumdes_id) {
        whereClause.id = bumdes_id;
      }

      // Get all BUMDES data once (cached in memory)
      const allBumdes = await Bumdes.findAll({
        where: whereClause,
        attributes: ['id', 'namabumdesa', 'desa', 'kecamatan',
                     'LaporanKeuangan2021', 'LaporanKeuangan2022', 
                     'LaporanKeuangan2023', 'LaporanKeuangan2024']
      });

      // Build lightweight file list from database (no filesystem scan)
      const documents = [];
      const seenFiles = new Set(); // Track seen files to prevent duplicates
      const yearFields = [
        { field: 'LaporanKeuangan2021', year: '2021' },
        { field: 'LaporanKeuangan2022', year: '2022' },
        { field: 'LaporanKeuangan2023', year: '2023' },
        { field: 'LaporanKeuangan2024', year: '2024' }
      ];

      for (const bumdes of allBumdes) {
        for (const { field, year } of yearFields) {
          if (bumdes[field]) {
            const filename = bumdes[field].split('/').pop();
            
            // Create unique key: bumdes_id + filename + field to prevent duplicates
            const uniqueKey = `${bumdes.id}_${filename}_${field}`;
            
            if (!seenFiles.has(uniqueKey)) {
              seenFiles.add(uniqueKey);
              
              documents.push({
                filename,
                document_type: `Laporan Keuangan ${year}`,
                year: year,
                original_path: `uploads/bumdes_laporan_keuangan/${filename}`,
                url: `${baseUrl}/uploads/bumdes_laporan_keuangan/${filename}`,
                download_url: `${baseUrl}/uploads/bumdes_laporan_keuangan/${filename}`,
                file_exists: true, // File ada di database
                status: 'available',
                bumdes_name: bumdes.namabumdesa || 'Tidak Diketahui',
                desa: bumdes.desa || '',
                kecamatan: bumdes.kecamatan || '',
                bumdes_id: bumdes.id, // Change from 'id' to 'bumdes_id' to be more explicit
                field: field
              });
            }
          }
        }
      }

      // Sort by year DESC, then bumdes name
      documents.sort((a, b) => {
        const yearDiff = b.year.localeCompare(a.year);
        if (yearDiff !== 0) return yearDiff;
        return a.bumdes_name.localeCompare(b.bumdes_name);
      });

      logger.info(`Found ${documents.length} laporan keuangan records`);

      return res.json({
        status: 'success',
        message: 'Laporan keuangan berhasil diambil',
        data: documents,
        total: documents.length
      });

    } catch (error) {
      logger.error('Error getting laporan keuangan:', error);
      next(error);
    }
  }

  // GET /api/bumdes/produk-hukum - Get produk hukum files (OPTIMIZED - Lazy Load)
  async getProdukHukum(req, res, next) {
    try {
      logger.info('Getting produk hukum files (optimized)');

      // Get base URL for file serving
      const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

      // Get all BUMDES with produk hukum documents
      const allBumdes = await Bumdes.findAll({
        attributes: ['id', 'namabumdesa', 'desa', 'kecamatan', 'Perdes', 'SK_BUM_Desa']
      });
      
      const documents = [];

      for (const bumdes of allBumdes) {
        // Add Perdes file
        if (bumdes.Perdes) {
          const filename = bumdes.Perdes.split('/').pop();
          documents.push({
            filename,
            original_path: `uploads/bumdes_dokumen_badanhukum/${filename}`,
            url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
            download_url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
            file_exists: true, // File ada di database
            status: 'available',
            type: 'Perdes',
            document_type: 'Peraturan Desa',
            bumdes_name: bumdes.namabumdesa || 'Tidak Diketahui',
            desa: bumdes.desa || '',
            kecamatan: bumdes.kecamatan || '',
            id: bumdes.id
          });
        }

        // Add SK BUM Desa file
        if (bumdes.SK_BUM_Desa) {
          const filename = bumdes.SK_BUM_Desa.split('/').pop();
          documents.push({
            filename,
            original_path: `uploads/bumdes_dokumen_badanhukum/${filename}`,
            url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
            download_url: `${baseUrl}/uploads/bumdes_dokumen_badanhukum/${filename}`,
            file_exists: true, // File ada di database
            status: 'available',
            type: 'SK_BUM_Desa',
            document_type: 'SK BUM Desa',
            bumdes_name: bumdes.namabumdesa || 'Tidak Diketahui',
            desa: bumdes.desa || '',
            kecamatan: bumdes.kecamatan || '',
            id: bumdes.id
          });
        }
      }

      // Sort by bumdes name
      documents.sort((a, b) => a.bumdes_name.localeCompare(b.bumdes_name));

      logger.info(`Found ${documents.length} produk hukum records`);

      return res.json({
        status: 'success',
        message: 'Produk hukum berhasil diambil',
        data: documents,
        total: documents.length,
        summary: {
          total_documents: documents.length,
          by_type: {
            perdes: documents.filter(d => d.type === 'Perdes').length,
            sk_bumdes: documents.filter(d => d.type === 'SK_BUM_Desa').length
          }
        }
      });

    } catch (error) {
      logger.error('Error getting produk hukum:', error);
      next(error);
    }
  }

  // GET /api/bumdes/statistics - Get BUMDES statistics (Admin)
  async getStatistics(req, res, next) {
    try {
      const { Op } = require('sequelize');
      
      // Basic counts
      const total = await Bumdes.count();
      const aktif = await Bumdes.count({ where: { status: 'aktif' } });
      const tidakAktif = await Bumdes.count({ where: { status: 'tidak aktif' } });

      // Calculate progress to target (assuming target is 416 desa)
      const target = 416;
      const remaining = Math.max(0, target - total);
      const percentage = Math.min(100, Math.round((total / target) * 100));

      // Get all bumdes for detailed stats with actual database field names
      const allBumdes = await Bumdes.findAll({
        attributes: [
          'kecamatan', 'JenisUsaha', 'status', 'TahunPendirian', 'badanhukum',
          'PenyertaanModal2019', 'PenyertaanModal2020', 'PenyertaanModal2021',
          'PenyertaanModal2022', 'PenyertaanModal2023', 'PenyertaanModal2024',
          'SumberLain', 'NilaiAset', 'Omset2024', 'Laba2024',
          'TotalTenagaKerja'
        ]
      });

      // Statistics by Kecamatan
      const byKecamatan = {};
      allBumdes.forEach(b => {
        const kec = b.kecamatan || 'Tidak Diketahui';
        if (!byKecamatan[kec]) {
          byKecamatan[kec] = { total: 0, aktif: 0, tidak_aktif: 0 };
        }
        byKecamatan[kec].total++;
        if (b.status === 'aktif') byKecamatan[kec].aktif++;
        if (b.status === 'tidak aktif') byKecamatan[kec].tidak_aktif++;
      });

      // Statistics by Jenis Usaha
      const byJenisUsaha = {};
      allBumdes.forEach(b => {
        const jenis = b.JenisUsaha || 'Tidak Diketahui';
        if (!byJenisUsaha[jenis]) {
          byJenisUsaha[jenis] = 0;
        }
        byJenisUsaha[jenis]++;
      });

      // Statistics by Tahun Pendirian (for trend chart)
      const byTahun = {};
      allBumdes.forEach(b => {
        if (b.TahunPendirian) {
          const tahun = b.TahunPendirian.toString();
          if (!byTahun[tahun]) {
            byTahun[tahun] = 0;
          }
          byTahun[tahun]++;
        }
      });

      // Calculate financial statistics
      let totalModal = 0;
      let totalAset = 0;
      let totalOmset = 0;
      let totalLaba = 0;
      let countWithModalData = 0;

      allBumdes.forEach(b => {
        // Calculate total modal from all penyertaan modal years + sumber lain
        let modal = 0;
        modal += parseFloat(b.PenyertaanModal2019) || 0;
        modal += parseFloat(b.PenyertaanModal2020) || 0;
        modal += parseFloat(b.PenyertaanModal2021) || 0;
        modal += parseFloat(b.PenyertaanModal2022) || 0;
        modal += parseFloat(b.PenyertaanModal2023) || 0;
        modal += parseFloat(b.PenyertaanModal2024) || 0;
        modal += parseFloat(b.SumberLain) || 0;
        
        if (modal > 0) {
          totalModal += modal;
          countWithModalData++;
        }
        
        if (b.NilaiAset) totalAset += parseFloat(b.NilaiAset) || 0;
        if (b.Omset2024) totalOmset += parseFloat(b.Omset2024) || 0;
        if (b.Laba2024) totalLaba += parseFloat(b.Laba2024) || 0;
      });

      // Workforce statistics (only total available, no gender breakdown in DB)
      let totalTenagaKerja = 0;

      allBumdes.forEach(b => {
        if (b.TotalTenagaKerja) totalTenagaKerja += parseInt(b.TotalTenagaKerja) || 0;
      });

      // Status Badan Hukum statistics
      const terbitSertifikat = allBumdes.filter(b => b.badanhukum === 'Terbit Sertifikat Badan Hukum').length;
      const namaTermerifikasi = allBumdes.filter(b => b.badanhukum === 'Nama Terverifikasi').length;
      const perbaikanDokumen = allBumdes.filter(b => b.badanhukum === 'Perbaikan Dokumen').length;
      const belumProses = allBumdes.filter(b => b.badanhukum === 'Belum Melakukan Proses').length;
      const percentageSertifikat = total > 0 ? Math.round((terbitSertifikat / total) * 100) : 0;

      return res.json({
        success: true,
        data: {
          overview: {
            total,
            aktif,
            tidak_aktif: tidakAktif,
            progress_to_target: {
              target,
              remaining,
              percentage
            }
          },
          by_kecamatan: Object.keys(byKecamatan).map(key => ({
            kecamatan: key,
            ...byKecamatan[key]
          })).sort((a, b) => b.total - a.total),
          by_jenis_usaha: Object.keys(byJenisUsaha).map(key => ({
            jenis_usaha: key,
            total: byJenisUsaha[key]
          })).sort((a, b) => b.total - a.total),
          by_tahun: Object.keys(byTahun).map(key => ({
            tahun: key,
            total: byTahun[key]
          })).sort((a, b) => a.tahun - b.tahun),
          financial: {
            total_modal: totalModal,
            total_aset: totalAset,
            total_volume_usaha: totalOmset,
            total_shu: totalLaba,
            rata_rata_modal: countWithModalData > 0 ? Math.round(totalModal / countWithModalData) : 0,
            rata_rata_aset: total > 0 ? Math.round(totalAset / total) : 0
          },
          workforce: {
            total_tenaga_kerja: totalTenagaKerja,
            laki_laki: 0, // Not available in database
            perempuan: 0, // Not available in database
            persentase_perempuan: 0 // Not available in database
          },
          badan_hukum: {
            terbit_sertifikat: terbitSertifikat,
            nama_terverifikasi: namaTermerifikasi,
            perbaikan_dokumen: perbaikanDokumen,
            belum_proses: belumProses,
            percentage_sertifikat: percentageSertifikat
          }
        }
      });

    } catch (error) {
      logger.error('Error getting BUMDES statistics:', error);
      next(error);
    }
  }

  // GET /api/desa/bumdes/produk-hukum - Get produk hukum options for dropdown
  async getProdukHukumForBumdes(req, res, next) {
    try {
      const desaId = req.user.desa_id;

      logger.info('Getting produk hukum options for desa:', desaId);

      // For now, return empty arrays since produk hukum linking is not yet implemented
      // In the future, this should fetch from produk_hukum table filtered by desa
      return res.json({
        success: true,
        data: {
          perdes: [],
          sk: []
        },
        message: 'Produk hukum options retrieved (feature coming soon)'
      });

    } catch (error) {
      logger.error('Error getting produk hukum for bumdes:', error);
      next(error);
    }
  }

  // GET /api/bumdes/check-desa/:kode_desa - Check if kode_desa already has BUMDes
  async checkDesaBumdes(req, res, next) {
    try {
      const { kode_desa } = req.params;
      
      logger.info(`Checking if kode_desa ${kode_desa} has existing BUMDes`);

      const bumdes = await Bumdes.findOne({
        where: { kode_desa: kode_desa }
      });

      return res.json({
        success: true,
        exists: !!bumdes,
        data: bumdes ? { 
          id: bumdes.id, 
          namabumdesa: bumdes.namabumdesa,
          kode_desa: bumdes.kode_desa,
          desa: bumdes.desa
        } : null
      });

    } catch (error) {
      logger.error('Error checking desa BUMDes:', error);
      next(error);
    }
  }

  // DELETE /api/bumdes/delete-file - Delete a file and update database
  async deleteFile(req, res, next) {
    try {
      const { filename, document_type, bumdes_id } = req.body;
      
      if (!filename || !document_type) {
        return res.status(400).json({
          success: false,
          message: 'filename and document_type are required'
        });
      }

      logger.info('Deleting file:', { filename, document_type, bumdes_id });

      // Determine folder based on document type
      let folder = '';
      if (document_type === 'dokumen_badan_hukum') {
        folder = 'bumdes_dokumen_badanhukum';
      } else if (document_type === 'laporan_keuangan') {
        folder = 'bumdes_laporan_keuangan';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid document_type'
        });
      }

      // Find BUMDes that has this file
      const documentFields = document_type === 'dokumen_badan_hukum' 
        ? ['Perdes', 'ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 'AnggaranRumahTangga', 'ProgramKerja', 'SK_BUM_Desa']
        : ['LaporanKeuangan2021', 'LaporanKeuangan2022', 'LaporanKeuangan2023', 'LaporanKeuangan2024'];

      let updatedCount = 0;
      const { Op } = require('sequelize');

      for (const field of documentFields) {
        const bumdesList = await Bumdes.findAll({
          where: {
            [field]: {
              [Op.like]: `%${filename}%`
            }
          }
        });

        for (const bumdes of bumdesList) {
          // Clear the field
          await bumdes.update({ [field]: null });
          updatedCount++;
          logger.info(`Cleared field ${field} for BUMDes ${bumdes.id}`);
        }
      }

      // Delete physical file
      const filePath = path.join(__dirname, '../../storage/uploads', folder, filename);
      try {
        await fs.unlink(filePath);
        logger.info(`Physical file deleted: ${filePath}`);
      } catch (fileError) {
        logger.warn(`Could not delete physical file: ${filePath}`, fileError.message);
        // Continue even if file deletion fails (file might not exist)
      }

      return res.json({
        success: true,
        message: `File berhasil dihapus${updatedCount > 0 ? ` (${updatedCount} referensi database diperbarui)` : ''}`,
        deleted_file: filename,
        updated_records: updatedCount
      });

    } catch (error) {
      logger.error('Error deleting file:', error);
      next(error);
    }
  }

}

// Helper functions (outside class)
async function findMatchingBumdes(filename) {
  const matches = [];
  
  const documentFields = [
    'Perdes', 'ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 
    'AnggaranRumahTangga', 'ProgramKerja', 'SK_BUM_Desa',
    'LaporanKeuangan2021', 'LaporanKeuangan2022', 'LaporanKeuangan2023', 'LaporanKeuangan2024'
  ];

  for (const field of documentFields) {
    const bumdesList = await Bumdes.findAll({
      where: {
        [field]: {
          [require('sequelize').Op.like]: `%${filename}%`
        }
      }
    });

    for (const bumdes of bumdesList) {
      const dbValue = bumdes[field];
      if (!dbValue) continue;

      let extractedFilename = null;
      
      if (dbValue.includes('bumdes_dokumen_badanhukum/')) {
        extractedFilename = dbValue.split('bumdes_dokumen_badanhukum/')[1];
      } else if (dbValue.includes('bumdes_laporan_keuangan/')) {
        extractedFilename = dbValue.split('bumdes_laporan_keuangan/')[1];
      } else if (dbValue.includes('/')) {
        extractedFilename = path.basename(dbValue);
      } else {
        extractedFilename = dbValue;
      }

      if (extractedFilename === filename) {
        matches.push({
          id: bumdes.id,
          namabumdesa: bumdes.namabumdesa,
          desa: bumdes.desa,
          kecamatan: bumdes.kecamatan,
          match_field: field
        });
        break;
      }
    }
  }

  return matches;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = new BumdesController();
