/**
 * Perjadin (Perjalanan Dinas) Controller
 * Manages kegiatan with multiple bidang and pegawai relationships
 */

const prisma = require('../config/prisma');

class PerjadinController {
  /**
   * Get all kegiatan with pagination and filters
   * GET /api/perjadin/kegiatan?page=1&limit=10&search=&id_bidang=&start_date=&end_date=
   */
  async getAllKegiatan(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        id_bidang,
        start_date,
        end_date
      } = req.query;

      console.log('\n🔍 [Perjadin] GET ALL Request');
      console.log('   User:', req.user.id, '- Role:', req.user.role);
      console.log('   Filters:', { page, limit, search, id_bidang, start_date, end_date });

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search filter (nama_kegiatan, nomor_sp, lokasi)
      if (search) {
        where.OR = [
          { nama_kegiatan: { contains: search } },
          { nomor_sp: { contains: search } },
          { lokasi: { contains: search } }
        ];
      }

      // Date range filter (find kegiatan that overlap with the date range)
      // A kegiatan overlaps if: tanggal_mulai <= end_date AND tanggal_selesai >= start_date
      if (start_date || end_date) {
        where.AND = where.AND || [];
        if (start_date && end_date) {
          // Both dates provided: find kegiatan that overlap with this range
          where.AND.push({
            tanggal_mulai: { lte: new Date(end_date + 'T23:59:59.999Z') }
          });
          where.AND.push({
            tanggal_selesai: { gte: new Date(start_date + 'T00:00:00.000Z') }
          });
        } else if (start_date) {
          // Only start_date: find kegiatan that are ongoing or after this date
          where.AND.push({
            tanggal_selesai: { gte: new Date(start_date + 'T00:00:00.000Z') }
          });
        } else if (end_date) {
          // Only end_date: find kegiatan that started before or on this date
          where.AND.push({
            tanggal_mulai: { lte: new Date(end_date + 'T23:59:59.999Z') }
          });
        }
      }

      // Bidang filter (filter kegiatan yang melibatkan bidang tertentu)
      if (id_bidang) {
        where.kegiatan_bidang = {
          some: { id_bidang: BigInt(id_bidang) }
        };
      }

      // Query with pagination
      const [kegiatans, total] = await Promise.all([
        prisma.kegiatan.findMany({
          where,
          include: {
            kegiatan_bidang: {
              include: {
                bidangs: { select: { id: true, nama: true } },
                kegiatan_pegawai: {
                  include: {
                    pegawai: { select: { id_pegawai: true, nama_pegawai: true } }
                  }
                }
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' }
        }),
        prisma.kegiatan.count({ where })
      ]);

      console.log('   ✅ Found', kegiatans.length, 'records out of', total);

      // Format response: calculate bidang & pegawai counts
      const formattedKegiatans = kegiatans.map(k => {
        const totalPegawai = k.kegiatan_bidang.reduce(
          (sum, kb) => sum + kb.kegiatan_pegawai.length,
          0
        );

        return {
          id_kegiatan: k.id_kegiatan,
          nama_kegiatan: k.nama_kegiatan,
          nomor_sp: k.nomor_sp,
          tanggal_mulai: k.tanggal_mulai,
          tanggal_selesai: k.tanggal_selesai,
          lokasi: k.lokasi,
          keterangan: k.keterangan || '-',
          jumlah_bidang: k.kegiatan_bidang.length,
          jumlah_pegawai: totalPegawai,
          created_at: k.created_at,
          updated_at: k.updated_at
        };
      });

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: formattedKegiatans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in getAllKegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kegiatan perjadin',
        error: error.message
      });
    }
  }

  /**
   * Get kegiatan detail by ID with all relationships
   * GET /api/perjadin/kegiatan/:id
   */
  async getKegiatanById(req, res) {
    try {
      const { id } = req.params;

      console.log('\n🔍 [Perjadin] GET BY ID:', id);

      const kegiatan = await prisma.kegiatan.findUnique({
        where: { id_kegiatan: parseInt(id) },
        include: {
          kegiatan_bidang: {
            include: {
              bidangs: { select: { id: true, nama: true } },
              kegiatan_pegawai: {
                include: {
                  pegawai: {
                    select: {
                      id_pegawai: true,
                      nama_pegawai: true,
                      id_bidang: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!kegiatan) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan'
        });
      }

      // Format response with bidang grouped by status
      const formatted = {
        id_kegiatan: kegiatan.id_kegiatan,
        nama_kegiatan: kegiatan.nama_kegiatan,
        nomor_sp: kegiatan.nomor_sp,
        tanggal_mulai: kegiatan.tanggal_mulai,
        tanggal_selesai: kegiatan.tanggal_selesai,
        lokasi: kegiatan.lokasi,
        keterangan: kegiatan.keterangan || '-',
        created_at: kegiatan.created_at,
        updated_at: kegiatan.updated_at,
        bidang: kegiatan.kegiatan_bidang.map(kb => ({
          id_kegiatan_bidang: kb.id_kegiatan_bidang,
          id_bidang: Number(kb.id_bidang),
          nama_bidang: kb.bidangs.nama,
          status: 'aktif',
          pegawai: kb.kegiatan_pegawai.map(kp => ({
            id: Number(kp.id_pegawai),
            nama: kp.pegawai.nama_pegawai,
            status: kp.status
          }))
        }))
      };

      console.log('   ✅ Kegiatan found with', formatted.bidang.length, 'bidang');

      res.json({
        success: true,
        data: formatted
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in getKegiatanById:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail kegiatan',
        error: error.message
      });
    }
  }

  /**
   * Create new kegiatan with bidang and pegawai
   * POST /api/perjadin/kegiatan
   * Body: { nama_kegiatan, nomor_sp, tanggal_mulai, tanggal_selesai, lokasi, keterangan?, bidang: [{ id_bidang, pegawai_ids: [] }] }
   */
  async createKegiatan(req, res) {
    try {
      const {
        nama_kegiatan,
        nomor_sp,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        keterangan,
        bidang
      } = req.body;

      console.log('\n✨ [Perjadin] CREATE Request');
      console.log('   User:', req.user.id, '- Role:', req.user.role);
      console.log('   Data:', { nama_kegiatan, nomor_sp, tanggal_mulai, tanggal_selesai, lokasi });
      console.log('   Bidang:', bidang?.length || 0);

      // Validation
      if (!nama_kegiatan || !nomor_sp || !tanggal_mulai || !tanggal_selesai || !lokasi) {
        return res.status(400).json({
          success: false,
          message: 'Field wajib: nama_kegiatan, nomor_sp, tanggal_mulai, tanggal_selesai, lokasi'
        });
      }

      if (!bidang || bidang.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 1 bidang harus dipilih'
        });
      }

      // Validate each bidang has at least 1 pegawai
      for (const b of bidang) {
        if (!b.pegawai_ids || b.pegawai_ids.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Setiap bidang harus memiliki minimal 1 pegawai'
          });
        }
      }

      // Create with transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create kegiatan
        const newKegiatan = await tx.kegiatan.create({
          data: {
            nama_kegiatan,
            nomor_sp,
            tanggal_mulai: new Date(tanggal_mulai),
            tanggal_selesai: new Date(tanggal_selesai),
            lokasi,
            keterangan: keterangan || null
          }
        });

        console.log('   ✓ Kegiatan created with ID:', newKegiatan.id_kegiatan);

        // 2. Create kegiatan_bidang and kegiatan_pegawai
        for (const b of bidang) {
          const kegiatanBidang = await tx.kegiatan_bidang.create({
            data: {
              id_kegiatan: newKegiatan.id_kegiatan,
              id_bidang: BigInt(b.id_bidang),
              pegawai: '' // Keep empty for backward compatibility
            }
          });

          console.log('   ✓ Created kegiatan_bidang ID:', kegiatanBidang.id_kegiatan_bidang, '- Bidang:', b.id_bidang);

          // 3. Create kegiatan_pegawai entries
          if (b.pegawai_ids && b.pegawai_ids.length > 0) {
            await tx.kegiatan_pegawai.createMany({
              data: b.pegawai_ids.map(pegawai_id => ({
                id_kegiatan: newKegiatan.id_kegiatan,
                id_kegiatan_bidang: kegiatanBidang.id_kegiatan_bidang,
                id_pegawai: BigInt(pegawai_id),
                status: 'aktif'
              }))
            });

            console.log('   ✓ Created', b.pegawai_ids.length, 'kegiatan_pegawai entries');
          }
        }

        return newKegiatan;
      });

      console.log('   ✅ Transaction completed successfully');

      res.status(201).json({
        success: true,
        message: 'Kegiatan perjadin berhasil dibuat',
        data: result
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in createKegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat kegiatan perjadin',
        error: error.message
      });
    }
  }

  /**
   * Update kegiatan
   * PUT /api/perjadin/kegiatan/:id
   * Body: Same as create
   */
  async updateKegiatan(req, res) {
    try {
      const { id } = req.params;
      const {
        nama_kegiatan,
        nomor_sp,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        keterangan,
        bidang
      } = req.body;

      console.log('\n📝 [Perjadin] UPDATE Request for ID:', id);
      console.log('   User:', req.user.id, '- Role:', req.user.role);

      // Check if kegiatan exists
      const existing = await prisma.kegiatan.findUnique({
        where: { id_kegiatan: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan'
        });
      }

      // Validation
      if (!nama_kegiatan || !nomor_sp || !tanggal_mulai || !tanggal_selesai || !lokasi) {
        return res.status(400).json({
          success: false,
          message: 'Field wajib: nama_kegiatan, nomor_sp, tanggal_mulai, tanggal_selesai, lokasi'
        });
      }

      if (!bidang || bidang.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 1 bidang harus dipilih'
        });
      }

      // Update with transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update kegiatan
        const updated = await tx.kegiatan.update({
          where: { id_kegiatan: parseInt(id) },
          data: {
            nama_kegiatan,
            nomor_sp,
            tanggal_mulai: new Date(tanggal_mulai),
            tanggal_selesai: new Date(tanggal_selesai),
            lokasi,
            keterangan: keterangan || null
          }
        });

        // 2. Delete existing kegiatan_pegawai
        await tx.kegiatan_pegawai.deleteMany({
          where: { id_kegiatan: parseInt(id) }
        });

        // 3. Delete existing kegiatan_bidang
        await tx.kegiatan_bidang.deleteMany({
          where: { id_kegiatan: parseInt(id) }
        });

        console.log('   ✓ Cleaned up old bidang & pegawai relations');

        // 4. Create new kegiatan_bidang and kegiatan_pegawai
        for (const b of bidang) {
          if (!b.pegawai_ids || b.pegawai_ids.length === 0) {
            continue; // Skip bidang without pegawai
          }

          const kegiatanBidang = await tx.kegiatan_bidang.create({
            data: {
              id_kegiatan: parseInt(id),
              id_bidang: BigInt(b.id_bidang),
              pegawai: ''
            }
          });

          await tx.kegiatan_pegawai.createMany({
            data: b.pegawai_ids.map(pegawai_id => ({
              id_kegiatan: parseInt(id),
              id_kegiatan_bidang: kegiatanBidang.id_kegiatan_bidang,
              id_pegawai: BigInt(pegawai_id),
              status: 'aktif'
            }))
          });

          console.log('   ✓ Created new bidang & pegawai relations for bidang:', b.id_bidang);
        }

        return updated;
      });

      console.log('   ✅ Update completed successfully');

      res.json({
        success: true,
        message: 'Kegiatan perjadin berhasil diperbarui',
        data: result
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in updateKegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui kegiatan perjadin',
        error: error.message
      });
    }
  }

  /**
   * Delete kegiatan (cascade delete bidang & pegawai)
   * DELETE /api/perjadin/kegiatan/:id
   */
  async deleteKegiatan(req, res) {
    try {
      const { id } = req.params;

      console.log('\n🗑️ [Perjadin] DELETE Request for ID:', id);
      console.log('   User:', req.user.id, '- Role:', req.user.role);

      const existing = await prisma.kegiatan.findUnique({
        where: { id_kegiatan: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan'
        });
      }

      // Delete (cascade will handle kegiatan_bidang and kegiatan_pegawai)
      await prisma.kegiatan.delete({
        where: { id_kegiatan: parseInt(id) }
      });

      console.log('   ✅ Kegiatan deleted successfully');

      res.json({
        success: true,
        message: 'Kegiatan perjadin berhasil dihapus'
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in deleteKegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus kegiatan perjadin',
        error: error.message
      });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/perjadin/dashboard
   */
  async getDashboard(req, res) {
    try {
      console.log('\n📊 [Perjadin] GET DASHBOARD Request');
      console.log('   User:', req.user.id, '- Role:', req.user.role);

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Parallel queries for performance
      const [
        total,
        mingguIni,
        bulanIni,
        uniquePegawai,
        breakdownBidang,
        upcomingKegiatan
      ] = await Promise.all([
        // Total kegiatan
        prisma.kegiatan.count(),

        // Kegiatan minggu ini (by tanggal_mulai)
        prisma.kegiatan.count({
          where: {
            tanggal_mulai: { gte: startOfWeek }
          }
        }),

        // Kegiatan bulan ini
        prisma.kegiatan.count({
          where: {
            tanggal_mulai: { gte: startOfMonth }
          }
        }),

        // Total unique pegawai terlibat
        prisma.kegiatan_pegawai.groupBy({
          by: ['id_pegawai']
        }).then(result => result.length),

        // Breakdown per bidang
        prisma.kegiatan_bidang.groupBy({
          by: ['id_bidang'],
          _count: { id_kegiatan: true }
        }),

        // Upcoming kegiatan for calendar (next 7 days)
        prisma.kegiatan.findMany({
          where: {
            tanggal_mulai: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          },
          select: {
            id_kegiatan: true,
            nama_kegiatan: true,
            tanggal_mulai: true,
            tanggal_selesai: true,
            lokasi: true
          },
          orderBy: { tanggal_mulai: 'asc' },
          take: 10
        })
      ]);

      // Enrich bidang names
      const bidangWithNames = await Promise.all(
        breakdownBidang.map(async (b) => {
          try {
            const bidang = await prisma.bidangs.findUnique({
              where: { id: b.id_bidang },
              select: { id: true, nama: true }
            });
            return {
              id_bidang: Number(b.id_bidang),
              nama: bidang?.nama || 'Unknown',
              jumlah: b._count.id_kegiatan
            };
          } catch (error) {
            return { 
              id_bidang: Number(b.id_bidang),
              nama: 'Unknown', 
              jumlah: b._count.id_kegiatan 
            };
          }
        })
      );

      console.log('   ✅ Dashboard stats:', { total, mingguIni, bulanIni, uniquePegawai });

      // Serialize BigInt in upcoming_kegiatan
      const serializedUpcoming = upcomingKegiatan.map(k => ({
        id_kegiatan: k.id_kegiatan,
        nama_kegiatan: k.nama_kegiatan,
        tanggal_mulai: k.tanggal_mulai,
        tanggal_selesai: k.tanggal_selesai,
        lokasi: k.lokasi
      }));

      res.json({
        success: true,
        data: {
          total,
          minggu_ini: mingguIni,
          bulan_ini: bulanIni,
          total_pegawai: uniquePegawai,
          breakdown_per_bidang: bidangWithNames.sort((a, b) => b.jumlah - a.jumlah),
          upcoming_kegiatan: serializedUpcoming
        }
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in getDashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data dashboard',
        error: error.message
      });
    }
  }

  /**
   * Export kegiatan to Excel
   * GET /api/perjadin/export?format=xlsx&filters=...
   */
  async exportKegiatan(req, res) {
    try {
      console.log('\n📤 [Perjadin] EXPORT Request');

      // Get all kegiatan with filters (similar to getAllKegiatan but without pagination)
      const {
        search = '',
        id_bidang,
        start_date,
        end_date
      } = req.query;

      const where = {};

      if (search) {
        where.OR = [
          { nama_kegiatan: { contains: search } },
          { nomor_sp: { contains: search } },
          { lokasi: { contains: search } }
        ];
      }

      if (start_date || end_date) {
        where.AND = where.AND || [];
        if (start_date) {
          where.AND.push({ tanggal_mulai: { gte: new Date(start_date) } });
        }
        if (end_date) {
          where.AND.push({ tanggal_selesai: { lte: new Date(end_date) } });
        }
      }

      if (id_bidang) {
        where.kegiatan_bidang = {
          some: { id_bidang: BigInt(id_bidang) }
        };
      }

      const kegiatans = await prisma.kegiatan.findMany({
        where,
        include: {
          kegiatan_bidang: {
            include: {
              bidangs: { select: { nama: true } },
              kegiatan_pegawai: {
                include: {
                  pegawai: { select: { nama_pegawai: true } }
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Format for Excel (simple JSON for now, can be enhanced with xlsx library)
      const exportData = kegiatans.map((k, index) => {
        const bidangList = k.kegiatan_bidang.map(kb => kb.bidangs.nama).join(', ');
        const pegawaiList = k.kegiatan_bidang.flatMap(kb =>
          kb.kegiatan_pegawai.map(kp => kp.pegawai.nama_pegawai)
        ).join(', ');

        return {
          No: index + 1,
          'Nomor SP': k.nomor_sp,
          'Nama Kegiatan': k.nama_kegiatan,
          'Tanggal Mulai': k.tanggal_mulai.toISOString().split('T')[0],
          'Tanggal Selesai': k.tanggal_selesai.toISOString().split('T')[0],
          'Lokasi': k.lokasi,
          'Keterangan': k.keterangan || '-',
          'Bidang Terlibat': bidangList,
          'Pegawai Terlibat': pegawaiList,
          'Jumlah Bidang': k.kegiatan_bidang.length,
          'Jumlah Pegawai': k.kegiatan_bidang.reduce((sum, kb) => sum + kb.kegiatan_pegawai.length, 0)
        };
      });

      console.log('   ✅ Exported', exportData.length, 'records');

      // For now, return JSON. Frontend can use xlsx library to convert to Excel
      res.json({
        success: true,
        data: exportData,
        total: exportData.length
      });
    } catch (error) {
      console.error('❌ [Perjadin] Error in exportKegiatan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal export kegiatan',
        error: error.message
      });
    }
  }
}

module.exports = new PerjadinController();
