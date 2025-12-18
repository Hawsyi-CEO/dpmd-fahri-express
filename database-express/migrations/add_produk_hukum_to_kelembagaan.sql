-- Add produk_hukum_id to karang_tarunas, lpms, pkks, rts, and posyandus
-- Migration: add_produk_hukum_to_kelembagaan
-- Date: 2025-12-15

-- Add produk_hukum_id to karang_tarunas
ALTER TABLE karang_tarunas 
ADD COLUMN produk_hukum_id CHAR(36) NULL AFTER updated_at,
ADD INDEX karang_tarunas_produk_hukum_id_foreign (produk_hukum_id),
ADD CONSTRAINT karang_tarunas_produk_hukum_id_foreign 
  FOREIGN KEY (produk_hukum_id) 
  REFERENCES produk_hukums(id) 
  ON UPDATE NO ACTION 
  ON DELETE NO ACTION;

-- Add produk_hukum_id to lpms
ALTER TABLE lpms 
ADD COLUMN produk_hukum_id CHAR(36) NULL AFTER updated_at,
ADD INDEX lpms_produk_hukum_id_foreign (produk_hukum_id),
ADD CONSTRAINT lpms_produk_hukum_id_foreign 
  FOREIGN KEY (produk_hukum_id) 
  REFERENCES produk_hukums(id) 
  ON UPDATE NO ACTION 
  ON DELETE NO ACTION;

-- Add produk_hukum_id to pkks
ALTER TABLE pkks 
ADD COLUMN produk_hukum_id CHAR(36) NULL AFTER updated_at,
ADD INDEX pkks_produk_hukum_id_foreign (produk_hukum_id),
ADD CONSTRAINT pkks_produk_hukum_id_foreign 
  FOREIGN KEY (produk_hukum_id) 
  REFERENCES produk_hukums(id) 
  ON UPDATE NO ACTION 
  ON DELETE NO ACTION;

-- Add produk_hukum_id to rts
ALTER TABLE rts 
ADD COLUMN produk_hukum_id CHAR(36) NULL AFTER updated_at,
ADD INDEX rts_produk_hukum_id_foreign (produk_hukum_id),
ADD CONSTRAINT rts_produk_hukum_id_foreign 
  FOREIGN KEY (produk_hukum_id) 
  REFERENCES produk_hukums(id) 
  ON UPDATE NO ACTION 
  ON DELETE NO ACTION;

-- Add produk_hukum_id to posyandus
ALTER TABLE posyandus 
ADD COLUMN produk_hukum_id CHAR(36) NULL AFTER updated_at,
ADD INDEX posyandus_produk_hukum_id_foreign (produk_hukum_id),
ADD CONSTRAINT posyandus_produk_hukum_id_foreign 
  FOREIGN KEY (produk_hukum_id) 
  REFERENCES produk_hukums(id) 
  ON UPDATE NO ACTION 
  ON DELETE NO ACTION;
