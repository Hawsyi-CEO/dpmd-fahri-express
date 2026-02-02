-- Migration: Add nama_kegiatan_spesifik and volume columns to bankeu_proposals
-- Date: 2026-02-01
-- Description: Menambahkan kolom nama_kegiatan_spesifik dan volume untuk detail kegiatan pada proposal

ALTER TABLE bankeu_proposals
ADD COLUMN nama_kegiatan_spesifik VARCHAR(255) NULL COMMENT 'Nama kegiatan spesifik yang diinput desa' AFTER judul_proposal,
ADD COLUMN volume VARCHAR(255) NULL COMMENT 'Volume/kuantitas kegiatan' AFTER nama_kegiatan_spesifik;
