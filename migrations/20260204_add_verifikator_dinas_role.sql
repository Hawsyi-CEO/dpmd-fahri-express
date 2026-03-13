-- Migration: Add verifikator_dinas role to users_role enum
-- Date: 2026-02-04
-- Description: Menambahkan role 'verifikator_dinas' untuk user yang ditunjuk dinas untuk melakukan verifikasi bankeu

-- Step 1: Add new role to enum
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM(
  'superadmin',
  'kepala_dinas',
  'sekretaris_dinas',
  'kepala_bidang',
  'ketua_tim',
  'pegawai',
  'desa',
  'kecamatan',
  'dinas_terkait',
  'verifikator_dinas'
) NOT NULL DEFAULT 'desa';

-- Step 2: Create table for verifikator_dinas assignments (optional - for tracking)
-- NOTE: dinas_id references master_dinas table (dinas terkait)
CREATE TABLE IF NOT EXISTS `dinas_verifikator` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `dinas_id` INT NOT NULL COMMENT 'References master_dinas.id',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `nip` VARCHAR(50) NULL,
  `jabatan` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`dinas_id`) REFERENCES `master_dinas`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  
  UNIQUE KEY `unique_user_per_dinas` (`dinas_id`, `user_id`),
  INDEX `idx_dinas_id` (`dinas_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
