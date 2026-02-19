-- Migration: Create kecamatan_bankeu_config table
-- Date: 2026-02-19
-- Description: Konfigurasi bankeu per kecamatan (data camat, logo, alamat, TTD, stempel)

CREATE TABLE IF NOT EXISTS `kecamatan_bankeu_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kecamatan_id` BIGINT UNSIGNED NOT NULL,
  `nama_camat` VARCHAR(255) NOT NULL,
  `nip_camat` VARCHAR(50) NULL,
  `jabatan_penandatangan` VARCHAR(50) NOT NULL DEFAULT 'Camat',
  `logo_path` VARCHAR(255) NULL,
  `alamat` TEXT NULL,
  `telepon` VARCHAR(50) NULL,
  `email` VARCHAR(100) NULL,
  `website` VARCHAR(150) NULL,
  `kode_pos` VARCHAR(10) NULL,
  `ttd_camat_path` VARCHAR(255) NULL,
  `stempel_path` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kecamatan_id` (`kecamatan_id`),
  INDEX `idx_kecamatan` (`kecamatan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
