-- Migration for table: kegiatan_bidang
-- Generated: 2025-11-10T17:06:16.814Z

CREATE TABLE `kegiatan_bidang` (
  `id_kegiatan_bidang` int unsigned NOT NULL AUTO_INCREMENT,
  `id_kegiatan` int unsigned NOT NULL,
  `id_bidang` bigint unsigned NOT NULL,
  `personil` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_kegiatan_bidang`),
  KEY `kegiatan_bidang_id_kegiatan_foreign` (`id_kegiatan`),
  KEY `kegiatan_bidang_id_bidang_foreign` (`id_bidang`),
  CONSTRAINT `kegiatan_bidang_id_bidang_foreign` FOREIGN KEY (`id_bidang`) REFERENCES `bidangs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kegiatan_bidang_id_kegiatan_foreign` FOREIGN KEY (`id_kegiatan`) REFERENCES `kegiatan` (`id_kegiatan`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
