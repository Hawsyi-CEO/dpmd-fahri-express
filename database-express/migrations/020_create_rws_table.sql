-- Create RWs (Rukun Warga) Table
CREATE TABLE IF NOT EXISTS rws (
    id CHAR(36) PRIMARY KEY,
    desa_id INT UNSIGNED NOT NULL,
    nomor VARCHAR(255) NOT NULL,
    alamat VARCHAR(255) NULL,
    status_kelembagaan ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    status_verifikasi ENUM('verified', 'unverified') DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_desa_nomor (desa_id, nomor),
    CONSTRAINT rws_desa_id_foreign FOREIGN KEY (desa_id) 
        REFERENCES desas(id_desa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
