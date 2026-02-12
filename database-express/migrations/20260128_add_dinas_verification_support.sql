-- Add support for dinas verification in questionnaires table
-- Date: 2026-01-28

-- Add new columns for dinas verification
ALTER TABLE `bankeu_verification_questionnaires`
ADD COLUMN `verifikasi_type` ENUM('kecamatan', 'dinas') DEFAULT 'kecamatan' AFTER `tim_verifikasi_id`,
ADD COLUMN `dinas_id` INT NULL AFTER `verifikasi_type`,
ADD INDEX `idx_verifikasi_type` (`verifikasi_type`),
ADD INDEX `idx_dinas_id` (`dinas_id`);

-- Add foreign key for dinas_id
ALTER TABLE `bankeu_verification_questionnaires`
ADD CONSTRAINT `fk_questionnaire_dinas` 
FOREIGN KEY (`dinas_id`) REFERENCES `master_dinas`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Make tim_verifikasi_id nullable since dinas won't use it
ALTER TABLE `bankeu_verification_questionnaires`
MODIFY COLUMN `tim_verifikasi_id` BIGINT UNSIGNED NULL;

-- Rename question columns to be generic (q1-q13 instead of specific names)
ALTER TABLE `bankeu_verification_questionnaires`
CHANGE COLUMN `q1_proposal_ttd_stempel` `q1` BOOLEAN NULL,
CHANGE COLUMN `q2_fotocopy_kelengkapan` `q2` BOOLEAN NULL,
CHANGE COLUMN `q3_rab_format` `q3` BOOLEAN NULL,
CHANGE COLUMN `q4_volume_realistis` `q4` BOOLEAN NULL,
CHANGE COLUMN `q5_harga_satuan` `q5` BOOLEAN NULL,
CHANGE COLUMN `q6_lokasi_jelas` `q6` BOOLEAN NULL,
CHANGE COLUMN `q7_kegiatan_fisik` `q7` BOOLEAN NULL,
CHANGE COLUMN `q8_tidak_tumpang_tindih` `q8` BOOLEAN NULL,
CHANGE COLUMN `q9_swakelola` `q9` BOOLEAN NULL,
CHANGE COLUMN `q10_partisipasi_masyarakat` `q10` BOOLEAN NULL,
CHANGE COLUMN `q11_dampak_luas` `q11` BOOLEAN NULL,
CHANGE COLUMN `q12_dukung_pencapaian` `q12` BOOLEAN NULL,
CHANGE COLUMN `q13_rekomendasi` `q13` BOOLEAN NULL;

-- Update overall_recommendation enum to match expected values
ALTER TABLE `bankeu_verification_questionnaires`
MODIFY COLUMN `overall_recommendation` ENUM('disetujui', 'ditolak', 'revisi', 'layak', 'tidak_layak') NULL;
