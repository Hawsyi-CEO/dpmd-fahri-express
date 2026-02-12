-- Migration: Add signature, stamp and kop surat columns to kecamatan_bankeu_config
-- Created: 2026-01-28

-- Tambah kolom untuk kop surat
ALTER TABLE kecamatan_bankeu_config 
ADD COLUMN telepon VARCHAR(50) DEFAULT NULL COMMENT 'Telepon kantor kecamatan' AFTER alamat,
ADD COLUMN email VARCHAR(100) DEFAULT NULL COMMENT 'Email kantor kecamatan' AFTER telepon,
ADD COLUMN website VARCHAR(150) DEFAULT NULL COMMENT 'Website kecamatan' AFTER email,
ADD COLUMN kode_pos VARCHAR(10) DEFAULT NULL COMMENT 'Kode pos' AFTER website;

-- Tambah kolom untuk tanda tangan camat dan stempel
ALTER TABLE kecamatan_bankeu_config 
ADD COLUMN ttd_camat_path VARCHAR(255) DEFAULT NULL COMMENT 'Path to camat signature image' AFTER kode_pos,
ADD COLUMN stempel_path VARCHAR(255) DEFAULT NULL COMMENT 'Path to kecamatan stamp image' AFTER ttd_camat_path;
