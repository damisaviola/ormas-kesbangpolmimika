import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Mulai proses seeding database Kesbangpol Mimika...');

  // 1. Seed Users (Hanya Administrator Utama)
  console.log('1. Menyiapkan data Pengguna Admin...');
  const users = [
    {
      id: 'USR-001',
      nama: 'Administrator Utama',
      email: 'admin.kesbangpol@mimikakab.go.id',
      password: 'password123',
      nip: '19850423 201001 1 002',
      role: 'superadmin',
      status: 'aktif',
      instansi: 'Badan Kesbangpol Kabupaten Mimika',
      telepon: '0811-480-1234',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: 'superadmin',
        status: 'aktif',
      },
      create: u,
    });
  }

  // 2. Seed Master Jenis Ormas
  console.log('2. Menyiapkan Master Jenis Ormas...');
  const masterJenis = [
    {
      kode: 'KAG',
      namaJenis: 'Keagamaan',
      deskripsi: 'Organisasi kemasyarakatan yang berbasis keagamaan dan pembinaan kerukunan keagamaan.',
      status: 'aktif',
    },
    {
      kode: 'KPM',
      namaJenis: 'Kepemudaan',
      deskripsi: 'Wadah kepemudaan, karang taruna, dan pemberdayaan generasi muda Kabupaten Mimika.',
      status: 'aktif',
    },
    {
      kode: 'KBD',
      namaJenis: 'Kebudayaan & Adat',
      deskripsi: 'Pelestarian kebudayaan lokal, kelembagaan masyarakat adat 7 suku dan sanggar seni.',
      status: 'aktif',
    },
    {
      kode: 'PRF',
      namaJenis: 'Profesi',
      deskripsi: 'Asosiasi keahlian, himpunan profesi pengusaha, dan ikatan tenaga profesional.',
      status: 'aktif',
    },
    {
      kode: 'SOS',
      namaJenis: 'Sosial Kemasyarakatan',
      deskripsi: 'Organisasi pelayanan sosial, bantuan kemanusiaan, dan pemberdayaan keluarga.',
      status: 'aktif',
    },
    {
      kode: 'LHK',
      namaJenis: 'Lingkungan Hidup',
      deskripsi: 'Konservasi alam, pelestarian hutan mangrove pesisir Mimika, dan sanitasi lingkungan.',
      status: 'aktif',
    },
  ];

  for (const j of masterJenis) {
    await prisma.jenisOrmas.upsert({
      where: { kode: j.kode },
      update: {},
      create: j,
    });
  }

  // 3. Seed Master Jabatan
  console.log('3. Menyiapkan Master Jabatan...');
  const masterJabatan = [
    {
      kode: 'KETUM',
      namaJabatan: 'Ketua Umum / Ketua',
      tingkat: 'Utama',
      deskripsi: 'Pemimpin tertinggi organisasi kemasyarakatan yang bertanggung jawab atas seluruh aktivitas.',
      status: 'aktif',
    },
    {
      kode: 'WAKET',
      namaJabatan: 'Wakil Ketua',
      tingkat: 'Utama',
      deskripsi: 'Membantu Ketua Umum dan menggantikan tugas pimpinan ketika berhalangan.',
      status: 'aktif',
    },
    {
      kode: 'SEKUM',
      namaJabatan: 'Sekretaris Umum / Sekretaris',
      tingkat: 'Pengurus Harian',
      deskripsi: 'Bertanggung jawab atas administrasi, surat-menyurat, arsip, dan kesekretariatan.',
      status: 'aktif',
    },
    {
      kode: 'BEND',
      namaJabatan: 'Bendahara Umum / Bendahara',
      tingkat: 'Pengurus Harian',
      deskripsi: 'Mengelola keuangan, pembukuan kas, serta pelaporan pertanggungjawaban anggaran.',
      status: 'aktif',
    },
    {
      kode: 'PEMB',
      namaJabatan: 'Dewan Pembina / Penasihat',
      tingkat: 'Pembina/Penasihat',
      deskripsi: 'Memberikan arahan strategis, nasihat kebijakan, serta pertimbangan etik.',
      status: 'aktif',
    },
    {
      kode: 'KOORD',
      namaJabatan: 'Koordinator Bidang / Divisi',
      tingkat: 'Divisi',
      deskripsi: 'Memimpin program kerja teknis di bidang pemberdayaan, advokasi, atau sosial.',
      status: 'aktif',
    },
  ];

  for (const jb of masterJabatan) {
    await prisma.jabatan.upsert({
      where: { kode: jb.kode },
      update: {},
      create: jb,
    });
  }
  console.log('✅ Seeding selesai! Database hanya berisi Administrator Utama dan Master Data.');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
