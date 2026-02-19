-- Migration: Add kegiatan detail fields to bankeu_proposals
-- Date: 2026-01-30
-- Description: Add nama_kegiatan, lokasi, volume, anggaran fields for Desa to fill per proposal

ALTER TABLE bankeu_proposals
ADD COLUMN nama_kegiatan VARCHAR(255) NULL AFTER judul_proposal,
ADD COLUMN lokasi VARCHAR(255) NULL AFTER nama_kegiatan,
ADD COLUMN volume VARCHAR(100) NULL AFTER lokasi,
ADD COLUMN anggaran VARCHAR(100) NULL AFTER volume;

-- Update existing records with default values (optional)
-- UPDATE bankeu_proposals SET nama_kegiatan = '', lokasi = '', volume = '', anggaran = '' WHERE nama_kegiatan IS NULL;
