-- Add jabatan_penandatangan to kecamatan_bankeu_config
-- Allows selecting "Camat", "Plt. Camat", or "Pj. Camat"
-- Default is "Camat" for existing records

ALTER TABLE kecamatan_bankeu_config
ADD COLUMN jabatan_penandatangan VARCHAR(50) NOT NULL DEFAULT 'Camat' AFTER nip_camat;
