-- Migration for table: desas
-- Generated: 2025-11-10T06:26:42.745Z

CREATE TABLE `desas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kecamatan_id` bigint unsigned NOT NULL,
  `kode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_pemerintahan` enum('desa','kelurahan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desa' COMMENT 'Status pemerintahan: desa atau kelurahan',
  `is_musdesus_target` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `desas_kode_unique` (`kode`),
  KEY `desas_kecamatan_id_foreign` (`kecamatan_id`),
  CONSTRAINT `desas_kecamatan_id_foreign` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=436 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
