// src/controllers/berita.controller.js
const Berita = require('../models/Berita');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const ActivityLogger = require('../utils/activityLogger');

// Helper function to generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all berita (Public - for landing page)
exports.getAllBerita = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      kategori, 
      status = 'published',
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { status };

    if (kategori) {
      whereClause.kategori = kategori;
    }

    if (search) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { ringkasan: { [Op.like]: `%${search}%` } },
        { konten: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Berita.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_publish', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        current_page: parseInt(page),
        last_page: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching berita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data berita',
      error: error.message
    });
  }
};

// Get berita terbaru (Public - for landing page)
exports.getBeritaTerbaru = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const berita = await Berita.findAll({
      where: { status: 'published' },
      limit: parseInt(limit),
      order: [['tanggal_publish', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: berita
    });
  } catch (error) {
    console.error('Error fetching berita terbaru:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil berita terbaru',
      error: error.message
    });
  }
};

// Get single berita by slug (Public)
exports.getBeritaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const berita = await Berita.findOne({
      where: { slug, status: 'published' }
    });

    if (!berita) {
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan'
      });
    }

    // Increment views
    await berita.increment('views');

    res.status(200).json({
      status: 'success',
      data: berita
    });
  } catch (error) {
    console.error('Error fetching berita by slug:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail berita',
      error: error.message
    });
  }
};

// Get all berita for admin (includes draft and archived)
exports.getAllBeritaAdmin = async (req, res) => {
  try {
    console.log('📋 [BeritaAdmin] Request received from:', req.user?.email, 'Role:', req.user?.role);
    
    const { 
      page = 1, 
      limit = 10, 
      kategori, 
      status,
      search 
    } = req.query;

    console.log('📋 [BeritaAdmin] Query params:', { page, limit, kategori, status, search });

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (kategori) {
      whereClause.kategori = kategori;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { ringkasan: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('📋 [BeritaAdmin] Where clause:', whereClause);

    const { count, rows } = await Berita.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    console.log('📋 [BeritaAdmin] Found:', count, 'berita');

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        current_page: parseInt(page),
        last_page: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ [BeritaAdmin] Error fetching berita admin:', error);
    console.error('❌ [BeritaAdmin] Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data berita',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create berita
exports.createBerita = async (req, res) => {
  try {
    console.log('📝 [CreateBerita] Request received');
    console.log('📝 [CreateBerita] Body:', req.body);
    console.log('📝 [CreateBerita] File:', req.file);
    
    const { judul, konten, ringkasan, kategori, status, penulis } = req.body;

    if (!judul || !konten) {
      console.log('❌ [CreateBerita] Missing required fields');
      return res.status(400).json({
        status: 'error',
        message: 'Judul dan konten harus diisi'
      });
    }

    // Generate slug from judul
    let slug = generateSlug(judul);
    console.log('📝 [CreateBerita] Generated slug:', slug);
    
    // Check if slug already exists
    const existingBerita = await Berita.findOne({ where: { slug } });
    if (existingBerita) {
      slug = `${slug}-${Date.now()}`;
      console.log('📝 [CreateBerita] Slug already exists, using:', slug);
    }

    // Handle image upload
    let gambar = null;
    if (req.file) {
      gambar = req.file.filename;
      console.log('📝 [CreateBerita] Image uploaded:', gambar);
    }

    // Set tanggal_publish if status is published
    let tanggal_publish = null;
    if (status === 'published') {
      tanggal_publish = new Date();
    }

    console.log('📝 [CreateBerita] Creating berita with data:', {
      judul, slug, kategori, status, gambar
    });

    const berita = await Berita.create({
      judul,
      slug,
      konten,
      ringkasan,
      gambar,
      kategori: kategori || 'umum',
      status: status || 'draft',
      tanggal_publish,
      penulis
    });

    console.log('✅ [CreateBerita] Berita created successfully:', berita.id_berita);

    // Activity Log
    await ActivityLogger.log({
      userId: req.user?.id,
      userName: req.user?.name || penulis || 'Admin',
      userRole: req.user?.role || 'admin',
      bidangId: 2, // Sekretariat/Humas
      module: 'berita',
      action: 'create',
      entityType: 'berita',
      entityId: berita.id_berita,
      entityName: judul,
      description: `${req.user?.name || penulis || 'Admin'} membuat berita baru: ${judul}`,
      newValue: { judul, status, kategori },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.status(201).json({
      status: 'success',
      message: 'Berita berhasil dibuat',
      data: berita
    });
  } catch (error) {
    console.error('❌ [CreateBerita] Error:', error);
    console.error('❌ [CreateBerita] Error stack:', error.stack);
    
    // Delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, '../../storage/uploads/berita', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ [CreateBerita] Deleted uploaded file due to error');
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat berita',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update berita
exports.updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, konten, ringkasan, kategori, status, penulis } = req.body;

    const berita = await Berita.findByPk(id);

    if (!berita) {
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan'
      });
    }

    // Generate new slug if judul changed
    let slug = berita.slug;
    if (judul && judul !== berita.judul) {
      slug = generateSlug(judul);
      
      // Check if new slug already exists
      const existingBerita = await Berita.findOne({ 
        where: { 
          slug,
          id_berita: { [Op.ne]: id }
        } 
      });
      
      if (existingBerita) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (berita.gambar) {
        const oldImagePath = path.join(__dirname, '../../storage/uploads', berita.gambar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      berita.gambar = req.file.filename;
    }

    // Update tanggal_publish if status changes to published
    if (status === 'published' && berita.status !== 'published' && !berita.tanggal_publish) {
      berita.tanggal_publish = new Date();
    }

    // Update fields
    if (judul) berita.judul = judul;
    if (slug) berita.slug = slug;
    if (konten) berita.konten = konten;
    if (ringkasan !== undefined) berita.ringkasan = ringkasan;
    if (kategori) berita.kategori = kategori;
    if (status) berita.status = status;
    if (penulis) berita.penulis = penulis;
    berita.updated_at = new Date();

    await berita.save();

    // Activity Log
    await ActivityLogger.log({
      userId: req.user?.id,
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      bidangId: 2, // Sekretariat/Humas
      module: 'berita',
      action: 'update',
      entityType: 'berita',
      entityId: berita.id_berita,
      entityName: berita.judul,
      description: `${req.user?.name || 'Admin'} memperbarui berita: ${berita.judul}`,
      newValue: { judul: berita.judul, status: berita.status, kategori: berita.kategori },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil diupdate',
      data: berita
    });
  } catch (error) {
    console.error('Error updating berita:', error);
    
    // Delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, '../../storage/uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Gagal mengupdate berita',
      error: error.message
    });
  }
};

// Delete berita
exports.deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const berita = await Berita.findByPk(id);

    if (!berita) {
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan'
      });
    }

    // Delete image file
    if (berita.gambar) {
      const imagePath = path.join(__dirname, '../../storage/uploads', berita.gambar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Store berita info before delete for activity log
    const beritaJudul = berita.judul;
    const beritaId = berita.id_berita;

    await berita.destroy();

    // Activity Log
    await ActivityLogger.log({
      userId: req.user?.id,
      userName: req.user?.name || 'Admin',
      userRole: req.user?.role || 'admin',
      bidangId: 2, // Sekretariat/Humas
      module: 'berita',
      action: 'delete',
      entityType: 'berita',
      entityId: beritaId,
      entityName: beritaJudul,
      description: `${req.user?.name || 'Admin'} menghapus berita: ${beritaJudul}`,
      oldValue: { judul: beritaJudul },
      ipAddress: ActivityLogger.getIpFromRequest(req),
      userAgent: ActivityLogger.getUserAgentFromRequest(req)
    });

    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting berita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus berita',
      error: error.message
    });
  }
};

// Get berita statistics
exports.getBeritaStats = async (req, res) => {
  try {
    const totalBerita = await Berita.count();
    const publishedBerita = await Berita.count({ where: { status: 'published' } });
    const draftBerita = await Berita.count({ where: { status: 'draft' } });
    
    const beritaByKategori = await Berita.findAll({
      attributes: [
        'kategori',
        [Berita.sequelize.fn('COUNT', Berita.sequelize.col('id_berita')), 'total']
      ],
      where: { status: 'published' },
      group: ['kategori']
    });

    res.status(200).json({
      status: 'success',
      data: {
        total_berita: totalBerita,
        published: publishedBerita,
        draft: draftBerita,
        by_kategori: beritaByKategori
      }
    });
  } catch (error) {
    console.error('Error fetching berita stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil statistik berita',
      error: error.message
    });
  }
};
