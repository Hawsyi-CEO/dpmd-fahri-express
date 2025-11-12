const { Bumdes, Musdesus, PerjalananDinas } = require('../models');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

class KepalaDinasController {
  // GET /api/kepala-dinas/dashboard - Get comprehensive dashboard statistics
  async getDashboardStats(req, res, next) {
    try {
      logger.info('Getting Kepala Dinas dashboard statistics');

      // Get BUMDes statistics
      const bumdesStats = await this.getBumdesStats();
      logger.info('BUMDes stats retrieved:', bumdesStats);
      
      // Get Perjalanan Dinas statistics
      const perjadinStats = await this.getPerjadinStats();
      logger.info('Perjadin stats retrieved:', perjadinStats);

      // Get trend data (monthly)
      const trendData = await this.getTrendData();
      logger.info('Trend data retrieved:', trendData);

      const response = {
        success: true,
        data: {
          summary: {
            total_bumdes: bumdesStats.total,
            total_perjalanan_dinas: perjadinStats.total,
            total_kegiatan: perjadinStats.total
          },
          bumdes: bumdesStats,
          perjalanan_dinas: perjadinStats,
          trends: trendData
        }
      };

      logger.info('Dashboard statistics retrieved successfully');
      res.json(response);

    } catch (error) {
      logger.error('Error getting dashboard statistics:', error);
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data dashboard',
        error: error.message
      });
    }
  }

  // Get BUMDes detailed statistics
  async getBumdesStats() {
    try {
      // Basic count with status
      const [results] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Aktif' OR status = 'aktif' THEN 1 ELSE 0 END) as aktif,
          SUM(CASE WHEN status = 'Non-Aktif' OR status = 'tidak aktif' OR status IS NULL THEN 1 ELSE 0 END) as non_aktif,
          COUNT(DISTINCT kecamatan) as total_kecamatan,
          SUM(CASE WHEN badanhukum IS NOT NULL AND badanhukum != '' THEN 1 ELSE 0 END) as berbadan_hukum,
          SUM(CASE WHEN NIB IS NOT NULL AND NIB != '' THEN 1 ELSE 0 END) as punya_nib,
          SUM(CASE WHEN NPWP IS NOT NULL AND NPWP != '' THEN 1 ELSE 0 END) as punya_npwp
        FROM bumdes
      `);

      // Get by status for chart
      const [statusData] = await sequelize.query(`
        SELECT 
          CASE 
            WHEN status = 'Aktif' OR status = 'aktif' THEN 'Aktif'
            ELSE 'Non-Aktif'
          END as status,
          COUNT(*) as total
        FROM bumdes
        GROUP BY CASE 
          WHEN status = 'Aktif' OR status = 'aktif' THEN 'Aktif'
          ELSE 'Non-Aktif'
        END
      `);

      // Get by kecamatan (top 10)
      const [kecamatanData] = await sequelize.query(`
        SELECT 
          COALESCE(kecamatan, 'Tidak Diketahui') as kecamatan,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Aktif' OR status = 'aktif' THEN 1 ELSE 0 END) as aktif
        FROM bumdes
        GROUP BY kecamatan
        ORDER BY total DESC
        LIMIT 10
      `);

      // Get financial summary
      const [financialData] = await sequelize.query(`
        SELECT 
          SUM(CASE WHEN Omset2024 IS NOT NULL THEN CAST(Omset2024 AS DECIMAL(15,2)) ELSE 0 END) as total_omzet,
          SUM(CASE WHEN Laba2024 IS NOT NULL THEN CAST(Laba2024 AS DECIMAL(15,2)) ELSE 0 END) as total_laba,
          SUM(CASE WHEN NilaiAset IS NOT NULL THEN CAST(NilaiAset AS DECIMAL(15,2)) ELSE 0 END) as total_aset,
          AVG(CASE WHEN NilaiAset IS NOT NULL AND NilaiAset > 0 THEN CAST(NilaiAset AS DECIMAL(15,2)) ELSE NULL END) as rata_aset,
          SUM(COALESCE(TotalTenagaKerja, 0)) as total_tenaga_kerja
        FROM bumdes
      `);

      // Get by jenis usaha (top 5)
      const [jenisUsahaData] = await sequelize.query(`
        SELECT 
          COALESCE(JenisUsahaUtama, 'Tidak Diketahui') as jenis_usaha,
          COUNT(*) as total
        FROM bumdes
        GROUP BY JenisUsahaUtama
        ORDER BY total DESC
        LIMIT 5
      `);

      return {
        total: parseInt(results[0].total) || 0,
        aktif: parseInt(results[0].aktif) || 0,
        non_aktif: parseInt(results[0].non_aktif) || 0,
        total_kecamatan: parseInt(results[0].total_kecamatan) || 0,
        berbadan_hukum: parseInt(results[0].berbadan_hukum) || 0,
        punya_nib: parseInt(results[0].punya_nib) || 0,
        punya_npwp: parseInt(results[0].punya_npwp) || 0,
        by_status: statusData.map(s => ({
          status: s.status,
          total: parseInt(s.total) || 0
        })),
        by_kecamatan: kecamatanData.map(k => ({
          kecamatan: k.kecamatan,
          total: parseInt(k.total) || 0,
          aktif: parseInt(k.aktif) || 0
        })),
        by_jenis_usaha: jenisUsahaData.map(j => ({
          jenis_usaha: j.jenis_usaha,
          total: parseInt(j.total) || 0
        })),
        financials: {
          total_aset: parseFloat(financialData[0].total_aset) || 0,
          total_omzet: parseFloat(financialData[0].total_omzet) || 0,
          total_laba: parseFloat(financialData[0].total_laba) || 0,
          rata_aset: parseFloat(financialData[0].rata_aset) || 0,
          total_tenaga_kerja: parseInt(financialData[0].total_tenaga_kerja) || 0
        }
      };
    } catch (error) {
      logger.error('Error getting BUMDes stats:', error);
      return {
        total: 0,
        aktif: 0,
        non_aktif: 0,
        total_kecamatan: 0,
        berbadan_hukum: 0,
        punya_nib: 0,
        punya_npwp: 0,
        by_status: [],
        by_kecamatan: [],
        by_jenis_usaha: [],
        financials: {
          total_aset: 0,
          total_omzet: 0,
          total_laba: 0,
          rata_aset: 0,
          total_tenaga_kerja: 0
        }
      };
    }
  }

  // Get Musdesus statistics
  async getMusdesusStats() {
    try {
      const [countResult] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          COUNT(DISTINCT desa_id) as total_desa,
          COUNT(DISTINCT kecamatan_id) as total_kecamatan,
          SUM(ukuran_file) as total_ukuran_file
        FROM musdesus
        WHERE deleted_at IS NULL
      `);
      
      const [statusData] = await sequelize.query(`
        SELECT 
          status,
          COUNT(*) as total
        FROM musdesus
        WHERE deleted_at IS NULL
        GROUP BY status
      `);

      // Get by kecamatan
      const [kecamatanData] = await sequelize.query(`
        SELECT 
          k.nama_kecamatan as kecamatan,
          COUNT(m.id) as total
        FROM musdesus m
        LEFT JOIN kecamatans k ON m.kecamatan_id = k.id
        WHERE m.deleted_at IS NULL
        GROUP BY k.nama_kecamatan
        ORDER BY total DESC
        LIMIT 10
      `);

      // Get monthly trend (last 6 months)
      const [monthlyData] = await sequelize.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as total
        FROM musdesus
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND deleted_at IS NULL
        GROUP BY month
        ORDER BY month ASC
      `);

      return {
        total: parseInt(countResult[0].total) || 0,
        approved: parseInt(countResult[0].approved) || 0,
        pending: parseInt(countResult[0].pending) || 0,
        rejected: parseInt(countResult[0].rejected) || 0,
        total_desa: parseInt(countResult[0].total_desa) || 0,
        total_kecamatan: parseInt(countResult[0].total_kecamatan) || 0,
        total_ukuran_mb: (parseFloat(countResult[0].total_ukuran_file) / (1024 * 1024)).toFixed(2),
        by_status: statusData.map(s => ({
          status: s.status,
          total: parseInt(s.total) || 0
        })),
        by_kecamatan: kecamatanData.map(k => ({
          kecamatan: k.kecamatan || 'Tidak Diketahui',
          total: parseInt(k.total) || 0
        })),
        monthly_trend: monthlyData.map(m => ({
          month: m.month,
          total: parseInt(m.total) || 0
        }))
      };
    } catch (error) {
      logger.error('Error getting Musdesus stats:', error);
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        total_desa: 0,
        total_kecamatan: 0,
        total_ukuran_mb: 0,
        by_status: [],
        by_kecamatan: [],
        monthly_trend: []
      };
    }
  }

  // Get Perjalanan Dinas statistics
  async getPerjadinStats() {
    try {
      const [countResult] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT lokasi) as total_lokasi,
          MIN(tanggal_mulai) as tanggal_terdekat,
          MAX(tanggal_selesai) as tanggal_terjauh
        FROM kegiatan
      `);

      // Get monthly trend (last 6 months)
      const [monthlyData] = await sequelize.query(`
        SELECT 
          DATE_FORMAT(tanggal_mulai, '%Y-%m') as month,
          COUNT(*) as total
        FROM kegiatan
        WHERE tanggal_mulai >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month DESC
      `);

      // Get by lokasi (top 10)
      const [lokasiData] = await sequelize.query(`
        SELECT 
          COALESCE(lokasi, 'Tidak Diketahui') as lokasi,
          COUNT(*) as total
        FROM kegiatan
        GROUP BY lokasi
        ORDER BY total DESC
        LIMIT 10
      `);

      // Get participants count from kegiatan_bidang
      const [participantData] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT kb.id_bidang) as total_bidang_terlibat,
          COUNT(*) as total_kegiatan_bidang
        FROM kegiatan_bidang kb
        INNER JOIN kegiatan k ON kb.id_kegiatan = k.id_kegiatan
      `);

      // Get upcoming events (next 30 days)
      const [upcomingData] = await sequelize.query(`
        SELECT COUNT(*) as total_upcoming
        FROM kegiatan
        WHERE tanggal_mulai BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
      `);

      return {
        total: parseInt(countResult[0].total) || 0,
        total_lokasi: parseInt(countResult[0].total_lokasi) || 0,
        total_bidang: parseInt(participantData[0]?.total_bidang_terlibat) || 0,
        total_kegiatan_bidang: parseInt(participantData[0]?.total_kegiatan_bidang) || 0,
        upcoming_30days: parseInt(upcomingData[0].total_upcoming) || 0,
        by_month: monthlyData.map(m => ({
          month: m.month,
          total: parseInt(m.total) || 0
        })),
        by_lokasi: lokasiData.map(l => ({
          lokasi: l.lokasi,
          total: parseInt(l.total) || 0
        }))
      };
    } catch (error) {
      logger.error('Error getting Perjadin stats:', error);
      return {
        total: 0,
        total_lokasi: 0,
        total_bidang: 0,
        total_kegiatan_bidang: 0,
        upcoming_30days: 0,
        by_month: [],
        by_lokasi: []
      };
    }
  }

  // Get trend data (last 6 months) - Simplified version
  async getTrendData() {
    try {
      // Simple approach: get last 6 months data
      const result = [];
      const months = [];
      
      // Generate last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
        months.push(monthStr);
      }

      // Get data for each month
      for (const month of months) {
        const [bumdesCount] = await sequelize.query(`
          SELECT COUNT(*) as count
          FROM bumdes
          WHERE DATE_FORMAT(created_at, '%Y-%m') = '${month}'
        `);

        const [perjadinCount] = await sequelize.query(`
          SELECT COUNT(*) as count
          FROM kegiatan
          WHERE DATE_FORMAT(tanggal_mulai, '%Y-%m') = '${month}'
        `);

        result.push({
          month: month,
          bumdes_count: parseInt(bumdesCount[0]?.count) || 0,
          perjadin_count: parseInt(perjadinCount[0]?.count) || 0
        });
      }

      return result;
    } catch (error) {
      logger.error('Error getting trend data:', error);
      return [];
    }
  }
}

module.exports = new KepalaDinasController();
