-- Migration: Add lokasi column to bankeu_proposals
-- Date: 2026-02-01
-- Description: Menambahkan kolom lokasi untuk lokasi kegiatan pada proposal

ALTER TABLE bankeu_proposals
ADD COLUMN lokasi VARCHAR(255) NULL COMMENT 'Lokasi kegiatan' AFTER volume;
