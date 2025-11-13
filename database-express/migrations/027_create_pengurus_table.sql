-- Create Pengurus (Kelembagaan Staff) Table
-- This table uses polymorphic relationships to connect to various kelembagaan tables
CREATE TABLE IF NOT EXISTS pengurus (
    id CHAR(36) PRIMARY KEY,
    desa_id INT UNSIGNED NOT NULL,
    
    -- Polymorphic relation to kelembagaan tables
    pengurusable_id CHAR(36) NOT NULL,
    pengurusable_type VARCHAR(255) NOT NULL,
    
    -- Jabatan + periode
    jabatan VARCHAR(255) NOT NULL COMMENT 'Ketua, Sekretaris, Bendahara, dsb',
    tanggal_mulai_jabatan DATE NULL,
    tanggal_akhir_jabatan DATE NULL,
    status_jabatan ENUM('aktif', 'selesai') DEFAULT 'aktif',
    
    -- Status verifikasi data
    status_verifikasi ENUM('verified', 'unverified') DEFAULT 'unverified',
    
    -- Referensi SK Pengangkatan (Produk Hukum desa)
    produk_hukum_id CHAR(36) NULL,
    
    -- Data personal pengurus
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(32) NULL,
    tempat_lahir VARCHAR(255) NULL,
    tanggal_lahir DATE NULL,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan') NULL,
    status_perkawinan VARCHAR(255) NULL,
    alamat TEXT NULL,
    no_telepon VARCHAR(32) NULL,
    pendidikan VARCHAR(255) NULL,
    
    -- File attachments (store filenames only)
    avatar VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pengurusable (pengurusable_type, pengurusable_id),
    INDEX idx_status_jabatan (status_jabatan),
    
    CONSTRAINT pengurus_desa_id_foreign FOREIGN KEY (desa_id) 
        REFERENCES desas(id_desa) ON DELETE CASCADE
    -- Note: produk_hukum_id foreign key constraint removed temporarily
    -- Will be added when produk_hukums table is created
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
