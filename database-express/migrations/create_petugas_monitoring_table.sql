-- Migration for table: petugas_monitoring
-- Generated: 2025-11-10T06:26:42.962Z

CREATE TABLE `petugas_monitoring` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_desa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kecamatan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_petugas` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `desa_id` bigint unsigned DEFAULT NULL,
  `kecamatan_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `petugas_monitoring_kecamatan_id_foreign` (`kecamatan_id`),
  KEY `petugas_monitoring_desa_id_kecamatan_id_index` (`desa_id`,`kecamatan_id`),
  CONSTRAINT `petugas_monitoring_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `petugas_monitoring_kecamatan_id_foreign` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
