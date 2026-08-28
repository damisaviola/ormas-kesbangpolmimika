export type StatusPengajuan = 'menunggu' | 'proses' | 'disetujui' | 'ditolak';
export type UserRole = 'superadmin' | 'verifikator' | 'admin_ormas';

export interface OrmasSubmission {
  id: string;
  namaOrmas: string;
  singkatan?: string;
  jenisOrmas: string;
  ketuaUmum: string;
  tanggalPengajuan: string;
  status: StatusPengajuan;
  nomorRegistrasi?: string;
  catatan?: string;
  berkasUrl?: string;
}

export interface RegisteredOrmas {
  id: string;
  namaOrmas: string;
  singkatan: string;
  jenisOrmas: string;
  ketuaUmum: string;
  alamat: string;
  telepon: string;
  email: string;
  statusSk: 'Aktif' | 'Perpanjangan' | 'Kadaluarsa';
  nomorSk: string;
  tanggalBerlaku: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  nip: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  instansi: string;
  terakhirLogin: string;
}

export interface JenisOrmasItem {
  id: string;
  kode: string;
  namaJenis: string;
  deskripsi: string;
  jumlahOrmas: number;
  status: 'aktif' | 'nonaktif';
}

export interface JabatanItem {
  id: string;
  kode: string;
  namaJabatan: string;
  tingkat: 'Utama' | 'Pengurus Harian' | 'Pembina/Penasihat' | 'Divisi';
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
}

export interface DashboardMetric {
  title: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}
