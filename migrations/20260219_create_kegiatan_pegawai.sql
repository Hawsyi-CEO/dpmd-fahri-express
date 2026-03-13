-- Migration: Create kegiatan_pegawai table
-- Date: 2026-02-19
-- Description: Tabel pivot many-to-many antara kegiatan_bidang dan pegawai

CREATE TABLE IF NOT EXISTS `kegiatan_pegawai` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_kegiatan` INT UNSIGNED NOT NULL,
  `id_kegiatan_bidang` INT UNSIGNED NOT NULL,
  `id_pegawai` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_kegiatan_bidang_pegawai` (`id_kegiatan_bidang`, `id_pegawai`),
  INDEX `kegiatan_pegawai_id_kegiatan_bidang_foreign` (`id_kegiatan_bidang`),
  INDEX `kegiatan_pegawai_id_kegiatan_foreign` (`id_kegiatan`),
  INDEX `kegiatan_pegawai_id_pegawai_foreign` (`id_pegawai`),
  CONSTRAINT `kegiatan_pegawai_id_kegiatan_bidang_foreign` FOREIGN KEY (`id_kegiatan_bidang`) REFERENCES `kegiatan_bidang` (`id_kegiatan_bidang`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `kegiatan_pegawai_id_kegiatan_foreign` FOREIGN KEY (`id_kegiatan`) REFERENCES `kegiatan` (`id_kegiatan`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `kegiatan_pegawai_id_pegawai_foreign` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
