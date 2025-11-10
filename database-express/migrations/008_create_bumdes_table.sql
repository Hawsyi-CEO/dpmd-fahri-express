-- Migration: Create bumdes table
-- Created: 2025-11-10

CREATE TABLE IF NOT EXISTS `bumdes` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_desa` int UNSIGNED DEFAULT NULL,
  `kode_desa` varchar(20) DEFAULT NULL,
  `nama_bumdes` varchar(255) NOT NULL,
  `tahun_berdiri` year DEFAULT NULL,
  `dasar_hukum_pendirian` text,
  `modal_awal` decimal(15,2) DEFAULT NULL,
  `total_aset` decimal(15,2) DEFAULT NULL,
  `omset_tahunan` decimal(15,2) DEFAULT NULL,
  `laba_rugi` decimal(15,2) DEFAULT NULL,
  `jumlah_karyawan` int DEFAULT NULL,
  `unit_usaha` text,
  `alamat` text,
  `kontak` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nama_direktur` varchar(255) DEFAULT NULL,
  `kontak_direktur` varchar(50) DEFAULT NULL,
  `status_operasional` enum('aktif','nonaktif','pembinaan') DEFAULT 'aktif',
  `file_badan_hukum` varchar(255) DEFAULT NULL,
  `file_sk_bumdes` varchar(255) DEFAULT NULL,
  `file_laporan_keuangan` varchar(255) DEFAULT NULL,
  `produk_hukum_perdes_id` int DEFAULT NULL,
  `produk_hukum_sk_bumdes_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bumdes_kode_desa_index` (`kode_desa`),
  KEY `bumdes_id_desa_foreign` (`id_desa`),
  CONSTRAINT `bumdes_id_desa_foreign` FOREIGN KEY (`id_desa`) REFERENCES `desas` (`id_desa`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
