-- Migration: Create bumdes table
-- Description: Table untuk menyimpan data BUMDes (Badan Usaha Milik Desa)

CREATE TABLE IF NOT EXISTS bumdes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    desa_id INT NULL,
    kode_desa VARCHAR(50) NULL,
    kecamatan VARCHAR(255) NULL,
    desa VARCHAR(255) NULL,
    namabumdesa VARCHAR(255) NOT NULL,
    status ENUM('aktif', 'tidak aktif') NOT NULL DEFAULT 'aktif',
    keterangan_tidak_aktif TEXT NULL,
    
    -- Legalitas
    NIB VARCHAR(255) NULL,
    LKPP VARCHAR(255) NULL,
    NPWP VARCHAR(255) NULL,
    badanhukum VARCHAR(255) NULL,
    
    -- Pengurus - Penasihat
    NamaPenasihat VARCHAR(255) NULL,
    JenisKelaminPenasihat VARCHAR(255) NULL,
    HPPenasihat VARCHAR(255) NULL,
    
    -- Pengurus - Pengawas
    NamaPengawas VARCHAR(255) NULL,
    JenisKelaminPengawas VARCHAR(255) NULL,
    HPPengawas VARCHAR(255) NULL,
    
    -- Pengurus - Direktur
    NamaDirektur VARCHAR(255) NULL,
    JenisKelaminDirektur VARCHAR(255) NULL,
    HPDirektur VARCHAR(255) NULL,
    
    -- Pengurus - Sekretaris
    NamaSekretaris VARCHAR(255) NULL,
    JenisKelaminSekretaris VARCHAR(255) NULL,
    HPSekretaris VARCHAR(255) NULL,
    
    -- Pengurus - Bendahara
    NamaBendahara VARCHAR(255) NULL,
    JenisKelaminBendahara VARCHAR(255) NULL,
    HPBendahara VARCHAR(255) NULL,
    
    -- Informasi Umum
    TahunPendirian VARCHAR(255) NULL,
    AlamatBumdesa TEXT NULL,
    Alamatemail VARCHAR(255) NULL,
    TotalTenagaKerja INT NULL,
    TelfonBumdes VARCHAR(255) NULL,
    
    -- Jenis Usaha
    JenisUsaha TEXT NULL,
    JenisUsahaUtama VARCHAR(255) NULL,
    JenisUsahaLainnya TEXT NULL,
    
    -- Keuangan 2023-2024
    Omset2023 DECIMAL(15,2) NULL,
    Laba2023 DECIMAL(15,2) NULL,
    Omset2024 DECIMAL(15,2) NULL,
    Laba2024 DECIMAL(15,2) NULL,
    
    -- Penyertaan Modal
    PenyertaanModal2019 DECIMAL(15,2) NULL,
    PenyertaanModal2020 DECIMAL(15,2) NULL,
    PenyertaanModal2021 DECIMAL(15,2) NULL,
    PenyertaanModal2022 DECIMAL(15,2) NULL,
    PenyertaanModal2023 DECIMAL(15,2) NULL,
    PenyertaanModal2024 DECIMAL(15,2) NULL,
    SumberLain DECIMAL(15,2) NULL,
    
    -- Aset
    JenisAset VARCHAR(255) NULL,
    NilaiAset DECIMAL(15,2) NULL,
    
    -- Kemitraan
    KerjasamaPihakKetiga TEXT NULL,
    `TahunMulai-TahunBerakhir` VARCHAR(255) NULL,
    
    -- Kontribusi PADes
    KontribusiTerhadapPADes2021 DECIMAL(15,2) NULL,
    KontribusiTerhadapPADes2022 DECIMAL(15,2) NULL,
    KontribusiTerhadapPADes2023 DECIMAL(15,2) NULL,
    KontribusiTerhadapPADes2024 DECIMAL(15,2) NULL,
    
    -- Program Ketapang
    Ketapang2024 VARCHAR(255) NULL,
    Ketapang2025 VARCHAR(255) NULL,
    
    -- Bantuan
    BantuanKementrian TEXT NULL,
    BantuanLaptopShopee TEXT NULL,
    
    -- Peraturan Desa
    NomorPerdes VARCHAR(255) NULL,
    
    -- Desa Wisata
    DesaWisata VARCHAR(255) NULL,
    
    -- Dokumen Laporan Keuangan (Path file)
    LaporanKeuangan2021 VARCHAR(255) NULL,
    LaporanKeuangan2022 VARCHAR(255) NULL,
    LaporanKeuangan2023 VARCHAR(255) NULL,
    LaporanKeuangan2024 VARCHAR(255) NULL,
    
    -- Dokumen Pendirian (Path file)
    Perdes VARCHAR(255) NULL,
    produk_hukum_perdes_id CHAR(36) NULL,
    ProfilBUMDesa VARCHAR(255) NULL,
    BeritaAcara VARCHAR(255) NULL,
    AnggaranDasar VARCHAR(255) NULL,
    AnggaranRumahTangga VARCHAR(255) NULL,
    ProgramKerja VARCHAR(255) NULL,
    SK_BUM_Desa VARCHAR(255) NULL,
    produk_hukum_sk_bumdes_id CHAR(36) NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_desa_id (desa_id),
    INDEX idx_kode_desa (kode_desa),
    INDEX idx_kecamatan (kecamatan),
    INDEX idx_status (status),
    INDEX idx_produk_hukum_perdes_id (produk_hukum_perdes_id),
    INDEX idx_produk_hukum_sk_bumdes_id (produk_hukum_sk_bumdes_id),
    
    -- Foreign Keys
    CONSTRAINT bumdes_produk_hukum_perdes_id_foreign 
        FOREIGN KEY (produk_hukum_perdes_id) 
        REFERENCES produk_hukums(id) 
        ON DELETE SET NULL,
    CONSTRAINT bumdes_produk_hukum_sk_bumdes_id_foreign 
        FOREIGN KEY (produk_hukum_sk_bumdes_id) 
        REFERENCES produk_hukums(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
