-- Migration: Rename surat fields to use _path suffix
-- Date: 2026-02-04
-- Fix: Field names harus konsisten dengan naming convention

ALTER TABLE `desa_bankeu_surat`
CHANGE COLUMN `surat_pengantar` `surat_pengantar_path` VARCHAR(255) NULL,
CHANGE COLUMN `surat_permohonan` `surat_permohonan_path` VARCHAR(255) NULL;

-- Rollback:
-- ALTER TABLE `desa_bankeu_surat`
-- CHANGE COLUMN `surat_pengantar_path` `surat_pengantar` VARCHAR(255) NULL,
-- CHANGE COLUMN `surat_permohonan_path` `surat_permohonan` VARCHAR(255) NULL;
