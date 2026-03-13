-- Create notifications table for storing push notification history
-- Replaces the previous approach of querying activity_logs as notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Target user who receives the notification',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'Type: disposisi, kegiatan, jadwal, bankeu, manual, test, broadcast, system',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `data` JSON NULL COMMENT 'Additional data (URL, related IDs, etc)',
  `sent_by` BIGINT UNSIGNED NULL COMMENT 'User who triggered the notification',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user_id` (`user_id`),
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`),
  INDEX `idx_notifications_created` (`created_at`),
  INDEX `idx_notifications_type` (`type`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_sent_by` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
