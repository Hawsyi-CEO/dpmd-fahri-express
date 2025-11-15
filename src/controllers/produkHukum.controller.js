/**
 * Produk Hukum Controller
 * Handles all produk hukum (legal products) endpoints for desa
 * Converted from Laravel to Express.js with Prisma ORM
 */

const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class ProdukHukumController {
  /**
   * Get all produk hukum for authenticated user's desa
   * Supports search and pagination
   */
  async index(req, res) {
    try {
      const user = req.user;
      const { search, all, page = 1, limit = 12 } = req.query;

      // Build where clause
      const where = {
        desa_id: user.desa_id
      };

      // Add search filter if provided
      if (search) {
        where.judul = {
          contains: search
        };
      }

      // If 'all' parameter is true, return all data without pagination
      if (all === 'true' || all === '1') {
        const produkHukums = await prisma.produk_hukums.findMany({
          where,
          include: {
            desas: {
              include: {
                kecamatans: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        });

        return res.json({
          success: true,
          message: 'Daftar Produk Hukum',
          data: produkHukums
        });
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [produkHukums, total] = await Promise.all([
        prisma.produk_hukums.findMany({
          where,
          include: {
            desas: {
              include: {
                kecamatans: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        prisma.produk_hukums.count({ where })
      ]);

      return res.json({
        success: true,
        message: 'Daftar Produk Hukum',
        data: {
          data: produkHukums,
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          last_page: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error in index:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk hukum',
        error: error.message
      });
    }
  }

  /**
   * Store a new produk hukum
   */
  async store(req, res) {
    try {
      const user = req.user;
      
      // Validate required fields
      const {
        judul,
        nomor,
        tahun,
        jenis,
        singkatan_jenis,
        tempat_penetapan,
        tanggal_penetapan,
        status_peraturan,
        sumber,
        subjek,
        keterangan_status
      } = req.body;

      if (!judul || !nomor || !tahun || !jenis || !singkatan_jenis || 
          !tempat_penetapan || !tanggal_penetapan || !status_peraturan) {
        return res.status(422).json({
          success: false,
          message: 'Semua field wajib harus diisi'
        });
      }

      // Validate file
      if (!req.file) {
        return res.status(422).json({
          success: false,
          message: 'File PDF harus diupload'
        });
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        // Delete uploaded file if wrong type
        await fs.unlink(req.file.path);
        return res.status(422).json({
          success: false,
          message: 'File harus berformat PDF'
        });
      }

      // Create produk hukum
      const produkHukum = await prisma.produk_hukums.create({
        data: {
          id: uuidv4(),
          desa_id: user.desa_id,
          judul,
          nomor,
          tahun: parseInt(tahun),
          jenis,
          singkatan_jenis,
          tempat_penetapan,
          tanggal_penetapan: new Date(tanggal_penetapan),
          status_peraturan,
          sumber: sumber || null,
          subjek: subjek || null,
          keterangan_status: keterangan_status || null,
          file: req.file.filename
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Produk Hukum berhasil ditambahkan',
        data: produkHukum
      });
    } catch (error) {
      console.error('Error in store:', error);
      
      // Delete uploaded file if database insert fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Produk Hukum gagal ditambahkan',
        error: error.message
      });
    }
  }

  /**
   * Get single produk hukum
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const produkHukum = await prisma.produk_hukums.findUnique({
        where: { id },
        include: {
          desas: {
            include: {
              kecamatans: true
            }
          }
        }
      });

      if (!produkHukum) {
        return res.status(404).json({
          success: false,
          message: 'Produk Hukum tidak ditemukan'
        });
      }

      return res.json({
        success: true,
        message: 'Detail Produk Hukum',
        data: produkHukum
      });
    } catch (error) {
      console.error('Error in show:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail produk hukum',
        error: error.message
      });
    }
  }

  /**
   * Update produk hukum
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      // Check if produk hukum exists
      const produkHukum = await prisma.produk_hukums.findUnique({
        where: { id }
      });

      if (!produkHukum) {
        return res.status(404).json({
          success: false,
          message: 'Produk Hukum tidak ditemukan'
        });
      }

      // Validate required fields
      const {
        judul,
        nomor,
        tahun,
        jenis,
        singkatan_jenis,
        tempat_penetapan,
        tanggal_penetapan,
        status_peraturan,
        sumber,
        subjek,
        keterangan_status
      } = req.body;

      if (!judul || !nomor || !tahun || !jenis || !singkatan_jenis || 
          !tempat_penetapan || !tanggal_penetapan || !status_peraturan) {
        return res.status(422).json({
          success: false,
          message: 'Semua field wajib harus diisi'
        });
      }

      // Prepare update data
      const updateData = {
        judul,
        nomor,
        tahun: parseInt(tahun),
        jenis,
        singkatan_jenis,
        tempat_penetapan,
        tanggal_penetapan: new Date(tanggal_penetapan),
        status_peraturan,
        sumber: sumber || null,
        subjek: subjek || null,
        keterangan_status: keterangan_status || null
      };

      // Handle file upload if new file provided
      if (req.file) {
        // Validate file type
        if (req.file.mimetype !== 'application/pdf') {
          await fs.unlink(req.file.path);
          return res.status(422).json({
            success: false,
            message: 'File harus berformat PDF'
          });
        }

        // Delete old file
        if (produkHukum.file) {
          const oldFilePath = path.join(__dirname, '../../storage/produk_hukum', produkHukum.file);
          try {
            await fs.unlink(oldFilePath);
          } catch (error) {
            console.error('Error deleting old file:', error);
          }
        }

        updateData.file = req.file.filename;
      }

      // Update database
      const updatedProdukHukum = await prisma.produk_hukums.update({
        where: { id },
        data: updateData
      });

      return res.json({
        success: true,
        message: 'Produk Hukum berhasil diupdate',
        data: updatedProdukHukum
      });
    } catch (error) {
      console.error('Error in update:', error);

      // Delete uploaded file if database update fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Produk Hukum gagal diupdate',
        error: error.message
      });
    }
  }

  /**
   * Delete produk hukum
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const produkHukum = await prisma.produk_hukums.findUnique({
        where: { id }
      });

      if (!produkHukum) {
        return res.status(404).json({
          success: false,
          message: 'Produk Hukum tidak ditemukan'
        });
      }

      // Delete file
      if (produkHukum.file) {
        const filePath = path.join(__dirname, '../../storage/produk_hukum', produkHukum.file);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }

      // Delete from database
      await prisma.produk_hukums.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: 'Produk Hukum berhasil dihapus'
      });
    } catch (error) {
      console.error('Error in destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Produk Hukum gagal dihapus',
        error: error.message
      });
    }
  }

  /**
   * Update status of produk hukum
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status_peraturan } = req.body;

      // Validate status
      if (!['berlaku', 'dicabut'].includes(status_peraturan)) {
        return res.status(422).json({
          success: false,
          message: 'Status harus "berlaku" atau "dicabut"'
        });
      }

      const produkHukum = await prisma.produk_hukums.findUnique({
        where: { id }
      });

      if (!produkHukum) {
        return res.status(404).json({
          success: false,
          message: 'Produk Hukum tidak ditemukan'
        });
      }

      // Update status
      const updated = await prisma.produk_hukums.update({
        where: { id },
        data: { status_peraturan }
      });

      return res.json({
        success: true,
        message: 'Status Produk Hukum berhasil diupdate',
        data: updated
      });
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengupdate status',
        error: error.message
      });
    }
  }
}

module.exports = new ProdukHukumController();
