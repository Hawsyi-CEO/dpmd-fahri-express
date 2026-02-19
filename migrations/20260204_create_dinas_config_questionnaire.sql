-- Migration: Create tables for Dinas Configuration and Verification Questionnaire
-- Date: 2026-02-04
-- Description: Add tables for storing dinas PIC signature/info and verification checklist responses

-- 1. Dinas Configuration Table (TTD + PIC Info)
CREATE TABLE IF NOT EXISTS dinas_config (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  dinas_id INT UNSIGNED NOT NULL,
  nama_pic VARCHAR(255) COMMENT 'Nama Penanggung Jawab Dinas',
  nip_pic VARCHAR(50) COMMENT 'NIP Penanggung Jawab',
  jabatan_pic VARCHAR(255) COMMENT 'Jabatan PIC (ex: Kepala UPT PU)',
  ttd_path VARCHAR(255) COMMENT 'Path to signature image file',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dinas (dinas_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Verification Questionnaire Table (13 Item Checklist)
CREATE TABLE IF NOT EXISTS bankeu_verification_questionnaire (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  proposal_id BIGINT UNSIGNED NOT NULL COMMENT 'ID Proposal yang diverifikasi',
  verifier_type ENUM('dinas', 'ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3') NOT NULL COMMENT 'Tipe verifikator',
  verifier_id BIGINT UNSIGNED COMMENT 'bidang_id (dinas) or user_id (kecamatan tim)',
  
  -- 13 Checklist Items (ok = √, not_ok = -)
  item_1 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Surat Pengantar dari Kepala Desa',
  item_2 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Surat Permohonan Bantuan Keuangan',
  item_3 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Proposal Bankeu (Latar Belakang, Maksud Tujuan, dll)',
  item_4 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Rencana Penggunaan Bantuan Keuangan dan RAB',
  item_5 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Foto lokasi rencana pelaksanaan kegiatan (0%)',
  item_6 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Peta dan titik lokasi rencana kegiatan',
  item_7 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Berita Acara Hasil Musyawarah Desa',
  item_8 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'SK Kepala Desa tentang TPK',
  item_9 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Ketersediaan lahan dan kepastian status lahan',
  item_10 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Tidak Duplikasi Anggaran',
  item_11 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Kesesuaian antara lokasi dan usulan',
  item_12 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Kesesuaian RAB dengan standar harga desa',
  item_13 ENUM('ok', 'not_ok') DEFAULT 'ok' COMMENT 'Kesesuaian dengan standar teknis konstruksi',
  
  catatan TEXT COMMENT 'Catatan tambahan dari verifikator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_proposal_verifier (proposal_id, verifier_type, verifier_id),
  FOREIGN KEY (proposal_id) REFERENCES bankeu_proposals(id) ON DELETE CASCADE,
  INDEX idx_proposal (proposal_id),
  INDEX idx_verifier (verifier_type, verifier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to tables
ALTER TABLE dinas_config COMMENT = 'Konfigurasi PIC dan Tanda Tangan Dinas untuk Berita Acara';
ALTER TABLE bankeu_verification_questionnaire COMMENT = 'Jawaban Quisioner Verifikasi 13 Item untuk Berita Acara';
