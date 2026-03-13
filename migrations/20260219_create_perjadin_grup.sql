-- Migration: Create perjadin_grup table
-- Date: 2026-02-19
-- Description: Tabel grup perjalanan dinas (mengelompokkan beberapa pegawai dalam satu perjalanan)

CREATE TABLE IF NOT EXISTS `perjadin_grup` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_grup` VARCHAR(255) NULL,
  `jenis_tujuan` ENUM('desa', 'instansi', 'luar_daerah', 'lainnya') NOT NULL DEFAULT 'desa',
  `desa_tujuan_id` BIGINT UNSIGNED NULL,
  `lokasi_tujuan` VARCHAR(255) NOT NULL,
  `alamat_tujuan` TEXT NULL,
  `tanggal_berangkat` DATE NOT NULL,
  `tanggal_kembali` DATE NOT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `keterangan` TEXT NULL,
  `nomor_sp_grup` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_perjadin_grup_creator` (`created_by`),
  INDEX `idx_perjadin_grup_desa` (`desa_tujuan_id`),
  INDEX `idx_perjadin_grup_tanggal` (`tanggal_berangkat`, `tanggal_kembali`),
  CONSTRAINT `fk_perjadin_grup_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_perjadin_grup_desa` FOREIGN KEY (`desa_tujuan_id`) REFERENCES `desas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
