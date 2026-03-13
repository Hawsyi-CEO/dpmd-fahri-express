-- Migration: Add many-to-many relationship between bankeu_proposals and kegiatan
-- Date: 2026-02-03
-- Description: Allow one proposal to have multiple kegiatan

-- Step 1: Make kegiatan_id nullable in bankeu_proposals for backward compatibility
ALTER TABLE `bankeu_proposals` 
MODIFY COLUMN `kegiatan_id` TINYINT UNSIGNED NULL;

-- Step 2: Create pivot table for many-to-many relationship
CREATE TABLE IF NOT EXISTS `bankeu_proposal_kegiatan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proposal_id` BIGINT UNSIGNED NOT NULL,
  `kegiatan_id` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_proposal_kegiatan` (`proposal_id`, `kegiatan_id`),
  KEY `idx_proposal_id` (`proposal_id`),
  KEY `idx_kegiatan_id` (`kegiatan_id`),
  CONSTRAINT `fk_proposal_kegiatan_proposal` 
    FOREIGN KEY (`proposal_id`) 
    REFERENCES `bankeu_proposals` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_proposal_kegiatan_kegiatan` 
    FOREIGN KEY (`kegiatan_id`) 
    REFERENCES `bankeu_master_kegiatan` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Migrate existing data from bankeu_proposals.kegiatan_id to pivot table
INSERT INTO `bankeu_proposal_kegiatan` (`proposal_id`, `kegiatan_id`, `created_at`)
SELECT `id`, `kegiatan_id`, `created_at` 
FROM `bankeu_proposals` 
WHERE `kegiatan_id` IS NOT NULL
ON DUPLICATE KEY UPDATE `created_at` = VALUES(`created_at`);

-- Note: Keeping kegiatan_id column as nullable for backward compatibility
-- Old records can still reference single kegiatan_id
-- New records will use pivot table only
