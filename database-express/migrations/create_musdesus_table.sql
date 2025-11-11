-- Migration: Create musdesus table
-- Description: Table untuk menyimpan data dan dokumen Musyawarah Desa

CREATE TABLE IF NOT EXISTS musdesus (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_file VARCHAR(255) NOT NULL COMMENT 'Nama file yang tersimpan di server (dengan timestamp)',
    nama_file_asli VARCHAR(255) NOT NULL COMMENT 'Nama file asli yang diupload user',
    path_file VARCHAR(255) NOT NULL COMMENT 'Path lengkap file di storage',
    mime_type VARCHAR(255) NOT NULL COMMENT 'MIME type file (application/pdf, etc)',
    ukuran_file BIGINT NOT NULL,
    nama_pengupload VARCHAR(255) NOT NULL,
    email_pengupload VARCHAR(255) NULL,
    telepon_pengupload VARCHAR(255) NULL,
    desa_id BIGINT UNSIGNED NOT NULL,
    kecamatan_id BIGINT UNSIGNED NOT NULL,
    petugas_id BIGINT UNSIGNED NULL,
    keterangan TEXT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    catatan_admin TEXT NULL,
    tanggal_musdesus TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_desa_id (desa_id),
    INDEX idx_kecamatan_id (kecamatan_id),
    INDEX idx_petugas_id (petugas_id),
    INDEX idx_status (status),
    INDEX idx_tanggal_musdesus (tanggal_musdesus),
    
    CONSTRAINT musdesus_desa_id_foreign 
        FOREIGN KEY (desa_id) 
        REFERENCES desas(id) 
        ON DELETE CASCADE,
    CONSTRAINT musdesus_kecamatan_id_foreign 
        FOREIGN KEY (kecamatan_id) 
        REFERENCES kecamatans(id) 
        ON DELETE CASCADE,
    CONSTRAINT musdesus_petugas_id_foreign 
        FOREIGN KEY (petugas_id) 
        REFERENCES petugas_monitoring(id_petugas) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
