const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

// Helper: Check if IP is in Tailscale range (100.64.0.0/10)
const isIPInTailscaleRange = (ip) => {
  // Remove IPv6 prefix if exists (::ffff:127.0.0.1 -> 127.0.0.1)
  const cleanIP = ip.replace(/^::ffff:/, '');
  
  // Allow localhost for development
  if (cleanIP === '127.0.0.1' || cleanIP === 'localhost') {
    return true;
  }
  
  // Parse IP to check if in range 100.64.0.0/10
  const parts = cleanIP.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  // 100.64.0.0/10 means:
  // First octet: 100
  // Second octet: 64-127 (10 bits: 01000000 to 01111111)
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) {
    return true;
  }
  
  return false;
};

// Get comprehensive dashboard statistics
exports.getVPNDashboardStats = async (req, res) => {
  try {
    // Get client IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    logger.info(`VPN Dashboard access attempt from IP: ${clientIP}`);
    
    // Check if IP is in Tailscale range
    if (!isIPInTailscaleRange(clientIP)) {
      logger.warn(`VPN Dashboard access denied for IP: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Halaman ini hanya dapat diakses melalui VPN kantor (Tailscale).',
        clientIP: clientIP,
        hint: 'Pastikan Anda sudah terhubung ke Tailscale VPN.'
      });
    }
    
    logger.info(`VPN Dashboard access granted for IP: ${clientIP}`);
    
    // Fetch all statistics
    const [
      bumdesStats,
      perjadinStats,
      kelembagaanStats,
      beritaStats,
      desaStats
    ] = await Promise.all([
      // BUMDes Statistics
      prisma.bumdes.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Perjalanan Dinas Statistics (last 30 days)
      prisma.kegiatan.findMany({
        where: {
          tanggal_mulai: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          kegiatan_bidang: {
            include: {
              bidangs: true
            }
          }
        }
      }),
      
      // Kelembagaan Statistics
      Promise.all([
        prisma.rws.count(),
        prisma.rts.count(),
        prisma.posyandus.count(),
        prisma.pkks.count(),
        prisma.lpms.count(),
        prisma.karang_tarunas.count(),
        prisma.satlinmas.count()
      ]),
      
      // Berita Statistics
      prisma.berita.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Desa Statistics
      prisma.desas.count()
    ]);
    
    // Process BUMDes stats
    const bumdesTotal = bumdesStats.reduce((sum, item) => sum + item._count, 0);
    const bumdesAktif = bumdesStats.find(s => s.status === 'aktif')?._count || 0;
    const bumdesTotalOmset = await prisma.bumdes.aggregate({
      _sum: { Omset2024: true }
    });
    
    // Process Kelembagaan stats
    const [rwCount, rtCount, posyanduCount, pkkCount, lpmCount, karangTarunaCount, satlinmasCount] = kelembagaanStats;
    
    // Process Berita stats
    const beritaTotal = beritaStats.reduce((sum, item) => sum + item._count, 0);
    const beritaPublished = beritaStats.find(s => s.status === 'published')?._count || 0;
    
    // Build response
    const dashboardData = {
      accessInfo: {
        clientIP: clientIP,
        accessTime: new Date().toISOString(),
        message: 'Akses VPN Dashboard berhasil'
      },
      bumdes: {
        total: bumdesTotal,
        aktif: bumdesAktif,
        tidak_aktif: bumdesTotal - bumdesAktif,
        total_omset_2024: Number(bumdesTotalOmset._sum.Omset2024 || 0)
      },
      perjalanan_dinas: {
        total_kegiatan_30_hari: perjadinStats.length,
        kegiatan_terbaru: perjadinStats.slice(0, 5).map(k => ({
          nama_kegiatan: k.nama_kegiatan,
          tanggal_mulai: k.tanggal_mulai,
          tanggal_selesai: k.tanggal_selesai,
          lokasi: k.lokasi
        }))
      },
      kelembagaan: {
        rw: rwCount,
        rt: rtCount,
        posyandu: posyanduCount,
        pkk: pkkCount,
        lpm: lpmCount,
        karang_taruna: karangTarunaCount,
        satlinmas: satlinmasCount,
        total: rwCount + rtCount + posyanduCount + pkkCount + lpmCount + karangTarunaCount + satlinmasCount
      },
      berita: {
        total: beritaTotal,
        published: beritaPublished,
        draft: beritaTotal - beritaPublished
      },
      desa: {
        total: desaStats
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    logger.error('Error fetching VPN dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check if client IP is allowed (for frontend to check before rendering)
exports.checkVPNAccess = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    const isAllowed = isIPInTailscaleRange(clientIP);
    
    res.json({
      success: true,
      allowed: isAllowed,
      clientIP: clientIP,
      message: isAllowed 
        ? 'VPN akses diizinkan' 
        : 'Akses ditolak. Harap gunakan VPN kantor (Tailscale).'
    });
    
  } catch (error) {
    logger.error('Error checking VPN access:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa akses VPN'
    });
  }
};

// Get detailed BUMDes statistics (same as kepala-dinas but without auth)
exports.getBumdesStats = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress;
    
    if (!isIPInTailscaleRange(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. VPN required.'
      });
    }
    
    // Fetch BUMDes data with aggregations - no relations, bumdes doesn't have desas relation
    const [bumdesList, financialStats, statusCounts, kecamatanStats] = await Promise.all([
      prisma.bumdes.findMany({
        select: {
          id: true,
          namabumdesa: true,
          status: true,
          kecamatan: true,
          desa: true,
          badanhukum: true,
          NIB: true,
          NPWP: true,
          TotalTenagaKerja: true,
          Omset2024: true,
          Laba2024: true,
          NilaiAset: true
        }
      }),
      prisma.bumdes.aggregate({
        _sum: {
          TotalTenagaKerja: true,
          NilaiAset: true,
          Omset2024: true,
          Laba2024: true
        }
      }),
      prisma.bumdes.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.bumdes.groupBy({
        by: ['kecamatan'],
        _count: true,
        _sum: {
          NilaiAset: true,
          Omset2024: true
        }
      })
    ]);
    
    // Process status counts
    const totalBumdes = bumdesList.length;
    const aktif = statusCounts.find(s => s.status === 'aktif')?._count || 0;
    const nonAktif = totalBumdes - aktif;
    const berbadenHukum = bumdesList.filter(b => b.badanhukum && b.badanhukum.trim() !== '').length;
    
    // Process kecamatan data
    const byKecamatan = kecamatanStats.map(ks => ({
      kecamatan: ks.kecamatan || 'Tidak Ada',
      total: ks._count,
      total_aset: Number(ks._sum.NilaiAset || 0),
      total_omzet: Number(ks._sum.Omset2024 || 0)
    }));
    
    res.json({
      success: true,
      data: {
        bumdes: {
          total: totalBumdes,
          aktif,
          non_aktif: nonAktif,
          berbadan_hukum: berbadenHukum,
          by_kecamatan: byKecamatan,
          financials: {
            total_aset: Number(financialStats._sum.NilaiAset || 0),
            total_omzet: Number(financialStats._sum.Omset2024 || 0),
            total_laba: Number(financialStats._sum.Laba2024 || 0),
            total_tenaga_kerja: Number(financialStats._sum.TotalTenagaKerja || 0)
          }
        }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching BUMDes stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data BUMDes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Perjalanan Dinas statistics
exports.getPerjadinStats = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress;
    
    if (!isIPInTailscaleRange(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. VPN required.'
      });
    }
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalKegiatan, kegiatanMingguIni, kegiatanBulanIni, totalPegawai, kegiatanPerBidang] = await Promise.all([
      prisma.kegiatan.count(),
      prisma.kegiatan.count({
        where: {
          tanggal_mulai: { gte: startOfWeek }
        }
      }),
      prisma.kegiatan.count({
        where: {
          tanggal_mulai: { gte: startOfMonth }
        }
      }),
      prisma.pegawai.count(),
      // Fixed: bidangs table has 'id' field, not 'id_bidang', and 'nama' not 'nama_bidang'
      prisma.$queryRaw`
        SELECT b.id, b.nama, COUNT(DISTINCT kb.id_kegiatan) as total_kegiatan
        FROM kegiatan_bidang kb
        JOIN bidangs b ON kb.id_bidang = b.id
        GROUP BY b.id, b.nama
      `
    ]);
    
    res.json({
      success: true,
      data: {
        total_kegiatan: totalKegiatan,
        kegiatan_minggu_ini: kegiatanMingguIni,
        kegiatan_bulan_ini: kegiatanBulanIni,
        total_pegawai: totalPegawai,
        kegiatan_per_bidang: kegiatanPerBidang.map(b => ({
          id_bidang: Number(b.id),
          nama_bidang: b.nama,
          total_kegiatan: Number(b.total_kegiatan)
        }))
      }
    });
    
  } catch (error) {
    logger.error('Error fetching Perjadin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Perjalanan Dinas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Perjalanan Dinas kegiatan list
exports.getPerjadinKegiatan = async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress;
    
    if (!isIPInTailscaleRange(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. VPN required.'
      });
    }
    
    const { limit = 100 } = req.query;
    
    const kegiatan = await prisma.kegiatan.findMany({
      take: parseInt(limit),
      orderBy: {
        tanggal_mulai: 'desc'
      },
      include: {
        kegiatan_bidang: {
          include: {
            bidangs: true
          }
        }
      }
    });
    
    // Format kegiatan details
    const formattedKegiatan = kegiatan.map(k => ({
      id_kegiatan: k.id_kegiatan,
      nama_kegiatan: k.nama_kegiatan,
      nomor_sp: k.nomor_sp,
      tanggal_mulai: k.tanggal_mulai,
      tanggal_selesai: k.tanggal_selesai,
      lokasi: k.lokasi,
      keterangan: k.keterangan,
      details: k.kegiatan_bidang.map(kb => ({
        id_bidang: kb.id_bidang,
        nama_bidang: kb.bidangs?.nama, // Fixed: bidangs has 'nama', not 'nama_bidang'
        // Note: pegawai is stored as TEXT field, not separate junction table
        pegawai_text: kb.pegawai
      }))
    }));
    
    res.json({
      success: true,
      data: formattedKegiatan
    });
    
  } catch (error) {
    logger.error('Error fetching Perjadin kegiatan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kegiatan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
