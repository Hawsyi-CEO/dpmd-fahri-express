-- Migration: Create pejabat_ttd table
-- Date: 2026-02-19
-- Description: Tabel pejabat penanda tangan (camat, tim verifikasi) untuk berita acara bankeu

CREATE TABLE IF NOT EXISTS `pejabat_ttd` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kecamatan_id` BIGINT UNSIGNED NOT NULL,
  `jenis_pejabat` ENUM('camat', 'tim_verifikasi') NOT NULL,
  `pejabat_id` BIGINT UNSIGNED NULL,
  `nama_pejabat` VARCHAR(255) NOT NULL,
  `ttd_path` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_jenis` (`jenis_pejabat`),
  INDEX `idx_kecamatan` (`kecamatan_id`),
  INDEX `idx_pejabat` (`pejabat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
