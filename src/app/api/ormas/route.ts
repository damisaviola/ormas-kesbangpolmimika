import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    let whereClause: any = {};
    if (userId && email) {
      const cleanEmail = email.toLowerCase().trim();
      whereClause = {
        OR: [
          { userId: userId },
          { emailResmi: cleanEmail },
          { user: { email: cleanEmail } },
        ],
      };
    } else if (userId) {
      whereClause = {
        OR: [
          { userId: userId },
          { user: { id: userId } },
        ],
      };
    } else if (email) {
      const cleanEmail = email.toLowerCase().trim();
      whereClause = {
        OR: [
          { emailResmi: cleanEmail },
          { user: { email: cleanEmail } },
        ],
      };
    }

    const list = await prisma.ormas.findMany({
      where: whereClause,
      include: {
        pengurus: true,
        pengajuan: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = list.map((item) => {
      const ketua =
        item.pengurus.find((p) => p.jabatan === 'Ketua Umum')?.nama ||
        item.pengurus[0]?.nama ||
        '-';
      const cleanDistrik = item.distrik || 'Mimika Baru';
      const fullAddress = item.alamatSekretariat
        ? `${item.alamatSekretariat}, Distrik ${cleanDistrik}`
        : `Distrik ${cleanDistrik}`;

      let statusSk = 'Aktif';
      if (item.statusSkt === 'Proses Perpanjangan') statusSk = 'Perpanjangan';
      else if (item.statusSkt === 'Kadaluarsa') statusSk = 'Kadaluarsa';
      else if (item.statusSkt === 'Menunggu Verifikasi') statusSk = 'Menunggu Verifikasi';

      return {
        id: item.id,
        userId: item.userId,
        namaOrmas: item.namaOrmas,
        singkatan: item.singkatan || '',
        jenisOrmas: item.jenisOrmas,
        kategori: item.kategori,
        ketuaUmum: ketua,
        alamat: fullAddress,
        alamatSekretariat: item.alamatSekretariat,
        distrik: cleanDistrik,
        kodePos: item.kodePos || '99910',
        telepon: item.teleponKantor || '-',
        email: item.emailResmi || '-',
        statusSk: statusSk as any,
        nomorSk: item.nomorSkt || item.pengajuan[0]?.nomorTiket || '-',
        tanggalBerlaku: item.masaBerlakuSkt || '-',
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching ormas list:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data ormas', error: error?.message },
      { status: 500 }
    );
  }
}
