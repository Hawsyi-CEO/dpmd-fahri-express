const Musdesus = require('../models/Musdesus');
const logger = require('../utils/logger');
const ActivityLogger = require('../utils/activityLogger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get all musdesus files (Admin only)
 */
exports.getAllMusdesus = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, kecamatan_id, desa_id, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (kecamatan_id) where.kecamatan_id = kecamatan_id;
    if (desa_id) where.desa_id = desa_id;
    
    if (search) {
      where[Op.or] = [
        { nama_pengupload: { [Op.like]: `%${search}%` } },
        { nama_file_asli: { [Op.like]: `%${search}%` } },
        { keterangan: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Musdesus.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['path_file'] }
    });

    // Add file_url to each record
    const data = rows.map(record => ({
      ...record.toJSON(),
      file_url: record.getFileUrl()
    }));

    logger.info('Musdesus - Get All Files', {
      user_id: req.user.id,
      role: req.user.role,
      total: count,
      filters: { status, kecamatan_id, desa_id }
    });

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Musdesus - Get All Files Error:', error);
    next(error);
  }
};

/**
 * Get musdesus files by desa (for logged in desa user)
 */
exports.getDesaMusdesus = async (req, res, next) => {
  try {
    const desaId = req.user.desa_id;

    if (!desaId) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses ke data desa'
      });
    }

    const files = await Musdesus.findAll({
      where: { desa_id: desaId },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['path_file'] }
    });

    const data = files.map(file => ({
      ...file.toJSON(),
      file_url: file.getFileUrl()
    }));

    logger.info('Musdesus - Get Desa Files', {
      user_id: req.user.id,
      desa_id: desaId,
      total_files: files.length
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Musdesus - Get Desa Files Error:', error);
    next(error);
  }
};

/**
 * Upload musdesus file (Desa user)
 */
exports.uploadMusdesusFile = async (req, res, next) => {
  try {
    const {
      nama_pengupload,
      email_pengupload,
      telepon_pengupload,
      keterangan,
      tanggal_musdesus
    } = req.body;

    const desaId = req.user.desa_id;
    const kecamatanId = req.user.kecamatan_id;

    if (!desaId || !kecamatanId) {
      return res.status(403).json({
        success: false,
        message: 'Data desa atau kecamatan tidak ditemukan'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File harus diupload'
      });
    }

    const file = req.file;

    logger.info('Musdesus - Upload File Request', {
      user_id: req.user.id,
      desa_id: desaId,
      kecamatan_id: kecamatanId,
      original_filename: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype
    });

    // Create musdesus record
    const musdesus = await Musdesus.create({
      nama_file: file.filename,
      nama_file_asli: file.originalname,
      path_file: file.path,
      mime_type: file.mimetype,
      ukuran_file: file.size,
      nama_pengupload,
      email_pengupload: email_pengupload || null,
      telepon_pengupload: telepon_pengupload || null,
      desa_id: desaId,
      kecamatan_id: kecamatanId,
      keterangan: keterangan || null,
      tanggal_musdesus: tanggal_musdesus || null,
      status: 'pending'
    });

    logger.info('Musdesus - File Uploaded Successfully', {
      musdesus_id: musdesus.id,
      filename: file.filename,
      desa_id: desaId
    });

    // Log activity
    await ActivityLogger.log({
      userId: req.user.id,
      userName: nama_pengupload || req.user.nama || req.user.email,
      userRole: req.user.role,
      bidangId: 5, // PMD
      module: 'musdesus',
      action: 'upload',
      entityType: 'musdesus',
      entityId: musdesus.id,
      entityName: file.originalname,
      description: `${nama_pengupload || req.user.nama || req.user.email} mengupload dokumen Musdesus: ${file.originalname}`,
      newValue: { filename: file.filename, size: file.size, tanggal_musdesus },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.status(201).json({
      success: true,
      message: 'File berhasil diupload',
      data: {
        ...musdesus.toJSON(),
        file_url: musdesus.getFileUrl()
      }
    });
  } catch (error) {
    // Delete uploaded file if database insert fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        logger.info('Musdesus - Deleted failed upload file:', req.file.filename);
      } catch (unlinkError) {
        logger.error('Musdesus - Error deleting file:', unlinkError);
      }
    }
    
    logger.error('Musdesus - Upload File Error:', error);
    next(error);
  }
};

/**
 * Update musdesus status (Admin only)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const musdesus = await Musdesus.findByPk(id);

    if (!musdesus) {
      return res.status(404).json({
        success: false,
        message: 'Data musdesus tidak ditemukan'
      });
    }

    musdesus.status = status;
    musdesus.catatan_admin = catatan_admin || musdesus.catatan_admin;
    musdesus.petugas_id = req.user.id;
    await musdesus.save();

    logger.info('Musdesus - Status Updated', {
      musdesus_id: id,
      new_status: status,
      petugas_id: req.user.id
    });

    // Log activity
    await ActivityLogger.log({
      userId: req.user.id,
      userName: req.user.nama || req.user.email,
      userRole: req.user.role,
      bidangId: 5, // PMD
      module: 'musdesus',
      action: status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'update',
      entityType: 'musdesus',
      entityId: musdesus.id,
      entityName: musdesus.nama_file_asli,
      description: `${req.user.nama || req.user.email} ${status === 'approved' ? 'menyetujui' : status === 'rejected' ? 'menolak' : 'mengubah status'} dokumen Musdesus: ${musdesus.nama_file_asli}`,
      oldValue: { status: musdesus.status },
      newValue: { status, catatan_admin },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.json({
      success: true,
      message: 'Status berhasil diupdate',
      data: {
        ...musdesus.toJSON(),
        file_url: musdesus.getFileUrl()
      }
    });
  } catch (error) {
    logger.error('Musdesus - Update Status Error:', error);
    next(error);
  }
};

/**
 * Delete musdesus file
 */
exports.deleteMusdesus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const musdesus = await Musdesus.findByPk(id);

    if (!musdesus) {
      return res.status(404).json({
        success: false,
        message: 'Data musdesus tidak ditemukan'
      });
    }

    // Check permission: Admin can delete all, desa can only delete their own
    if (req.user.role === 'desa' && musdesus.desa_id !== req.user.desa_id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk menghapus data ini'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(musdesus.path_file);
      logger.info('Musdesus - Physical file deleted:', musdesus.nama_file);
    } catch (fileError) {
      logger.warn('Musdesus - File not found or already deleted:', musdesus.nama_file);
    }

    // Delete database record
    await musdesus.destroy();

    logger.info('Musdesus - File Deleted', {
      musdesus_id: id,
      deleted_by: req.user.id,
      role: req.user.role
    });

    // Log activity
    await ActivityLogger.log({
      userId: req.user.id,
      userName: req.user.nama || req.user.email,
      userRole: req.user.role,
      bidangId: 5, // PMD
      module: 'musdesus',
      action: 'delete',
      entityType: 'musdesus',
      entityId: parseInt(id),
      entityName: musdesus.nama_file_asli,
      description: `${req.user.nama || req.user.email} menghapus dokumen Musdesus: ${musdesus.nama_file_asli}`,
      oldValue: { filename: musdesus.nama_file, nama_pengupload: musdesus.nama_pengupload },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.json({
      success: true,
      message: 'File berhasil dihapus'
    });
  } catch (error) {
    logger.error('Musdesus - Delete File Error:', error);
    next(error);
  }
};

/**
 * Get musdesus statistics (Admin only)
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');

    const totalFiles = await Musdesus.count();
    const totalSize = await Musdesus.sum('ukuran_file') || 0;
    
    const statusStats = await Musdesus.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalDesa = await Musdesus.count({
      distinct: true,
      col: 'desa_id'
    });

    const totalKecamatan = await Musdesus.count({
      distinct: true,
      col: 'kecamatan_id'
    });

    logger.info('Musdesus - Get Statistics', {
      user_id: req.user.id,
      role: req.user.role
    });

    res.json({
      success: true,
      data: {
        total_files: totalFiles,
        total_size: totalSize,
        total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
        total_desa: totalDesa,
        total_kecamatan: totalKecamatan,
        status_breakdown: statusStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.dataValues.count);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Musdesus - Get Statistics Error:', error);
    next(error);
  }
};

/**
 * Check if desa already uploaded files
 */
exports.checkDesaUploadStatus = async (req, res, next) => {
  try {
    const { desa_id } = req.params;

    const existingUpload = await Musdesus.findOne({
      where: { desa_id },
      order: [['created_at', 'DESC']]
    });

    if (existingUpload) {
      const filesCount = await Musdesus.count({ where: { desa_id } });
      
      return res.json({
        success: true,
        already_uploaded: true,
        message: 'Desa sudah pernah melakukan upload sebelumnya',
        upload_info: {
          upload_date: existingUpload.created_at,
          uploader_name: existingUpload.nama_pengupload,
          files_count: filesCount
        }
      });
    }

    res.json({
      success: true,
      already_uploaded: false,
      message: 'Desa belum pernah upload, dapat melakukan upload'
    });
  } catch (error) {
    logger.error('Musdesus - Check Upload Status Error:', error);
    next(error);
  }
};
