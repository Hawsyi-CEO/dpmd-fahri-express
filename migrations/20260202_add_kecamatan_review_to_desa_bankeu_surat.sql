-- Add kecamatan review fields to desa_bankeu_surat table
-- Migration: 20260202_add_kecamatan_review_to_desa_bankeu_surat.sql

ALTER TABLE desa_bankeu_surat
ADD COLUMN kecamatan_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER submitted_at,
ADD COLUMN kecamatan_reviewed_by BIGINT UNSIGNED NULL AFTER kecamatan_status,
ADD COLUMN kecamatan_reviewed_at TIMESTAMP NULL AFTER kecamatan_reviewed_by,
ADD COLUMN kecamatan_catatan TEXT NULL AFTER kecamatan_reviewed_at,
ADD CONSTRAINT fk_desa_bankeu_surat_reviewer FOREIGN KEY (kecamatan_reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_kecamatan_status ON desa_bankeu_surat(kecamatan_status);
CREATE INDEX idx_submitted_to_kecamatan ON desa_bankeu_surat(submitted_to_kecamatan);
