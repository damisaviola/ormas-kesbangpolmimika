import {
  OrmasSubmission,
  RegisteredOrmas,
  UserAccount,
  JenisOrmasItem,
  JabatanItem,
  DashboardMetric,
} from '@/types/dashboard';

export const INITIAL_METRICS: DashboardMetric[] = [
  {
    title: 'Total Ormas Terdaftar',
    value: '0',
    change: '0%',
    trend: 'neutral',
    description: 'Terdaftar di Kesbangpol Mimika',
  },
  {
    title: 'Pengajuan Masuk',
    value: '0',
    change: '0%',
    trend: 'neutral',
    description: 'Bulan ini (Menunggu & Proses)',
  },
  {
    title: 'Pengajuan Disetujui',
    value: '0',
    change: '0%',
    trend: 'neutral',
    description: 'Telah memiliki SKT / SK',
  },
  {
    title: 'Verifikasi Ditolak/Revisi',
    value: '0',
    change: '0%',
    trend: 'neutral',
    description: 'Perlu kelengkapan berkas',
  },
];

export const INITIAL_SUBMISSIONS: OrmasSubmission[] = [];

export const INITIAL_REGISTERED_ORMAS: RegisteredOrmas[] = [];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    nama: 'Administrator Utama',
    email: 'admin.kesbangpol@mimikakab.go.id',
    nip: '19850423 201001 1 002',
    role: 'admin',
    status: 'aktif',
    instansi: 'Badan Kesbangpol Kabupaten Mimika',
    terakhirLogin: '28 Agt 2026, 06:10 WIT',
    tanggalDaftar: '01 Jan 2024, 08:00 WIT',
    telepon: '0811-480-1234',
  },
  {
    id: 'USR-ORMAS-001',
    nama: 'Ketua Ormas Pemuda Mimika',
    email: 'ormas@mimika.go.id',
    nip: '-',
    role: 'pengguna',
    status: 'aktif',
    instansi: 'Forum Pemuda Peduli Mimika',
    terakhirLogin: 'Baru saja',
    tanggalDaftar: '01 Agt 2026, 10:00 WIT',
    telepon: '0812-3456-7890',
  },
];

export const INITIAL_JENIS_ORMAS: JenisOrmasItem[] = [
  {
    id: 'JNS-001',
    kode: 'ORMAS',
    namaJenis: 'ORMAS',
    deskripsi: 'Organisasi Kemasyarakatan umum di Kabupaten Mimika.',
    jumlahOrmas: 120,
    status: 'aktif',
  },
  {
    id: 'JNS-002',
    kode: 'FKUB',
    namaJenis: 'FKUB',
    deskripsi: 'Forum Kerukunan Umat Beragama Kabupaten Mimika.',
    jumlahOrmas: 2,
    status: 'aktif',
  },
];

export const INITIAL_JABATAN: JabatanItem[] = [
  {
    id: 'JBT-001',
    kode: 'KETUM',
    namaJabatan: 'Ketua Umum / Pembina Utama',
    tingkat: 'Utama',
    deskripsi: 'Pimpinan tertinggi penanggung jawab kegiatan dan legalitas organisasi.',
    status: 'aktif',
  },
  {
    id: 'JBT-002',
    kode: 'WAKET',
    namaJabatan: 'Wakil Ketua Umum',
    tingkat: 'Utama',
    deskripsi: 'Mendampingi dan mewakili Ketua Umum dalam operasional organisasi.',
    status: 'aktif',
  },
  {
    id: 'JBT-003',
    kode: 'SEKGEN',
    namaJabatan: 'Sekretaris / Sekretaris Jenderal',
    tingkat: 'Pengurus Harian',
    deskripsi: 'Penanggung jawab administrasi, korespondensi, dan dokumen organisasi.',
    status: 'aktif',
  },
  {
    id: 'JBT-004',
    kode: 'BENDA',
    namaJabatan: 'Bendahara Umum',
    tingkat: 'Pengurus Harian',
    deskripsi: 'Penanggung jawab tata kelola keuangan dan pelaporan anggaran.',
    status: 'aktif',
  },
  {
    id: 'JBT-005',
    kode: 'PEMBINA',
    namaJabatan: 'Dewan Pembina / Penasihat',
    tingkat: 'Pembina/Penasihat',
    deskripsi: 'Pengarah strategis dan penasihat pertimbangan keorganisasian.',
    status: 'aktif',
  },
];
