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
        user: true,
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
        item.user?.nama ||
        '-';
      const cleanDistrik = item.distrik || 'Mimika Baru';
      const fullAddress = item.alamatSekretariat
        ? `${item.alamatSekretariat}, Distrik ${cleanDistrik}`
        : `Distrik ${cleanDistrik}`;

      let statusSk = 'Aktif';
      if (item.statusSkt === 'Proses Perpanjangan') statusSk = 'Perpanjangan';
      else if (item.statusSkt === 'Kadaluarsa') statusSk = 'Kadaluarsa';
      else if (item.statusSkt === 'Menunggu Verifikasi') statusSk = 'Menunggu Verifikasi';

      // Status publik untuk landing page: "Resmi" atau "Dalam Proses"
      const isResmi =
        item.statusSkt === 'Aktif' ||
        item.statusSkt === 'Resmi' ||
        Boolean(item.nomorSkt) ||
        item.pengajuan[0]?.status === 'resmi' ||
        item.pengajuan[0]?.status === 'disetujui';

      const statusPublik: 'Resmi' | 'Dalam Proses' = isResmi ? 'Resmi' : 'Dalam Proses';
      const nomorSkt = item.nomorSkt || item.pengajuan[0]?.nomorRegistrasi || item.pengajuan[0]?.nomorTiket || 'Dalam Verifikasi';

      const tglDaftar = item.tanggalPendirian || new Date(item.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return {
        id: item.id,
        userId: item.userId,
        namaOrmas: item.namaOrmas,
        nama: item.namaOrmas,
        singkatan: item.singkatan || '',
        jenisOrmas: item.jenisOrmas || 'ORMAS',
        jenis: item.jenisOrmas || 'ORMAS',
        kategori: item.kategori || item.jenisOrmas || 'Lembaga Swadaya Masyarakat',
        ketuaUmum: ketua,
        ketua: ketua,
        alamat: fullAddress,
        alamatSekretariat: item.alamatSekretariat,
        distrik: cleanDistrik,
        kodePos: item.kodePos || '99910',
        telepon: item.teleponKantor || item.user?.telepon || '-',
        email: item.emailResmi || item.user?.email || '-',
        statusSk: statusSk as any,
        status: statusPublik,
        nomorSk: nomorSkt,
        noSkt: nomorSkt,
        tanggalBerlaku: item.masaBerlakuSkt || '-',
        tanggalDaftar: tglDaftar,
        // Full fields untuk ekspor Excel & detail komprehensif
        alamatSekretariatMurni: item.alamatSekretariat,
        kelurahanDesa: item.kelurahanDesa || '-',
        kabupaten: item.kabupaten || 'Kabupaten Mimika',
        provinsi: item.provinsi || 'Papua Tengah',
        nomorAktaNotaris: item.nomorAktaNotaris || '-',
        namaNotaris: item.namaNotaris || '-',
        npwpOrmas: item.npwpOrmas || '-',
        tanggalTerbitSkt: item.tanggalTerbitSkt || '-',
        masaBerlakuSkt: item.masaBerlakuSkt || '-',
        statusSkt: item.statusSkt || statusSk,
        websiteSosmed: item.websiteSosmed || '-',
        visiMisi: item.visiMisi || '-',
        tujuanOrganisasi: item.tujuanOrganisasi || '-',
        tanggalPendirian: item.tanggalPendirian || tglDaftar,
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
