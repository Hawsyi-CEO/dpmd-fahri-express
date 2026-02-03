-- Create table for Desa Bankeu Surat (Surat Pengantar & Surat Permohonan)
-- Untuk desa submit surat ke kecamatan untuk review

CREATE TABLE IF NOT EXISTS desa_bankeu_surat (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  desa_id BIGINT UNSIGNED NOT NULL,
  tahun INT NOT NULL DEFAULT 2026,
  
  -- File uploads
  surat_pengantar_path VARCHAR(255),
  surat_permohonan_path VARCHAR(255),
  
  -- Submission status
  submitted_to_kecamatan BOOLEAN DEFAULT FALSE,
  submitted_at DATETIME,
  
  -- Kecamatan review
  kecamatan_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  kecamatan_reviewed_by BIGINT UNSIGNED,
  kecamatan_reviewed_at DATETIME,
  kecamatan_catatan TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (desa_id) REFERENCES desas(id) ON DELETE CASCADE,
  FOREIGN KEY (kecamatan_reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Index
  INDEX idx_desa_tahun (desa_id, tahun),
  INDEX idx_kecamatan_status (kecamatan_status),
  INDEX idx_submitted (submitted_to_kecamatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
