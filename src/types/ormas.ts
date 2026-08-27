export interface OrmasItem {
  id: number;
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
}
