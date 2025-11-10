-- Migration: Create users table
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','desa','kecamatan','dinas','sarpras','sekretariat','sarana_prasarana','kekayaan_keuangan','pemberdayaan_masyarakat','pemerintahan_desa') NOT NULL DEFAULT 'desa',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key columns for entity relations
ALTER TABLE `users`
ADD COLUMN `kecamatan_id` int UNSIGNED DEFAULT NULL AFTER `role`,
ADD COLUMN `desa_id` bigint UNSIGNED DEFAULT NULL AFTER `kecamatan_id`,
ADD COLUMN `bidang_id` int UNSIGNED DEFAULT NULL AFTER `desa_id`,
ADD COLUMN `dinas_id` int UNSIGNED DEFAULT NULL AFTER `bidang_id`;
