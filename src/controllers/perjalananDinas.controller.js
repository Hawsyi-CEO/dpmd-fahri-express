const PerjalananDinas = require('../models/PerjalananDinas');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get all perjalanan dinas (kegiatan)
 */
exports.getAllKegiatan = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      date_filter,
      id_bidang
    } = req.query;

    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { nama_kegiatan: { [Op.like]: `%${search}%` } },
        { nomor_sp: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
        { keterangan: { [Op.like]: `%${search}%` } }
      ];
    }

    // Date filter
    if (date_filter === 'mingguan') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      where.tanggal_mulai = {
        [Op.between]: [startOfWeek, endOfWeek]
      };
    } else if (date_filter === 'bulanan') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      where.tanggal_mulai = {
        [Op.between]: [startOfMonth, endOfMonth]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await PerjalananDinas.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_mulai', 'DESC']],
      // Include details if KegiatanBidang relationship is defined
      // include: [{ association: 'details' }]
    });

    logger.info('Perjalanan Dinas - Get All Kegiatan', {
      user_id: req.user.id,
      role: req.user.role,
      total: count,
      filters: { search, date_filter, id_bidang }
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        current_page: parseInt(page),
        last_page: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get All Kegiatan Error:', error);
    next(error);
  }
};

/**
 * Get single kegiatan by ID
 */
exports.getKegiatanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kegiatan = await PerjalananDinas.findByPk(id);

    if (!kegiatan) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    logger.info('Perjalanan Dinas - Get Kegiatan Detail', {
      user_id: req.user.id,
      kegiatan_id: id
    });

    res.json({
      success: true,
      data: kegiatan
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Kegiatan Detail Error:', error);
    next(error);
  }
};

/**
 * Create new kegiatan
 */
exports.createKegiatan = async (req, res, next) => {
  try {
    const {
      nama_kegiatan,
      nomor_sp,
      tanggal_mulai,
      tanggal_selesai,
      lokasi,
      keterangan
    } = req.body;

    // Validation
    if (!nama_kegiatan || !nomor_sp || !tanggal_mulai || !tanggal_selesai || !lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib tidak boleh kosong',
        required: ['nama_kegiatan', 'nomor_sp', 'tanggal_mulai', 'tanggal_selesai', 'lokasi']
      });
    }

    // Validate date range
    if (new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai'
      });
    }

    const kegiatan = await PerjalananDinas.create({
      nama_kegiatan,
      nomor_sp,
      tanggal_mulai,
      tanggal_selesai,
      lokasi,
      keterangan: keterangan || null
    });

    logger.info('Perjalanan Dinas - Kegiatan Created', {
      user_id: req.user.id,
      kegiatan_id: kegiatan.id_kegiatan,
      nama_kegiatan
    });

    res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil dibuat',
      data: kegiatan
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Create Kegiatan Error:', error);
    next(error);
  }
};

/**
 * Update kegiatan
 */
exports.updateKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama_kegiatan,
      nomor_sp,
      tanggal_mulai,
      tanggal_selesai,
      lokasi,
      keterangan
    } = req.body;

    const kegiatan = await PerjalananDinas.findByPk(id);

    if (!kegiatan) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    // Validate date range if both dates provided
    if (tanggal_mulai && tanggal_selesai && new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai'
      });
    }

    // Update fields
    if (nama_kegiatan) kegiatan.nama_kegiatan = nama_kegiatan;
    if (nomor_sp) kegiatan.nomor_sp = nomor_sp;
    if (tanggal_mulai) kegiatan.tanggal_mulai = tanggal_mulai;
    if (tanggal_selesai) kegiatan.tanggal_selesai = tanggal_selesai;
    if (lokasi) kegiatan.lokasi = lokasi;
    if (keterangan !== undefined) kegiatan.keterangan = keterangan;

    await kegiatan.save();

    logger.info('Perjalanan Dinas - Kegiatan Updated', {
      user_id: req.user.id,
      kegiatan_id: id
    });

    res.json({
      success: true,
      message: 'Kegiatan berhasil diupdate',
      data: kegiatan
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Update Kegiatan Error:', error);
    next(error);
  }
};

/**
 * Delete kegiatan
 */
exports.deleteKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kegiatan = await PerjalananDinas.findByPk(id);

    if (!kegiatan) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    await kegiatan.destroy();

    logger.info('Perjalanan Dinas - Kegiatan Deleted', {
      user_id: req.user.id,
      kegiatan_id: id,
      deleted_kegiatan: kegiatan.nama_kegiatan
    });

    res.json({
      success: true,
      message: 'Kegiatan berhasil dihapus'
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Delete Kegiatan Error:', error);
    next(error);
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalKegiatan = await PerjalananDinas.count();
    
    const kegiatanBulanIni = await PerjalananDinas.count({
      where: {
        tanggal_mulai: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    const kegiatanBerlangsung = await PerjalananDinas.count({
      where: {
        tanggal_mulai: { [Op.lte]: now },
        tanggal_selesai: { [Op.gte]: now }
      }
    });

    const kegiatanMendatang = await PerjalananDinas.count({
      where: {
        tanggal_mulai: { [Op.gt]: now }
      }
    });

    logger.info('Perjalanan Dinas - Get Dashboard Stats', {
      user_id: req.user.id,
      role: req.user.role
    });

    res.json({
      success: true,
      data: {
        total_kegiatan: totalKegiatan,
        kegiatan_bulan_ini: kegiatanBulanIni,
        kegiatan_berlangsung: kegiatanBerlangsung,
        kegiatan_mendatang: kegiatanMendatang
      }
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Dashboard Stats Error:', error);
    next(error);
  }
};

/**
 * Get weekly schedule
 */
exports.getWeeklySchedule = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const kegiatan = await PerjalananDinas.findAll({
      where: {
        [Op.or]: [
          {
            tanggal_mulai: {
              [Op.between]: [startOfWeek, endOfWeek]
            }
          },
          {
            tanggal_selesai: {
              [Op.between]: [startOfWeek, endOfWeek]
            }
          },
          {
            [Op.and]: [
              { tanggal_mulai: { [Op.lte]: startOfWeek } },
              { tanggal_selesai: { [Op.gte]: endOfWeek } }
            ]
          }
        ]
      },
      order: [['tanggal_mulai', 'ASC']]
    });

    logger.info('Perjalanan Dinas - Get Weekly Schedule', {
      user_id: req.user.id,
      week_start: startOfWeek,
      total_kegiatan: kegiatan.length
    });

    res.json({
      success: true,
      data: kegiatan,
      period: {
        start: startOfWeek,
        end: endOfWeek
      }
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Weekly Schedule Error:', error);
    next(error);
  }
};
