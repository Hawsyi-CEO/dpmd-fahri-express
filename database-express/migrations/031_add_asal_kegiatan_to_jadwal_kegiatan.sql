-- Migration: Add asal_kegiatan column to jadwal_kegiatan table
-- Description: Menambahkan kolom asal_kegiatan untuk mencatat sumber/asal kegiatan (misal: SETDA, DPMD, dll)
-- Date: 2024-12-28

ALTER TABLE `jadwal_kegiatan` 
ADD COLUMN `asal_kegiatan` VARCHAR(255) NULL AFTER `lokasi`;
