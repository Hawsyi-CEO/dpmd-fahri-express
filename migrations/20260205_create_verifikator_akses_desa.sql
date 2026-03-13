-- Migration: Create verifikator_akses_desa table
-- Description: Tabel untuk menyimpan hak akses verifikator ke desa-desa tertentu
-- Date: 2026-02-05

-- Create table for verifikator access to desas
CREATE TABLE IF NOT EXISTS verifikator_akses_desa (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  verifikator_id BIGINT UNSIGNED NOT NULL,
  desa_id BIGINT UNSIGNED NOT NULL,
  kecamatan_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_verifikator_akses_verifikator 
    FOREIGN KEY (verifikator_id) 
    REFERENCES dinas_verifikator(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_verifikator_akses_desa 
    FOREIGN KEY (desa_id) 
    REFERENCES desas(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_verifikator_akses_kecamatan 
    FOREIGN KEY (kecamatan_id) 
    REFERENCES kecamatans(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint: satu verifikator tidak bisa duplikat akses ke desa yang sama
  UNIQUE KEY unique_verifikator_desa (verifikator_id, desa_id),
  
  -- Indexes for performance
  INDEX idx_verifikator_id (verifikator_id),
  INDEX idx_desa_id (desa_id),
  INDEX idx_kecamatan_id (kecamatan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE verifikator_akses_desa 
COMMENT = 'Hak akses verifikator untuk mengakses proposal dari desa-desa tertentu';
