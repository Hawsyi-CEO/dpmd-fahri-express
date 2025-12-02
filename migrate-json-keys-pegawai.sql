-- Migration: Update JSON format in kegiatan_bidang.pegawai
-- Change id_personil -> id_pegawai and nama_personil -> nama_pegawai
-- Date: 2025-12-02

UPDATE kegiatan_bidang 
SET pegawai = REPLACE(REPLACE(pegawai, 'id_personil', 'id_pegawai'), 'nama_personil', 'nama_pegawai')
WHERE pegawai LIKE '%id_personil%' OR pegawai LIKE '%nama_personil%';

-- Verification
SELECT COUNT(*) as total_updated 
FROM kegiatan_bidang 
WHERE pegawai LIKE '%id_pegawai%' AND pegawai LIKE '%nama_pegawai%';

SELECT 'Migration completed - JSON keys updated' as status;
