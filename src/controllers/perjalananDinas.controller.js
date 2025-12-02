// Import models from index to ensure associations are loaded
const { 
  PerjalananDinas, 
  KegiatanBidang, 
  Bidang, 
  Pegawai 
} = require('../models');
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

    // Format response dengan bidang info dan pegawai
    const formattedRows = await Promise.all(rows.map(async (kegiatan) => {
      const kegiatanData = kegiatan.toJSON();
      
      // Extract bidang names dari details
      if (kegiatanData.details && kegiatanData.details.length > 0) {
        kegiatanData.bidang_list = kegiatanData.details
          .map(d => d.bidang ? d.bidang.nama : null)
          .filter(nama => nama)
          .join(', ');
        
        // Process pegawai for each detail
        for (let detail of kegiatanData.details) {
          let pegawaiList = [];
          
          if (detail.pegawai) {
            try {
              // Try to parse as JSON first
              const pegawaiData = JSON.parse(detail.pegawai);
              if (Array.isArray(pegawaiData)) {
                // Get pegawai details from database
                const pegawaiIds = pegawaiData
                  .map(p => p.id_pegawai || p)
                  .filter(id => id);
                
                if (pegawaiIds.length > 0) {
                  const pegawaiRecords = await Pegawai.findAll({
                    where: { id_pegawai: pegawaiIds },
                    attributes: ['id_pegawai', 'nama_pegawai']
                  });
                  
                  pegawaiList = pegawaiRecords.map(p => ({
                    id_pegawai: p.id_pegawai,
                    nama_pegawai: p.nama_pegawai
                  }));
                }
              }
            } catch (error) {
              // Not JSON, treat as comma-separated TEXT
              // First try as single name (might contain comma for degree/title)
              const singleNameQuery = await Pegawai.findAll({
                where: { nama_pegawai: detail.pegawai.trim() },
                attributes: ['id_pegawai', 'nama_pegawai']
              });
              
              if (singleNameQuery.length > 0) {
                pegawaiList = singleNameQuery.map(p => ({
                  id_pegawai: p.id_pegawai,
                  nama_pegawai: p.nama_pegawai
                }));
              } else {
                // Not found as single name, try splitting
                const pegawaiNames = detail.pegawai
                  .split(',')
                  .map(name => name.trim())
                  .filter(name => name);
                
                pegawaiList = pegawaiNames.map(name => ({
                  id_pegawai: null,
                  nama_pegawai: name
                }));
              }
            }
          }
          
          detail.pegawai_list = pegawaiList;
        }
      } else {
        kegiatanData.bidang_list = '';
      }
      
      return kegiatanData;
    }));

    logger.info('Perjalanan Dinas - Get All Kegiatan', {
      user_id: req.user.id,
      role: req.user.role,
      total: count,
      filters: { search, date_filter, id_bidang }
    });

    res.json({
      status: 'success',
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
        status: 'error',
        message: 'Kegiatan tidak ditemukan'
      });
    }

    // Format response dengan detail bidang dan pegawai
    const response = {
      id_kegiatan: kegiatan.id_kegiatan,
      nama_kegiatan: kegiatan.nama_kegiatan,
      nomor_sp: kegiatan.nomor_sp,
      nomor_surat: kegiatan.nomor_sp, // Alias untuk kompabilitas frontend
      tanggal_mulai: kegiatan.tanggal_mulai,
      tanggal_selesai: kegiatan.tanggal_selesai,
      lokasi: kegiatan.lokasi,
      keterangan: kegiatan.keterangan,
      created_at: kegiatan.created_at,
      updated_at: kegiatan.updated_at,
      details: [],
      bidang: [], // Array bidang untuk frontend
      pegawai: [] // Array pegawai untuk frontend
    };

    // Process kegiatan_bidang details
    if (kegiatan.details && kegiatan.details.length > 0) {
      for (const detail of kegiatan.details) {
        let pegawaiList = [];
        
        // Parse pegawai - handle both TEXT (comma-separated) and JSON format
        if (detail.pegawai) {
          try {
            // Try to parse as JSON first
            const pegawaiData = JSON.parse(detail.pegawai);
            if (Array.isArray(pegawaiData)) {
              // Get pegawai details from database
              const pegawaiIds = pegawaiData
                .map(p => p.id_pegawai || p)
                .filter(id => id);
              
              if (pegawaiIds.length > 0) {
                const pegawaiRecords = await Pegawai.findAll({
                  where: { id_pegawai: pegawaiIds },
                  attributes: ['id_pegawai', 'nama_pegawai', 'id_bidang']
                });
                
                pegawaiList = pegawaiRecords.map(p => ({
                  id_pegawai: p.id_pegawai,
                  nama_pegawai: p.nama_pegawai,
                  id_bidang: p.id_bidang
                }));
              }
            }
          } catch (error) {
            // Not JSON, treat as comma-separated TEXT
            // WARNING: This is problematic because names can contain commas (e.g., "John Doe, S.E.")
            // We should migrate to JSON format for proper handling
            
            // First, try to query as single name (might contain comma for title)
            const singleNameQuery = await Pegawai.findAll({
              where: { 
                nama_pegawai: detail.pegawai.trim()
              },
              attributes: ['id_pegawai', 'nama_pegawai', 'id_bidang']
            });
            
            if (singleNameQuery.length > 0) {
              // Found as single name, use it
              pegawaiList = singleNameQuery.map(p => ({
                id_pegawai: p.id_pegawai,
                nama_pegawai: p.nama_pegawai,
                id_bidang: p.id_bidang
              }));
            } else {
              // Not found as single name, try splitting
              const pegawaiNames = detail.pegawai
                .split(',')
                .map(name => name.trim())
                .filter(name => name);
              
              if (pegawaiNames.length > 0) {
                // Try to find pegawai by name
                const pegawaiRecords = await Pegawai.findAll({
                  where: { 
                    nama_pegawai: pegawaiNames
                  },
                  attributes: ['id_pegawai', 'nama_pegawai', 'id_bidang']
                });
                
                pegawaiList = pegawaiRecords.map(p => ({
                  id_pegawai: p.id_pegawai,
                  nama_pegawai: p.nama_pegawai,
                  id_bidang: p.id_bidang
                }));
                
                // If some names not found in DB, add them as name-only
                pegawaiNames.forEach(name => {
                  if (!pegawaiList.find(p => p.nama_pegawai === name)) {
                    pegawaiList.push({
                      id_pegawai: null,
                      nama_pegawai: name,
                      id_bidang: detail.id_bidang
                    });
                  }
                });
              }
            }
          }
        }

        // Add to details array (backward compatibility)
        response.details.push({
          id_kegiatan_bidang: detail.id_kegiatan_bidang,
          id_bidang: detail.id_bidang,
          nama_bidang: detail.bidang ? detail.bidang.nama : null,
          pegawai: pegawaiList.map(p => p.nama_pegawai).join(', '),
          pegawai_list: pegawaiList
        });

        // Add bidang to bidang array (for frontend)
        if (detail.bidang) {
          response.bidang.push({
            id_bidang: detail.id_bidang,
            nama_bidang: detail.bidang.nama,
            status: 'aktif'
          });
        }

        // Add pegawai to pegawai array (for frontend)
        pegawaiList.forEach(p => {
          response.pegawai.push({
            id_pegawai: p.id_pegawai,
            nama: p.nama_pegawai,
            bidang: detail.bidang ? detail.bidang.nama : 'Tidak diketahui'
          });
        });
      }
    }

    logger.info('Perjalanan Dinas - Get Kegiatan Detail', {
      user_id: req.user.id,
      kegiatan_id: id
    });

    res.json({
      status: 'success',
      data: response
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Kegiatan Detail Error:', error);
    next(error);
  }
};

/**
 * Check if pegawai has conflict with existing kegiatan
 */
const checkPegawaiConflict = async (pegawaiIds, tanggalMulai, tanggalSelesai, excludeKegiatanId = null) => {
  if (!pegawaiIds || pegawaiIds.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }
  
  // Query untuk cek pegawai yang sudah ada di kegiatan lain pada tanggal yang overlap
  const query = `
    SELECT DISTINCT
      k.id_kegiatan,
      k.nama_kegiatan,
      k.tanggal_mulai,
      k.tanggal_selesai,
      kb.pegawai,
      kb.id_bidang
    FROM kegiatan k
    INNER JOIN kegiatan_bidang kb ON k.id_kegiatan = kb.id_kegiatan
    WHERE kb.pegawai IS NOT NULL
      AND kb.pegawai != ''
      AND kb.pegawai != '[]'
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
      const existingPegawai = JSON.parse(kegiatan.pegawai || '[]');
      const existingPegawaiIds = existingPegawai.map(p => parseInt(p.id_pegawai));
      
      // Cek apakah ada pegawai yang sama
      const conflictPegawai = pegawaiIds.filter(id => existingPegawaiIds.includes(parseInt(id)));
      
      if (conflictPegawai.length > 0) {
        // Get nama pegawai yang conflict
        const pegawaiData = await Pegawai.findAll({
          where: { id_pegawai: conflictPegawai },
          attributes: ['id_pegawai', 'nama_pegawai']
        });
        
        conflicts.push({
          kegiatan_id: kegiatan.id_kegiatan,
          nama_kegiatan: kegiatan.nama_kegiatan,
          tanggal_mulai: kegiatan.tanggal_mulai,
          tanggal_selesai: kegiatan.tanggal_selesai,
          pegawai_conflict: pegawaiData.map(p => ({
            id_pegawai: p.id_pegawai,
            nama_pegawai: p.nama_pegawai
          }))
        });
      }
    } catch (e) {
      logger.error('Error parsing pegawai JSON:', e);
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
        status: 'error',
        message: 'Parameter tidak lengkap',
        conflicts: []
      });
    }

    // Find pegawai by name
    const pegawai = await Pegawai.findOne({
      where: { nama_pegawai: personnel_name }
    });

    if (!pegawai) {
      return res.json({
        status: 'success',
        conflicts: []
      });
    }

    // Check conflict using the helper function
    const conflictCheck = await checkPegawaiConflict(
      [pegawai.id_pegawai],
      start_date,
      end_date,
      exclude_id ? parseInt(exclude_id) : null
    );

    res.json({
      status: 'success',
      conflicts: conflictCheck.conflicts
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Check Personnel Conflict Error:', error);
    res.json({
      status: 'success',
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
      pegawai_bidang_list
    } = req.body;

    // Validation
    if (!nama_kegiatan || !nomor_sp || !tanggal_mulai || !tanggal_selesai || !lokasi) {
      return res.status(400).json({
        status: 'error',
        message: 'Field wajib tidak boleh kosong',
        required: ['nama_kegiatan', 'nomor_sp', 'tanggal_mulai', 'tanggal_selesai', 'lokasi']
      });
    }

    // Validate date range
    if (new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai'
      });
    }

    // Extract all pegawai IDs from bidang list untuk validasi conflict
    const allPegawaiIds = [];
    if (pegawai_bidang_list && Array.isArray(pegawai_bidang_list)) {
      pegawai_bidang_list.forEach(bidang => {
        if (bidang.pegawai && Array.isArray(bidang.pegawai)) {
          bidang.pegawai.forEach(pegawaiName => {
            if (pegawaiName && typeof pegawaiName === 'object' && pegawaiName.id_pegawai) {
              allPegawaiIds.push(parseInt(pegawaiName.id_pegawai));
            }
          });
        }
      });
    }

    // Check conflict pegawai
    if (allPegawaiIds.length > 0) {
      const conflictCheck = await checkPegawaiConflict(
        allPegawaiIds,
        tanggal_mulai,
        tanggal_selesai
      );

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          status: 'error',
          message: 'Terdapat pegawai yang sudah memiliki kegiatan pada tanggal yang sama',
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

    // Save bidang and pegawai details
    if (pegawai_bidang_list && Array.isArray(pegawai_bidang_list)) {
      for (const bidangData of pegawai_bidang_list) {
        if (bidangData.id_bidang) {
          // Prepare pegawai data
          let pegawaiJson = [];
          if (bidangData.pegawai && Array.isArray(bidangData.pegawai)) {
            pegawaiJson = bidangData.pegawai
              .filter(p => p) // Remove empty values
              .map(p => {
                // Handle both object {id_pegawai, nama_pegawai} and string format
                if (typeof p === 'object' && p.id_pegawai && p.nama_pegawai) {
                  return {
                    id_pegawai: p.id_pegawai,
                    nama_pegawai: p.nama_pegawai
                  };
                } else if (typeof p === 'string' && p.trim()) {
                  // If string, try to find matching pegawai
                  return { nama_pegawai: p.trim() };
                }
                return null;
              })
              .filter(p => p !== null);
          }

          // Create KegiatanBidang record
          await KegiatanBidang.create({
            id_kegiatan: kegiatan.id_kegiatan,
            id_bidang: parseInt(bidangData.id_bidang),
            pegawai: JSON.stringify(pegawaiJson)
          });
        }
      }
    }

    logger.info('Perjalanan Dinas - Kegiatan Created', {
      user_id: req.user.id,
      kegiatan_id: kegiatan.id_kegiatan,
      nama_kegiatan
    });

    res.status(201).json({
      status: 'success',
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
      pegawai_bidang_list
    } = req.body;

    const kegiatan = await PerjalananDinas.findByPk(id);

    if (!kegiatan) {
      return res.status(404).json({
        status: 'error',
        message: 'Kegiatan tidak ditemukan'
      });
    }

    // Validate date range if both dates provided
    if (tanggal_mulai && tanggal_selesai && new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai'
      });
    }

    // Extract all pegawai IDs dari bidang list untuk validasi conflict
    const allPegawaiIds = [];
    if (pegawai_bidang_list && Array.isArray(pegawai_bidang_list)) {
      pegawai_bidang_list.forEach(bidang => {
        if (bidang.pegawai && Array.isArray(bidang.pegawai)) {
          bidang.pegawai.forEach(pegawaiName => {
            if (pegawaiName && typeof pegawaiName === 'object' && pegawaiName.id_pegawai) {
              allPegawaiIds.push(parseInt(pegawaiName.id_pegawai));
            }
          });
        }
      });
    }

    // Check conflict pegawai (exclude current kegiatan)
    if (allPegawaiIds.length > 0) {
      const conflictCheck = await checkPegawaiConflict(
        allPegawaiIds,
        tanggal_mulai || kegiatan.tanggal_mulai,
        tanggal_selesai || kegiatan.tanggal_selesai,
        parseInt(id) // exclude current kegiatan from conflict check
      );

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          status: 'error',
          message: 'Terdapat pegawai yang sudah memiliki kegiatan pada tanggal yang sama',
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

    // Update bidang and pegawai details
    if (pegawai_bidang_list && Array.isArray(pegawai_bidang_list)) {
      // Delete existing kegiatan_bidang records
      await KegiatanBidang.destroy({
        where: { id_kegiatan: parseInt(id) }
      });

      // Create new records
      for (const bidangData of pegawai_bidang_list) {
        if (bidangData.id_bidang) {
          // Prepare pegawai data
          let pegawaiJson = [];
          if (bidangData.pegawai && Array.isArray(bidangData.pegawai)) {
            pegawaiJson = bidangData.pegawai
              .filter(p => p) // Remove empty values
              .map(p => {
                // Handle both object {id_pegawai, nama_pegawai} and string format
                if (typeof p === 'object' && p.id_pegawai && p.nama_pegawai) {
                  return {
                    id_pegawai: p.id_pegawai,
                    nama_pegawai: p.nama_pegawai
                  };
                } else if (typeof p === 'string' && p.trim()) {
                  return { nama_pegawai: p.trim() };
                }
                return null;
              })
              .filter(p => p !== null);
          }

          // Create KegiatanBidang record
          await KegiatanBidang.create({
            id_kegiatan: parseInt(id),
            id_bidang: parseInt(bidangData.id_bidang),
            pegawai: JSON.stringify(pegawaiJson)
          });
        }
      }
    }

    logger.info('Perjalanan Dinas - Kegiatan Updated', {
      user_id: req.user.id,
      kegiatan_id: id
    });

    res.json({
      status: 'success',
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
        status: 'error',
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
      status: 'success',
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
      status: 'success',
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
      ],
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
          lokasi: k.lokasi,
          details: k.details || []
        }))
      });
    }

    logger.info('Perjalanan Dinas - Get Weekly Schedule', {
      user_id: req.user.id,
      week_start: startOfWeek,
      total_kegiatan: kegiatan.length
    });

    res.json({
      status: 'success',
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
    const bidang = await Bidang.findAll({
      order: [['nama', 'ASC']]
    });

    logger.info('Perjalanan Dinas - Get All Bidang', {
      user_id: req.user.id,
      total: bidang.length
    });

    res.json({
      status: 'success',
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
 * Get pegawai by bidang ID
 */
exports.getPegawaiByBidang = async (req, res, next) => {
  try {
    const { id_bidang } = req.params;
    
    const pegawai = await Pegawai.findAll({
      where: { id_bidang },
      order: [['nama_pegawai', 'ASC']]
    });

    logger.info('Perjalanan Dinas - Get Pegawai by Bidang', {
      user_id: req.user.id,
      id_bidang,
      total: pegawai.length
    });

    res.json({
      status: 'success',
      data: pegawai.map(p => ({
        id_pegawai: p.id_pegawai,
        id_bidang: p.id_bidang,
        nama_pegawai: p.nama_pegawai,
        created_at: p.created_at,
        updated_at: p.updated_at
      }))
    });
  } catch (error) {
    logger.error('Perjalanan Dinas - Get Pegawai by Bidang Error:', error);
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
      status: 'success',
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
