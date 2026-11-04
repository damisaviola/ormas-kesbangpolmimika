export interface OrmasItem {
  id: number | string;
  nama: string;
  singkatan?: string;
  jenis: string;
  kategori: string;
  status: "Resmi" | "Dalam Proses";
  noSkt: string;
  ketua: string;
  alamat: string;
  distrik: string;
  tanggalDaftar: string;
  telepon: string;
  // Field data lengkap (Full Data Ormas)
  email?: string;
  kodePos?: string;
  alamatSekretariat?: string;
  kelurahanDesa?: string;
  kabupaten?: string;
  provinsi?: string;
  nomorAktaNotaris?: string;
  namaNotaris?: string;
  npwpOrmas?: string;
  tanggalTerbitSkt?: string;
  masaBerlakuSkt?: string;
  statusSkt?: string;
  websiteSosmed?: string;
  visiMisi?: string;
  tujuanOrganisasi?: string;
  tanggalPendirian?: string;
}
