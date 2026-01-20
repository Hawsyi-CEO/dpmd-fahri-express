-- Migration: Create bankeu_proposals table
-- Description: Tabel untuk menyimpan proposal Bantuan Keuangan dari Desa

CREATE TABLE IF NOT EXISTS bankeu_proposals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Relasi
    desa_id BIGINT UNSIGNED NOT NULL,
    kecamatan_id BIGINT UNSIGNED NOT NULL,
    
    -- Jenis dan Kegiatan
    jenis_kegiatan ENUM('infrastruktur', 'non_infrastruktur') NOT NULL,
    kegiatan_id TINYINT UNSIGNED NOT NULL COMMENT '1-9 untuk infrastruktur, 1-14 untuk non-infrastruktur',
    kegiatan_nama VARCHAR(255) NOT NULL,
    
    -- Proposal
    judul_proposal VARCHAR(255) NOT NULL,
    deskripsi TEXT DEFAULT NULL,
    file_proposal VARCHAR(255) NOT NULL COMMENT 'Path to uploaded PDF/DOC file',
    file_size INT UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
    
    -- Anggaran
    anggaran_usulan DECIMAL(15,2) DEFAULT NULL,
    
    -- Status Verifikasi
    status ENUM('pending', 'verified', 'rejected', 'revision') DEFAULT 'pending',
    catatan_verifikasi TEXT DEFAULT NULL,
    verified_by BIGINT UNSIGNED DEFAULT NULL COMMENT 'User ID kecamatan yang verifikasi',
    verified_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Berita Acara
    berita_acara_path VARCHAR(255) DEFAULT NULL COMMENT 'Path to generated Berita Acara PDF',
    berita_acara_generated_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Metadata
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User ID desa yang upload',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_desa (desa_id),
    INDEX idx_kecamatan (kecamatan_id),
    INDEX idx_status (status),
    INDEX idx_jenis_kegiatan (jenis_kegiatan),
    INDEX idx_created_by (created_by),
    INDEX idx_verified_by (verified_by),
    
    -- Foreign Keys
    CONSTRAINT fk_bankeu_proposals_desa 
        FOREIGN KEY (desa_id) REFERENCES desas(id) ON DELETE CASCADE,
    CONSTRAINT fk_bankeu_proposals_kecamatan 
        FOREIGN KEY (kecamatan_id) REFERENCES kecamatans(id) ON DELETE CASCADE,
    CONSTRAINT fk_bankeu_proposals_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bankeu_proposals_verified_by 
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert master data kegiatan (sebagai referensi, bisa digunakan untuk validasi)
CREATE TABLE IF NOT EXISTS bankeu_master_kegiatan (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jenis_kegiatan ENUM('infrastruktur', 'non_infrastruktur') NOT NULL,
    urutan TINYINT UNSIGNED NOT NULL,
    nama_kegiatan TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_jenis (jenis_kegiatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert master kegiatan infrastruktur
INSERT INTO bankeu_master_kegiatan (jenis_kegiatan, urutan, nama_kegiatan) VALUES
('infrastruktur', 1, 'Pembangunan/peningkatan/rehabilitasi Jalan Desa/Jalan antar Desa/Jalan Poros Desa dan kelengkapannya, Jembatan Desa dan Jembatan Kawasan'),
('infrastruktur', 2, 'Dinding penahan tanah, tebing, tembok tanah, pasangan bronjong'),
('infrastruktur', 3, 'Pembangunan/Rehabilitasi/rekonstruksi Kantor Desa'),
('infrastruktur', 4, 'Sanitasi lingkungan'),
('infrastruktur', 5, 'Pembangunan/rehabilitasi sarana dan prasarana air bersih berskala desa'),
('infrastruktur', 6, 'Infrastruktur pendukung program Koperasi Desa Merah Putih'),
('infrastruktur', 7, 'Infrastruktur pendukung program Makan Bergizi Gratis'),
('infrastruktur', 8, 'Infrastruktur pendukung pengelolaan sampah berskala Desa'),
('infrastruktur', 9, 'Kegiatan infrastruktur lainnya yang mendukung program prioritas daerah, program regional dan/atau program nasional');

-- Insert master kegiatan non-infrastruktur
INSERT INTO bankeu_master_kegiatan (jenis_kegiatan, urutan, nama_kegiatan) VALUES
('non_infrastruktur', 1, 'Pendukung program pengelolaan sampah berskala desa'),
('non_infrastruktur', 2, 'Pengembangan Data Digital Desa'),
('non_infrastruktur', 3, 'Program Minimal Satu Sarjana Satu Desa'),
('non_infrastruktur', 4, 'Pendukung sekolah Pemerintahan Desa'),
('non_infrastruktur', 5, 'Pendukung program Desa Siaga'),
('non_infrastruktur', 6, 'Pendukung program Peningkatan Peranan Wanita Menuju Keluarga Sehat Sejahtera (P2WKSS)'),
('non_infrastruktur', 7, 'Pendukung program Sekolah Pra Nikah'),
('non_infrastruktur', 8, 'Pendukung program Koperasi Desa Merah Putih'),
('non_infrastruktur', 9, 'Pendukung program Makan Bergizi Gratis'),
('non_infrastruktur', 10, 'Pendukung program Gerakan Pangan Murah'),
('non_infrastruktur', 11, 'Pemberdayaan lembaga kemasyarakatan di Desa'),
('non_infrastruktur', 12, 'Pendukung pembelajaran Sekolah Perempuan'),
('non_infrastruktur', 13, 'Pendukung program bantuan jaminan ketenagakerjaan bagi pekerja rentan'),
('non_infrastruktur', 14, 'Kegiatan noninfrastruktur lainnya yang mendukung program prioritas daerah, program regional dan/atau program nasional');
