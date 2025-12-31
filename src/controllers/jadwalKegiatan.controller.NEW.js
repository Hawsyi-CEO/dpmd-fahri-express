/**
 * Jadwal Kegiatan Controller - REBUILT
 * Simple and clean implementation
 */

const prisma = require('../config/prisma');

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
        page = 1, 
        limit = 50 
      } = req.query;

      console.log('\n🔍 [Jadwal] GET ALL Request from user:', req.user.id);
      console.log('   Role:', req.user.role);
      console.log('   Bidang ID:', req.user.bidang_id);
      console.log('   Filters:', { status, prioritas, search, page, limit });

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Role-based filtering
      const userRole = req.user.role;
      const userBidangId = req.user.bidang_id;

      console.log('   Applying role-based filter...');

      // Only pegawai, ketua_tim, kepala_bidang need bidang filter
      if (['pegawai', 'ketua_tim', 'kepala_bidang'].includes(userRole)) {
        if (userBidangId) {
          where.bidang_id = userBidangId;
          console.log('   ✓ Filter by bidang_id:', userBidangId);
        } else {
          console.log('   ⚠️ User has no bidang_id, returning empty');
          return res.json({
            success: true,
            data: [],
            pagination: { page: 1, limit: parseInt(limit), total: 0, totalPages: 0 }
          });
        }
      } else {
        console.log('   ✓ User is sekda/superadmin, no bidang filter');
      }

      // Apply filters
      if (status && status !== 'all') {
        where.status = status;
        console.log('   ✓ Filter by status:', status);
      }
      
      if (prioritas && prioritas !== 'all') {
        where.prioritas = prioritas;
        console.log('   ✓ Filter by prioritas:', prioritas);
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
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        asal_kegiatan,
        pic_name,
        pic_contact
      } = req.body;

      console.log('\n✨ [Jadwal] CREATE Request');
      console.log('   User:', req.user.id, '- Bidang:', req.user.bidang_id);
      console.log('   Data:', { judul, tanggal_mulai, tanggal_selesai, lokasi, asal_kegiatan });

      // Validation
      if (!judul || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({
          success: false,
          message: 'Judul, tanggal mulai, dan tanggal selesai wajib diisi'
        });
      }

      // Create jadwal
      const jadwal = await prisma.jadwal_kegiatan.create({
        data: {
          judul,
          deskripsi: '-', // Default value
          bidang_id: req.user.bidang_id || null,
          tanggal_mulai: new Date(tanggal_mulai),
          tanggal_selesai: new Date(tanggal_selesai),
          lokasi: lokasi || '-',
          asal_kegiatan: asal_kegiatan || '-',
          pic_name: pic_name || '-',
          pic_contact: pic_contact || '-',
          status: 'draft',
          prioritas: 'sedang',
          kategori: 'lainnya',
          created_by: req.user.id
        }
      });

      console.log('   ✅ Jadwal created with ID:', jadwal.id);

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

      await prisma.jadwal_kegiatan.delete({
        where: { id: parseInt(id) }
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
