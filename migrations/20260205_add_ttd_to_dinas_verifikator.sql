-- Migration: Add TTD (tanda tangan) field to dinas_verifikator
-- Date: 2026-02-05
-- Description: Menambahkan field ttd_path untuk menyimpan file tanda tangan verifikator

-- Add ttd_path column
ALTER TABLE `dinas_verifikator` 
ADD COLUMN `ttd_path` VARCHAR(255) NULL AFTER `email`;

-- Add pangkat/golongan for completeness
ALTER TABLE `dinas_verifikator` 
ADD COLUMN `pangkat_golongan` VARCHAR(100) NULL AFTER `jabatan`;
