// src/controllers/bankeuPublic.controller.js
// Public controller for Bantuan Keuangan - NO AUTH REQUIRED
// Returns aggregate/safe data only for public transparency page

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

class BankeuPublicController {
  /**
   * GET /api/public/bankeu/tracking-summary
   * Returns aggregate proposal tracking data (safe for public)
   * Query: ?tahun_anggaran=2027
   */
  async getTrackingSummary(req, res) {
    try {
      const { tahun_anggaran } = req.query;
      const tahun = tahun_anggaran ? parseInt(tahun_anggaran) : 2027;

      logger.info(`[PUBLIC] Fetching bankeu tracking summary for tahun ${tahun}`);

      const proposals = await prisma.bankeu_proposals.findMany({
        where: { tahun_anggaran: tahun },
        select: {
          id: true,
          desa_id: true,
          kegiatan_id: true,
          anggaran_usulan: true,
          dinas_status: true,
          kecamatan_status: true,
          dpmd_status: true,
          submitted_to_dinas_at: true,
          submitted_to_kecamatan: true,
          submitted_to_dpmd: true,
          created_at: true,
          desas: {
            select: {
              nama: true,
              kecamatans: {
                select: { nama: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Get kegiatan info (direct FK + many-to-many pivot)
      const kegiatanIds = [...new Set(proposals.map(p => p.kegiatan_id).filter(Boolean))];
      const allKegiatan = await prisma.bankeu_master_kegiatan.findMany({
        select: { id: true, nama_kegiatan: true, dinas_terkait: true }
      });
      const kegiatanMap = {};
      allKegiatan.forEach(k => { kegiatanMap[Number(k.id)] = k; });

      // Get pivot table kegiatan for proposals without direct kegiatan_id
      const proposalIdsWithoutKegiatan = proposals.filter(p => !p.kegiatan_id).map(p => p.id);
      let pivotMap = {};
      if (proposalIdsWithoutKegiatan.length > 0) {
        const pivots = await prisma.bankeu_proposal_kegiatan.findMany({
          where: { proposal_id: { in: proposalIdsWithoutKegiatan } },
          select: { proposal_id: true, kegiatan_id: true }
        });
        pivots.forEach(pv => {
          const kid = Number(pv.kegiatan_id);
          if (!pivotMap[Number(pv.proposal_id)]) pivotMap[Number(pv.proposal_id)] = kegiatanMap[kid];
        });
      }

      // Calculate stages
      const getStage = (p) => {
        if (p.dpmd_status === 'approved') return 'selesai';
        if (p.submitted_to_dpmd) return 'di_dpmd';
        if (p.kecamatan_status === 'approved') return 'di_dpmd';
        if (p.submitted_to_kecamatan && p.dinas_status === 'approved') return 'di_kecamatan';
        if (p.dinas_status === 'approved') return 'di_kecamatan';
        if (p.submitted_to_dinas_at) return 'di_dinas';
        return 'di_desa';
      };

      // Build summary
      const summary = {
        total: proposals.length,
        di_desa: 0,
        di_dinas: 0,
        di_kecamatan: 0,
        di_dpmd: 0,
        selesai: 0,
        total_anggaran: 0
      };

      // Build kecamatan aggregation 
      const kecamatanAgg = {};

      // Build sanitized proposal list (public-safe)
      const publicProposals = proposals.map(p => {
        const stage = getStage(p);
        const anggaran = Number(p.anggaran_usulan) || 0;
        const kegiatan = kegiatanMap[Number(p.kegiatan_id)] || pivotMap[Number(p.id)];

        // Update summary
        summary[stage] = (summary[stage] || 0) + 1;
        summary.total_anggaran += anggaran;

        // Update kecamatan agg
        const kecName = p.desas?.kecamatans?.nama || 'Lainnya';
        const desaName = p.desas?.nama || 'Lainnya';

        if (!kecamatanAgg[kecName]) {
          kecamatanAgg[kecName] = { count: 0, total: 0, desas: {} };
        }
        kecamatanAgg[kecName].count += 1;
        kecamatanAgg[kecName].total += anggaran;

        if (!kecamatanAgg[kecName].desas[desaName]) {
          kecamatanAgg[kecName].desas[desaName] = { count: 0, total: 0, stage: stage };
        }
        kecamatanAgg[kecName].desas[desaName].count += 1;
        kecamatanAgg[kecName].desas[desaName].total += anggaran;

        return {
          kecamatan: kecName,
          desa: desaName,
          kegiatan: kegiatan?.nama_kegiatan || '-',
          dinas_terkait: kegiatan?.dinas_terkait || '-',
          anggaran: anggaran,
          stage: stage
        };
      });

      logger.info(`[PUBLIC] Tracking summary: ${proposals.length} proposals for tahun ${tahun}`);

      return res.json({
        success: true,
        summary,
        proposals: publicProposals,
        kecamatan: kecamatanAgg,
        tahun_anggaran: tahun
      });

    } catch (error) {
      logger.error('Error fetching public tracking summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data tracking'
      });
    }
  }

  /**
   * GET /api/public/bankeu/available-years
   * Returns list of years that have proposal data
   */
  async getAvailableYears(req, res) {
    try {
      const years = await prisma.bankeu_proposals.findMany({
        select: { tahun_anggaran: true },
        distinct: ['tahun_anggaran'],
        orderBy: { tahun_anggaran: 'desc' }
      });

      return res.json({
        success: true,
        years: years.map(y => y.tahun_anggaran)
      });
    } catch (error) {
      logger.error('Error fetching available years:', error);
      return res.json({ success: true, years: [2027, 2026] });
    }
  }
}

module.exports = new BankeuPublicController();
