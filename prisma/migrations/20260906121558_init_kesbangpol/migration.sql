-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(30) NULL,
    `nik` VARCHAR(20) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin_ormas',
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `instansi` VARCHAR(191) NULL DEFAULT 'Badan Kesbangpol Kabupaten Mimika',
    `telepon` VARCHAR(25) NULL,
    `avatar_url` TEXT NULL,
    `terakhir_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ormas` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `nama_ormas` VARCHAR(191) NOT NULL,
    `singkatan` VARCHAR(50) NULL,
    `jenis_ormas` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NULL DEFAULT 'Lembaga Swadaya Masyarakat',
    `nomor_akta_notaris` VARCHAR(191) NULL,
    `nama_notaris` VARCHAR(191) NULL,
    `tanggal_pendirian` VARCHAR(191) NULL,
    `npwp_ormas` VARCHAR(35) NULL,
    `alamat_sekretariat` TEXT NOT NULL,
    `kelurahan_desa` VARCHAR(191) NULL,
    `distrik` VARCHAR(191) NOT NULL DEFAULT 'Mimika Baru',
    `kabupaten` VARCHAR(191) NOT NULL DEFAULT 'Kabupaten Mimika',
    `provinsi` VARCHAR(191) NOT NULL DEFAULT 'Papua Tengah',
    `kode_pos` VARCHAR(10) NULL DEFAULT '99910',
    `telepon_kantor` VARCHAR(25) NULL,
    `email_resmi` VARCHAR(191) NULL,
    `website_sosmed` VARCHAR(191) NULL,
    `visi_misi` TEXT NULL,
    `tujuan_organisasi` TEXT NULL,
    `nomor_skt` VARCHAR(191) NULL,
    `tanggal_terbit_skt` VARCHAR(191) NULL,
    `masa_berlaku_skt` VARCHAR(191) NULL,
    `status_skt` VARCHAR(191) NOT NULL DEFAULT 'Menunggu Verifikasi',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengurus` (
    `id` VARCHAR(191) NOT NULL,
    `ormas_id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(20) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `telepon` VARCHAR(25) NOT NULL,
    `email` VARCHAR(191) NULL,
    `alamat` TEXT NOT NULL,
    `foto_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dokumen_persyaratan` (
    `id` VARCHAR(191) NOT NULL,
    `ormas_id` VARCHAR(191) NOT NULL,
    `nama_dokumen` VARCHAR(191) NOT NULL,
    `wajib` BOOLEAN NOT NULL DEFAULT true,
    `deskripsi` TEXT NULL,
    `format` VARCHAR(10) NOT NULL DEFAULT 'PDF',
    `ukuran_maks` VARCHAR(15) NOT NULL DEFAULT '5 MB',
    `status_unggah` VARCHAR(191) NOT NULL DEFAULT 'belum_unggah',
    `nama_file` VARCHAR(191) NULL,
    `file_url` TEXT NULL,
    `tanggal_unggah` DATETIME(3) NULL,
    `catatan_verifikator` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengajuan` (
    `id` VARCHAR(191) NOT NULL,
    `nomor_tiket` VARCHAR(191) NOT NULL,
    `ormas_id` VARCHAR(191) NOT NULL,
    `jenis_pengajuan` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'menunggu',
    `tahapan_aktif` INTEGER NOT NULL DEFAULT 1,
    `catatan_verifikator` TEXT NULL,
    `estimasi_selesai` VARCHAR(191) NULL,
    `nomor_registrasi` VARCHAR(191) NULL,
    `petugas_verifikator` VARCHAR(191) NULL,
    `tanggal_pengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_disetujui` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengajuan_nomor_tiket_key`(`nomor_tiket`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayat_verifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuan_id` VARCHAR(191) NOT NULL,
    `verifikator_id` VARCHAR(191) NULL,
    `tahap` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_jenis_ormas` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(20) NOT NULL,
    `nama_jenis` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_jenis_ormas_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_jabatan` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(20) NOT NULL,
    `nama_jabatan` VARCHAR(191) NOT NULL,
    `tingkat` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_jabatan_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ormas` ADD CONSTRAINT `ormas_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengurus` ADD CONSTRAINT `pengurus_ormas_id_fkey` FOREIGN KEY (`ormas_id`) REFERENCES `ormas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen_persyaratan` ADD CONSTRAINT `dokumen_persyaratan_ormas_id_fkey` FOREIGN KEY (`ormas_id`) REFERENCES `ormas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengajuan` ADD CONSTRAINT `pengajuan_ormas_id_fkey` FOREIGN KEY (`ormas_id`) REFERENCES `ormas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `riwayat_verifikasi` ADD CONSTRAINT `riwayat_verifikasi_pengajuan_id_fkey` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `riwayat_verifikasi` ADD CONSTRAINT `riwayat_verifikasi_verifikator_id_fkey` FOREIGN KEY (`verifikator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
