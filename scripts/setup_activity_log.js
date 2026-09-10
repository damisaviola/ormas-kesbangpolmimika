const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS log_aktivitas (
      id VARCHAR(191) PRIMARY KEY,
      nama_ormas VARCHAR(191) NULL,
      ormas_id VARCHAR(191) NULL,
      pengajuan_id VARCHAR(191) NULL,
      user_email VARCHAR(191) NULL,
      aktivitas VARCHAR(191) NOT NULL,
      pesan TEXT NOT NULL,
      oleh VARCHAR(191) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX idx_nama_ormas (nama_ormas),
      INDEX idx_user_email (user_email),
      INDEX idx_pengajuan_id (pengajuan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Tabel log_aktivitas berhasil dibuat / diverifikasi di MySQL!');
  const count = await prisma.$queryRawUnsafe('SELECT COUNT(*) as total FROM log_aktivitas');
  console.log('Jumlah log aktivitas saat ini:', count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
