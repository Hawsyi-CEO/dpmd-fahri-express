-- Migration: Create users table
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('desa','kecamatan','dinas','sarpras','admin','superadmin') NOT NULL DEFAULT 'desa',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key columns for entity relations
ALTER TABLE `users`
ADD COLUMN `id_kecamatan` int UNSIGNED DEFAULT NULL AFTER `role`,
ADD COLUMN `id_desa` int UNSIGNED DEFAULT NULL AFTER `id_kecamatan`,
ADD COLUMN `id_bidang` int UNSIGNED DEFAULT NULL AFTER `id_desa`,
ADD COLUMN `id_dinas` int UNSIGNED DEFAULT NULL AFTER `id_bidang`;
