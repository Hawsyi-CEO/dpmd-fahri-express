-- Migration: Create dinas_config table
-- Description: Table to store dinas configuration (PIC info and signature)
-- Date: 2026-02-05

CREATE TABLE IF NOT EXISTS `dinas_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dinas_id` INT NOT NULL,
  `nama_pic` VARCHAR(255) NULL COMMENT 'Nama Person In Charge',
  `nip_pic` VARCHAR(50) NULL COMMENT 'NIP Person In Charge',
  `jabatan_pic` VARCHAR(255) NULL COMMENT 'Jabatan Person In Charge',
  `ttd_path` VARCHAR(500) NULL COMMENT 'Path to TTD image',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_dinas` (`dinas_id`),
  CONSTRAINT `fk_dinas_config_dinas` FOREIGN KEY (`dinas_id`) REFERENCES `dinas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
