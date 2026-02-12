-- Migration: Create perjadin_pegawai table for new perjadin feature
-- Each pegawai can create their own perjadin (perjalanan dinas)
-- Integrated with desa data for Google Maps

CREATE TABLE IF NOT EXISTS `perjadin_pegawai` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pegawai_id` BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key ke table pegawai',
  `desa_tujuan_id` BIGINT UNSIGNED NULL COMMENT 'FK ke desas - untuk integrasi Google Maps (optional)',
  `lokasi_tujuan` VARCHAR(255) NOT NULL COMMENT 'Nama lokasi tujuan (bisa desa atau lokasi lain)',
  `alamat_tujuan` TEXT NULL COMMENT 'Alamat lengkap tujuan',
  `tujuan_perjalanan` TEXT NOT NULL COMMENT 'Tujuan/keperluan perjalanan dinas',
  `tanggal_berangkat` DATE NOT NULL,
  `tanggal_kembali` DATE NOT NULL,
  `nomor_sppd` VARCHAR(100) NULL COMMENT 'Nomor Surat Perintah Perjalanan Dinas',
  `status` ENUM('draft', 'diajukan', 'disetujui', 'ditolak', 'selesai') NOT NULL DEFAULT 'draft',
  `catatan_approval` TEXT NULL COMMENT 'Catatan dari approver',
  `approved_by` BIGINT UNSIGNED NULL COMMENT 'User yang menyetujui',
  `approved_at` DATETIME NULL,
  `keterangan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_perjadin_pegawai_id` (`pegawai_id`),
  INDEX `idx_perjadin_desa_tujuan` (`desa_tujuan_id`),
  INDEX `idx_perjadin_status` (`status`),
  INDEX `idx_perjadin_tanggal` (`tanggal_berangkat`, `tanggal_kembali`),
  CONSTRAINT `fk_perjadin_pegawai` 
    FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  CONSTRAINT `fk_perjadin_desa_tujuan` 
    FOREIGN KEY (`desa_tujuan_id`) REFERENCES `desas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_perjadin_approved_by` 
    FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel perjadin untuk tiap pegawai';
