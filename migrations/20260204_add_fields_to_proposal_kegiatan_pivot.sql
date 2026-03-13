-- Migration: Add detail fields to bankeu_proposal_kegiatan pivot table
-- Date: 2026-02-04
-- Description: Move volume and lokasi from proposal-level to per-kegiatan level
--              So each kegiatan in a proposal can have its own volume and lokasi

ALTER TABLE `bankeu_proposal_kegiatan`
ADD COLUMN `nama_kegiatan_spesifik` VARCHAR(500) NULL COMMENT 'Nama kegiatan detail yang diinput desa' AFTER `kegiatan_id`,
ADD COLUMN `volume` VARCHAR(255) NULL COMMENT 'Volume kegiatan (contoh: 100 meter, 50 unit)' AFTER `nama_kegiatan_spesifik`,
ADD COLUMN `lokasi` VARCHAR(500) NULL COMMENT 'Lokasi pelaksanaan kegiatan' AFTER `volume`,
ADD COLUMN `anggaran_usulan` DECIMAL(15,2) NULL COMMENT 'Anggaran usulan untuk kegiatan ini' AFTER `lokasi`,
ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Note: 
-- 1. Fields di bankeu_proposals (nama_kegiatan_spesifik, volume, lokasi) akan deprecated
-- 2. Data baru akan menggunakan fields di pivot table ini
-- 3. Backward compatibility: jika ada 1 kegiatan, bisa sync dari proposal level ke pivot

-- Rollback Query (if needed):
-- ALTER TABLE `bankeu_proposal_kegiatan`
-- DROP COLUMN `nama_kegiatan_spesifik`,
-- DROP COLUMN `volume`,
-- DROP COLUMN `lokasi`,
-- DROP COLUMN `anggaran_usulan`,
-- DROP COLUMN `updated_at`;
