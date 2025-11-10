-- Migration: Create desas table
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `desas` (
  `id_desa` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_kecamatan` int UNSIGNED NOT NULL,
  `kode_desa` varchar(20) NOT NULL,
  `nama_desa` varchar(255) NOT NULL,
  `status_pemerintahan` enum('desa','kelurahan') DEFAULT 'desa',
  `musdesus_target` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_desa`),
  UNIQUE KEY `desas_kode_desa_unique` (`kode_desa`),
  KEY `desas_id_kecamatan_foreign` (`id_kecamatan`),
  CONSTRAINT `desas_id_kecamatan_foreign` FOREIGN KEY (`id_kecamatan`) REFERENCES `kecamatans` (`id_kecamatan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
