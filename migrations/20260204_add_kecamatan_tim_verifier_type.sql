-- Migration: Add kecamatan_tim to verifikasi_type ENUM
-- Date: 2026-02-04
-- Description: Allow tim verifikasi kecamatan to fill questionnaires with dynamic member positions

-- Update ENUM for table bankeu_verification_questionnaires (plural - from Prisma schema)
ALTER TABLE bankeu_verification_questionnaires 
MODIFY COLUMN verifikasi_type ENUM('kecamatan', 'dinas', 'kecamatan_tim') DEFAULT 'kecamatan';

-- Update ENUM for table bankeu_verification_questionnaire (singular - used by controllers)
ALTER TABLE bankeu_verification_questionnaire 
MODIFY COLUMN verifier_type ENUM('dinas', 'ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3', 'kecamatan_tim') NOT NULL;

-- Migration completed successfully
-- Note: Both tables exist in database (plural & singular)
-- - bankeu_verification_questionnaires: Prisma schema, uses verifikasi_type
-- - bankeu_verification_questionnaire: Controllers, uses verifier_type
-- verifier_id format for kecamatan_tim: "{kecamatan_id}_{posisi}" (e.g., "29_ketua", "29_anggota_1")
