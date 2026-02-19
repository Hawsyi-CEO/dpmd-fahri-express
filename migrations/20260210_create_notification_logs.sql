-- Create notification_logs table
CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `target_type` VARCHAR(50) NOT NULL COMMENT 'broadcast, roles, users',
  `target_value` TEXT NULL COMMENT 'JSON: role names or user IDs',
  `sent_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `sender_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `notification_logs_sender_id_index` (`sender_id`),
  INDEX `notification_logs_created_at_index` (`created_at`),
  CONSTRAINT `notification_logs_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
