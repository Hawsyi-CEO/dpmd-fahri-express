-- Migration: Add Multi-level Verification Columns
-- Date: 2026-02-01
-- Description: Add kecamatan and DPMD verification columns to support 4-level verification flow

-- Add kecamatan verification fields
ALTER TABLE `bankeu_proposals` 
ADD COLUMN `kecamatan_status` ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') NULL COMMENT 'Status verifikasi kecamatan' AFTER `dinas_catatan`,
ADD COLUMN `kecamatan_catatan` TEXT NULL COMMENT 'Catatan dari kecamatan' AFTER `kecamatan_status`,
ADD COLUMN `kecamatan_verified_at` TIMESTAMP NULL COMMENT 'Waktu verifikasi kecamatan' AFTER `kecamatan_catatan`,
ADD COLUMN `kecamatan_verified_by` BIGINT UNSIGNED NULL COMMENT 'User ID kecamatan yang verifikasi' AFTER `kecamatan_verified_at`,
ADD INDEX `idx_kecamatan_status` (`kecamatan_status`),
ADD INDEX `idx_kecamatan_verified_by` (`kecamatan_verified_by`);

-- Add DPMD verification fields
ALTER TABLE `bankeu_proposals` 
ADD COLUMN `dpmd_status` ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') NULL COMMENT 'Status verifikasi DPMD' AFTER `kecamatan_verified_by`,
ADD COLUMN `dpmd_catatan` TEXT NULL COMMENT 'Catatan dari DPMD' AFTER `dpmd_status`,
ADD COLUMN `dpmd_verified_at` TIMESTAMP NULL COMMENT 'Waktu verifikasi DPMD' AFTER `dpmd_catatan`,
ADD COLUMN `dpmd_verified_by` BIGINT UNSIGNED NULL COMMENT 'User ID DPMD yang verifikasi' AFTER `dpmd_verified_at`,
ADD INDEX `idx_dpmd_status` (`dpmd_status`),
ADD INDEX `idx_dpmd_verified_by` (`dpmd_verified_by`);

-- Add foreign key constraints for verifier references
ALTER TABLE `bankeu_proposals`
ADD CONSTRAINT `fk_proposal_kecamatan_verified_by` FOREIGN KEY (`kecamatan_verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_proposal_dpmd_verified_by` FOREIGN KEY (`dpmd_verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Update existing proposals: set kecamatan_status based on current verified_by (if verified_by is kecamatan role)
UPDATE `bankeu_proposals` bp
INNER JOIN `users` u ON bp.verified_by = u.id
SET 
  bp.kecamatan_status = CASE 
    WHEN bp.status = 'verified' THEN 'approved'
    WHEN bp.status = 'rejected' THEN 'rejected'
    WHEN bp.status = 'revision' THEN 'revision'
    ELSE NULL
  END,
  bp.kecamatan_verified_by = bp.verified_by,
  bp.kecamatan_verified_at = bp.verified_at,
  bp.kecamatan_catatan = bp.catatan_verifikasi
WHERE u.role = 'kecamatan' AND bp.verified_by IS NOT NULL;

-- Update existing proposals: set dpmd_status for submissions that went to DPMD
UPDATE `bankeu_proposals`
SET 
  dpmd_status = CASE 
    WHEN status = 'verified' AND submitted_to_dpmd = 1 THEN 'approved'
    WHEN status = 'rejected' AND submitted_to_dpmd = 1 THEN 'rejected'
    WHEN status = 'revision' AND submitted_to_dpmd = 1 THEN 'revision'
    ELSE NULL
  END
WHERE submitted_to_dpmd = 1;
