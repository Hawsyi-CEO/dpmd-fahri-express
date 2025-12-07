-- Migration: Create Disposisi Surat Tables
-- Date: 2025-12-03
-- Description: Sistem disposisi surat berjenjang

-- Table: surat_masuk
CREATE TABLE IF NOT EXISTS `surat_masuk` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `tanggal_terima` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `pengirim` VARCHAR(255) NOT NULL,
  `perihal` TEXT NOT NULL,
  `jenis_surat` ENUM('biasa', 'penting', 'segera', 'rahasia') DEFAULT 'biasa',
  `file_path` VARCHAR(500) NULL,
  `keterangan` TEXT NULL,
  `status` ENUM('draft', 'dikirim', 'selesai') DEFAULT 'draft',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_surat_unique` (`nomor_surat`),
  KEY `idx_tanggal_surat` (`tanggal_surat`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_surat_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: disposisi
CREATE TABLE IF NOT EXISTS `disposisi` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `surat_id` BIGINT UNSIGNED NOT NULL,
  `dari_user_id` BIGINT UNSIGNED NOT NULL,
  `ke_user_id` BIGINT UNSIGNED NOT NULL,
  `catatan` TEXT NULL,
  `instruksi` ENUM('segera', 'penting', 'biasa', 'koordinasi', 'teliti_lapor', 'edarkan', 'simpan') DEFAULT 'biasa',
  `status` ENUM('pending', 'dibaca', 'proses', 'selesai', 'teruskan') DEFAULT 'pending',
  `level_disposisi` TINYINT UNSIGNED NOT NULL COMMENT '1=Kepala Dinas, 2=Sekretaris Dinas, 3=Kepala Bidang, 4=Ketua Tim, 5=Pegawai',
  `tanggal_disposisi` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tanggal_dibaca` DATETIME NULL,
  `tanggal_selesai` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_surat_id` (`surat_id`),
  KEY `idx_dari_user` (`dari_user_id`),
  KEY `idx_ke_user` (`ke_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_level` (`level_disposisi`),
  CONSTRAINT `fk_disposisi_surat` FOREIGN KEY (`surat_id`) REFERENCES `surat_masuk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_disposisi_dari` FOREIGN KEY (`dari_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_disposisi_ke` FOREIGN KEY (`ke_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lampiran_surat (optional - untuk multiple files)
CREATE TABLE IF NOT EXISTS `lampiran_surat` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `surat_id` BIGINT UNSIGNED NOT NULL,
  `nama_file` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `ukuran_file` INT UNSIGNED NULL COMMENT 'Size in bytes',
  `tipe_file` VARCHAR(50) NULL,
  `uploaded_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_surat_id` (`surat_id`),
  CONSTRAINT `fk_lampiran_surat` FOREIGN KEY (`surat_id`) REFERENCES `surat_masuk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lampiran_uploaded` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX idx_surat_status_tanggal ON surat_masuk(status, tanggal_surat DESC);
CREATE INDEX idx_disposisi_ke_status ON disposisi(ke_user_id, status);
CREATE INDEX idx_disposisi_surat_level ON disposisi(surat_id, level_disposisi);
