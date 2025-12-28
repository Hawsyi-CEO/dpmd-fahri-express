/**
 * Jadwal Kegiatan Controller
 * Handles CRUD operations for activity schedules
 */

const prisma = require('../config/prisma');

class JadwalKegiatanController {
  /**
   * Get all jadwal kegiatan with filters
   */
  async getAllJadwal(req, res) {
    try {
      const { 
        status, 
        bidang_id, 
        kategori,
        prioritas,
        start_date,
        end_date,
        search,
        page = 1, 
        limit = 50 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Role-based filtering
      const userRole = req.user.role;
      const userBidangId = req.user.bidang_id;

      console.log('🔍 [JadwalKegiatan] User role:', userRole);
      console.log('🔍 [JadwalKegiatan] User bidang_id:', userBidangId);
      console.log('🔍 [JadwalKegiatan] User data:', req.user);

      // Kepala Bidang, Ketua Tim, Pegawai: only see their bidang's schedules
      if (['kepala_bidang', 'ketua_tim', 'pegawai'].includes(userRole)) {
        if (userBidangId) {
          where.bidang_id = userBidangId;
          console.log('✅ [JadwalKegiatan] Filtering by bidang_id:', userBidangId);
        } else {
          // If no bidang_id, return empty
          console.log('⚠️ [JadwalKegiatan] No bidang_id found, returning empty!');
          return res.json({
            success: true,
            data: [],
            pagination: { page: 1, limit, total: 0, totalPages: 0 }
          });
        }
      } else {
        console.log('✅ [JadwalKegiatan] User is sekda/superadmin, no bidang filter');
      }

      // Apply filters
      if (status) where.status = status;
      if (bidang_id) where.bidang_id = parseInt(bidang_id);
      if (kategori) where.kategori = kategori;
      if (prioritas) where.prioritas = prioritas;

      // Date range filter
      if (start_date || end_date) {
        where.AND = [];
        if (start_date) {
          where.AND.push({
            tanggal_mulai: { gte: new Date(start_date) }
          });
        }
        if (end_date) {
          where.AND.push({
            tanggal_selesai: { lte: new Date(end_date) }
          });
        }
      }

      // Search filter
      if (search) {
        where.OR = [
          { judul: { contains: search } },
          { deskripsi: { contains: search } },
          { lokasi: { contains: search } },
          { asal_kegiatan: { contains: search } },
          { pic_name: { contains: search } }
        ];
      }

      console.log('📊 [JadwalKegiatan] Final WHERE clause:', JSON.stringify(where, null, 2));
      console.log('📄 [JadwalKegiatan] Query params - page:', page, 'limit:', limit);

      // Get jadwals with Prisma ORM (simpler and safer)
      const [jadwals, total] = await Promise.all([
        prisma.jadwal_kegiatan.findMany({
          where,
          include: {
            bidangs: {
              select: { nama: true }
            },
            users_jadwal_kegiatan_created_byTousers: {
              select: { name: true, role: true }
            },
            users_jadwal_kegiatan_approved_byTousers: {
              select: { name: true, role: true }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { tanggal_mulai: 'desc' }
        }),
        prisma.jadwal_kegiatan.count({ where })
      ]);

      console.log('✅ [JadwalKegiatan] Query result - total:', total, 'records:', jadwals.length);
      if (jadwals.length > 0) {
        console.log('📋 [JadwalKegiatan] First record:', {
          id: jadwals[0].id,
          judul: jadwals[0].judul,
          bidang_id: jadwals[0].bidang_id,
          status: jadwals[0].status
        });
      } else {
        console.log('⚠️ [JadwalKegiatan] No records found!');
      }

      // Format response
      const formattedJadwals = jadwals.map(j => ({
        id: j.id,
        judul: j.judul,
        deskripsi: j.deskripsi,
        bidang_id: j.bidang_id,
        bidang_nama: j.bidangs?.nama || null,
        tanggal_mulai: j.tanggal_mulai,
        tanggal_selesai: j.tanggal_selesai,
        lokasi: j.lokasi,
        asal_kegiatan: j.asal_kegiatan,
        pic_name: j.pic_name,
        pic_contact: j.pic_contact,
        status: j.status,
        prioritas: j.prioritas,
        kategori: j.kategori,
        anggaran: j.anggaran,
        created_by: j.created_by,
        created_by_name: j.users_jadwal_kegiatan_created_byTousers?.name || null,
        created_by_role: j.users_jadwal_kegiatan_created_byTousers?.role || null,
        approved_by: j.approved_by,
        approved_by_name: j.users_jadwal_kegiatan_approved_byTousers?.name || null,
        approved_by_role: j.users_jadwal_kegiatan_approved_byTousers?.role || null,
        approved_at: j.approved_at,
        catatan_approval: j.catatan_approval,
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
      console.error('Error fetching jadwal:', error);
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
          bidangs: {
            select: { nama: true }
          },
          users_jadwal_kegiatan_created_byTousers: {
            select: { name: true, role: true }
          },
          users_jadwal_kegiatan_approved_byTousers: {
            select: { name: true, role: true }
          }
        }
      });

      if (!jadwal) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal kegiatan tidak ditemukan'
        });
      }

      // Format response
      const formattedJadwal = {
        id: jadwal.id,
        judul: jadwal.judul,
        deskripsi: jadwal.deskripsi,
        bidang_id: jadwal.bidang_id,
        bidang_nama: jadwal.bidangs?.nama || null,
        tanggal_mulai: jadwal.tanggal_mulai,
        tanggal_selesai: jadwal.tanggal_selesai,
        lokasi: jadwal.lokasi,
        asal_kegiatan: jadwal.asal_kegiatan,
        pic_name: jadwal.pic_name,
        pic_contact: jadwal.pic_contact,
        status: jadwal.status,
        prioritas: jadwal.prioritas,
        kategori: jadwal.kategori,
        anggaran: jadwal.anggaran,
        created_by: jadwal.created_by,
        created_by_name: jadwal.users_jadwal_kegiatan_created_byTousers?.name || null,
        created_by_role: jadwal.users_jadwal_kegiatan_created_byTousers?.role || null,
        approved_by: jadwal.approved_by,
        approved_by_name: jadwal.users_jadwal_kegiatan_approved_byTousers?.name || null,
        approved_by_role: jadwal.users_jadwal_kegiatan_approved_byTousers?.role || null,
        approved_at: jadwal.approved_at,
        catatan_approval: jadwal.catatan_approval,
        created_at: jadwal.created_at,
        updated_at: jadwal.updated_at
      };

      res.json({
        success: true,
        data: formattedJadwal
      });
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail jadwal',
        error: error.message
      });
    }
  }

  /**
   * Create new jadwal
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
        pic_name,
        pic_contact,
        prioritas,
        kategori,
        anggaran
      } = req.body;

      // Validation
      if (!judul || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({
          success: false,
          message: 'Judul, tanggal mulai, dan tanggal selesai wajib diisi'
        });
      }

      // Check date logic
      if (new Date(tanggal_mulai) >= new Date(tanggal_selesai)) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal selesai harus setelah tanggal mulai'
        });
      }

      const jadwal = await prisma.$queryRaw`
        INSERT INTO jadwal_kegiatan (
          judul, deskripsi, bidang_id, tanggal_mulai, tanggal_selesai,
          lokasi, asal_kegiatan, pic_name, pic_contact, prioritas, kategori, anggaran,
          status, created_by
        ) VALUES (
          ${judul},
          ${deskripsi || '-'},
          ${bidang_id ? parseInt(bidang_id) : null},
          ${tanggal_mulai},
          ${tanggal_selesai},
          ${lokasi || null},
          ${asal_kegiatan || null},
          ${pic_name || null},
          ${pic_contact || null},
          ${prioritas || 'sedang'},
          ${kategori || 'lainnya'},
          ${anggaran || null},
          'draft',
          ${req.user.id}
        )
      `;

      res.status(201).json({
        success: true,
        message: 'Jadwal kegiatan berhasil dibuat',
        data: { id: jadwal.insertId }
      });
    } catch (error) {
      console.error('Error creating jadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat jadwal kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Update jadwal
   */
  async updateJadwal(req, res) {
    try {
      const { id } = req.params;
      const {
        judul,
        deskripsi,
        bidang_id,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        asal_kegiatan,
        pic_name,
        pic_contact,
        prioritas,
        kategori,
        anggaran,
        status
      } = req.body;

      // Check if jadwal exists
      const existing = await prisma.$queryRaw`
        SELECT * FROM jadwal_kegiatan WHERE id = ${parseInt(id)}
      `;

      if (!existing || existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal tidak ditemukan'
        });
      }

      // Build update query
      const updates = [];
      if (judul !== undefined) updates.push(`judul = '${judul}'`);
      if (deskripsi !== undefined) updates.push(`deskripsi = '${deskripsi}'`);
      if (bidang_id !== undefined) updates.push(`bidang_id = ${bidang_id ? parseInt(bidang_id) : null}`);
      if (tanggal_mulai !== undefined) updates.push(`tanggal_mulai = '${tanggal_mulai}'`);
      if (tanggal_selesai !== undefined) updates.push(`tanggal_selesai = '${tanggal_selesai}'`);
      if (lokasi !== undefined) updates.push(`lokasi = '${lokasi}'`);
      if (asal_kegiatan !== undefined) updates.push(`asal_kegiatan = '${asal_kegiatan}'`);
      if (pic_name !== undefined) updates.push(`pic_name = '${pic_name}'`);
      if (pic_contact !== undefined) updates.push(`pic_contact = '${pic_contact}'`);
      if (prioritas !== undefined) updates.push(`prioritas = '${prioritas}'`);
      if (kategori !== undefined) updates.push(`kategori = '${kategori}'`);
      if (anggaran !== undefined) updates.push(`anggaran = ${anggaran || null}`);
      if (status !== undefined) updates.push(`status = '${status}'`);

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada data yang diupdate'
        });
      }

      await prisma.$executeRaw`
        UPDATE jadwal_kegiatan 
        SET ${prisma.Prisma.raw(updates.join(', '))}
        WHERE id = ${parseInt(id)}
      `;

      res.json({
        success: true,
        message: 'Jadwal kegiatan berhasil diupdate'
      });
    } catch (error) {
      console.error('Error updating jadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate jadwal',
        error: error.message
      });
    }
  }

  /**
   * Approve/Reject jadwal (Kepala Dinas, Sekretaris Dinas)
   */
  async approveJadwal(req, res) {
    try {
      const { id } = req.params;
      const { status, catatan_approval } = req.body;

      // Check permission
      if (!['kepala_dinas', 'sekretaris_dinas', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk approve jadwal'
        });
      }

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus approved atau rejected'
        });
      }

      await prisma.$executeRaw`
        UPDATE jadwal_kegiatan 
        SET 
          status = ${status},
          approved_by = ${req.user.id},
          approved_at = NOW(),
          catatan_approval = ${catatan_approval || null}
        WHERE id = ${parseInt(id)}
      `;

      res.json({
        success: true,
        message: `Jadwal berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
      });
    } catch (error) {
      console.error('Error approving jadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memproses approval',
        error: error.message
      });
    }
  }

  /**
   * Delete jadwal
   */
  async deleteJadwal(req, res) {
    try {
      const { id } = req.params;

      // Check if exists
      const existing = await prisma.$queryRaw`
        SELECT * FROM jadwal_kegiatan WHERE id = ${parseInt(id)}
      `;

      if (!existing || existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Jadwal tidak ditemukan'
        });
      }

      await prisma.$executeRaw`
        DELETE FROM jadwal_kegiatan WHERE id = ${parseInt(id)}
      `;

      res.json({
        success: true,
        message: 'Jadwal berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus jadwal',
        error: error.message
      });
    }
  }

  /**
   * Get calendar view (grouped by date)
   */
  async getCalendarView(req, res) {
    try {
      const { month, year, bidang_id } = req.query;
      
      const userRole = req.user.role;
      const userBidangId = req.user.bidang_id;

      let whereClause = '';
      
      // Role-based filtering
      if (['kepala_bidang', 'ketua_tim', 'pegawai'].includes(userRole) && userBidangId) {
        whereClause = `WHERE bidang_id = ${userBidangId}`;
      } else if (bidang_id) {
        whereClause = `WHERE bidang_id = ${parseInt(bidang_id)}`;
      }

      // Add month/year filter
      if (month && year) {
        const monthFilter = `AND MONTH(tanggal_mulai) = ${parseInt(month)} AND YEAR(tanggal_mulai) = ${parseInt(year)}`;
        whereClause += whereClause ? ` ${monthFilter}` : `WHERE ${monthFilter}`;
      }

      const jadwals = await prisma.$queryRawUnsafe(`
        SELECT 
          jk.*,
          b.nama as bidang_nama
        FROM jadwal_kegiatan jk
        LEFT JOIN bidangs b ON jk.bidang_id = b.id
        ${whereClause}
        ORDER BY jk.tanggal_mulai ASC
      `);

      res.json({
        success: true,
        data: jadwals
      });
    } catch (error) {
      console.error('Error fetching calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kalender',
        error: error.message
      });
    }
  }
}

module.exports = new JadwalKegiatanController();
