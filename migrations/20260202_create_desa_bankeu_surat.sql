-- Migration: Create table untuk surat pengantar dan surat permohonan per desa
-- Date: 2026-02-02
-- Description: Tabel untuk menyimpan surat pengantar proposal dan surat permohonan proposal
--              Scope: 1 desa = 1 surat pengantar + 1 surat permohonan untuk semua proposal

CREATE TABLE IF NOT EXISTS desa_bankeu_surat (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  desa_id BIGINT UNSIGNED NOT NULL,
  tahun YEAR NOT NULL DEFAULT 2025,
  surat_pengantar VARCHAR(255) NULL COMMENT 'Filename surat pengantar proposal',
  surat_permohonan VARCHAR(255) NULL COMMENT 'Filename surat permohonan proposal',
  submitted_to_kecamatan BOOLEAN DEFAULT FALSE COMMENT 'Sudah dikirim ke kecamatan atau belum',
  submitted_at TIMESTAMP NULL COMMENT 'Waktu pengiriman ke kecamatan',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_desa_bankeu_surat_desa 
    FOREIGN KEY (desa_id) REFERENCES desas(id) ON DELETE CASCADE,
  
  -- Unique constraint: 1 desa hanya punya 1 record surat per tahun
  UNIQUE KEY unique_desa_tahun (desa_id, tahun),
  
  -- Index untuk performance
  INDEX idx_desa_id (desa_id),
  INDEX idx_tahun (tahun),
  INDEX idx_submitted (submitted_to_kecamatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
