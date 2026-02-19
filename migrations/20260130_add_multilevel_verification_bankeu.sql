-- Migration: Multi-Level Verification for Bankeu Proposals
-- Date: 2026-01-30
-- Flow: Desa -> Dinas Terkait -> Kecamatan -> DPMD

-- Step 1: Add new ENUM for kecamatan_status
ALTER TABLE `bankeu_proposals` 
  MODIFY COLUMN `dinas_status` 
  ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') 
  DEFAULT NULL COMMENT 'Status verifikasi Dinas Terkait';

-- Step 2: Add kecamatan verification fields
ALTER TABLE `bankeu_proposals`
  ADD COLUMN `kecamatan_status` 
    ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') 
    DEFAULT NULL 
    COMMENT 'Status verifikasi Kecamatan' AFTER `dinas_catatan`,
  
  ADD COLUMN `kecamatan_verified_at` 
    TIMESTAMP NULL 
    COMMENT 'Waktu verifikasi Kecamatan' AFTER `kecamatan_status`,
  
  ADD COLUMN `kecamatan_verified_by` 
    BIGINT UNSIGNED NULL 
    COMMENT 'ID user yang verifikasi (Kecamatan)' AFTER `kecamatan_verified_at`,
  
  ADD COLUMN `kecamatan_catatan` 
    TEXT NULL 
    COMMENT 'Catatan dari Kecamatan' AFTER `kecamatan_verified_by`;

-- Step 3: Add DPMD verification fields
ALTER TABLE `bankeu_proposals`
  ADD COLUMN `dpmd_status` 
    ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') 
    DEFAULT NULL 
    COMMENT 'Status verifikasi DPMD' AFTER `kecamatan_catatan`,
  
  ADD COLUMN `dpmd_verified_at` 
    TIMESTAMP NULL 
    COMMENT 'Waktu verifikasi DPMD' AFTER `dpmd_status`,
  
  ADD COLUMN `dpmd_verified_by` 
    BIGINT UNSIGNED NULL 
    COMMENT 'ID user yang verifikasi (DPMD)' AFTER `dpmd_verified_at`,
  
  ADD COLUMN `dpmd_catatan` 
    TEXT NULL 
    COMMENT 'Catatan dari DPMD' AFTER `dpmd_verified_by`;

-- Step 4: Add indexes for performance
ALTER TABLE `bankeu_proposals`
  ADD INDEX `idx_kecamatan_status` (`kecamatan_status`),
  ADD INDEX `idx_kecamatan_verified_by` (`kecamatan_verified_by`),
  ADD INDEX `idx_dpmd_status` (`dpmd_status`),
  ADD INDEX `idx_dpmd_verified_by` (`dpmd_verified_by`);

-- Step 5: Add foreign keys (optional, for referential integrity)
ALTER TABLE `bankeu_proposals`
  ADD CONSTRAINT `fk_bankeu_kecamatan_verified_by` 
    FOREIGN KEY (`kecamatan_verified_by`) 
    REFERENCES `users` (`id`) 
    ON UPDATE NO ACTION 
    ON DELETE SET NULL,
  
  ADD CONSTRAINT `fk_bankeu_dpmd_verified_by` 
    FOREIGN KEY (`dpmd_verified_by`) 
    REFERENCES `users` (`id`) 
    ON UPDATE NO ACTION 
    ON DELETE SET NULL;

-- Step 6: Update existing data (set default kecamatan_status for migrated records)
-- Jika dinas sudah approve, set kecamatan_status = 'pending'
UPDATE `bankeu_proposals`
SET 
  `kecamatan_status` = CASE
    WHEN `dinas_status` = 'approved' AND `submitted_to_kecamatan` = TRUE THEN 'pending'
    ELSE NULL
  END
WHERE `dinas_status` IS NOT NULL;

-- Step 7: Comment for documentation
ALTER TABLE `bankeu_proposals` 
  COMMENT = 'Proposal Bantuan Keuangan dengan Multi-Level Verification (Dinas → Kecamatan → DPMD)';
