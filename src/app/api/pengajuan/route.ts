import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil data pengajuan dari database MySQL (opsional filter email / userId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const userIdParam = searchParams.get('userId');

    let whereClause: any = {};
    if (emailParam) {
      const cleanEmail = emailParam.toLowerCase().trim();
      whereClause = {
        OR: [
          { ormas: { emailResmi: cleanEmail } },
          { ormas: { user: { email: cleanEmail } } },
        ],
      };
    } else if (userIdParam) {
      whereClause = {
        ormas: { userId: userIdParam },
      };
    }

    const pengajuanList = await prisma.pengajuan.findMany({
      where: whereClause,
      include: {
        ormas: {
          include: {
            pengurus: true,
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
                role: true,
              },
            },
          },
        },
        riwayatVerifikasi: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = pengajuanList.map((item) => {
      const ketua =
        item.ormas.pengurus.find((p) => p.jabatan === 'Ketua Umum')?.nama ||
        item.ormas.pengurus[0]?.nama ||
        item.ormas.namaOrmas;

      const cleanDistrik = item.ormas.distrik || 'Mimika Baru';
      const fullAddress = item.ormas.alamatSekretariat
        ? `${item.ormas.alamatSekretariat}, Distrik ${cleanDistrik}`
        : `Distrik ${cleanDistrik}`;

      const pemohonEmail = item.ormas.emailResmi || item.ormas.user?.email || undefined;

      return {
        id: item.id,
        nomorRegistrasi: item.nomorTiket,
        namaOrmas: item.ormas.namaOrmas,
        singkatan: item.ormas.singkatan || undefined,
        jenisOrmas: item.ormas.jenisOrmas,
        ketuaUmum: ketua,
        pendaftar: item.ormas.user?.nama || ketua,
        pendaftarEmail: pemohonEmail,
        alamat: fullAddress,
        distrik: cleanDistrik,
        kodePos: item.ormas.kodePos || '99910',
        telepon: item.ormas.teleponKantor || '',
        email: pemohonEmail,
        userId: item.ormas.userId || item.ormas.user?.id || undefined,
        kategori: item.ormas.kategori || undefined,
        tanggalPengajuan: new Date(item.tanggalPengajuan).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: item.status,
        catatan: item.catatanVerifikator || undefined,
        isCustomSubmission: true,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching pengajuan from DB:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengajuan dari database', error: error?.message },
      { status: 500 }
    );
  }
}

// POST: Menyimpan data pengajuan baru dari pemohon Ormas ke database MySQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.namaOrganisasi || !body.namaOrganisasi.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama Organisasi wajib diisi' },
        { status: 400 }
      );
    }

    const cleanDistrik = body.distrik ? body.distrik.replace(/^Distrik\s+/i, '') : 'Mimika Baru';
    const tiket = body.nomorTiket || `TIKET/SKT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

    // Transaksi database: Simpan Ormas, Pengurus, Pengajuan, & Riwayat Verifikasi
    const result = await prisma.$transaction(async (tx) => {
      // 0. Hubungkan ke User berdasarkan email pemohon yang sedang login
      let targetUserId: string | null = body.userId || null;
      let targetUser = null;
      const cleanEmail = (body.email || body.emailResmi || '').toLowerCase().trim();

      if (cleanEmail) {
        targetUser = await tx.user.findUnique({
          where: { email: cleanEmail },
        });
        if (targetUser) {
          targetUserId = targetUser.id;
          // Perbarui instansi jika masih default
          if (!targetUser.instansi || targetUser.instansi === 'Organisasi Baru') {
            await tx.user.update({
              where: { id: targetUser.id },
              data: { instansi: body.namaOrganisasi.trim() },
            });
          }
        }
      } else if (targetUserId) {
        targetUser = await tx.user.findUnique({
          where: { id: targetUserId },
        });
      }

      // 1. Buat data Ormas yang terhubung dengan akun user
      const ormas = await tx.ormas.create({
        data: {
          userId: targetUserId,
          namaOrmas: body.namaOrganisasi.trim(),
          singkatan: body.namaSingkat?.trim() || null,
          jenisOrmas: body.jenisOrganisasi || 'ORMAS',
          kategori: body.kategori || 'Sosial Kemasyarakatan',
          alamatSekretariat: body.alamatKantor?.trim() || 'Alamat Belum Diisi',
          distrik: cleanDistrik,
          kabupaten: 'Kabupaten Mimika',
          provinsi: 'Papua Tengah',
          kodePos: body.kodePos?.trim() || '99910',
          teleponKantor: body.noTelepon?.trim() || null,
          emailResmi: cleanEmail || targetUser?.email || null,
          statusSkt: 'Menunggu Verifikasi',
          visiMisi: body.catatan?.trim() || null,
          tujuanOrganisasi: body.jenisPengajuan || 'Pendaftaran Baru SKT',
        },
      });

      // 2. Buat data Pengurus (Ketua Umum)
      const namaKetua = body.ketuaUmum?.trim() || body.namaOrganisasi.trim();
      const randomNik = `910901${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      await tx.pengurus.create({
        data: {
          ormasId: ormas.id,
          nama: namaKetua,
          nik: randomNik,
          jabatan: 'Ketua Umum',
          telepon: body.noTelepon?.trim() || '-',
          alamat: body.alamatKantor?.trim() || `Distrik ${cleanDistrik}`,
        },
      });

      // 3. Buat data Pengajuan SKT
      const pengajuan = await tx.pengajuan.create({
        data: {
          nomorTiket: tiket,
          ormasId: ormas.id,
          jenisPengajuan: body.jenisPengajuan || 'Pendaftaran Baru SKT',
          status: 'menunggu',
          tahapanAktif: 1,
          catatanVerifikator: body.catatan?.trim() || 'Pengajuan pendaftaran online mandiri dari portal Ormas Mimika',
          nomorRegistrasi: tiket,
          tanggalPengajuan: new Date(),
        },
      });

      // 4. Catat Riwayat Audit Verifikasi awal
      await tx.riwayatVerifikasi.create({
        data: {
          pengajuanId: pengajuan.id,
          tahap: 'Pemeriksaan Berkas',
          status: 'menunggu',
          catatan: `Pengajuan ${body.jenisPengajuan || 'Pendaftaran Baru SKT'} berhasil didaftarkan secara online oleh ${body.namaOrganisasi}`,
        },
      });

      // 5. Catat ke tabel log_aktivitas
      try {
        const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await tx.$executeRawUnsafe(
          `INSERT INTO log_aktivitas (id, nama_ormas, ormas_id, pengajuan_id, user_email, aktivitas, pesan, oleh, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          logId,
          body.namaOrganisasi.trim(),
          ormas.id,
          pengajuan.id,
          cleanEmail || null,
          `Pendaftaran ${body.jenisPengajuan || 'Baru SKT'}`,
          `No. Tiket: ${tiket} diajukan secara daring ke Bakesbangpol Kab. Mimika`,
          body.namaOrganisasi.trim()
        );
      } catch (logErr) {
        console.error('Error logging new submission activity:', logErr);
      }

      return { ormas, pengajuan };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pengajuan Ormas berhasil disimpan ke database MySQL',
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating pengajuan in DB:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan pengajuan ke database', error: error?.message },
      { status: 500 }
    );
  }
}

// PATCH: Memperbarui status verifikasi pengajuan di database MySQL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, message: 'ID dan status wajib diisi' },
        { status: 400 }
      );
    }

    // Cari pengajuan berdasarkan ID atau nomorTiket
    const existing = await prisma.pengajuan.findFirst({
      where: {
        OR: [{ id: body.id }, { nomorTiket: body.id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pengajuan tidak ditemukan di database' },
        { status: 44 }
      );
    }

    const tahapan =
      body.status === 'disetujui' ? 4 : body.status === 'proses' ? 2 : body.status === 'ditolak' ? 1 : 1;

    const noRegistrasiFinal =
      body.status === 'disetujui' && (!existing.nomorRegistrasi || existing.nomorRegistrasi.startsWith('TIKET/'))
        ? `230/SKT/KESBANGPOL/${new Date().getFullYear()}`
        : existing.nomorRegistrasi;

    const updated = await prisma.pengajuan.update({
      where: { id: existing.id },
      data: {
        status: body.status,
        catatanVerifikator: body.catatan !== undefined ? body.catatan : existing.catatanVerifikator,
        tahapanAktif: tahapan,
        tanggalDisetujui: body.status === 'disetujui' ? new Date() : undefined,
        nomorRegistrasi: noRegistrasiFinal,
      },
    });

    // Catat log riwayat verifikasi baru
    await prisma.riwayatVerifikasi.create({
      data: {
        pengajuanId: existing.id,
        tahap: tahapan === 4 ? 'Penerbitan SKT' : tahapan === 2 ? 'Verifikasi Lapangan' : 'Pemeriksaan Berkas',
        status: body.status,
        catatan: body.catatan || `Status pengajuan diubah menjadi ${body.status}`,
      },
    });

    // Catat otomatis ke log_aktivitas
    try {
      const ormasDetail = await prisma.ormas.findUnique({ where: { id: existing.ormasId } });
      const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const statusLabel =
        body.status === 'disetujui'
          ? 'Disetujui'
          : body.status === 'proses'
          ? 'Diproses'
          : body.status === 'ditolak'
          ? 'Ditolak'
          : body.status;
      await prisma.$executeRawUnsafe(
        `INSERT INTO log_aktivitas (id, nama_ormas, ormas_id, pengajuan_id, user_email, aktivitas, pesan, oleh, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        logId,
        ormasDetail?.namaOrmas || existing.nomorTiket,
        existing.ormasId,
        existing.id,
        ormasDetail?.emailResmi || null,
        `Status Pengajuan: ${statusLabel}`,
        body.catatan || `Status pengajuan diubah menjadi ${statusLabel} oleh Bakesbangpol Mimika`,
        'Bakesbangpol Mimika'
      );
    } catch (logErr) {
      console.error('Error recording log_aktivitas in pengajuan PATCH:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Status pengajuan berhasil diperbarui di database',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating pengajuan in DB:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pengajuan di database', error: error?.message },
      { status: 500 }
    );
  }
}
