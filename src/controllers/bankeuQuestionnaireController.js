const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the model inline since it's not in prisma yet
const BankeuVerificationQuestionnaire = sequelize.define('bankeu_verification_questionnaires', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  proposal_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  tim_verifikasi_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  q1_proposal_ttd_stempel: DataTypes.BOOLEAN,
  q2_fotocopy_kelengkapan: DataTypes.BOOLEAN,
  q3_rab_format: DataTypes.BOOLEAN,
  q4_volume_realistis: DataTypes.BOOLEAN,
  q5_harga_satuan: DataTypes.BOOLEAN,
  q6_lokasi_jelas: DataTypes.BOOLEAN,
  q7_kegiatan_fisik: DataTypes.BOOLEAN,
  q8_tidak_tumpang_tindih: DataTypes.BOOLEAN,
  q9_swakelola: DataTypes.BOOLEAN,
  q10_partisipasi_masyarakat: DataTypes.BOOLEAN,
  q11_dampak_luas: DataTypes.BOOLEAN,
  q12_dukung_pencapaian: DataTypes.BOOLEAN,
  q13_rekomendasi: DataTypes.BOOLEAN,
  q1_keterangan: DataTypes.TEXT,
  q2_keterangan: DataTypes.TEXT,
  q3_keterangan: DataTypes.TEXT,
  q4_keterangan: DataTypes.TEXT,
  q5_keterangan: DataTypes.TEXT,
  q6_keterangan: DataTypes.TEXT,
  q7_keterangan: DataTypes.TEXT,
  q8_keterangan: DataTypes.TEXT,
  q9_keterangan: DataTypes.TEXT,
  q10_keterangan: DataTypes.TEXT,
  q11_keterangan: DataTypes.TEXT,
  q12_keterangan: DataTypes.TEXT,
  q13_keterangan: DataTypes.TEXT,
  overall_recommendation: {
    type: DataTypes.ENUM('layak', 'tidak_layak', 'revisi'),
    allowNull: true
  },
  overall_notes: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('draft', 'submitted'),
    defaultValue: 'draft'
  },
  submitted_at: DataTypes.DATE,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  timestamps: false,
  tableName: 'bankeu_verification_questionnaires'
});

// Get questionnaire for a specific proposal and tim verifikasi member
exports.getQuestionnaire = async (req, res) => {
  try {
    const { proposalId, timVerifikasiId } = req.params;

    const questionnaire = await BankeuVerificationQuestionnaire.findOne({
      where: {
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId
      }
    });

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: questionnaire
    });
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch questionnaire',
      error: error.message
    });
  }
};

// Get all questionnaires for a proposal (all tim verifikasi members)
exports.getProposalQuestionnaires = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const questionnaires = await sequelize.query(`
      SELECT 
        q.*,
        tv.nama as tim_nama,
        tv.jabatan as tim_jabatan,
        tv.nip as tim_nip
      FROM bankeu_verification_questionnaires q
      LEFT JOIN tim_verifikasi_kecamatan tv ON q.tim_verifikasi_id = tv.id
      WHERE q.proposal_id = :proposalId
      ORDER BY 
        CASE tv.jabatan
          WHEN 'ketua' THEN 1
          WHEN 'sekretaris' THEN 2
          WHEN 'anggota' THEN 3
        END,
        tv.nama
    `, {
      replacements: { proposalId },
      type: Sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      success: true,
      data: questionnaires
    });
  } catch (error) {
    console.error('Error fetching proposal questionnaires:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch questionnaires',
      error: error.message
    });
  }
};

// Save or update questionnaire (draft)
exports.saveQuestionnaire = async (req, res) => {
  try {
    const { proposalId, timVerifikasiId } = req.params;
    const data = req.body;

    // Check if exists
    let questionnaire = await BankeuVerificationQuestionnaire.findOne({
      where: {
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId
      }
    });

    if (questionnaire) {
      // Update existing
      await questionnaire.update({
        ...data,
        status: 'draft'
      });
    } else {
      // Create new
      questionnaire = await BankeuVerificationQuestionnaire.create({
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId,
        ...data,
        status: 'draft'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Questionnaire saved successfully',
      data: questionnaire
    });
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save questionnaire',
      error: error.message
    });
  }
};

// Submit questionnaire (final)
exports.submitQuestionnaire = async (req, res) => {
  try {
    const { proposalId, timVerifikasiId } = req.params;
    const data = req.body;

    let questionnaire = await BankeuVerificationQuestionnaire.findOne({
      where: {
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId
      }
    });

    if (questionnaire) {
      // Update existing
      await questionnaire.update({
        ...data,
        status: 'submitted',
        submitted_at: new Date()
      });
    } else {
      // Create new
      questionnaire = await BankeuVerificationQuestionnaire.create({
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId,
        ...data,
        status: 'submitted',
        submitted_at: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Questionnaire submitted successfully',
      data: questionnaire
    });
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit questionnaire',
      error: error.message
    });
  }
};

// Delete questionnaire
exports.deleteQuestionnaire = async (req, res) => {
  try {
    const { proposalId, timVerifikasiId } = req.params;

    const deleted = await BankeuVerificationQuestionnaire.destroy({
      where: {
        proposal_id: proposalId,
        tim_verifikasi_id: timVerifikasiId
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Questionnaire deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete questionnaire',
      error: error.message
    });
  }
};

// Get questionnaire summary for a proposal
exports.getQuestionnaireSummary = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const summary = await sequelize.query(`
      SELECT 
        COUNT(*) as total_responses,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN overall_recommendation = 'layak' THEN 1 ELSE 0 END) as layak_count,
        SUM(CASE WHEN overall_recommendation = 'tidak_layak' THEN 1 ELSE 0 END) as tidak_layak_count,
        SUM(CASE WHEN overall_recommendation = 'revisi' THEN 1 ELSE 0 END) as revisi_count
      FROM bankeu_verification_questionnaires
      WHERE proposal_id = :proposalId
    `, {
      replacements: { proposalId },
      type: Sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        total_responses: 0,
        submitted_count: 0,
        draft_count: 0,
        layak_count: 0,
        tidak_layak_count: 0,
        revisi_count: 0
      }
    });
  } catch (error) {
    console.error('Error fetching questionnaire summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
};
