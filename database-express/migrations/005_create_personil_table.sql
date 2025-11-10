-- Migration: Create personil table (for Perjalanan Dinas)
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `personil` (
  `id_personil` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_bidang` int UNSIGNED NOT NULL,
  `nama_personil` varchar(255) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_personil`),
  KEY `personil_id_bidang_foreign` (`id_bidang`),
  CONSTRAINT `personil_id_bidang_foreign` FOREIGN KEY (`id_bidang`) REFERENCES `bidangs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
