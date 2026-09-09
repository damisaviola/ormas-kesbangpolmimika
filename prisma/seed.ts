import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Mulai proses seeding database Kesbangpol Mimika...');

  // 1. Seed Users
  console.log('1. Menyiapkan data Pengguna (Users)...');
  const users = [
    {
      id: 'USR-001',
      nama: 'Administrator Utama',
      email: 'admin.kesbangpol@mimikakab.go.id',
      password: 'password123', // Dalam produksi disarankan menggunakan bcrypt hash
      nip: '19850423 201001 1 002',
      role: 'superadmin',
      status: 'aktif',
      instansi: 'Badan Kesbangpol Kabupaten Mimika',
      telepon: '0811-480-1234',
    },
    {
      id: 'USR-002',
      nama: 'Yance Murib, S.STP',
      email: 'yance.verifikator@mimikakab.go.id',
      password: 'password123',
      nip: '19900815 201503 1 003',
      role: 'verifikator',
      status: 'aktif',
      instansi: 'Bidang Ketahanan Ekonomi & Ormas',
      telepon: '0812-4809-5678',
    },
    {
      id: 'USR-003',
      nama: 'Maria Magdalena Maparey',
      email: 'maria.pwkm@gmail.com',
      password: 'password123',
      nik: '9109015508880002',
      role: 'admin_ormas',
      status: 'aktif',
      instansi: 'Persatuan Wanita Kamoro Mimika',
      telepon: '0812-4809-1122',
    },
    {
      id: 'USR-004',
      nama: 'Stevanus Kilangin',
      email: 'stevanus@hipmimimika.or.id',
      password: 'password123',
      nik: '9109014502870001',
      role: 'admin_ormas',
      status: 'aktif',
      instansi: 'HIPMI Mimika',
      telepon: '0813-4455-8899',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
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

  // 4. Seed Data Ormas & Susunan Pengurus
  console.log('4. Menyiapkan data Profil Ormas & Pengurus...');
  const ormasPWKM = await prisma.ormas.upsert({
    where: { id: 'ORM-PWKM-2026' },
    update: {},
    create: {
      id: 'ORM-PWKM-2026',
      userId: 'USR-003', // Terhubung ke user Maria Magdalena Maparey
      namaOrmas: 'Persatuan Wanita Kamoro Mimika',
      singkatan: 'PWKM',
      jenisOrmas: 'Kebudayaan & Adat',
      nomorAktaNotaris: 'AHU-0012984.AH.01.07.TAHUN 2024',
      namaNotaris: 'Fransiskus X. Rumere, S.H., M.Kn.',
      tanggalPendirian: '14 Agustus 2020',
      npwpOrmas: '84.992.102.4-953.000',
      alamatSekretariat: 'Jl. Cendrawasih SP2, Gg. Damai No. 18, Kel. Timika Indah',
      kelurahanDesa: 'Timika Indah',
      distrik: 'Mimika Baru',
      kabupaten: 'Kabupaten Mimika',
      provinsi: 'Papua Tengah',
      kodePos: '99910',
      teleponKantor: '0812-4809-1122',
      emailResmi: 'sekretariat.pwkm@gmail.com',
      websiteSosmed: 'facebook.com/pwkm.mimika',
      visiMisi:
        'Visi: Mewujudkan perempuan Kamoro yang mandiri, berdaya saing, berbudaya, dan berperan aktif dalam pembangunan berkelanjutan di Tanah Mimika.\n\nMisi: 1. Melestarikan seni ukir dan anyaman tradisional Kamoro. 2. Memberdayakan ekonomi kaum perempuan di pesisir Mimika. 3. Meningkatkan derajat kesehatan dan pendidikan anak generasi penerus.',
      tujuanOrganisasi:
        'Memperjuangkan hak-hak perempuan adat, pembinaan ekonomi kreatif keluarga, dan melestarikan kearifan lokal suku Kamoro.',
      nomorSkt: '220/SKT/KESBANGPOL/VIII/2026',
      tanggalTerbitSkt: '20 Agustus 2026',
      masaBerlakuSkt: '20 Agustus 2026 s/d 20 Agustus 2029',
      statusSkt: 'Menunggu Verifikasi',
    },
  });

  // Ormas lainnya
  const otherOrmas = [
    {
      id: 'ORM-001',
      namaOrmas: 'KERUKUNAN KELUARGA SERAM BAGIAN TIMUR BERSATU KABUPATEN MIMIKA',
      singkatan: 'KKSBT MIMIKA',
      jenisOrmas: 'Kebudayaan & Adat',
      alamatSekretariat: 'Jl. Yos Sudarso, RT 06 Sempan, Kel. Inauga, Kec. Wania',
      distrik: 'Wania',
      nomorSkt: '220/012/KESBANGPOL/2024',
      statusSkt: 'Aktif',
      teleponKantor: '0812-4800-1122',
      emailResmi: 'kksbt.mimika@gmail.com',
      visiMisi: 'Mempererat tali persaudaraan keluarga Seram Bagian Timur di Tanah Amungsa.',
      tujuanOrganisasi: 'Kerukunan sosial dan kemasyarakatan.',
    },
    {
      id: 'ORM-002',
      namaOrmas: 'FORUM PEMUDA PEMBANGUNAN MIMIKA',
      singkatan: 'FPPM',
      jenisOrmas: 'Kepemudaan',
      alamatSekretariat: 'Jl. Cendrawasih SP2, Kel. Karang Senang, Kec. Kuala Kencana',
      distrik: 'Kuala Kencana',
      nomorSkt: '220/045/KESBANGPOL/2024',
      statusSkt: 'Aktif',
      teleponKantor: '0813-4412-3344',
      emailResmi: 'fppm.mimika@gmail.com',
      visiMisi: 'Pemberdayaan potensi pemuda dalam pembangunan daerah.',
      tujuanOrganisasi: 'Wadah kreativitas dan kepemudaan.',
    },
    {
      id: 'ORM-003',
      namaOrmas: 'YAYASAN ADAT AMUNGME DAN KAMORO',
      singkatan: 'YAMAK',
      jenisOrmas: 'Kebudayaan & Adat',
      alamatSekretariat: 'Jl. Agimuga No. 12, Kel. Kwamki, Kec. Mimika Baru',
      distrik: 'Mimika Baru',
      nomorSkt: '220/003/KESBANGPOL/2022',
      statusSkt: 'Aktif',
      teleponKantor: '0852-5401-5566',
      emailResmi: 'yamak.mimika@gmail.com',
      visiMisi: 'Pelestarian nilai adat dan budaya suku asli Amungme dan Kamoro.',
      tujuanOrganisasi: 'Advokasi dan pelestarian adat.',
    },
    {
      id: 'ORM-004',
      namaOrmas: 'IKATAN KELUARGA TORAJA KABUPATEN MIMIKA',
      singkatan: 'IKT MIMIKA',
      jenisOrmas: 'Kebudayaan & Adat',
      alamatSekretariat: 'Jl. Poros Timika - Mapurujaya Km 8, Kec. Mimika Timur',
      distrik: 'Mimika Timur',
      nomorSkt: '220/088/KESBANGPOL/2023',
      statusSkt: 'Aktif',
      teleponKantor: '0811-4900-7788',
      emailResmi: 'ikt.mimika@gmail.com',
      visiMisi: 'Membangun kebersamaan dan kerukunan warga Toraja di Mimika.',
      tujuanOrganisasi: 'Sosial budaya kemasyarakatan.',
    },
    {
      id: 'ORM-005',
      namaOrmas: 'KERUKUNAN KELUARGA SULAWESI SELATAN MIMIKA',
      singkatan: 'KKSS MIMIKA',
      jenisOrmas: 'Kebudayaan & Adat',
      alamatSekretariat: 'Jl. Pendidikan No. 45, Kel. Otomona, Kec. Mimika Baru',
      distrik: 'Mimika Baru',
      nomorSkt: '220/099/KESBANGPOL/2023',
      statusSkt: 'Aktif',
      teleponKantor: '0812-4011-9900',
      emailResmi: 'kkss.mimika@gmail.com',
      visiMisi: 'Sipakatau, sipakalebbi, sipakainge di perantauan.',
      tujuanOrganisasi: 'Pemberdayaan warga dan solidaritas.',
    },
    {
      id: 'ORM-006',
      namaOrmas: 'FORUM KERUKUNAN UMAT BERAGAMA MIMIKA',
      singkatan: 'FKUB MIMIKA',
      jenisOrmas: 'Keagamaan',
      alamatSekretariat: 'Jl. Cendrawasih SP3, Kec. Kuala Kencana',
      distrik: 'Kuala Kencana',
      nomorSkt: '220/001/KESBANGPOL/2021',
      statusSkt: 'Aktif',
      teleponKantor: '0812-4700-1122',
      emailResmi: 'fkub.mimika@gmail.com',
      visiMisi: 'Menjaga kerukunan antarumat beragama dan toleransi di Mimika.',
      tujuanOrganisasi: 'Harmoni dan toleransi beragama.',
    },
  ];

  for (const item of otherOrmas) {
    await prisma.ormas.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Seed Pengurus untuk PWKM
  const pengurusList = [
    {
      id: 'PGR-001',
      ormasId: ormasPWKM.id,
      nama: 'Maria Magdalena Maparey',
      nik: '9109015508880002',
      jabatan: 'Ketua Umum',
      telepon: '0812-4809-1122',
      email: 'maria.maparey@gmail.com',
      alamat: 'Jl. Mapurujaya Km. 8, Timika',
    },
    {
      id: 'PGR-002',
      ormasId: ormasPWKM.id,
      nama: 'Theresia Natikapereau',
      nik: '9109014205900004',
      jabatan: 'Sekretaris',
      telepon: '0821-9988-1234',
      email: 'theresia.pwkm@gmail.com',
      alamat: 'Jl. Cendrawasih SP2, Timika',
    },
    {
      id: 'PGR-003',
      ormasId: ormasPWKM.id,
      nama: 'Yuliana Mapeko',
      nik: '9109016102870001',
      jabatan: 'Bendahara',
      telepon: '0813-4455-7890',
      email: 'yuliana.bendahara@gmail.com',
      alamat: 'Jl. Yos Sudarso, Nawaripi, Timika',
    },
    {
      id: 'PGR-004',
      ormasId: ormasPWKM.id,
      nama: 'Dr. Beatrix Yanwarin, M.Pd.',
      nik: '9109014901750003',
      jabatan: 'Dewan Pembina',
      telepon: '0811-4900-5544',
      email: 'beatrix.yanwarin@mimikakab.go.id',
      alamat: 'Jl. Hasanuddin, Timika',
    },
  ];

  for (const p of pengurusList) {
    await prisma.pengurus.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // 5. Seed Dokumen Persyaratan untuk PWKM
  console.log('5. Menyiapkan Dokumen Persyaratan...');
  const dokumenList = [
    {
      id: 'DOC-01',
      ormasId: ormasPWKM.id,
      namaDokumen: 'Surat Permohonan Pendaftaran / Pelaporan',
      wajib: true,
      deskripsi: 'Ditandatangani Ketua & Sekretaris dengan cap basah Ormas bermaterai Rp 10.000',
      format: 'PDF',
      ukuranMaks: '5 MB',
      statusUnggah: 'terverifikasi',
      namaFile: 'Surat_Permohonan_Pendaftaran_PWKM_2026.pdf',
      fileUrl: '/uploads/sample_dokumen.pdf',
      tanggalUnggah: new Date('2026-08-20T10:15:00Z'),
    },
    {
      id: 'DOC-02',
      ormasId: ormasPWKM.id,
      namaDokumen: 'Akta Notaris Pendirian & AD/ART',
      wajib: true,
      deskripsi: 'Akta notaris yang memuat Anggaran Dasar dan Anggaran Rumah Tangga yang disahkan',
      format: 'PDF',
      ukuranMaks: '10 MB',
      statusUnggah: 'terverifikasi',
      namaFile: 'Akta_Notaris_AD_ART_PWKM.pdf',
      fileUrl: '/uploads/sample_dokumen.pdf',
      tanggalUnggah: new Date('2026-08-20T10:20:00Z'),
    },
    {
      id: 'DOC-03',
      ormasId: ormasPWKM.id,
      namaDokumen: 'SK Pengesahan Kemenkumham / Legalitas Asal',
      wajib: true,
      deskripsi: 'Surat Keputusan pengesahan badan hukum dari Kementerian Hukum dan HAM RI',
      format: 'PDF',
      ukuranMaks: '5 MB',
      statusUnggah: 'terverifikasi',
      namaFile: 'SK_Kemenkumham_PWKM_2024.pdf',
      fileUrl: '/uploads/sample_dokumen.pdf',
      tanggalUnggah: new Date('2026-08-20T10:22:00Z'),
    },
    {
      id: 'DOC-04',
      ormasId: ormasPWKM.id,
      namaDokumen: 'Surat Keterangan Domisili Sekretariat',
      wajib: true,
      deskripsi: 'Surat keterangan domisili dari Kepala Distrik atau Lurah/Kepala Kampung setempat',
      format: 'PDF',
      ukuranMaks: '5 MB',
      statusUnggah: 'terverifikasi',
      namaFile: 'Domisili_Distrik_MimikaBaru_PWKM.pdf',
      fileUrl: '/uploads/sample_dokumen.pdf',
      tanggalUnggah: new Date('2026-08-20T10:25:00Z'),
    },
  ];

  for (const d of dokumenList) {
    await prisma.dokumenPersyaratan.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }

  // 6. Seed Pengajuan SKT
  console.log('6. Menyiapkan Pengajuan & Riwayat Verifikasi...');
  const pengajuan = await prisma.pengajuan.upsert({
    where: { nomorTiket: 'SUB-2026-003' },
    update: {},
    create: {
      id: 'SUB-2026-003',
      nomorTiket: 'SUB-2026-003',
      ormasId: ormasPWKM.id,
      jenisPengajuan: 'Pendaftaran Baru SKT',
      status: 'disetujui',
      tahapanAktif: 4,
      nomorRegistrasi: '220/SKT/KESBANGPOL/VIII/2026',
      petugasVerifikator: 'Yance Murib, S.STP',
      catatanVerifikator: 'Seluruh dokumen persyaratan telah diverifikasi lengkap dan valid.',
      tanggalPengajuan: new Date('2026-08-20T08:00:00Z'),
      tanggalDisetujui: new Date('2026-08-22T14:30:00Z'),
    },
  });

  // Seed Riwayat Verifikasi
  await prisma.riwayatVerifikasi.create({
    data: {
      pengajuanId: pengajuan.id,
      verifikatorId: 'USR-002',
      tahap: 'Pemeriksaan Berkas',
      status: 'disetujui',
      catatan: 'Dokumen Akta Notaris dan Domisili telah tervalidasi.',
    },
  });

  console.log('✅ Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
