-- Migration for table: users
-- Generated: 2025-11-10T06:26:43.072Z

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `desa_id` bigint unsigned DEFAULT NULL,
  `kecamatan_id` bigint unsigned DEFAULT NULL,
  `bidang_id` bigint unsigned DEFAULT NULL,
  `dinas_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_desa_id_foreign` (`desa_id`),
  KEY `users_kecamatan_id_foreign` (`kecamatan_id`),
  KEY `users_bidang_id_foreign` (`bidang_id`),
  KEY `users_dinas_id_foreign` (`dinas_id`),
  CONSTRAINT `users_bidang_id_foreign` FOREIGN KEY (`bidang_id`) REFERENCES `bidangs` (`id`),
  CONSTRAINT `users_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas` (`id`),
  CONSTRAINT `users_dinas_id_foreign` FOREIGN KEY (`dinas_id`) REFERENCES `dinas` (`id`),
  CONSTRAINT `users_kecamatan_id_foreign` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=493 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
