-- Migration: Add bankeu config columns to kecamatans and create tim verifikasi table
-- Created: 2026-01-27

-- Tambah kolom untuk berita acara ke tabel kecamatans (khusus bankeu)
ALTER TABLE kecamatans 
ADD COLUMN nama_camat VARCHAR(255) DEFAULT NULL AFTER nama,
ADD COLUMN nip_camat VARCHAR(50) DEFAULT NULL AFTER nama_camat,
ADD COLUMN logo_path VARCHAR(255) DEFAULT NULL AFTER nip_camat,
ADD COLUMN alamat TEXT DEFAULT NULL AFTER logo_path;

-- Table untuk tim verifikasi kecamatan (khusus bankeu)
CREATE TABLE IF NOT EXISTS tim_verifikasi_kecamatan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kecamatan_id BIGINT UNSIGNED NOT NULL,
    jabatan ENUM('ketua', 'sekretaris', 'anggota') NOT NULL,
    nama VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    urutan TINYINT UNSIGNED NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kecamatan (kecamatan_id),
    INDEX idx_jabatan (jabatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
