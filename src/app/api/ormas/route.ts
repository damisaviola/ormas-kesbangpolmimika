import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const list = await prisma.ormas.findMany({
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
        namaOrmas: item.namaOrmas,
        singkatan: item.singkatan || '',
        jenisOrmas: item.jenisOrmas,
        ketuaUmum: ketua,
        alamat: fullAddress,
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
