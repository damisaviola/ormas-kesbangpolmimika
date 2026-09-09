export type OrmasSubmissionStatus =
  | 'draft'
  | 'menunggu'
  | 'verifikasi_berkas'
  | 'verifikasi_lapangan'
  | 'disetujui'
  | 'ditolak'
  | 'revisi';

export interface DokumenPersyaratan {
  id: string;
  namaDokumen: string;
  wajib: boolean;
  deskripsi: string;
  format: string;
  ukuranMaks: string;
  statusUnggah: 'sudah_unggah' | 'belum_unggah' | 'perlu_revisi' | 'terverifikasi';
  namaFile?: string;
  tanggalUnggah?: string;
  catatanVerifikator?: string;
  fileUrl?: string;
}

export interface PengurusOrmas {
  id: string;
  nama: string;
  nik: string;
  jabatan: 'Ketua Umum' | 'Sekretaris' | 'Bendahara' | 'Dewan Pembina' | 'Koordinator Bidang';
  telepon: string;
  email: string;
  alamat: string;
  fotoUrl?: string;
}

export interface OrmasDetailProfile {
  id: string;
  namaOrmas: string;
  singkatan: string;
  jenisOrmas: string;
  nomorAktaNotaris: string;
  namaNotaris: string;
  tanggalPendirian: string;
  npwpOrmas: string;
  alamatSekretariat: string;
  kelurahanDesa: string;
  distrik: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  teleponKantor: string;
  emailResmi: string;
  websiteSosmed: string;
  visiMisi: string;
  tujuanOrganisasi: string;
  nomorSkt?: string;
  tanggalTerbitSkt?: string;
  masaBerlakuSkt?: string;
  statusSkt: 'Aktif' | 'Proses Perpanjangan' | 'Menunggu Verifikasi' | 'Kadaluarsa';
}

export interface RiwayatPengajuanOrmas {
  id: string;
  nomorTiket: string;
  jenisPengajuan: 'Pendaftaran Baru SKT' | 'Perpanjangan SKT' | 'Perubahan Susunan Pengurus' | 'Pelaporan Kegiatan';
  tanggalPengajuan: string;
  status: OrmasSubmissionStatus;
  tahapanAktif: number; // 1 to 4
  catatanVerifikator?: string;
  estimasiSelesai: string;
  dokumenLampiranCount: number;
  petugasVerifikator?: string;
}

export interface OrmasTimelineStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected';
  date?: string;
}

export interface UserOrmasProfile {
  id: string;
  namaLengkap: string;
  nik: string;
  email: string;
  telepon: string;
  jabatanDiOrmas: string;
  namaOrmas: string;
  alamatTinggal: string;
  terakhirLogin: string;
  avatarUrl?: string;
}
