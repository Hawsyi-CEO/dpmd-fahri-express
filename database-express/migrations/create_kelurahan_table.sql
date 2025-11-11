-- Migration: Create kelurahan table
-- Description: Table untuk menyimpan data kelurahan/desa

CREATE TABLE IF NOT EXISTS kelurahan (
    id_kelurahan INT AUTO_INCREMENT PRIMARY KEY,
    kelurahan VARCHAR(255) NOT NULL,
    id_kecamatan INT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_kelurahan (kelurahan),
    INDEX idx_kecamatan (id_kecamatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
