-- Create RTs (Rukun Tetangga) Table
CREATE TABLE IF NOT EXISTS rts (
    id CHAR(36) PRIMARY KEY,
    rw_id CHAR(36) NOT NULL,
    desa_id INT UNSIGNED NOT NULL,
    nomor VARCHAR(255) NOT NULL,
    alamat VARCHAR(255) NULL,
    status_kelembagaan ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    status_verifikasi ENUM('verified', 'unverified') DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rw_nomor (rw_id, nomor),
    CONSTRAINT rts_rw_id_foreign FOREIGN KEY (rw_id) 
        REFERENCES rws(id) ON DELETE CASCADE,
    CONSTRAINT rts_desa_id_foreign FOREIGN KEY (desa_id) 
        REFERENCES desas(id_desa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
