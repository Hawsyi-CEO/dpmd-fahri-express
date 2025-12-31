-- Migration: Create activity_logs table for tracking all user activities
-- Date: 2025-12-27
-- Purpose: Track all CRUD operations performed by users across all modules

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL,
  `bidang_id` BIGINT UNSIGNED NULL,
  `module` VARCHAR(100) NOT NULL COMMENT 'Module name: bumdes, musdesus, kelembagaan, etc',
  `action` ENUM('create', 'update', 'delete', 'approve', 'reject', 'upload', 'download') NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL COMMENT 'Table or entity name',
  `entity_id` BIGINT UNSIGNED NULL,
  `entity_name` VARCHAR(255) NULL COMMENT 'Name of the entity for easy reference',
  `description` TEXT NOT NULL COMMENT 'Human-readable description',
  `old_value` JSON NULL COMMENT 'Previous data before change',
  `new_value` JSON NULL COMMENT 'New data after change',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_bidang_id` (`bidang_id`),
  INDEX `idx_module` (`module`),
  INDEX `idx_action` (`action`),
  INDEX `idx_entity_type` (`entity_type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`bidang_id`) REFERENCES `bidangs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Activity logs for all user actions';

-- Sample data
INSERT INTO `activity_logs` (`user_id`, `user_name`, `user_role`, `bidang_id`, `module`, `action`, `entity_type`, `entity_id`, `entity_name`, `description`) VALUES
(1, 'Super Admin', 'superadmin', NULL, 'bumdes', 'create', 'bumdes', 1, 'BUMDes Maju Jaya', 'Super Admin membuat BUMDes baru: BUMDes Maju Jaya'),
(1, 'Super Admin', 'superadmin', NULL, 'bumdes', 'update', 'bumdes', 1, 'BUMDes Sejahtera', 'Super Admin mengubah nama BUMDes dari "BUMDes Maju Jaya" menjadi "BUMDes Sejahtera"');
