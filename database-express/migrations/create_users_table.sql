-- Migration for table: users
-- Generated: 2025-11-10T17:06:16.819Z

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('superadmin','admin','desa','kecamatan','dinas','sarpras','sekretariat','sarana_prasarana','kekayaan_keuangan','pemberdayaan_masyarakat','pemerintahan_desa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desa',
  `kecamatan_id` int unsigned DEFAULT NULL,
  `desa_id` bigint unsigned DEFAULT NULL,
  `bidang_id` int unsigned DEFAULT NULL,
  `dinas_id` int unsigned DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
