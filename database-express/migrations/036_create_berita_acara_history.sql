-- Create berita_acara_history table untuk menyimpan riwayat generate berita acara
CREATE TABLE IF NOT EXISTS `berita_acara_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proposal_id` BIGINT UNSIGNED NOT NULL,
  `desa_id` BIGINT UNSIGNED NOT NULL,
  `kecamatan_id` BIGINT UNSIGNED NOT NULL,
  `kegiatan_id` TINYINT UNSIGNED NULL COMMENT 'NULL jika berita acara untuk semua kegiatan desa',
  
  -- File info
  `file_path` VARCHAR(255) NOT NULL COMMENT 'Path ke file PDF berita acara',
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT UNSIGNED DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  
  -- QR Code validation
  `qr_code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique code untuk validasi QR',
  `qr_code_path` VARCHAR(255) NULL COMMENT 'Path ke QR code image',
  
  -- Generator info
  `generated_by` BIGINT UNSIGNED NOT NULL COMMENT 'User ID yang generate',
  `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Checklist summary dari semua tim (aggregated)
  `checklist_summary` JSON NULL COMMENT 'Aggregated checklist dari semua tim verifikasi',
  
  -- Tim verifikasi yang terlibat
  `tim_verifikasi_data` JSON NULL COMMENT 'Snapshot data tim verifikasi saat generate',
  
  -- Version tracking
  `version` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Versi berita acara (increment setiap regenerate)',
  `is_latest` BOOLEAN DEFAULT TRUE COMMENT 'Flag untuk versi terbaru',
  `replaced_by` BIGINT UNSIGNED NULL COMMENT 'ID berita acara yang menggantikan',
  
  -- Status
  `status` ENUM('active', 'superseded', 'revoked') NOT NULL DEFAULT 'active',
  `revoked_at` TIMESTAMP NULL,
  `revoked_by` BIGINT UNSIGNED NULL,
  `revoked_reason` TEXT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT `fk_ba_history_proposal` FOREIGN KEY (`proposal_id`) 
    REFERENCES `bankeu_proposals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ba_history_desa` FOREIGN KEY (`desa_id`) 
    REFERENCES `desas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ba_history_kecamatan` FOREIGN KEY (`kecamatan_id`) 
    REFERENCES `kecamatans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ba_history_kegiatan` FOREIGN KEY (`kegiatan_id`) 
    REFERENCES `bankeu_master_kegiatan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ba_history_generator` FOREIGN KEY (`generated_by`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Indexes
  INDEX `idx_ba_history_proposal` (`proposal_id`),
  INDEX `idx_ba_history_desa` (`desa_id`),
  INDEX `idx_ba_history_kecamatan` (`kecamatan_id`),
  INDEX `idx_ba_history_qr` (`qr_code`),
  INDEX `idx_ba_history_generated` (`generated_at`),
  INDEX `idx_ba_history_latest` (`desa_id`, `is_latest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alter bankeu_proposals to add qr_code column if not exists (using stored procedure workaround)
DROP PROCEDURE IF EXISTS add_berita_acara_columns;

DELIMITER //
CREATE PROCEDURE add_berita_acara_columns()
BEGIN
    -- Add berita_acara_qr_code if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bankeu_proposals' 
        AND COLUMN_NAME = 'berita_acara_qr_code'
    ) THEN
        ALTER TABLE `bankeu_proposals` 
        ADD COLUMN `berita_acara_qr_code` VARCHAR(100) NULL AFTER `berita_acara_generated_at`;
    END IF;
    
    -- Add berita_acara_version if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bankeu_proposals' 
        AND COLUMN_NAME = 'berita_acara_version'
    ) THEN
        ALTER TABLE `bankeu_proposals` 
        ADD COLUMN `berita_acara_version` INT UNSIGNED DEFAULT 1 AFTER `berita_acara_qr_code`;
    END IF;
    
    -- Add index if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bankeu_proposals' 
        AND INDEX_NAME = 'idx_proposal_qr_code'
    ) THEN
        CREATE INDEX `idx_proposal_qr_code` ON `bankeu_proposals` (`berita_acara_qr_code`);
    END IF;
END //
DELIMITER ;

CALL add_berita_acara_columns();
DROP PROCEDURE IF EXISTS add_berita_acara_columns;
