-- Migration: Create kegiatan_bidang table (Perjalanan Dinas)
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `kegiatan_bidang` (
  `id_kegiatan_bidang` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_kegiatan` int UNSIGNED NOT NULL,
  `id_bidang` int UNSIGNED NOT NULL,
  `personil` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_kegiatan_bidang`),
  KEY `kegiatan_bidang_id_kegiatan_foreign` (`id_kegiatan`),
  KEY `kegiatan_bidang_id_bidang_foreign` (`id_bidang`),
  CONSTRAINT `kegiatan_bidang_id_kegiatan_foreign` FOREIGN KEY (`id_kegiatan`) REFERENCES `kegiatan` (`id_kegiatan`) ON DELETE CASCADE,
  CONSTRAINT `kegiatan_bidang_id_bidang_foreign` FOREIGN KEY (`id_bidang`) REFERENCES `bidangs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
