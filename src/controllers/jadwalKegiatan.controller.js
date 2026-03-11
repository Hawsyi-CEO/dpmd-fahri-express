/**
 * Jadwal Kegiatan Controller - REBUILT
 * Simple and clean implementation
 */

const prisma = require('../config/prisma');
const pushNotificationService = require('../services/pushNotification.service');
const ActivityLogger = require('../utils/activityLogger');

class JadwalKegiatanController {
  /**
   * Get all jadwal kegiatan with filters and role-based access
   */
  async getAllJadwal(req, res) {
    try {
      const { 
        status, 
        prioritas,
        search,
        tanggal,
        page = 1, 
        limit = 50 
      } = req.query;

      console.log('\n🔍 [Jadwal] GET ALL Request from user:', req.user.id);
      console.log('   Role:', req.user.role);
      console.log('   Bidang ID:', req.user.bidang_id);
      console.log('   Filters:', { status, prioritas, search, tanggal, page, limit });

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // NO BIDANG FILTER - All users can see all jadwal kegiatan
      // This allows cross-bidang integration and coordination
      console.log('   ✓ No bidang filter - showing all jadwal kegiatan for coordination');

      // Apply filters
      if (status && status !== 'all') {
        where.status = status;
        console.log('   ✓ Filter by status:', status);
      }
      
      if (prioritas && prioritas !== 'all') {
        where.prioritas = prioritas;
        console.log('   ✓ Filter by prioritas:', prioritas);
      }

      // Date filter - find activities on the selected date
      // Activity spans the date if: tanggal_mulai <= selected_date AND tanggal_selesai >= selected_date
      if (tanggal) {
        // Parse the input date as local time (not UTC)
        const [year, month, day] = tanggal.split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        where.AND = where.AND || [];
        where.AND.push({
          tanggal_mulai: { lte: endOfDay }
        });
        where.AND.push({
          tanggal_selesai: { gte: startOfDay }
        });
        console.log('   ✓ Filter tanggal:', tanggal);
        console.log('   ✓ Date range:', startOfDay, 'to', endOfDay);
      }

      // Search filter
      if (search) {
        where.OR = [
          { judul: { contains: search } },
          { deskripsi: { contains: search } },
          { lokasi: { contains: search } },
          { asal_kegiatan: { contains: search } }
        ];
        console.log('   ✓ Search term:', search);
      }

      console.log('   Final WHERE clause:', JSON.stringify(where, null, 2));

      // Query database
      const [jadwals, total] = await Promise.all([
        prisma.jadwal_kegiatan.findMany({
          where,
          include: {
            bidangs: {
              select: { nama: true }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { tanggal_mulai: 'desc' }
        }),
        prisma.jadwal_kegiatan.count({ where })
      ]);

      console.log('   ✅ Query result: Found', jadwals.length, 'records out of', total, 'total');

      // Format response
      const formattedJadwals = jadwals.map(j => ({
        id: j.id,
        judul: j.judul,
        deskripsi: j.deskripsi || '-',
        bidang_id: j.bidang_id,
        bidang_nama: j.bidangs?.nama || null,
        tanggal_mulai: j.tanggal_mulai,
        tanggal_selesai: j.tanggal_selesai,
        lokasi: j.lokasi || '-',
        asal_kegiatan: j.asal_kegiatan || '-',
        pic_name: j.pic_name || '-',
        pic_contact: j.pic_contact || '-',
        status: j.status,
        prioritas: j.prioritas,
        kategori: j.kategori,
        created_at: j.created_at,
        updated_at: j.updated_at
      }));

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: formattedJadwals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      });

    } catch (error) {
      console.error('❌ [Jadwal] Error in getAllJadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data jadwal kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Get single jadwal by ID
   */
  async getJadwalById(req, res) {
    try {
      const { id } = req.params;

      const jadwal = await prisma.jadwal_kegiatan.findUnique({
        where: { id: parseInt(id) },
        include: {
          bidangs: { select: { nama: true } }
        }
      });

      if (!jadwal) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal kegiatan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: {
          id: jadwal.id,
          judul: jadwal.judul,
          deskripsi: jadwal.deskripsi || '-',
          bidang_id: jadwal.bidang_id,
          bidang_nama: jadwal.bidangs?.nama || null,
          tanggal_mulai: jadwal.tanggal_mulai,
          tanggal_selesai: jadwal.tanggal_selesai,
          lokasi: jadwal.lokasi || '-',
          asal_kegiatan: jadwal.asal_kegiatan || '-',
          pic_name: jadwal.pic_name || '-',
          pic_contact: jadwal.pic_contact || '-',
          status: jadwal.status,
          prioritas: jadwal.prioritas,
          kategori: jadwal.kategori,
          created_at: jadwal.created_at,
          updated_at: jadwal.updated_at
        }
      });

    } catch (error) {
      console.error('❌ [Jadwal] Error in getJadwalById:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail jadwal',
        error: error.message
      });
    }
  }

  /**
   * Create new jadwal kegiatan
   */
  async createJadwal(req, res) {
    try {
      const {
        judul,
        deskripsi,
        bidang_id,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        asal_kegiatan,
        prioritas,
        kategori,
        pic_name,
        pic_contact
      } = req.body;

      console.log('\n✨ [Jadwal] CREATE Request');
      console.log('   User:', req.user.id, '- Role:', req.user.role, '- Bidang:', req.user.bidang_id);
      console.log('   Data:', { judul, bidang_id, tanggal_mulai, tanggal_selesai, lokasi, asal_kegiatan });

      // Validation
      if (!judul || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({
          success: false,
          message: 'Judul, tanggal mulai, dan tanggal selesai wajib diisi'
        });
      }

      // Authorization check: Only Sekretariat (bidang_id = 2) or superadmin can create
      const SEKRETARIAT_BIDANG_ID = 2;
      const userBidangId = Number(req.user.bidang_id);
      
      if (req.user.role !== 'superadmin' && userBidangId !== SEKRETARIAT_BIDANG_ID) {
        console.log(`   ❌ Authorization failed: User bidang_id ${userBidangId} is not Sekretariat`);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk membuat jadwal kegiatan. Hanya bidang Sekretariat yang dapat mengelola jadwal.'
        });
      }

      console.log('   ✓ Authorization passed: User can create jadwal');

      // Determine bidang_id for jadwal
      // null = untuk semua pegawai (lintas bidang)
      let finalBidangId = null;
      
      if (bidang_id) {
        finalBidangId = Number(bidang_id);
        console.log('   ✓ Using specified bidang_id:', finalBidangId);
      } else {
        console.log('   ✓ No bidang_id - kegiatan untuk semua pegawai');
      }

      // Create jadwal
      const jadwal = await prisma.jadwal_kegiatan.create({
        data: {
          judul,
          deskripsi: deskripsi || '-',
          bidang_id: finalBidangId,
          tanggal_mulai: new Date(tanggal_mulai),
          tanggal_selesai: new Date(tanggal_selesai),
          lokasi: lokasi || '-',
          asal_kegiatan: asal_kegiatan || '-',
          pic_name: pic_name || '-',
          pic_contact: pic_contact || '-',
          status: 'draft',
          prioritas: prioritas || 'sedang',
          kategori: kategori || 'lainnya',
          created_by: req.user.id
        }
      });

      console.log('   ✅ Jadwal created with ID:', jadwal.id, '- Bidang:', finalBidangId || 'ALL');

      // Activity Log
      await ActivityLogger.log({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        bidangId: 2, // Sekretariat
        module: 'jadwal_kegiatan',
        action: 'create',
        entityType: 'jadwal_kegiatan',
        entityId: jadwal.id,
        entityName: judul,
        description: `${req.user.name} menambahkan jadwal kegiatan baru: ${judul}`,
        newValue: { judul, lokasi, asal_kegiatan, tanggal_mulai, tanggal_selesai },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      // Push notification dikirim per hari via cron scheduler, bukan per kegiatan

      res.status(201).json({
        success: true,
        message: 'Jadwal kegiatan berhasil ditambahkan',
        data: jadwal
      });

    } catch (error) {
      console.error('❌ [Jadwal] Error in createJadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan jadwal kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Update jadwal kegiatan
   */
  async updateJadwal(req, res) {
    try {
      const { id } = req.params;
      const {
        judul,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        asal_kegiatan,
        pic_name,
        pic_contact,
        status,
        prioritas
      } = req.body;

      console.log('\n📝 [Jadwal] UPDATE Request for ID:', id);
      console.log('   User:', req.user.id, '- Role:', req.user.role, '- Bidang:', req.user.bidang_id);

      // Check if jadwal exists
      const existing = await prisma.jadwal_kegiatan.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal kegiatan tidak ditemukan'
        });
      }

      // Authorization check: Only Sekretariat (bidang_id = 2) or superadmin can edit
      const SEKRETARIAT_BIDANG_ID = 2;
      const userBidangId = Number(req.user.bidang_id);
      
      if (req.user.role !== 'superadmin' && userBidangId !== SEKRETARIAT_BIDANG_ID) {
        console.log(`   ❌ Authorization failed: User bidang_id ${userBidangId} is not Sekretariat`);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk mengubah jadwal kegiatan. Hanya bidang Sekretariat yang dapat mengelola jadwal.'
        });
      }

      console.log('   ✓ Authorization passed: User can edit jadwal');

      // Track changes for notification
      const changes = {};
      if (judul && judul !== existing.judul) changes.judul = true;
      if (tanggal_mulai && tanggal_mulai !== existing.tanggal_mulai) changes.tanggal = true;
      if (tanggal_selesai && tanggal_selesai !== existing.tanggal_selesai) changes.tanggal = true;
      if (lokasi && lokasi !== existing.lokasi) changes.lokasi = true;
      if (status && status !== existing.status) changes.status = true;
      if (prioritas && prioritas !== existing.prioritas) changes.prioritas = true;

      // Update
      const updated = await prisma.jadwal_kegiatan.update({
        where: { id: parseInt(id) },
        data: {
          ...(judul && { judul }),
          ...(tanggal_mulai && { tanggal_mulai: new Date(tanggal_mulai) }),
          ...(tanggal_selesai && { tanggal_selesai: new Date(tanggal_selesai) }),
          ...(lokasi !== undefined && { lokasi: lokasi || '-' }),
          ...(asal_kegiatan !== undefined && { asal_kegiatan: asal_kegiatan || '-' }),
          ...(pic_name !== undefined && { pic_name: pic_name || '-' }),
          ...(pic_contact !== undefined && { pic_contact: pic_contact || '-' }),
          ...(status && { status }),
          ...(prioritas && { prioritas })
        }
      });

      console.log('   ✅ Jadwal updated');

      // Activity Log
      await ActivityLogger.log({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        bidangId: 2, // Sekretariat
        module: 'jadwal_kegiatan',
        action: 'update',
        entityType: 'jadwal_kegiatan',
        entityId: parseInt(id),
        entityName: updated.judul,
        description: `${req.user.name} memperbarui jadwal kegiatan: ${updated.judul}`,
        oldValue: { judul: existing.judul, lokasi: existing.lokasi, status: existing.status },
        newValue: { judul: updated.judul, lokasi: updated.lokasi, status: updated.status },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      // Push notification dikirim per hari via cron scheduler, bukan per perubahan

      res.json({
        success: true,
        message: 'Jadwal kegiatan berhasil diperbarui',
        data: updated
      });

    } catch (error) {
      console.error('❌ [Jadwal] Error in updateJadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui jadwal kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Delete jadwal kegiatan
   */
  async deleteJadwal(req, res) {
    try {
      const { id } = req.params;

      console.log('\n🗑️ [Jadwal] DELETE Request for ID:', id);
      console.log('   User:', req.user.id, '- Role:', req.user.role, '- Bidang:', req.user.bidang_id);

      // Check if jadwal exists
      const existing = await prisma.jadwal_kegiatan.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal kegiatan tidak ditemukan'
        });
      }

      // Authorization check: Only Sekretariat (bidang_id = 2) or superadmin can delete
      const SEKRETARIAT_BIDANG_ID = 2;
      const userBidangId = Number(req.user.bidang_id);
      
      if (req.user.role !== 'superadmin' && userBidangId !== SEKRETARIAT_BIDANG_ID) {
        console.log(`   ❌ Authorization failed: User bidang_id ${userBidangId} is not Sekretariat`);
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk menghapus jadwal kegiatan. Hanya bidang Sekretariat yang dapat mengelola jadwal.'
        });
      }

      console.log('   ✓ Authorization passed: User can delete jadwal');

      await prisma.jadwal_kegiatan.delete({
        where: { id: parseInt(id) }
      });

      // Activity Log
      await ActivityLogger.log({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        bidangId: 2, // Sekretariat
        module: 'jadwal_kegiatan',
        action: 'delete',
        entityType: 'jadwal_kegiatan',
        entityId: parseInt(id),
        entityName: existing.judul,
        description: `${req.user.name} menghapus jadwal kegiatan: ${existing.judul}`,
        oldValue: { judul: existing.judul, lokasi: existing.lokasi },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      console.log('   ✅ Jadwal deleted');

      res.json({
        success: true,
        message: 'Jadwal kegiatan berhasil dihapus'
      });

    } catch (error) {
      console.error('❌ [Jadwal] Error in deleteJadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus jadwal kegiatan',
        error: error.message
      });
    }
  }
}

module.exports = new JadwalKegiatanController();
