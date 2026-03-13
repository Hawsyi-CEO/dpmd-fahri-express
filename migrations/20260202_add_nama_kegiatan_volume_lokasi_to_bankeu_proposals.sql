-- Migration: Add nama_kegiatan_spesifik, volume, lokasi to bankeu_proposals
-- Date: 2026-02-02
-- Description: Menambahkan kolom untuk menyimpan detail kegiatan spesifik yang diinput user

ALTER TABLE bankeu_proposals 
ADD COLUMN nama_kegiatan_spesifik VARCHAR(500) AFTER judul_proposal,
ADD COLUMN volume VARCHAR(255) AFTER nama_kegiatan_spesifik,
ADD COLUMN lokasi VARCHAR(500) AFTER volume;

-- Rollback Query (if needed):
-- ALTER TABLE bankeu_proposals 
-- DROP COLUMN nama_kegiatan_spesifik,
-- DROP COLUMN volume,
-- DROP COLUMN lokasi;
