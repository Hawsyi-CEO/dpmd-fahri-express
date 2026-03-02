// src/controllers/informasi.controller.js
const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class InformasiController {
  
  // GET /api/informasi/public - Get active informasi (for dashboard banner)
  async getPublicInformasi(req, res, next) {
    try {
      const informasiList = await prisma.informasi.findMany({
        where: { is_active: true },
        orderBy: [
          { urutan: 'asc' },
          { created_at: 'desc' }
        ],
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          gambar: true,
          link: true,
          urutan: true
        }
      });

      return res.json({
        success: true,
        data: informasiList
      });
    } catch (error) {
      logger.error('Error fetching public informasi:', error);
      next(error);
    }
  }

  // GET /api/informasi - Get all informasi (admin)
  async getAllInformasi(req, res, next) {
    try {
      logger.info(`[Informasi] Fetching all informasi by ${req.user?.email}`);

      const informasiList = await prisma.informasi.findMany({
        orderBy: [
          { urutan: 'asc' },
          { created_at: 'desc' }
        ],
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Serialize BigInt
      const serialized = informasiList.map(item => ({
        ...item,
        created_by: item.created_by?.toString() || null,
        users: item.users ? {
          ...item.users,
          id: item.users.id.toString()
        } : null
      }));

      return res.json({
        success: true,
        data: serialized
      });
    } catch (error) {
      logger.error('Error fetching all informasi:', error);
      next(error);
    }
  }

  // GET /api/informasi/:id - Get single informasi
  async getInformasiById(req, res, next) {
    try {
      const { id } = req.params;
      
      const informasi = await prisma.informasi.findUnique({
        where: { id: parseInt(id) },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!informasi) {
        return res.status(404).json({
          success: false,
          message: 'Informasi tidak ditemukan'
        });
      }

      return res.json({
        success: true,
        data: {
          ...informasi,
          created_by: informasi.created_by?.toString() || null,
          users: informasi.users ? {
            ...informasi.users,
            id: informasi.users.id.toString()
          } : null
        }
      });
    } catch (error) {
      logger.error('Error fetching informasi by id:', error);
      next(error);
    }
  }

  // POST /api/informasi - Create new informasi
  async createInformasi(req, res, next) {
    try {
      const { judul, deskripsi, link, urutan, is_active } = req.body;
      const userId = req.user?.id;

      logger.info(`[Informasi] Creating by ${req.user?.email}:`, { judul, link });

      // Validate required fields
      if (!judul) {
        return res.status(400).json({
          success: false,
          message: 'Judul wajib diisi'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Gambar wajib diupload'
        });
      }

      const gambarPath = req.file.path.replace(/\\/g, '/');

      const informasi = await prisma.informasi.create({
        data: {
          judul: judul.trim(),
          deskripsi: deskripsi?.trim() || null,
          gambar: gambarPath,
          link: link?.trim() || null,
          urutan: urutan ? parseInt(urutan) : 1,
          is_active: is_active === 'true' || is_active === true,
          created_by: userId ? BigInt(userId) : null
        }
      });

      logger.info(`[Informasi] Created successfully with id: ${informasi.id}`);

      return res.status(201).json({
        success: true,
        message: 'Informasi berhasil ditambahkan',
        data: {
          ...informasi,
          created_by: informasi.created_by?.toString() || null
        }
      });
    } catch (error) {
      // Delete uploaded file if error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.error('Error deleting file:', err);
        });
      }
      logger.error('Error creating informasi:', error);
      next(error);
    }
  }

  // PUT /api/informasi/:id - Update informasi
  async updateInformasi(req, res, next) {
    try {
      const { id } = req.params;
      const { judul, deskripsi, link, urutan, is_active } = req.body;

      logger.info(`[Informasi] Updating id ${id} by ${req.user?.email}`);

      // Check if exists
      const existing = await prisma.informasi.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(404).json({
          success: false,
          message: 'Informasi tidak ditemukan'
        });
      }

      const updateData = {
        updated_at: new Date()
      };

      if (judul) updateData.judul = judul.trim();
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() || null;
      if (link !== undefined) updateData.link = link?.trim() || null;
      if (urutan !== undefined) updateData.urutan = parseInt(urutan);
      if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;

      // Handle new image upload
      if (req.file) {
        // Delete old image
        if (existing.gambar && fs.existsSync(existing.gambar)) {
          fs.unlink(existing.gambar, (err) => {
            if (err) logger.error('Error deleting old image:', err);
          });
        }
        updateData.gambar = req.file.path.replace(/\\/g, '/');
      }

      const updated = await prisma.informasi.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.info(`[Informasi] Updated successfully id: ${id}`);

      return res.json({
        success: true,
        message: 'Informasi berhasil diperbarui',
        data: {
          ...updated,
          created_by: updated.created_by?.toString() || null
        }
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      logger.error('Error updating informasi:', error);
      next(error);
    }
  }

  // DELETE /api/informasi/:id - Delete informasi
  async deleteInformasi(req, res, next) {
    try {
      const { id } = req.params;

      logger.info(`[Informasi] Deleting id ${id} by ${req.user?.email}`);

      const existing = await prisma.informasi.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Informasi tidak ditemukan'
        });
      }

      // Delete image file
      if (existing.gambar && fs.existsSync(existing.gambar)) {
        fs.unlink(existing.gambar, (err) => {
          if (err) logger.error('Error deleting image file:', err);
        });
      }

      await prisma.informasi.delete({
        where: { id: parseInt(id) }
      });

      logger.info(`[Informasi] Deleted successfully id: ${id}`);

      return res.json({
        success: true,
        message: 'Informasi berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error deleting informasi:', error);
      next(error);
    }
  }

  // PATCH /api/informasi/:id/toggle - Toggle active status
  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await prisma.informasi.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Informasi tidak ditemukan'
        });
      }

      const updated = await prisma.informasi.update({
        where: { id: parseInt(id) },
        data: {
          is_active: !existing.is_active,
          updated_at: new Date()
        }
      });

      logger.info(`[Informasi] Toggled active status id ${id} to ${updated.is_active}`);

      return res.json({
        success: true,
        message: `Informasi berhasil ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
        data: {
          ...updated,
          created_by: updated.created_by?.toString() || null
        }
      });
    } catch (error) {
      logger.error('Error toggling informasi:', error);
      next(error);
    }
  }

  // PUT /api/informasi/reorder - Reorder informasi
  async reorderInformasi(req, res, next) {
    try {
      const { items } = req.body; // [{id: 1, urutan: 1}, {id: 2, urutan: 2}, ...]

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Data items wajib berupa array'
        });
      }

      // Update each item's urutan
      await Promise.all(
        items.map(item => 
          prisma.informasi.update({
            where: { id: parseInt(item.id) },
            data: { 
              urutan: parseInt(item.urutan),
              updated_at: new Date()
            }
          })
        )
      );

      logger.info(`[Informasi] Reordered ${items.length} items`);

      return res.json({
        success: true,
        message: 'Urutan informasi berhasil diperbarui'
      });
    } catch (error) {
      logger.error('Error reordering informasi:', error);
      next(error);
    }
  }
}

module.exports = new InformasiController();
