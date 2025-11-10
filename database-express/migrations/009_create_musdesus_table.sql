-- Migration: Create musdesus table
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `musdesus` (
  `id_musdesus` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_desa` int UNSIGNED NOT NULL,
  `kode_desa` varchar(20) NOT NULL,
  `nama_desa` varchar(255) NOT NULL,
  `nama_kecamatan` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` bigint UNSIGNED DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verified_by` bigint UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `notes` text,
  `petugas_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_musdesus`),
  KEY `musdesus_id_desa_foreign` (`id_desa`),
  KEY `musdesus_uploaded_by_foreign` (`uploaded_by`),
  KEY `musdesus_petugas_id_foreign` (`petugas_id`),
  CONSTRAINT `musdesus_id_desa_foreign` FOREIGN KEY (`id_desa`) REFERENCES `desas` (`id_desa`) ON DELETE CASCADE,
  CONSTRAINT `musdesus_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `musdesus_petugas_id_foreign` FOREIGN KEY (`petugas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
