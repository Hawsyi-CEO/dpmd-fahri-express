const PerjalananDinas = require('../models/PerjalananDinas');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

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

    const KegiatanBidang = require('../models/KegiatanBidang');
    const Bidang = require('../models/Bidang');

    const where = {};
    const includeOptions = [
      {
        model: KegiatanBidang,
        as: 'details',
        required: false, // LEFT JOIN, jadi kegiatan tanpa bidang tetap muncul
        include: [
          {
            model: Bidang,
            as: 'bidang',
            attributes: ['id', 'nama']
          }
        ]
      }
    ];

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

    // Bidang filter - filter via include
    if (id_bidang && id_bidang !== '' && !isNaN(parseInt(id_bidang))) {
      includeOptions[0].where = { id_bidang: parseInt(id_bidang) };
      includeOptions[0].required = true; // INNER JOIN untuk filter
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await PerjalananDinas.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_mulai', 'DESC']],
      include: includeOptions,
      distinct: true // Count distinct kegiatan, bukan rows yang di-join
    });

    // Format response dengan bidang info
    const formattedRows = rows.map(kegiatan => {
      const kegiatanData = kegiatan.toJSON();
      
      // Extract bidang names dari details
      if (kegiatanData.details && kegiatanData.details.length > 0) {
        kegiatanData.bidang_list = kegiatanData.details
          .map(d => d.bidang ? d.bidang.nama : null)
          .filter(nama => nama)
          .join(', ');
      } else {
        kegiatanData.bidang_list = '';
      }
      
      return kegiatanData;
    });

    logger.info('Perjalanan Dinas - Get All Kegiatan', {
      user_id: req.user.id,
      role: req.user.role,
      total: count,
      filters: { search, date_filter, id_bidang }
    });

    res.json({
      success: true,
      data: formattedRows,
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
    
    const KegiatanBidang = require('../models/KegiatanBidang');
    const Bidang = require('../models/Bidang');
    const Personil = require('../models/Personil');

    const kegiatan = await PerjalananDinas.findByPk(id, {
      include: [
        {
          model: KegiatanBidang,
          as: 'details',
          include: [
            {
              model: Bidang,
              as: 'bidang',
              attributes: ['id', 'nama']
            }
          ]
        }
      ]
    });

    if (!kegiatan) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    // Format response dengan detail bidang dan personil
    const response = {
      id_kegiatan: kegiatan.id_kegiatan,
      nama_kegiatan: kegiatan.nama_kegiatan,
      nomor_sp: kegiatan.nomor_sp,
      tanggal_mulai: kegiatan.tanggal_mulai,
      tanggal_selesai: kegiatan.tanggal_selesai,
      lokasi: kegiatan.lokasi,
      keterangan: kegiatan.keterangan,
      created_at: kegiatan.created_at,
      updated_at: kegiatan.updated_at,
      details: []
    };

    // Process kegiatan_bidang details
    if (kegiatan.details && kegiatan.details.length > 0) {
      for (const detail of kegiatan.details) {
        let personilList = [];
        
        // Parse personil - handle both TEXT (comma-separated) and JSON format
        if (detail.personil) {
          try {
            // Try to parse as JSON first
            const personilData = JSON.parse(detail.personil);
            if (Array.isArray(personilData)) {
              // Get personil details from database
              const personilIds = personilData
                .map(p => p.id_personil || p)
                .filter(id => id);
              
              if (personilIds.length > 0) {
                const personilRecords = await Personil.findAll({
                  where: { id_personil: personilIds },
                  attributes: ['id_personil', 'nama_personil']
                });
                
                personilList = personilRecords.map(p => ({
                  id_personil: p.id_personil,
                  nama_personil: p.nama_personil
                }));
              }
            }
          } catch (error) {
            // Not JSON, treat as comma-separated TEXT
            const personilNames = detail.personil
              .split(',')
              .map(name => name.trim())
              .filter(name => name);
            
            if (personilNames.length > 0) {
              // Try to find personil by name
              const personilRecords = await Personil.findAll({
                where: { 
                  nama_personil: personilNames 
                },
                attributes: ['id_personil', 'nama_personil']
              });
              
              personilList = personilRecords.map(p => ({
                id_personil: p.id_personil,
                nama_personil: p.nama_personil
              }));
              
              // If some names not found in DB, add them as name-only
              personilNames.forEach(name => {
                if (!personilList.find(p => p.nama_personil === name)) {
                  personilList.push({
                    id_personil: null,
                    nama_personil: name
                  });
                }
              });
            }
          }
        }

        response.details.push({
          id_kegiatan_bidang: detail.id_kegiatan_bidang,
          id_bidang: detail.id_bidang,
          nama_bidang: detail.bidang ? detail.bidang.nama : null,
          personil: personilList.map(p => p.nama_personil).join(', '),
          personil_list: personilList
        });
      }
    }

    logger.info('Perjalanan Dinas - Get Kegiatan Detail', {
      user_id: req.user.id,
      kegiatan_id: id
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Kegiatan Detail Error:', error);
    next(error);
  }
};

/**
 * Check if personil has conflict with existing kegiatan
 */
const checkPersonilConflict = async (personilIds, tanggalMulai, tanggalSelesai, excludeKegiatanId = null) => {
  if (!personilIds || personilIds.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }

  const KegiatanBidang = require('../models/KegiatanBidang');
  
  // Query untuk cek personil yang sudah ada di kegiatan lain pada tanggal yang overlap
  const query = `
    SELECT DISTINCT
      k.id_kegiatan,
      k.nama_kegiatan,
      k.tanggal_mulai,
      k.tanggal_selesai,
      kb.personil,
      kb.id_bidang
    FROM kegiatan k
    INNER JOIN kegiatan_bidang kb ON k.id_kegiatan = kb.id_kegiatan
    WHERE kb.personil IS NOT NULL
      AND kb.personil != ''
      AND kb.personil != '[]'
      ${excludeKegiatanId ? `AND k.id_kegiatan != ${excludeKegiatanId}` : ''}
      AND (
        (k.tanggal_mulai BETWEEN ? AND ?)
        OR (k.tanggal_selesai BETWEEN ? AND ?)
        OR (k.tanggal_mulai <= ? AND k.tanggal_selesai >= ?)
      )
  `;

  const existingKegiatan = await sequelize.query(query, {
    replacements: [tanggalMulai, tanggalSelesai, tanggalMulai, tanggalSelesai, tanggalMulai, tanggalSelesai],
    type: sequelize.QueryTypes.SELECT
  });

  const conflicts = [];
  
  for (const kegiatan of existingKegiatan) {
    try {
      const existingPersonil = JSON.parse(kegiatan.personil || '[]');
      const existingPersonilIds = existingPersonil.map(p => parseInt(p.id_personil));
      
      // Cek apakah ada personil yang sama
      const conflictPersonil = personilIds.filter(id => existingPersonilIds.includes(parseInt(id)));
      
      if (conflictPersonil.length > 0) {
        // Get nama personil yang conflict
        const Personil = require('../models/Personil');
        const personilData = await Personil.findAll({
          where: { id_personil: conflictPersonil },
          attributes: ['id_personil', 'nama_personil']
        });
        
        conflicts.push({
          kegiatan_id: kegiatan.id_kegiatan,
          nama_kegiatan: kegiatan.nama_kegiatan,
          tanggal_mulai: kegiatan.tanggal_mulai,
          tanggal_selesai: kegiatan.tanggal_selesai,
          personil_conflict: personilData.map(p => ({
            id_personil: p.id_personil,
            nama_personil: p.nama_personil
          }))
        });
      }
    } catch (e) {
      logger.error('Error parsing personil JSON:', e);
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
};

/**
 * Create new kegiatan
 */
/**
 * Check personnel conflict endpoint untuk frontend preview
 */
exports.checkPersonnelConflict = async (req, res, next) => {
  try {
    const { personnel_name, start_date, end_date, exclude_id } = req.query;

    if (!personnel_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tidak lengkap',
        conflicts: []
      });
    }

    // Find personil by name
    const personil = await Personil.findOne({
      where: { nama_personil: personnel_name }
    });

    if (!personil) {
      return res.json({
        success: true,
        conflicts: []
      });
    }

    // Check conflict using the helper function
    const conflictCheck = await checkPersonilConflict(
      [personil.id_personil],
      start_date,
      end_date,
      exclude_id ? parseInt(exclude_id) : null
    );

    res.json({
      success: true,
      conflicts: conflictCheck.conflicts
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Check Personnel Conflict Error:', error);
    res.json({
      success: true,
      conflicts: []
    });
  }
};

exports.createKegiatan = async (req, res, next) => {
  try {
    const {
      nama_kegiatan,
      nomor_sp,
      tanggal_mulai,
      tanggal_selesai,
      lokasi,
      keterangan,
      personil_bidang_list
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

    // Extract all personil IDs from bidang list untuk validasi conflict
    const allPersonilIds = [];
    if (personil_bidang_list && Array.isArray(personil_bidang_list)) {
      personil_bidang_list.forEach(bidang => {
        if (bidang.personil && Array.isArray(bidang.personil)) {
          bidang.personil.forEach(personilName => {
            if (personilName && typeof personilName === 'object' && personilName.id_personil) {
              allPersonilIds.push(parseInt(personilName.id_personil));
            }
          });
        }
      });
    }

    // Check conflict personil
    if (allPersonilIds.length > 0) {
      const conflictCheck = await checkPersonilConflict(
        allPersonilIds,
        tanggal_mulai,
        tanggal_selesai
      );

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          message: 'Terdapat personil yang sudah memiliki kegiatan pada tanggal yang sama',
          conflicts: conflictCheck.conflicts
        });
      }
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
      keterangan,
      personil_bidang_list
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

    // Extract all personil IDs dari bidang list untuk validasi conflict
    const allPersonilIds = [];
    if (personil_bidang_list && Array.isArray(personil_bidang_list)) {
      personil_bidang_list.forEach(bidang => {
        if (bidang.personil && Array.isArray(bidang.personil)) {
          bidang.personil.forEach(personilName => {
            if (personilName && typeof personilName === 'object' && personilName.id_personil) {
              allPersonilIds.push(parseInt(personilName.id_personil));
            }
          });
        }
      });
    }

    // Check conflict personil (exclude current kegiatan)
    if (allPersonilIds.length > 0) {
      const conflictCheck = await checkPersonilConflict(
        allPersonilIds,
        tanggal_mulai || kegiatan.tanggal_mulai,
        tanggal_selesai || kegiatan.tanggal_selesai,
        parseInt(id) // exclude current kegiatan from conflict check
      );

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          success: false,
          message: 'Terdapat personil yang sudah memiliki kegiatan pada tanggal yang sama',
          conflicts: conflictCheck.conflicts
        });
      }
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

    // Get kegiatan per bidang
    const Bidang = require('../models/Bidang');
    const KegiatanBidang = require('../models/KegiatanBidang');
    
    const perBidang = await sequelize.query(`
      SELECT 
        b.id as id_bidang,
        b.nama as nama_bidang,
        COUNT(DISTINCT kb.id_kegiatan) as total
      FROM bidangs b
      LEFT JOIN kegiatan_bidang kb ON b.id = kb.id_bidang
      GROUP BY b.id, b.nama
      ORDER BY total DESC, b.nama ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    logger.info('Perjalanan Dinas - Get Dashboard Stats', {
      user_id: req.user.id,
      role: req.user.role
    });

    res.json({
      success: true,
      data: {
        total: totalKegiatan,
        mingguan: 0, // Will be calculated from weekly schedule
        bulanan: kegiatanBulanIni,
        per_bidang: perBidang.map(b => ({
          id_bidang: b.id_bidang,
          nama_bidang: b.nama_bidang,
          total: parseInt(b.total) || 0
        })),
        // Keep old field names for backward compatibility
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

    // Format data per hari
    const weeklyData = [];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Filter kegiatan yang jatuh pada hari ini
      const dailyKegiatan = kegiatan.filter(k => {
        const mulai = new Date(k.tanggal_mulai);
        const selesai = new Date(k.tanggal_selesai);
        
        return currentDate >= mulai && currentDate <= selesai;
      });

      weeklyData.push({
        tanggal: currentDate.toISOString().split('T')[0],
        hari: dayNames[currentDate.getDay()],
        kegiatan: dailyKegiatan.map(k => ({
          id_kegiatan: k.id_kegiatan,
          nama_kegiatan: k.nama_kegiatan,
          nomor_sp: k.nomor_sp,
          tanggal_mulai: k.tanggal_mulai,
          tanggal_selesai: k.tanggal_selesai,
          lokasi: k.lokasi
        }))
      });
    }

    logger.info('Perjalanan Dinas - Get Weekly Schedule', {
      user_id: req.user.id,
      week_start: startOfWeek,
      total_kegiatan: kegiatan.length
    });

    res.json({
      success: true,
      data: weeklyData,
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

/**
 * Get all bidang
 */
exports.getAllBidang = async (req, res, next) => {
  try {
    const Bidang = require('../models/Bidang');
    
    const bidang = await Bidang.findAll({
      order: [['nama', 'ASC']]
    });

    logger.info('Perjalanan Dinas - Get All Bidang', {
      user_id: req.user.id,
      total: bidang.length
    });

    res.json({
      success: true,
      data: bidang.map(b => ({
        id_bidang: b.id,
        nama_bidang: b.nama,
        status: 'aktif', // Default semua bidang aktif
        created_at: b.created_at,
        updated_at: b.updated_at
      }))
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get All Bidang Error:', error);
    next(error);
  }
};

/**
 * Get personil by bidang ID
 */
exports.getPersonilByBidang = async (req, res, next) => {
  try {
    const { id_bidang } = req.params;
    const Personil = require('../models/Personil');
    
    const personil = await Personil.findAll({
      where: { id_bidang },
      order: [['nama_personil', 'ASC']]
    });

    logger.info('Perjalanan Dinas - Get Personil by Bidang', {
      user_id: req.user.id,
      id_bidang,
      total: personil.length
    });

    res.json({
      success: true,
      data: personil.map(p => ({
        id_personil: p.id_personil,
        id_bidang: p.id_bidang,
        nama_personil: p.nama_personil,
        created_at: p.created_at,
        updated_at: p.updated_at
      }))
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Personil by Bidang Error:', error);
    next(error);
  }
};

/**
 * Get statistik data with filters
 */
exports.getStatistik = async (req, res, next) => {
  try {
    const { periode, tahun, bulan, bidang: bidangId } = req.query;
    
    let whereClause = '';
    const params = [];

    // Build where clause based on filters
    if (periode === 'minggu') {
      // Get current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      whereClause += ' WHERE k.tanggal_mulai BETWEEN ? AND ?';
      params.push(startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]);
    } else if (periode === 'bulan' && tahun && bulan) {
      const startOfMonth = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const endOfMonth = new Date(parseInt(tahun), parseInt(bulan), 0).toISOString().split('T')[0];
      
      whereClause += ' WHERE k.tanggal_mulai BETWEEN ? AND ?';
      params.push(startOfMonth, endOfMonth);
    } else if (periode === 'tahun' && tahun) {
      whereClause += ' WHERE YEAR(k.tanggal_mulai) = ?';
      params.push(tahun);
    }

    // Add bidang filter if specified
    if (bidangId) {
      whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
      whereClause += ' kb.id_bidang = ?';
      params.push(bidangId);
    }

    // Get statistik data
    const stats = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT k.id_kegiatan) as total_kegiatan,
        COUNT(DISTINCT CASE WHEN k.tanggal_mulai <= CURDATE() AND k.tanggal_selesai >= CURDATE() THEN k.id_kegiatan END) as kegiatan_berlangsung,
        COUNT(DISTINCT CASE WHEN k.tanggal_mulai > CURDATE() THEN k.id_kegiatan END) as kegiatan_mendatang,
        COUNT(DISTINCT CASE WHEN k.tanggal_selesai < CURDATE() THEN k.id_kegiatan END) as kegiatan_selesai
      FROM dpmd.kegiatan k
      LEFT JOIN dpmd.kegiatan_bidang kb ON k.id_kegiatan = kb.id_kegiatan
      ${whereClause}
    `, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    // Get kegiatan per bidang
    const perBidang = await sequelize.query(`
      SELECT 
        b.id_bidang,
        b.nama_bidang,
        COUNT(DISTINCT k.id_kegiatan) as total
      FROM db_kegiatan.bidang b
      LEFT JOIN dpmd.kegiatan_bidang kb ON b.id_bidang = kb.id_bidang
      LEFT JOIN dpmd.kegiatan k ON kb.id_kegiatan = k.id_kegiatan
      ${whereClause}
      GROUP BY b.id_bidang, b.nama_bidang
      ORDER BY total DESC, b.nama_bidang ASC
    `, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    logger.info('Perjalanan Dinas - Get Statistik', {
      user_id: req.user.id,
      periode,
      tahun,
      bulan,
      bidang: bidangId
    });

    res.json({
      success: true,
      data: {
        ...stats[0],
        per_bidang: perBidang.map(b => ({
          id_bidang: b.id_bidang,
          nama_bidang: b.nama_bidang,
          total: parseInt(b.total) || 0
        }))
      }
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Statistik Error:', error);
    next(error);
  }
};
