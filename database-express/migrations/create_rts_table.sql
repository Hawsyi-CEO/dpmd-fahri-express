-- Migration for table: rts
-- Generated: 2025-11-10T06:26:43.039Z

CREATE TABLE `rts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `desa_id` bigint unsigned NOT NULL,
  `nomor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_kelembagaan` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `status_verifikasi` enum('verified','unverified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unverified',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `produk_hukum_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rts_rw_id_nomor_unique` (`rw_id`,`nomor`),
  KEY `rts_desa_id_foreign` (`desa_id`),
  KEY `rts_produk_hukum_id_foreign` (`produk_hukum_id`),
  CONSTRAINT `rts_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rts_produk_hukum_id_foreign` FOREIGN KEY (`produk_hukum_id`) REFERENCES `produk_hukums` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rts_rw_id_foreign` FOREIGN KEY (`rw_id`) REFERENCES `rws` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
