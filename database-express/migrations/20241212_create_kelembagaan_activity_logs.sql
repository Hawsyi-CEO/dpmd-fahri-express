-- CreateTable untuk kelembagaan_activity_logs
CREATE TABLE IF NOT EXISTS `kelembagaan_activity_logs` (
    `id` CHAR(36) NOT NULL,
    `kelembagaan_type` VARCHAR(50) NOT NULL,
    `kelembagaan_id` CHAR(36) NOT NULL,
    `kelembagaan_nama` VARCHAR(255) NULL,
    `desa_id` BIGINT UNSIGNED NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `entity_name` VARCHAR(255) NULL,
    `action_description` TEXT NOT NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `user_name` VARCHAR(255) NULL,
    `user_role` VARCHAR(50) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_kelembagaan_type_id`(`kelembagaan_type`, `kelembagaan_id`),
    INDEX `idx_entity_type`(`entity_type`),
    INDEX `idx_desa_id`(`desa_id`),
    INDEX `idx_activity_type`(`activity_type`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kelembagaan_activity_logs` ADD CONSTRAINT `kelembagaan_logs_desa_id_foreign` FOREIGN KEY (`desa_id`) REFERENCES `desas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelembagaan_activity_logs` ADD CONSTRAINT `kelembagaan_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
