-- Migration: Add troubleshoot fields to bankeu_proposals
-- Date: 2026-02-19
-- Description: Add fields to track when DPMD/SPKED staff force-revises a proposal

ALTER TABLE `bankeu_proposals`
  ADD COLUMN `troubleshoot_catatan` TEXT NULL AFTER `berita_acara_generated_at`,
  ADD COLUMN `troubleshoot_by` BIGINT UNSIGNED NULL AFTER `troubleshoot_catatan`,
  ADD COLUMN `troubleshoot_at` TIMESTAMP NULL AFTER `troubleshoot_by`;

-- Add foreign key for troubleshoot_by
ALTER TABLE `bankeu_proposals`
  ADD INDEX `idx_troubleshoot_by` (`troubleshoot_by`),
  ADD CONSTRAINT `fk_bankeu_troubleshoot_by` FOREIGN KEY (`troubleshoot_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
