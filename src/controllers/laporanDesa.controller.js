const LaporanDesa = require('../models/LaporanDesa');
const JenisLaporan = require('../models/JenisLaporan');
const FileLaporan = require('../models/FileLaporan');
const Bidang = require('../models/Bidang');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Setup associations
LaporanDesa.belongsTo(JenisLaporan, { foreignKey: 'id_jenis_laporan', as: 'jenisLaporan' });
LaporanDesa.hasMany(FileLaporan, { foreignKey: 'id_laporan', as: 'files' });
JenisLaporan.belongsTo(Bidang, { foreignKey: 'id_bidang', as: 'bidang' });

/**
 * Get all laporan with filters and pagination
 */
exports.getAllLaporan = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      id_jenis_laporan,
      id_bidang,
      status_laporan,
      tahun_kegiatan,
      transparansi_laporan
    } = req.query;

    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { judul_laporan: { [Op.like]: `%${search}%` } },
        { uraian_laporan: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filters
    if (id_jenis_laporan) where.id_jenis_laporan = id_jenis_laporan;
    if (status_laporan) where.status_laporan = status_laporan;
    if (tahun_kegiatan) where.tahun_kegiatan = tahun_kegiatan;
    if (transparansi_laporan) where.transparansi_laporan = transparansi_laporan;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await LaporanDesa.findAndCountAll({
      where,
      include: [
        {
          model: JenisLaporan,
          as: 'jenisLaporan',
          attributes: ['id_jenis_laporan', 'jenis_laporan', 'id_bidang'],
          include: [
            {
              model: Bidang,
              as: 'bidang',
              attributes: ['id', 'nama'],
              where: id_bidang ? { id: id_bidang } : undefined,
              required: !!id_bidang
            }
          ]
        },
        {
          model: FileLaporan,
          as: 'files',
          attributes: ['id_file_laporan', 'file_laporan']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['tgl_laporan', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan',
      error: error.message
    });
  }
};

/**
 * Get laporan by ID
 */
exports.getLaporanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const laporan = await LaporanDesa.findByPk(id, {
      include: [
        {
          model: JenisLaporan,
          as: 'jenisLaporan',
          include: [
            {
              model: Bidang,
              as: 'bidang',
              attributes: ['id', 'nama']
            }
          ]
        },
        {
          model: FileLaporan,
          as: 'files',
          attributes: ['id_file_laporan', 'file_laporan']
        }
      ]
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: laporan
    });
  } catch (error) {
    console.error('Error fetching laporan by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan',
      error: error.message
    });
  }
};

/**
 * Get jenis laporan by bidang
 */
exports.getJenisLaporanByBidang = async (req, res, next) => {
  try {
    const { id_bidang } = req.params;

    const jenisLaporan = await JenisLaporan.findAll({
      where: { id_bidang },
      include: [
        {
          model: Bidang,
          as: 'bidang',
          attributes: ['id', 'nama']
        }
      ],
      order: [['jenis_laporan', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: jenisLaporan
    });
  } catch (error) {
    console.error('Error fetching jenis laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil jenis laporan',
      error: error.message
    });
  }
};

/**
 * Get all jenis laporan
 */
exports.getAllJenisLaporan = async (req, res, next) => {
  try {
    const jenisLaporan = await JenisLaporan.findAll({
      include: [
        {
          model: Bidang,
          as: 'bidang',
          attributes: ['id', 'nama']
        }
      ],
      order: [['jenis_laporan', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: jenisLaporan
    });
  } catch (error) {
    console.error('Error fetching jenis laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil jenis laporan',
      error: error.message
    });
  }
};

/**
 * Create new laporan
 */
exports.createLaporan = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      judul_laporan,
      uraian_laporan,
      tgl_laporan,
      tahun_kegiatan,
      status_laporan,
      transparansi_laporan,
      id_jenis_laporan,
      id_kelurahan,
      id_user,
      files
    } = req.body;

    // Create laporan
    const laporan = await LaporanDesa.create({
      judul_laporan,
      uraian_laporan,
      tgl_laporan,
      tahun_kegiatan,
      status_laporan: status_laporan || 'Belum Divalidasi',
      transparansi_laporan: transparansi_laporan || 'Tertutup',
      id_jenis_laporan,
      id_kelurahan,
      id_user
    }, { transaction });

    // Create file records if provided
    if (files && Array.isArray(files) && files.length > 0) {
      const fileRecords = files.map(file => ({
        file_laporan: file,
        id_laporan: laporan.id_laporan
      }));
      await FileLaporan.bulkCreate(fileRecords, { transaction });
    }

    await transaction.commit();

    // Fetch complete laporan with relations
    const completeLaporan = await LaporanDesa.findByPk(laporan.id_laporan, {
      include: [
        {
          model: JenisLaporan,
          as: 'jenisLaporan',
          include: [{ model: Bidang, as: 'bidang' }]
        },
        { model: FileLaporan, as: 'files' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Laporan berhasil dibuat',
      data: completeLaporan
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat laporan',
      error: error.message
    });
  }
};

/**
 * Update laporan
 */
exports.updateLaporan = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      judul_laporan,
      uraian_laporan,
      tgl_laporan,
      tahun_kegiatan,
      status_laporan,
      transparansi_laporan,
      id_jenis_laporan,
      id_kelurahan,
      files
    } = req.body;

    const laporan = await LaporanDesa.findByPk(id);
    if (!laporan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    // Update laporan
    await laporan.update({
      judul_laporan,
      uraian_laporan,
      tgl_laporan,
      tahun_kegiatan,
      status_laporan,
      transparansi_laporan,
      id_jenis_laporan,
      id_kelurahan
    }, { transaction });

    // Update files if provided
    if (files && Array.isArray(files)) {
      // Delete old files
      await FileLaporan.destroy({
        where: { id_laporan: id },
        transaction
      });

      // Create new files
      if (files.length > 0) {
        const fileRecords = files.map(file => ({
          file_laporan: file,
          id_laporan: id
        }));
        await FileLaporan.bulkCreate(fileRecords, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated laporan
    const updatedLaporan = await LaporanDesa.findByPk(id, {
      include: [
        {
          model: JenisLaporan,
          as: 'jenisLaporan',
          include: [{ model: Bidang, as: 'bidang' }]
        },
        { model: FileLaporan, as: 'files' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Laporan berhasil diperbarui',
      data: updatedLaporan
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui laporan',
      error: error.message
    });
  }
};

/**
 * Delete laporan
 */
exports.deleteLaporan = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const laporan = await LaporanDesa.findByPk(id);
    if (!laporan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    // Delete files first
    await FileLaporan.destroy({
      where: { id_laporan: id },
      transaction
    });

    // Delete laporan
    await laporan.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Laporan berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus laporan',
      error: error.message
    });
  }
};

/**
 * Get laporan statistics
 */
exports.getLaporanStats = async (req, res, next) => {
  try {
    const stats = await LaporanDesa.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id_laporan')), 'total'],
        'status_laporan'
      ],
      group: ['status_laporan']
    });

    const totalByBidang = await LaporanDesa.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('LaporanDesa.id_laporan')), 'total']
      ],
      include: [
        {
          model: JenisLaporan,
          as: 'jenisLaporan',
          attributes: [],
          include: [
            {
              model: Bidang,
              as: 'bidang',
              attributes: ['id', 'nama']
            }
          ]
        }
      ],
      group: ['jenisLaporan.bidang.id', 'jenisLaporan.bidang.nama'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byBidang: totalByBidang
      }
    });
  } catch (error) {
    console.error('Error fetching laporan stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik laporan',
      error: error.message
    });
  }
};
