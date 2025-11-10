-- Migration: Create bidangs table (for Perjalanan Dinas)
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `bidangs` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_bidang` int UNSIGNED NOT NULL,
  `nama` varchar(255) NOT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bidangs_id_bidang_unique` (`id_bidang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
