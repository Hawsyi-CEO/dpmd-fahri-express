-- Migration for table: pengurus
-- Generated: 2025-11-10T06:26:42.918Z

CREATE TABLE `pengurus` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `desa_id` bigint unsigned NOT NULL,
  `pengurusable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengurusable_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jabatan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_mulai_jabatan` date DEFAULT NULL,
  `tanggal_akhir_jabatan` date DEFAULT NULL,
  `status_jabatan` enum('aktif','selesai') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `status_verifikasi` enum('verified','unverified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unverified',
  `produk_hukum_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tempat_lahir` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_perkawinan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `no_telepon` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pendidikan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pengurus_desa_id_foreign` (`desa_id`),
  KEY `pengurus_pengurusable_type_pengurusable_id_index` (`pengurusable_type`,`pengurusable_id`),
  KEY `pengurus_produk_hukum_id_foreign` (`produk_hukum_id`),
  CONSTRAINT `pengurus_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pengurus_produk_hukum_id_foreign` FOREIGN KEY (`produk_hukum_id`) REFERENCES `produk_hukums` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
