const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all proposals for a specific dinas
 * Filters proposals based on the dinas_terkait field in master_kegiatan
 */
const getDinasProposals = async (req, res) => {
  try {
    const { dinas_id } = req.user; // dari JWT token

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    // Get dinas kode
    const dinas = await prisma.master_dinas.findUnique({
      where: { id: dinas_id }
    });

    if (!dinas) {
      return res.status(404).json({
        success: false,
        message: 'Dinas tidak ditemukan'
      });
    }

    // Get proposals where kegiatan.dinas_terkait contains this dinas kode
    // Show ALL proposals that:
    // 1. Submitted to Dinas (submitted_to_dinas_at IS NOT NULL)
    // 2. Related to this dinas based on kegiatan.dinas_terkait
    const proposals = await prisma.$queryRaw`
      SELECT 
        bp.*,
        d.nama as nama_desa,
        d.kecamatan_id,
        k.nama as nama_kecamatan,
        bmk.nama_kegiatan,
        bmk.jenis_kegiatan,
        bmk.dinas_terkait,
        u.name as created_by_name,
        u_verifier.name as dinas_verifier_name
      FROM bankeu_proposals bp
      INNER JOIN desas d ON bp.desa_id = d.id
      INNER JOIN kecamatans k ON d.kecamatan_id = k.id
      INNER JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
      LEFT JOIN users u ON bp.created_by = u.id
      LEFT JOIN users u_verifier ON bp.dinas_verified_by = u_verifier.id
      WHERE FIND_IN_SET(${dinas.kode_dinas}, bmk.dinas_terkait) > 0
        AND bp.submitted_to_dinas_at IS NOT NULL
      ORDER BY bp.created_at DESC
    `;

    return res.json({
      success: true,
      data: proposals,
      dinas_info: {
        kode: dinas.kode_dinas,
        nama: dinas.nama_dinas,
        singkatan: dinas.singkatan
      }
    });

  } catch (error) {
    console.error('Error getting dinas proposals:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data proposal',
      error: error.message
    });
  }
};

/**
 * Get single proposal detail for dinas verification
 */
const getDinasProposalDetail = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { dinas_id } = req.user;

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    const dinas = await prisma.master_dinas.findUnique({
      where: { id: dinas_id }
    });

    const proposal = await prisma.bankeu_proposals.findUnique({
      where: { id: BigInt(proposalId) },
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

    // Verify this dinas has access to this kegiatan
    if (!kegiatan.dinas_terkait || !kegiatan.dinas_terkait.includes(dinas.kode_dinas)) {
      return res.status(403).json({
        success: false,
        message: 'Dinas tidak memiliki akses ke kegiatan ini'
      });
    }

    return res.json({
      success: true,
      data: {
        ...proposal,
        bankeu_master_kegiatan: kegiatan,
        kecamatan: proposal.desas?.kecamatans
      }
    });

  } catch (error) {
    console.error('Error getting proposal detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail proposal',
      error: error.message
    });
  }
};

/**
 * Save or update questionnaire (draft)
 */
const saveQuestionnaire = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { dinas_id, id: user_id } = req.user;
    const { answers, catatan_umum } = req.body;

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    // Check if proposal exists
    const proposal = await prisma.bankeu_proposals.findUnique({
      where: { id: BigInt(proposalId) }
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal tidak ditemukan'
      });
    }

    // Convert answers array to q1-q13 format
    const questionnaireData = {
      proposal_id: BigInt(proposalId),
      verifikasi_type: 'dinas',
      dinas_id: dinas_id,
      status: 'draft'
    };

    // Map answers to q1-q13 fields
    if (answers && Array.isArray(answers)) {
      answers.forEach(answer => {
        const qNum = answer.question_id;
        questionnaireData[`q${qNum}`] = answer.is_compliant;
        questionnaireData[`q${qNum}_keterangan`] = answer.catatan || null;
      });
    }

    // Upsert questionnaire - need unique constraint
    // Since there's no unique constraint, we need to find and update or create
    const existing = await prisma.bankeu_verification_questionnaires.findFirst({
      where: {
        proposal_id: BigInt(proposalId),
        verifikasi_type: 'dinas',
        dinas_id: dinas_id
      }
    });

    let questionnaire;
    if (existing) {
      questionnaire = await prisma.bankeu_verification_questionnaires.update({
        where: { id: existing.id },
        data: {
          ...questionnaireData,
          updated_at: new Date()
        }
      });
    } else {
      questionnaire = await prisma.bankeu_verification_questionnaires.create({
        data: questionnaireData
      });
    }

    // Update proposal dinas_status to in_review
    await prisma.bankeu_proposals.update({
      where: { id: BigInt(proposalId) },
      data: {
        dinas_status: 'in_review'
      }
    });

    return res.json({
      success: true,
      message: 'Questionnaire berhasil disimpan sebagai draft',
      data: questionnaire
    });

  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan questionnaire',
      error: error.message
    });
  }
};

/**
 * Submit questionnaire and verify proposal
 */
const submitVerification = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { dinas_id, id: user_id } = req.user;
    const { action, answers, catatan_umum } = req.body; // action: 'approved' | 'rejected' | 'revision'

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    // Validate action
    if (!['approved', 'rejected', 'revision'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action tidak valid. Harus: approved, rejected, atau revision'
      });
    }

    // Check if proposal exists
    const proposal = await prisma.bankeu_proposals.findUnique({
      where: { id: BigInt(proposalId) }
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal tidak ditemukan'
      });
    }

    // Convert answers array to q1-q13 format
    const questionnaireData = {
      proposal_id: BigInt(proposalId),
      verifikasi_type: 'dinas',
      dinas_id: dinas_id,
      status: 'submitted'
    };

    // Map answers to q1-q13 fields
    if (answers && Array.isArray(answers)) {
      answers.forEach(answer => {
        const qNum = answer.question_id;
        questionnaireData[`q${qNum}`] = answer.is_compliant;
        questionnaireData[`q${qNum}_keterangan`] = answer.catatan || null;
      });
    }

    // Set overall recommendation based on action
    if (action === 'approved') {
      questionnaireData.overall_recommendation = 'disetujui';
    } else if (action === 'rejected') {
      questionnaireData.overall_recommendation = 'ditolak';
    } else {
      questionnaireData.overall_recommendation = 'revisi';
    }

    // Find and update or create questionnaire
    const existing = await prisma.bankeu_verification_questionnaires.findFirst({
      where: {
        proposal_id: BigInt(proposalId),
        verifikasi_type: 'dinas',
        dinas_id: dinas_id
      }
    });

    let questionnaire;
    if (existing) {
      questionnaire = await prisma.bankeu_verification_questionnaires.update({
        where: { id: existing.id },
        data: {
          ...questionnaireData,
          updated_at: new Date()
        }
      });
    } else {
      questionnaire = await prisma.bankeu_verification_questionnaires.create({
        data: questionnaireData
      });
    }

    // NEW FLOW (2026-01-30): Desa → Dinas → Kecamatan → DPMD
    // - approved → kirim ke KECAMATAN (submitted_to_kecamatan=TRUE, kecamatan_status='pending')
    // - rejected/revision → RETURN TO DESA (reset submitted_to_dinas_at=NULL)
    // STATUS tetap 'pending' sampai DPMD approve (final)
    const updatedProposal = await prisma.bankeu_proposals.update({
      where: { id: BigInt(proposalId) },
      data: {
        dinas_status: action,
        dinas_verified_by: parseInt(user_id),
        dinas_verified_at: new Date(),
        dinas_catatan: catatan_umum || null,
        // If approved → send to KECAMATAN
        submitted_to_kecamatan: action === 'approved' ? true : false,
        kecamatan_status: action === 'approved' ? 'pending' : null,
        // If rejected/revision → RETURN TO DESA
        submitted_to_dinas_at: action === 'approved' ? proposal.submitted_to_dinas_at : null,
        // Status TETAP pending sampai DPMD approve
        status: action === 'approved' ? 'pending' : action
      }
    });

    let message = '';
    if (action === 'approved') {
      message = 'Verifikasi disetujui. Proposal diteruskan ke Kecamatan.';
    } else if (action === 'rejected') {
      message = 'Verifikasi ditolak. Proposal dikembalikan ke Desa.';
    } else {
      message = 'Verifikasi perlu revisi. Proposal dikembalikan ke Desa.';
    }

    return res.json({
      success: true,
      message,
      data: {
        proposal: updatedProposal,
        questionnaire,
        returned_to: action === 'approved' ? 'kecamatan' : 'desa'
      }
    });

  } catch (error) {
    console.error('Error submitting verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal submit verifikasi',
      error: error.message
    });
  }
};

/**
 * Get questionnaire by proposal ID
 */
const getQuestionnaire = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { dinas_id } = req.user;

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    // Standard questions for dinas verification
    const standardQuestions = [
      { id: 1, question_text: 'Apakah proposal sesuai dengan kewenangan dinas?' },
      { id: 2, question_text: 'Apakah rencana teknis kegiatan layak dan dapat dilaksanakan?' },
      { id: 3, question_text: 'Apakah RAB (Rencana Anggaran Biaya) realistis dan sesuai standar?' },
      { id: 4, question_text: 'Apakah lokasi kegiatan sesuai dengan data yang diajukan?' },
      { id: 5, question_text: 'Apakah spesifikasi teknis memenuhi standar minimal?' },
      { id: 6, question_text: 'Apakah volume pekerjaan sesuai dengan kondisi lapangan?' },
      { id: 7, question_text: 'Apakah gambar desain/DED tersedia dan sesuai?' },
      { id: 8, question_text: 'Apakah analisa harga satuan menggunakan standar yang berlaku?' },
      { id: 9, question_text: 'Apakah tidak ada duplikasi dengan program lain?' },
      { id: 10, question_text: 'Apakah kegiatan ini menjadi prioritas sesuai kebutuhan masyarakat?' },
      { id: 11, question_text: 'Apakah aspek lingkungan telah dipertimbangkan?' },
      { id: 12, question_text: 'Apakah ada rencana pemeliharaan pasca kegiatan?' },
      { id: 13, question_text: 'Secara keseluruhan, apakah proposal layak untuk disetujui?' }
    ];

    // Get existing questionnaire if any
    const existingQuestionnaire = await prisma.bankeu_verification_questionnaires.findFirst({
      where: {
        proposal_id: BigInt(proposalId),
        verifikasi_type: 'dinas',
        dinas_id: dinas_id
      }
    });

    let existingAnswers = [];

    if (existingQuestionnaire) {
      // Convert q1-q13 to answers array
      for (let i = 1; i <= 13; i++) {
        const qValue = existingQuestionnaire[`q${i}`];
        const keteranganValue = existingQuestionnaire[`q${i}_keterangan`];
        if (qValue !== null && qValue !== undefined) {
          existingAnswers.push({
            question_id: i,
            is_compliant: qValue,
            catatan: keteranganValue || ''
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        questions: standardQuestions,
        existing_answers: existingAnswers,
        questionnaire_status: existingQuestionnaire?.status || null
      }
    });

  } catch (error) {
    console.error('Error getting questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil questionnaire',
      error: error.message
    });
  }
};

/**
 * Get statistics for dinas dashboard
 */
const getDinasStatistics = async (req, res) => {
  try {
    const { dinas_id } = req.user;

    if (!dinas_id) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses dinas'
      });
    }

    const dinas = await prisma.master_dinas.findUnique({
      where: { id: dinas_id }
    });

    // Count proposals by status
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN bp.dinas_status IS NULL OR bp.dinas_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN bp.dinas_status = 'in_review' THEN 1 ELSE 0 END) as in_review,
        SUM(CASE WHEN bp.dinas_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN bp.dinas_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN bp.dinas_status = 'revision' THEN 1 ELSE 0 END) as revision
      FROM bankeu_proposals bp
      INNER JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
      WHERE FIND_IN_SET(${dinas.kode_dinas}, bmk.dinas_terkait) > 0
    `;

    return res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Error getting statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik',
      error: error.message
    });
  }
};

/**
 * Get list of all dinas for dropdown/filter
 */
const getDinasList = async (req, res) => {
  try {
    const dinasList = await prisma.master_dinas.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        nama_dinas: 'asc'
      }
    });

    return res.json({
      success: true,
      data: dinasList
    });

  } catch (error) {
    console.error('Error getting dinas list:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil list dinas',
      error: error.message
    });
  }
};

module.exports = {
  getDinasProposals,
  getDinasProposalDetail,
  saveQuestionnaire,
  submitVerification,
  getQuestionnaire,
  getDinasStatistics,
  getDinasList
};
