-- Migration for table: musdesus
-- Generated: 2025-11-10T06:26:42.897Z

CREATE TABLE `musdesus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_file_asli` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ukuran_file` bigint NOT NULL,
  `nama_pengupload` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_pengupload` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon_pengupload` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desa_id` bigint unsigned NOT NULL,
  `kecamatan_id` bigint unsigned NOT NULL,
  `petugas_id` bigint unsigned DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `catatan_admin` text COLLATE utf8mb4_unicode_ci,
  `tanggal_musdesus` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `musdesus_desa_id_foreign` (`desa_id`),
  KEY `musdesus_kecamatan_id_foreign` (`kecamatan_id`),
  KEY `musdesus_petugas_id_index` (`petugas_id`),
  CONSTRAINT `musdesus_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `musdesus_kecamatan_id_foreign` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `musdesus_petugas_id_foreign` FOREIGN KEY (`petugas_id`) REFERENCES `petugas_monitoring` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
