-- Migration: Add proposal_id to tim_verifikasi_kecamatan
-- Tujuan: Memungkinkan anggota tim berbeda per proposal
-- 
-- Logika:
--   - proposal_id = NULL: Berlaku untuk semua proposal (ketua, sekretaris)
--   - proposal_id = ID: Khusus untuk proposal tertentu (anggota)

-- Add proposal_id column
ALTER TABLE `tim_verifikasi_kecamatan` 
ADD COLUMN `proposal_id` BIGINT UNSIGNED NULL AFTER `kecamatan_id`;

-- Add index for faster lookup
CREATE INDEX `idx_proposal_id` ON `tim_verifikasi_kecamatan` (`proposal_id`);

-- Add composite index for kecamatan + proposal
CREATE INDEX `idx_kecamatan_proposal` ON `tim_verifikasi_kecamatan` (`kecamatan_id`, `proposal_id`);

-- Add foreign key to bankeu_proposals (optional, commenting out for flexibility)
-- ALTER TABLE `tim_verifikasi_kecamatan`
-- ADD CONSTRAINT `fk_tim_verifikasi_proposal`
-- FOREIGN KEY (`proposal_id`) REFERENCES `bankeu_proposals` (`id`) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate entries
-- For ketua/sekretaris: unique per kecamatan (proposal_id is NULL)
-- For anggota: unique per kecamatan + proposal + jabatan
ALTER TABLE `tim_verifikasi_kecamatan`
ADD UNIQUE INDEX `idx_unique_tim_member` (`kecamatan_id`, `proposal_id`, `jabatan`);
