-- Migration: Create produk_hukums table
-- Created: 2025-11-12
-- Description: Tabel untuk menyimpan data produk hukum desa

CREATE TABLE IF NOT EXISTS produk_hukums (
    id CHAR(36) PRIMARY KEY,
    desa_id INT UNSIGNED NOT NULL,
    tipe_dokumen VARCHAR(255) DEFAULT 'Peraturan Perundang-undangan',
    judul VARCHAR(255) NOT NULL,
    nomor VARCHAR(255) NOT NULL,
    tahun YEAR NOT NULL,
    jenis ENUM('Peraturan Desa', 'Peraturan Kepala Desa', 'Keputusan Kepala Desa') NOT NULL,
    singkatan_jenis ENUM('PERDES', 'PERKADES', 'SK KADES') NOT NULL,
    tempat_penetapan VARCHAR(255) NOT NULL,
    tanggal_penetapan DATE NOT NULL,
    sumber VARCHAR(255) NULL,
    subjek VARCHAR(255) NULL,
    status_peraturan ENUM('berlaku', 'dicabut') DEFAULT 'berlaku',
    keterangan_status VARCHAR(255) NULL,
    bahasa VARCHAR(255) DEFAULT 'Indonesia',
    bidang_hukum VARCHAR(255) DEFAULT 'Tata Negara',
    file VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (desa_id) REFERENCES desas(id_desa) ON DELETE CASCADE,
    INDEX idx_desa_id (desa_id),
    INDEX idx_status_peraturan (status_peraturan),
    INDEX idx_jenis (jenis),
    INDEX idx_tahun (tahun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
