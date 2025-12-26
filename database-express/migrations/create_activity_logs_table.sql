-- Create activity_logs table for bidang activities (BUMDes, Bankeu, etc)
-- This is separate from kelembagaan_activity_logs

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `user_name` VARCHAR(255) NULL,
  `user_role` VARCHAR(50) NULL,
  `bidang_id` BIGINT UNSIGNED NULL COMMENT 'Bidang ID (3 for SPKED, etc)',
  `module` VARCHAR(50) NOT NULL COMMENT 'bumdes, bankeu, musdesus, etc',
  `action` VARCHAR(50) NOT NULL COMMENT 'create, update, delete, upload, etc',
  `entity_type` VARCHAR(100) NOT NULL COMMENT 'Table/entity name',
  `entity_id` BIGINT UNSIGNED NULL,
  `entity_name` VARCHAR(255) NULL COMMENT 'Entity name for easy reference',
  `description` TEXT NOT NULL COMMENT 'Human-readable description',
  `old_value` JSON NULL,
  `new_value` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_bidang_id` (`bidang_id`),
  INDEX `idx_module` (`module`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_module_action` (`module`, `action`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
