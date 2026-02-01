const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * DPMD Verification Controller
 * Flow: Desa → Dinas Terkait → Kecamatan → DPMD (Final Approval)
 * Created: 2026-01-30
 */

class DPMDVerificationController {
  /**
   * Get all proposals submitted to DPMD
   * Only show proposals that have been approved by Kecamatan
   * GET /api/dpmd/bankeu/proposals
   */
  async getProposals(req, res) {
    try {
      const { status, kecamatan_id, desa_id } = req.query;

      // Build query filters
      const whereClause = {
        submitted_to_dpmd: true,
        kecamatan_status: 'approved', // Only show if Kecamatan approved
        dinas_status: 'approved' // Only show if Dinas approved
      };

      if (status) {
        whereClause.dpmd_status = status;
      }

      if (desa_id) {
        whereClause.desa_id = BigInt(desa_id);
      }

      // Get proposals
      const proposals = await prisma.bankeu_proposals.findMany({
        where: whereClause,
        include: {
          desas: {
            include: {
              kecamatans: kecamatan_id ? {
                where: { id: parseInt(kecamatan_id) }
              } : true
            }
          },
          users_bankeu_proposals_created_byTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          users_bankeu_kecamatan_verified_by: {
            select: {
              id: true,
              name: true
            }
          },
          users_bankeu_dpmd_verified_by: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          submitted_to_dpmd_at: 'desc'
        }
      });

      // Get kegiatan info for each proposal
      const proposalsWithKegiatan = await Promise.all(
        proposals.map(async (proposal) => {
          const kegiatan = await prisma.bankeu_master_kegiatan.findUnique({
            where: { id: proposal.kegiatan_id }
          });
          return {
            ...proposal,
            bankeu_master_kegiatan: kegiatan
          };
        })
      );

      return res.json({
        success: true,
        data: proposalsWithKegiatan
      });

    } catch (error) {
      logger.error('Error getting DPMD proposals:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data proposal',
        error: error.message
      });
    }
  }

  /**
   * Get single proposal detail for DPMD verification
   * GET /api/dpmd/bankeu/proposals/:id
   */
  async getProposalDetail(req, res) {
    try {
      const { id } = req.params;

      const proposal = await prisma.bankeu_proposals.findUnique({
        where: { id: BigInt(id) },
        include: {
          desas: {
            include: {
              kecamatans: true
            }
          },
          users_bankeu_proposals_created_byTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          users_bankeu_kecamatan_verified_by: {
            select: {
              id: true,
              name: true
            }
          },
          users_bankeu_dpmd_verified_by: {
            select: {
              id: true,
              name: true
            }
          },
          bankeu_verification_questionnaires: {
            where: {
              verifikasi_type: {
                in: ['dinas', 'kecamatan']
              }
            }
          }
        }
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      // Get kegiatan info
      const kegiatan = await prisma.bankeu_master_kegiatan.findUnique({
        where: { id: proposal.kegiatan_id }
      });

      return res.json({
        success: true,
        data: {
          ...proposal,
          bankeu_master_kegiatan: kegiatan,
          kecamatan: proposal.desas?.kecamatans
        }
      });

    } catch (error) {
      logger.error('Error getting proposal detail:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail proposal',
        error: error.message
      });
    }
  }

  /**
   * Verify proposal (Final Approval by DPMD)
   * PUT /api/dpmd/bankeu/proposals/:id/verify
   */
  async verifyProposal(req, res) {
    try {
      const { id } = req.params;
      const { action, catatan } = req.body; // action: 'approved', 'rejected', 'revision'
      const userId = req.user.id;

      logger.info(`🔍 DPMD VERIFY - ID: ${id}, Action: ${action}, User: ${userId}`);

      // Validate action
      if (!['approved', 'rejected', 'revision'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action tidak valid. Gunakan: approved, rejected, atau revision'
        });
      }

      // Check if proposal exists
      const proposal = await prisma.bankeu_proposals.findUnique({
        where: { id: BigInt(id) }
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      // Verify proposal sudah disetujui Kecamatan
      if (proposal.kecamatan_status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Proposal belum disetujui oleh Kecamatan'
        });
      }

      // NEW FLOW: DPMD reject/revision → return to DESA
      if (action === 'rejected' || action === 'revision') {
        logger.info(`⬅️ DPMD returning proposal ${id} to DESA`);

        await prisma.bankeu_proposals.update({
          where: { id: BigInt(id) },
          data: {
            dpmd_status: action,
            dpmd_catatan: catatan || null,
            dpmd_verified_by: BigInt(userId),
            dpmd_verified_at: new Date(),
            // Return to DESA - reset all
            submitted_to_dpmd: false,
            submitted_to_dpmd_at: null,
            submitted_to_kecamatan: false,
            submitted_to_dinas_at: null,
            kecamatan_status: null,
            kecamatan_catatan: null,
            kecamatan_verified_by: null,
            kecamatan_verified_at: null,
            dinas_status: null,
            dinas_catatan: null,
            dinas_verified_by: null,
            dinas_verified_at: null,
            status: action
          }
        });

        logger.info(`✅ DPMD returned proposal ${id} to DESA with status ${action}`);

        return res.json({
          success: true,
          message: `Proposal dikembalikan ke Desa untuk ${action === 'rejected' ? 'diperbaiki' : 'direvisi'}`,
          data: {
            id,
            dpmd_status: action,
            returned_to: 'desa'
          }
        });
      }

      // FINAL APPROVAL by DPMD
      await prisma.bankeu_proposals.update({
        where: { id: BigInt(id) },
        data: {
          dpmd_status: 'approved',
          dpmd_catatan: catatan || null,
          dpmd_verified_by: BigInt(userId),
          dpmd_verified_at: new Date(),
          status: 'verified' // Final status
        }
      });

      logger.info(`✅ DPMD FINAL APPROVED proposal ${id}`);

      res.json({
        success: true,
        message: 'Proposal disetujui oleh DPMD (Final Approval)',
        data: {
          id,
          dpmd_status: 'approved',
          status: 'verified'
        }
      });

    } catch (error) {
      logger.error('Error DPMD verifying proposal:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memverifikasi proposal',
        error: error.message
      });
    }
  }

  /**
   * Get DPMD statistics
   * GET /api/dpmd/bankeu/statistics
   */
  async getStatistics(req, res) {
    try {
      const totalProposals = await prisma.bankeu_proposals.count({
        where: {
          submitted_to_dpmd: true,
          kecamatan_status: 'approved'
        }
      });

      const pending = await prisma.bankeu_proposals.count({
        where: {
          submitted_to_dpmd: true,
          kecamatan_status: 'approved',
          dpmd_status: {
            in: [null, 'pending']
          }
        }
      });

      const approved = await prisma.bankeu_proposals.count({
        where: {
          dpmd_status: 'approved'
        }
      });

      const rejected = await prisma.bankeu_proposals.count({
        where: {
          dpmd_status: {
            in: ['rejected', 'revision']
          }
        }
      });

      return res.json({
        success: true,
        data: {
          total: totalProposals,
          pending,
          approved,
          rejected
        }
      });

    } catch (error) {
      logger.error('Error getting DPMD statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik',
        error: error.message
      });
    }
  }
}

module.exports = new DPMDVerificationController();
