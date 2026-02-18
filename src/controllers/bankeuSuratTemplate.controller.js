const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BankeuSuratTemplateController {
  /**
   * Get all surat templates
   * GET /api/bankeu/surat-templates
   */
  async getAll(req, res) {
    try {
      const { kategori, is_active } = req.query;

      const where = {};
      if (kategori) where.kategori = kategori;
      if (is_active !== undefined) where.is_active = is_active === 'true';

      const templates = await prisma.bankeu_surat_templates.findMany({
        where,
        orderBy: [{ kategori: 'asc' }, { kode: 'asc' }],
        include: {
          users: {
            select: { id: true, name: true }
          }
        }
      });

      res.json({
        success: true,
        data: templates.map(t => ({
          ...t,
          placeholders: t.placeholders || [],
          updated_by: t.users ? { id: t.users.id, name: t.users.name } : null,
          users: undefined
        }))
      });
    } catch (error) {
      console.error('Error getting surat templates:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data template surat',
        error: error.message
      });
    }
  }

  /**
   * Get single template by ID or kode
   * GET /api/bankeu/surat-templates/:idOrKode
   */
  async getOne(req, res) {
    try {
      const { idOrKode } = req.params;

      let template;
      const numericId = parseInt(idOrKode);

      if (!isNaN(numericId)) {
        template = await prisma.bankeu_surat_templates.findUnique({
          where: { id: numericId },
          include: { users: { select: { id: true, name: true } } }
        });
      } else {
        template = await prisma.bankeu_surat_templates.findUnique({
          where: { kode: idOrKode },
          include: { users: { select: { id: true, name: true } } }
        });
      }

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template surat tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: {
          ...template,
          placeholders: template.placeholders || [],
          updated_by: template.users ? { id: template.users.id, name: template.users.name } : null,
          users: undefined
        }
      });
    } catch (error) {
      console.error('Error getting surat template:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil template surat',
        error: error.message
      });
    }
  }

  /**
   * Create new template
   * POST /api/bankeu/surat-templates
   */
  async create(req, res) {
    try {
      const { kode, nama, deskripsi, kategori, content_html, placeholders } = req.body;

      if (!kode || !nama || !content_html) {
        return res.status(400).json({
          success: false,
          message: 'Kode, nama, dan content_html wajib diisi'
        });
      }

      // Check duplicate kode
      const existing = await prisma.bankeu_surat_templates.findUnique({
        where: { kode }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Template dengan kode "${kode}" sudah ada`
        });
      }

      const template = await prisma.bankeu_surat_templates.create({
        data: {
          kode,
          nama,
          deskripsi: deskripsi || null,
          kategori: kategori || 'desa',
          content_html,
          placeholders: placeholders || [],
          updated_by_user_id: req.user?.id ? BigInt(req.user.id) : null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Template surat berhasil dibuat',
        data: template
      });
    } catch (error) {
      console.error('Error creating surat template:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat template surat',
        error: error.message
      });
    }
  }

  /**
   * Update template
   * PUT /api/bankeu/surat-templates/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nama, deskripsi, kategori, content_html, placeholders, is_active } = req.body;

      const existing = await prisma.bankeu_surat_templates.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Template surat tidak ditemukan'
        });
      }

      const updateData = {
        updated_at: new Date(),
        updated_by_user_id: req.user?.id ? BigInt(req.user.id) : null
      };

      if (nama !== undefined) updateData.nama = nama;
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
      if (kategori !== undefined) updateData.kategori = kategori;
      if (content_html !== undefined) updateData.content_html = content_html;
      if (placeholders !== undefined) updateData.placeholders = placeholders;
      if (is_active !== undefined) updateData.is_active = is_active;

      const template = await prisma.bankeu_surat_templates.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { users: { select: { id: true, name: true } } }
      });

      res.json({
        success: true,
        message: 'Template surat berhasil diperbarui',
        data: {
          ...template,
          placeholders: template.placeholders || [],
          updated_by: template.users ? { id: template.users.id, name: template.users.name } : null,
          users: undefined
        }
      });
    } catch (error) {
      console.error('Error updating surat template:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui template surat',
        error: error.message
      });
    }
  }

  /**
   * Delete template
   * DELETE /api/bankeu/surat-templates/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await prisma.bankeu_surat_templates.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Template surat tidak ditemukan'
        });
      }

      await prisma.bankeu_surat_templates.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Template surat berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting surat template:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus template surat',
        error: error.message
      });
    }
  }

  /**
   * Get templates for desa (public-ish, for desa to see template format)
   * GET /api/bankeu/surat-templates/public/desa
   */
  async getDesaTemplates(req, res) {
    try {
      const templates = await prisma.bankeu_surat_templates.findMany({
        where: {
          kategori: 'desa',
          is_active: true
        },
        select: {
          id: true,
          kode: true,
          nama: true,
          deskripsi: true,
          content_html: true,
          placeholders: true
        },
        orderBy: { kode: 'asc' }
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting desa templates:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil template surat desa',
        error: error.message
      });
    }
  }
}

module.exports = new BankeuSuratTemplateController();
