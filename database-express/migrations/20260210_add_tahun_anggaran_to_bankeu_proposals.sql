-- Migration: Add tahun_anggaran column to bankeu_proposals
-- Date: 2026-02-10
-- Description: Tambah kolom tahun_anggaran untuk memisahkan proposal berdasarkan tahun anggaran

-- Add tahun_anggaran column
ALTER TABLE bankeu_proposals
ADD COLUMN tahun_anggaran YEAR NOT NULL DEFAULT 2026 
COMMENT 'Tahun anggaran untuk proposal ini (e.g., 2026, 2027)'
AFTER desa_id;

-- Add index for better query performance
CREATE INDEX idx_tahun_anggaran ON bankeu_proposals (tahun_anggaran);

-- Update existing proposals based on created_at year
UPDATE bankeu_proposals 
SET tahun_anggaran = YEAR(created_at)
WHERE tahun_anggaran IS NULL OR tahun_anggaran = 0;
