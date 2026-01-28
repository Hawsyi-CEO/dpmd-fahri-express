-- Create bankeu_verification_questionnaires table
CREATE TABLE IF NOT EXISTS `bankeu_verification_questionnaires` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proposal_id` BIGINT UNSIGNED NOT NULL,
  `tim_verifikasi_id` BIGINT UNSIGNED NOT NULL,
  
  -- 13 checklist items - HASIL column (checklist/true/false)
  `q1_proposal_ttd_stempel` BOOLEAN DEFAULT NULL COMMENT 'Proposal telah ditandatangani oleh Kepala Desa dan diketahui oleh Camat',
  `q2_fotocopy_kelengkapan` BOOLEAN DEFAULT NULL COMMENT 'Foto copy dokumen kelengkapan proposal',
  `q3_rab_format` BOOLEAN DEFAULT NULL COMMENT 'RAB sesuai dengan format yang telah ditentukan',
  `q4_volume_realistis` BOOLEAN DEFAULT NULL COMMENT 'Volume pekerjaan realistis dan dapat dipertanggungjawabkan',
  `q5_harga_satuan` BOOLEAN DEFAULT NULL COMMENT 'Harga satuan sesuai dengan harga yang berlaku di daerah',
  `q6_lokasi_jelas` BOOLEAN DEFAULT NULL COMMENT 'Lokasi kegiatan jelas dan tidak bermasalah',
  `q7_kegiatan_fisik` BOOLEAN DEFAULT NULL COMMENT 'Kegiatan bersifat fisik infrastruktur atau pemberdayaan masyarakat',
  `q8_tidak_tumpang_tindih` BOOLEAN DEFAULT NULL COMMENT 'Kegiatan tidak tumpang tindih dengan program lain',
  `q9_swakelola` BOOLEAN DEFAULT NULL COMMENT 'Swakelola dilaksanakan oleh desa',
  `q10_partisipasi_masyarakat` BOOLEAN DEFAULT NULL COMMENT 'Masyarakat ikut berpartisipasi (gotong royong)',
  `q11_dampak_luas` BOOLEAN DEFAULT NULL COMMENT 'Dampak kegiatan dapat dirasakan oleh masyarakat luas',
  `q12_dukung_pencapaian` BOOLEAN DEFAULT NULL COMMENT 'Kegiatan mendukung pencapaian tujuan pembangunan desa',
  `q13_rekomendasi` BOOLEAN DEFAULT NULL COMMENT 'Proposal dapat direkomendasikan untuk dibiayai',
  
  -- KET column (keterangan/notes for each question)
  `q1_keterangan` TEXT DEFAULT NULL,
  `q2_keterangan` TEXT DEFAULT NULL,
  `q3_keterangan` TEXT DEFAULT NULL,
  `q4_keterangan` TEXT DEFAULT NULL,
  `q5_keterangan` TEXT DEFAULT NULL,
  `q6_keterangan` TEXT DEFAULT NULL,
  `q7_keterangan` TEXT DEFAULT NULL,
  `q8_keterangan` TEXT DEFAULT NULL,
  `q9_keterangan` TEXT DEFAULT NULL,
  `q10_keterangan` TEXT DEFAULT NULL,
  `q11_keterangan` TEXT DEFAULT NULL,
  `q12_keterangan` TEXT DEFAULT NULL,
  `q13_keterangan` TEXT DEFAULT NULL,
  
  -- Overall assessment
  `overall_recommendation` ENUM('layak', 'tidak_layak', 'revisi') DEFAULT NULL,
  `overall_notes` TEXT DEFAULT NULL,
  
  `status` ENUM('draft', 'submitted') NOT NULL DEFAULT 'draft',
  `submitted_at` TIMESTAMP NULL DEFAULT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT `fk_questionnaire_proposal` FOREIGN KEY (`proposal_id`) 
    REFERENCES `bankeu_proposals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_questionnaire_tim` FOREIGN KEY (`tim_verifikasi_id`) 
    REFERENCES `tim_verifikasi_kecamatan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Indexes
  INDEX `idx_questionnaire_proposal` (`proposal_id`),
  INDEX `idx_questionnaire_tim` (`tim_verifikasi_id`),
  UNIQUE KEY `idx_questionnaire_proposal_tim` (`proposal_id`, `tim_verifikasi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
