-- Migration for table: personil
-- Generated: 2025-11-10T06:26:42.955Z

CREATE TABLE `personil` (
  `id_personil` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_bidang` bigint unsigned NOT NULL,
  `nama_personil` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_personil`),
  KEY `personil_id_bidang_foreign` (`id_bidang`),
  CONSTRAINT `personil_id_bidang_foreign` FOREIGN KEY (`id_bidang`) REFERENCES `bidangs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
