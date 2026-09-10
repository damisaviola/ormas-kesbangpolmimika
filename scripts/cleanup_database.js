const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Memulai pembersihan database Kesbangpol Mimika...');

  // 1. Hapus semua riwayat verifikasi
  const delRiwayat = await prisma.riwayatVerifikasi.deleteMany({});
  console.log(`✓ Menghapus riwayat verifikasi: ${delRiwayat.count} data`);

  // 2. Hapus semua pengajuan
  const delPengajuan = await prisma.pengajuan.deleteMany({});
  console.log(`✓ Menghapus pengajuan ormas: ${delPengajuan.count} data`);

  // 3. Hapus semua dokumen persyaratan
  const delDokumen = await prisma.dokumenPersyaratan.deleteMany({});
  console.log(`✓ Menghapus dokumen persyaratan: ${delDokumen.count} data`);

  // 4. Hapus semua pengurus ormas
  const delPengurus = await prisma.pengurus.deleteMany({});
  console.log(`✓ Menghapus pengurus ormas: ${delPengurus.count} data`);

  // 5. Hapus semua data ormas
  const delOrmas = await prisma.ormas.deleteMany({});
  console.log(`✓ Menghapus data ormas: ${delOrmas.count} data`);

  // 6. Hapus semua user KECUALI admin.kesbangpol@mimikakab.go.id
  const delUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin.kesbangpol@mimikakab.go.id',
      },
    },
  });
  console.log(`✓ Menghapus user non-admin: ${delUsers.count} user`);

  // 7. Pastikan akun admin utama tersedia dan aktif
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.kesbangpol@mimikakab.go.id' },
    update: {
      role: 'superadmin',
      status: 'aktif',
      instansi: 'Badan Kesbangpol Kabupaten Mimika',
    },
    create: {
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
  });
  console.log(`✓ Akun admin berhasil dipastikan:`, {
    id: adminUser.id,
    nama: adminUser.nama,
    email: adminUser.email,
    role: adminUser.role,
    status: adminUser.status,
  });

  // 8. Bersihkan berkas upload sementara jika ada (kecuali sample_dokumen.pdf)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'dokumen');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    let removedFiles = 0;
    for (const f of files) {
      if (f !== 'sample_dokumen.pdf') {
        fs.unlinkSync(path.join(uploadsDir, f));
        removedFiles++;
      }
    }
    console.log(`✓ Menghapus ${removedFiles} berkas upload fisik di ${uploadsDir}`);
  }

  // 9. Verifikasi isi database saat ini
  const remainingUsers = await prisma.user.findMany({
    select: { id: true, nama: true, email: true, role: true, instansi: true },
  });
  const remainingOrmas = await prisma.ormas.findMany({
    select: { id: true, namaOrmas: true },
  });
  const remainingPengajuan = await prisma.pengajuan.findMany({
    select: { id: true, nomorTiket: true },
  });

  console.log('\n================ HASIL AKHIR DATABASE ================');
  console.log('Sisa Users (' + remainingUsers.length + '):', remainingUsers);
  console.log('Sisa Ormas (' + remainingOrmas.length + '):', remainingOrmas);
  console.log('Sisa Pengajuan (' + remainingPengajuan.length + '):', remainingPengajuan);
  console.log('======================================================\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error saat pembersihan database:', e);
  await prisma.$disconnect();
  process.exit(1);
});
