export type StatusPengajuan =
  | 'disiapkan'
  | 'diajukan'
  | 'ditolak'
  | 'resmi'
  | 'bubar'
  | 'ditangguhkan'
  | 'menunggu'
  | 'proses'
  | 'disetujui'
  | 'Disiapkan'
  | 'Diajukan'
  | 'Ditolak'
  | 'Resmi'
  | 'Bubar'
  | 'Ditangguhkan';
export type UserRole = 'admin' | 'pengguna';

export interface OrmasSubmission {
  id: string;
  namaOrmas: string;
  singkatan?: string;
  jenisOrmas: string;
  ketuaUmum: string;
  alamat?: string;
  pendaftar?: string;
  tanggalPengajuan: string;
  status: StatusPengajuan;
  nomorRegistrasi?: string;
  catatan?: string;
  berkasUrl?: string;
  distrik?: string;
  kodePos?: string;
  telepon?: string;
  email?: string;
  pendaftarEmail?: string;
  userId?: string;
  kategori?: string;
  isCustomSubmission?: boolean;
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
  nik?: string;
  role: UserRole;
  rawRole?: string;
  userType?: 'admin' | 'pengajuan';
  status: 'aktif' | 'nonaktif';
  instansi: string;
  terakhirLogin: string;
  tanggalDaftar?: string;
  telepon?: string;
  password?: string;
  ormasId?: string | null;
  ormasNama?: string | null;
  singkatan?: string | null;
  statusSkt?: string | null;
  nomorTiket?: string | null;
  jumlahPengajuan?: number;
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
