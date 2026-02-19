-- Migration: Add Dinas Reviewed File Mirroring
-- Date: 2026-02-02
-- Purpose: Menyimpan file reference dari hasil review dinas terkait
--          agar kecamatan punya acuan saat verifikasi ulang

-- Add dinas_reviewed_file column (mirroring file dari dinas)
ALTER TABLE bankeu_proposals 
ADD COLUMN IF NOT EXISTS dinas_reviewed_file VARCHAR(255) NULL AFTER file_proposal,
ADD COLUMN IF NOT EXISTS dinas_reviewed_at TIMESTAMP NULL AFTER dinas_reviewed_file;

-- Add index untuk query performance
CREATE INDEX IF NOT EXISTS idx_dinas_reviewed_at ON bankeu_proposals(dinas_reviewed_at);

-- Add comment
ALTER TABLE bankeu_proposals 
MODIFY COLUMN dinas_reviewed_file VARCHAR(255) NULL COMMENT 'File proposal yang sudah direview oleh dinas terkait (reference untuk kecamatan)',
MODIFY COLUMN dinas_reviewed_at TIMESTAMP NULL COMMENT 'Timestamp kapan dinas melakukan review';

-- Rollback script (jika diperlukan):
-- ALTER TABLE bankeu_proposals DROP COLUMN IF EXISTS dinas_reviewed_file;
-- ALTER TABLE bankeu_proposals DROP COLUMN IF EXISTS dinas_reviewed_at;
-- DROP INDEX IF EXISTS idx_dinas_reviewed_at ON bankeu_proposals;
