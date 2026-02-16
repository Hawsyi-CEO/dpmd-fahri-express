const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const ActivityLogger = require('../utils/activityLogger');
const fs = require('fs');
const path = require('path');

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
      const { status, kecamatan_id, desa_id, tahun_anggaran } = req.query;

      // Build query filters
      const whereClause = {
        submitted_to_dpmd: true,
        kecamatan_status: 'approved', // Only show if Kecamatan approved
        dinas_status: 'approved' // Only show if Dinas approved
      };

      // Filter by tahun_anggaran if provided
      if (tahun_anggaran) {
        whereClause.tahun_anggaran = parseInt(tahun_anggaran);
      }

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
          users_bankeu_proposals_kecamatan_verified_byTousers: {
            select: {
              id: true,
              name: true
            }
          },
          users_bankeu_proposals_dpmd_verified_byTousers: {
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

      // Get kegiatan info and surat desa for each proposal
      const proposalsWithKegiatan = await Promise.all(
        proposals.map(async (proposal) => {
          const kegiatan = await prisma.bankeu_master_kegiatan.findUnique({
            where: { id: proposal.kegiatan_id }
          });
          
          // Get surat pengantar & permohonan from desa
          const suratDesa = await prisma.desa_bankeu_surat.findFirst({
            where: {
              desa_id: proposal.desa_id,
              tahun: new Date().getFullYear()
            }
          });
          
          return {
            ...proposal,
            bankeu_master_kegiatan: kegiatan,
            surat_pengantar_desa: suratDesa?.surat_pengantar || null,
            surat_permohonan_desa: suratDesa?.surat_permohonan || null
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
          users_bankeu_proposals_kecamatan_verified_byTousers: {
            select: {
              id: true,
              name: true
            }
          },
          users_bankeu_proposals_dpmd_verified_byTousers: {
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
      if (!['approved', 'rejected', 'revision', 'revisi_dokumen_kecamatan'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action tidak valid. Gunakan: approved, rejected, revision, atau revisi_dokumen_kecamatan'
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

      // REVISI DOKUMEN KECAMATAN: Only send back to kecamatan to regenerate BA/SP
      // Keeps kecamatan_status = 'approved', only resets dpmd submission and clears BA/SP paths
      if (action === 'revisi_dokumen_kecamatan') {
        logger.info(`📄 DPMD requesting BA/SP revision for proposal ${id} → back to Kecamatan`);

        await prisma.bankeu_proposals.update({
          where: { id: BigInt(id) },
          data: {
            dpmd_status: 'revision',
            dpmd_catatan: catatan || 'Revisi Surat Pengantar dan/atau Berita Acara Kecamatan',
            dpmd_verified_by: BigInt(userId),
            dpmd_verified_at: new Date(),
            // Return to Kecamatan - only reset DPMD submission
            submitted_to_dpmd: false,
            submitted_to_dpmd_at: null,
            // Clear BA & SP paths so kecamatan must regenerate
            berita_acara_path: null,
            berita_acara_generated_at: null,
            surat_pengantar: null,
            // Keep kecamatan_status = 'approved' so kecamatan can directly regenerate
            // Keep dinas_status intact
            // Keep status as-is (not resetting to desa)
          }
        });

        logger.info(`✅ DPMD returned proposal ${id} to Kecamatan for BA/SP revision`);

        // Activity Log
        ActivityLogger.log({
          userId: userId,
          userName: req.user.name || `User ${userId}`,
          userRole: req.user.role,
          bidangId: 3,
          module: 'bankeu',
          action: 'revision',
          entityType: 'bankeu_proposal',
          entityId: parseInt(id),
          entityName: `Proposal #${id}`,
          description: `DPMD/SPKED (${req.user.name || 'User'}) meminta revisi dokumen Kecamatan untuk proposal #${id} (Desa ID: ${proposal.desa_id})`,
          newValue: { dpmd_status: 'revision', revision_type: 'dokumen_kecamatan', catatan: catatan || null },
          ipAddress: ActivityLogger.getIpFromRequest(req),
          userAgent: ActivityLogger.getUserAgentFromRequest(req)
        });

        return res.json({
          success: true,
          message: 'Proposal dikembalikan ke Kecamatan untuk revisi Surat Pengantar dan Berita Acara',
          data: {
            id,
            dpmd_status: 'revision',
            returned_to: 'kecamatan',
            revision_type: 'dokumen_kecamatan'
          }
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

        // Activity Log
        ActivityLogger.log({
          userId: userId,
          userName: req.user.name || `User ${userId}`,
          userRole: req.user.role,
          bidangId: 3,
          module: 'bankeu',
          action: action === 'rejected' ? 'reject' : 'revision',
          entityType: 'bankeu_proposal',
          entityId: parseInt(id),
          entityName: `Proposal #${id}`,
          description: `DPMD/SPKED (${req.user.name || 'User'}) ${action === 'rejected' ? 'menolak' : 'meminta revisi'} proposal #${id} (Desa ID: ${proposal.desa_id})`,
          oldValue: { dpmd_status: proposal.dpmd_status, status: proposal.status },
          newValue: { dpmd_status: action, catatan: catatan || null, returned_to: 'desa' },
          ipAddress: ActivityLogger.getIpFromRequest(req),
          userAgent: ActivityLogger.getUserAgentFromRequest(req)
        });

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

      // Activity Log
      ActivityLogger.log({
        userId: userId,
        userName: req.user.name || `User ${userId}`,
        userRole: req.user.role,
        bidangId: 3,
        module: 'bankeu',
        action: 'approve',
        entityType: 'bankeu_proposal',
        entityId: parseInt(id),
        entityName: `Proposal #${id}`,
        description: `DPMD/SPKED (${req.user.name || 'User'}) FINAL APPROVED proposal #${id} (Desa ID: ${proposal.desa_id})`,
        newValue: { dpmd_status: 'approved', status: 'verified' },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

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
      const { tahun_anggaran } = req.query;
      const tahunFilter = tahun_anggaran ? { tahun_anggaran: parseInt(tahun_anggaran) } : {};

      const totalProposals = await prisma.bankeu_proposals.count({
        where: {
          submitted_to_dpmd: true,
          kecamatan_status: 'approved',
          ...tahunFilter
        }
      });

      const pending = await prisma.bankeu_proposals.count({
        where: {
          submitted_to_dpmd: true,
          kecamatan_status: 'approved',
          ...tahunFilter,
          OR: [
            { dpmd_status: null },
            { dpmd_status: 'pending' }
          ]
        }
      });

      const approved = await prisma.bankeu_proposals.count({
        where: {
          dpmd_status: 'approved',
          ...tahunFilter
        }
      });

      const rejected = await prisma.bankeu_proposals.count({
        where: {
          dpmd_status: {
            in: ['rejected', 'revision']
          },
          ...tahunFilter
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

  /**
   * Delete proposal by DPMD (for troubleshooting)
   * DELETE /api/dpmd/bankeu/proposals/:id
   */
  async deleteProposal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      logger.info(`🗑️ DPMD DELETE - Proposal ID: ${id}, User: ${userId}`);

      // Check if proposal exists
      const proposal = await prisma.bankeu_proposals.findUnique({
        where: { id: BigInt(id) },
        include: {
          desas: true
        }
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Proposal tidak ditemukan'
        });
      }

      // Delete related questionnaires first
      await prisma.bankeu_verification_questionnaires.deleteMany({
        where: { proposal_id: BigInt(id) }
      });

      // Delete physical files
      const filesToDelete = [];
      if (proposal.file_proposal) {
        filesToDelete.push(path.join(__dirname, '../../storage/uploads/bankeu', proposal.file_proposal));
      }
      if (proposal.berita_acara_path) {
        filesToDelete.push(path.join(__dirname, '../../storage', proposal.berita_acara_path));
      }
      if (proposal.surat_pengantar) {
        filesToDelete.push(path.join(__dirname, '../../storage', proposal.surat_pengantar));
      }

      filesToDelete.forEach(filePath => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`🗑️ Deleted file: ${filePath}`);
          }
        } catch (err) {
          logger.warn(`⚠️ Failed to delete file: ${filePath}`, err.message);
        }
      });

      // Delete proposal from database
      await prisma.bankeu_proposals.delete({
        where: { id: BigInt(id) }
      });

      logger.info(`✅ DPMD deleted proposal ${id} (${proposal.judul_proposal}) from desa ${proposal.desas?.nama}`);

      // Activity Log - CRITICAL: Track siapa yang hapus
      ActivityLogger.log({
        userId: userId,
        userName: req.user.name || `User ${userId}`,
        userRole: req.user.role,
        bidangId: 3,
        module: 'bankeu',
        action: 'delete',
        entityType: 'bankeu_proposal',
        entityId: parseInt(id),
        entityName: proposal.judul_proposal || `Proposal #${id}`,
        description: `DPMD/SPKED (${req.user.name || 'User'}) MENGHAPUS proposal #${id} "${proposal.judul_proposal}" dari Desa ${proposal.desas?.nama || 'Unknown'} (ID: ${proposal.desa_id})`,
        oldValue: { judul_proposal: proposal.judul_proposal, desa_id: Number(proposal.desa_id), status: proposal.status, dpmd_status: proposal.dpmd_status },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      return res.json({
        success: true,
        message: `Proposal "${proposal.judul_proposal}" berhasil dihapus`
      });

    } catch (error) {
      logger.error('Error DPMD deleting proposal:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus proposal',
        error: error.message
      });
    }
  }

  /**
   * Delete all proposals from a specific desa (bulk delete for troubleshooting)
   * DELETE /api/dpmd/bankeu/desa/:desaId/proposals
   * Query params: ?all=true to delete proposals at ALL stages (not just submitted_to_dpmd)
   */
  async deleteDesaProposals(req, res) {
    try {
      const { desaId } = req.params;
      const { all } = req.query;
      const userId = req.user.id;
      const deleteAll = all === 'true';

      logger.info(`🗑️ DPMD BULK DELETE - Desa ID: ${desaId}, User: ${userId}, All stages: ${deleteAll}`);

      // Build where clause
      const whereClause = {
        desa_id: BigInt(desaId)
      };
      if (!deleteAll) {
        whereClause.submitted_to_dpmd = true;
      }

      const proposals = await prisma.bankeu_proposals.findMany({
        where: whereClause,
        include: { desas: true }
      });

      if (proposals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada proposal dari desa ini'
        });
      }

      const desaName = proposals[0].desas?.nama || 'Unknown';

      // Delete related questionnaires
      const proposalIds = proposals.map(p => p.id);
      await prisma.bankeu_verification_questionnaires.deleteMany({
        where: { proposal_id: { in: proposalIds } }
      });

      // Delete physical files
      proposals.forEach(proposal => {
        const filesToDelete = [];
        if (proposal.file_proposal) {
          filesToDelete.push(path.join(__dirname, '../../storage/uploads/bankeu', proposal.file_proposal));
        }
        if (proposal.berita_acara_path) {
          filesToDelete.push(path.join(__dirname, '../../storage', proposal.berita_acara_path));
        }
        if (proposal.surat_pengantar) {
          filesToDelete.push(path.join(__dirname, '../../storage', proposal.surat_pengantar));
        }
        filesToDelete.forEach(filePath => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            logger.warn(`⚠️ Failed to delete file: ${filePath}`, err.message);
          }
        });
      });

      // Delete all proposals
      await prisma.bankeu_proposals.deleteMany({
        where: whereClause
      });

      logger.info(`✅ DPMD bulk deleted ${proposals.length} proposals from desa ${desaName} (ID: ${desaId}), all stages: ${deleteAll}`);

      // Activity Log - CRITICAL: Track bulk delete
      ActivityLogger.log({
        userId: userId,
        userName: req.user.name || `User ${userId}`,
        userRole: req.user.role,
        bidangId: 3,
        module: 'bankeu',
        action: 'delete',
        entityType: 'bankeu_proposal',
        entityName: `${proposals.length} proposal Desa ${desaName}`,
        description: `DPMD/SPKED (${req.user.name || 'User'}) BULK DELETE ${proposals.length} proposal dari Desa ${desaName} (ID: ${desaId}, all stages: ${deleteAll})`,
        oldValue: { count: proposals.length, desa_id: parseInt(desaId), desa_nama: desaName, all_stages: deleteAll, proposal_ids: proposals.map(p => Number(p.id)) },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      return res.json({
        success: true,
        message: `${proposals.length} proposal dari Desa ${desaName} berhasil dihapus`
      });

    } catch (error) {
      logger.error('Error DPMD bulk deleting proposals:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus proposal desa',
        error: error.message
      });
    }
  }

  /**
   * Delete surat (pengantar & permohonan) for a specific desa
   * DELETE /api/dpmd/bankeu/desa/:desaId/surat
   */
  async deleteDesaSurat(req, res) {
    try {
      const { desaId } = req.params;
      const userId = req.user.id;

      logger.info(`🗑️ DPMD DELETE SURAT - Desa ID: ${desaId}, User: ${userId}`);

      // Find surat for this desa
      const suratList = await prisma.desa_bankeu_surat.findMany({
        where: { desa_id: BigInt(desaId) },
        include: { desas: true }
      });

      if (suratList.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada surat dari desa ini'
        });
      }

      const desaName = suratList[0].desas?.nama || 'Unknown';

      // Delete physical files
      suratList.forEach(surat => {
        const filesToDelete = [];
        if (surat.surat_pengantar_path) {
          filesToDelete.push(path.join(__dirname, '../../storage', surat.surat_pengantar_path));
        }
        if (surat.surat_permohonan_path) {
          filesToDelete.push(path.join(__dirname, '../../storage', surat.surat_permohonan_path));
        }
        filesToDelete.forEach(filePath => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              logger.info(`🗑️ Deleted surat file: ${filePath}`);
            }
          } catch (err) {
            logger.warn(`⚠️ Failed to delete surat file: ${filePath}`, err.message);
          }
        });
      });

      // Delete surat records
      const deleted = await prisma.desa_bankeu_surat.deleteMany({
        where: { desa_id: BigInt(desaId) }
      });

      logger.info(`✅ DPMD deleted ${deleted.count} surat from desa ${desaName} (ID: ${desaId})`);

      // Activity Log
      ActivityLogger.log({
        userId: userId,
        userName: req.user.name || `User ${userId}`,
        userRole: req.user.role,
        bidangId: 3,
        module: 'bankeu',
        action: 'delete',
        entityType: 'desa_bankeu_surat',
        entityName: `Surat Desa ${desaName}`,
        description: `DPMD/SPKED (${req.user.name || 'User'}) menghapus ${deleted.count} surat dari Desa ${desaName} (ID: ${desaId})`,
        oldValue: { count: deleted.count, desa_id: parseInt(desaId), desa_nama: desaName },
        ipAddress: ActivityLogger.getIpFromRequest(req),
        userAgent: ActivityLogger.getUserAgentFromRequest(req)
      });

      return res.json({
        success: true,
        message: `${deleted.count} surat dari Desa ${desaName} berhasil dihapus`
      });

    } catch (error) {
      logger.error('Error DPMD deleting surat:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus surat desa',
        error: error.message
      });
    }
  }

  /**
   * Get all proposals for tracking view (ALL stages)
   * Shows proposals regardless of dpmd_status or submitted_to_dpmd
   * GET /api/dpmd/bankeu/tracking
   */
  async getTrackingProposals(req, res) {
    try {
      const { tahun_anggaran } = req.query;
      const tahun = tahun_anggaran ? parseInt(tahun_anggaran) : 2027;

      logger.info(`📊 Fetching ALL proposals for tracking (tahun: ${tahun})`);

      // Get ALL proposals for tracking - no status filter
      const proposals = await prisma.bankeu_proposals.findMany({
        where: {
          tahun_anggaran: tahun
        },
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
          users_bankeu_proposals_verified_byTousers: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Get kegiatan info for each proposal
      const proposalsWithKegiatan = await Promise.all(
        proposals.map(async (proposal) => {
          const kegiatan = await prisma.bankeu_master_kegiatan.findUnique({
            where: { id: proposal.kegiatan_id }
          });
          
          // Get desa surat info
          const desaSurat = await prisma.desa_bankeu_surat.findFirst({
            where: { desa_id: proposal.desa_id }
          });

          return {
            ...proposal,
            id: Number(proposal.id),
            desa_id: Number(proposal.desa_id),
            kegiatan_id: Number(proposal.kegiatan_id),
            anggaran_usulan: Number(proposal.anggaran_usulan),
            bankeu_master_kegiatan: kegiatan ? {
              ...kegiatan,
              id: Number(kegiatan.id)
            } : null,
            surat_pengantar_desa: desaSurat?.surat_pengantar || null,
            surat_permohonan_desa: desaSurat?.surat_permohonan || null
          };
        })
      );

      // Calculate tracking summary
      const trackingSummary = {
        total: proposals.length,
        di_desa: proposals.filter(p => !p.submitted_to_dinas_at).length,
        di_dinas: proposals.filter(p => p.submitted_to_dinas_at && (!p.dinas_status || p.dinas_status === 'pending')).length,
        dinas_approved: proposals.filter(p => p.dinas_status === 'approved' && (!p.kecamatan_status || p.kecamatan_status === 'pending')).length,
        di_kecamatan: proposals.filter(p => p.dinas_status === 'approved' && p.submitted_to_kecamatan).length,
        kecamatan_approved: proposals.filter(p => p.kecamatan_status === 'approved').length,
        di_dpmd: proposals.filter(p => p.submitted_to_dpmd).length,
        dpmd_approved: proposals.filter(p => p.dpmd_status === 'approved').length,
        dpmd_rejected: proposals.filter(p => p.dpmd_status === 'rejected').length,
        revision: proposals.filter(p => p.dinas_status === 'revision' || p.kecamatan_status === 'revision' || p.dpmd_status === 'revision').length
      };

      logger.info(`📊 Tracking: ${proposals.length} proposals found for tahun ${tahun}`);

      return res.json({
        success: true,
        data: proposalsWithKegiatan,
        summary: trackingSummary,
        tahun_anggaran: tahun
      });

    } catch (error) {
      logger.error('Error fetching tracking proposals:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data tracking proposal',
        error: error.message
      });
    }
  }
}

module.exports = new DPMDVerificationController();
