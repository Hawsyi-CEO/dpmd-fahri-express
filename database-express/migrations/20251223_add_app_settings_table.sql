-- Migration: Add app_settings table for application-wide settings
-- Created: 2025-12-23
-- Purpose: Store application settings like edit mode status

CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    updated_by_user_id BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX fk_app_settings_user_idx (updated_by_user_id),
    CONSTRAINT fk_app_settings_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default value for kelembagaan_edit_mode
INSERT INTO app_settings (setting_key, setting_value, description) 
VALUES ('kelembagaan_edit_mode', 'false', 'Enable/disable edit mode for kelembagaan and pengurus (true/false)')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- Add foreign key constraint for user tracking (optional)
-- ALTER TABLE app_settings 
-- ADD CONSTRAINT fk_app_settings_user 
-- FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
