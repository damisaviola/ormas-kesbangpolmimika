import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper untuk serialize metadata tambahan anggota ke fotoUrl
function serializeExtraData(extra: {
  jk?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  golDarah?: string;
  pekerjaan?: string;
  fotoUrl?: string;
}): string {
  try {
    return JSON.stringify({
      jk: extra.jk || 'Laki-laki',
      tempatLahir: extra.tempatLahir || '',
      tanggalLahir: extra.tanggalLahir || '',
      golDarah: extra.golDarah || 'A',
      pekerjaan: extra.pekerjaan || '',
      fotoUrl: extra.fotoUrl || null,
    });
  } catch {
    return extra.fotoUrl || '';
  }
}

// Helper untuk deserialize data dari fotoUrl
function parseExtraData(fotoUrlStr: string | null | undefined) {
  if (!fotoUrlStr) {
    return {
      jk: 'Laki-laki' as const,
      tempatLahir: '',
      tanggalLahir: '',
      golDarah: 'A',
      pekerjaan: '',
      fotoUrl: null,
    };
  }

  try {
    if (fotoUrlStr.startsWith('{') && fotoUrlStr.endsWith('}')) {
      const parsed = JSON.parse(fotoUrlStr);
      return {
        jk: parsed.jk || 'Laki-laki',
        tempatLahir: parsed.tempatLahir || '',
        tanggalLahir: parsed.tanggalLahir || '',
        golDarah: parsed.golDarah || 'A',
        pekerjaan: parsed.pekerjaan || '',
        fotoUrl: parsed.fotoUrl || null,
      };
    }
  } catch {
    // fallback jika fotoUrl adalah URL gambar biasa
  }

  return {
    jk: 'Laki-laki' as const,
    tempatLahir: '',
    tanggalLahir: '',
    golDarah: 'A',
    pekerjaan: '',
    fotoUrl: fotoUrlStr,
  };
}

// Helper untuk mencatat log aktivitas dengan aman
async function safeLogActivity(data: {
  namaOrmas?: string | null;
  ormasId?: string | null;
  userEmail?: string | null;
  aktivitas: string;
  pesan: string;
  oleh: string;
}) {
  try {
    if ((prisma as any).logAktivitas?.create) {
      await (prisma as any).logAktivitas.create({ data });
    }
  } catch (err) {
    console.warn('safeLogActivity notice:', err);
  }
}

/**
 * GET: Mengambil daftar pengurus & anggota ormas
 * Parameter: ormasId ATAU namaOrmas ATAU userEmail
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ormasIdParam = searchParams.get('ormasId');
    const namaOrmasParam = searchParams.get('namaOrmas');
    const userEmailParam = searchParams.get('userEmail');

    let ormasId = ormasIdParam;

    if (!ormasId && userEmailParam) {
      const cleanEmail = userEmailParam.toLowerCase().trim();
      const userOrmas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { emailResmi: cleanEmail },
            { user: { email: cleanEmail } },
          ],
        },
      });
      if (userOrmas) {
        ormasId = userOrmas.id;
      }
    }

    if (!ormasId && namaOrmasParam) {
      const ormas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { namaOrmas: { contains: namaOrmasParam } },
            { singkatan: { contains: namaOrmasParam } },
          ],
        },
      });
      if (ormas) {
        ormasId = ormas.id;
      }
    }

    let whereClause: any = {};
    if (ormasId) {
      whereClause.ormasId = ormasId;
    }

    const list = await prisma.pengurus.findMany({
      where: whereClause,
      include: {
        ormas: {
          select: {
            id: true,
            namaOrmas: true,
            singkatan: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = list.map((item, idx) => {
      const extra = parseExtraData(item.fotoUrl);
      return {
        id: item.id,
        numericId: idx + 1,
        ormasId: item.ormasId,
        namaOrmas: item.ormas?.namaOrmas || '',
        nama: item.nama,
        nik: item.nik,
        jabatan: item.jabatan,
        telepon: item.telepon,
        email: item.email || '',
        alamat: item.alamat,
        jk: extra.jk,
        tempatLahir: extra.tempatLahir,
        tanggalLahir: extra.tanggalLahir,
        golDarah: extra.golDarah,
        pekerjaan: extra.pekerjaan,
        fotoUrl: extra.fotoUrl,
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching pengurus/anggota:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data anggota/pengurus', error: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Menambah data anggota / pengurus baru
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ormasId: rawOrmasId,
      namaOrmas,
      userEmail,
      nama,
      nik,
      jabatan = 'Anggota',
      telepon = '-',
      email = '',
      alamat = '-',
      jk = 'Laki-laki',
      tempatLahir = '',
      tanggalLahir = '',
      golDarah = 'A',
      pekerjaan = '',
      fotoUrl = null,
      actorName,
    } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json({ success: false, message: 'Nama lengkap wajib diisi!' }, { status: 400 });
    }

    let targetOrmasId = rawOrmasId;

    if (!targetOrmasId && userEmail) {
      const cleanEmail = userEmail.toLowerCase().trim();
      const userOrmas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { emailResmi: cleanEmail },
            { user: { email: cleanEmail } },
          ],
        },
      });
      if (userOrmas) {
        targetOrmasId = userOrmas.id;
      }
    }

    if (!targetOrmasId && namaOrmas) {
      const ormas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { namaOrmas: { contains: namaOrmas } },
            { singkatan: { contains: namaOrmas } },
          ],
        },
      });
      if (ormas) {
        targetOrmasId = ormas.id;
      }
    }

    // Jika masih belum ada ormas terdaftar, ambil ormas pertama atau buat record awal
    if (!targetOrmasId) {
      const firstOrmas = await prisma.ormas.findFirst({ orderBy: { createdAt: 'desc' } });
      if (firstOrmas) {
        targetOrmasId = firstOrmas.id;
      } else {
        return NextResponse.json(
          { success: false, message: 'Data Organisasi belum terdaftar. Silakan daftarkan nama ormas terlebih dahulu.' },
          { status: 400 }
        );
      }
    }

    // Generate NIK fallback jika kosong (16 digit standar Indonesia Papua: 9109...)
    const cleanNik = nik && nik.trim()
      ? nik.trim()
      : `9109${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const extraSerialized = serializeExtraData({
      jk,
      tempatLahir,
      tanggalLahir,
      golDarah,
      pekerjaan,
      fotoUrl,
    });

    const newPengurus = await prisma.pengurus.create({
      data: {
        ormasId: targetOrmasId,
        nama: nama.trim(),
        nik: cleanNik,
        jabatan: jabatan || 'Anggota',
        telepon: telepon || '-',
        email: email && email.trim() ? email.trim() : null,
        alamat: alamat || 'Kabupaten Mimika',
        fotoUrl: extraSerialized,
      },
      include: {
        ormas: {
          select: {
            namaOrmas: true,
          },
        },
      },
    });

    // Catat ke Log Aktivitas secara aman
    const ormasNameDisplay = newPengurus.ormas?.namaOrmas || namaOrmas || 'Ormas';
    await safeLogActivity({
      namaOrmas: ormasNameDisplay,
      ormasId: targetOrmasId,
      userEmail: userEmail || null,
      aktivitas: 'Penambahan Anggota / Pengurus',
      pesan: `Anggota baru "${nama.trim()}" jabatan "${jabatan || 'Anggota'}" berhasil didaftarkan.`,
      oleh: actorName || ormasNameDisplay,
    });

    const extra = parseExtraData(newPengurus.fotoUrl);

    return NextResponse.json({
      success: true,
      message: 'Data anggota berhasil ditambahkan dan disimpan ke database!',
      data: {
        id: newPengurus.id,
        ormasId: newPengurus.ormasId,
        nama: newPengurus.nama,
        nik: newPengurus.nik,
        jabatan: newPengurus.jabatan,
        telepon: newPengurus.telepon,
        email: newPengurus.email || '',
        alamat: newPengurus.alamat,
        jk: extra.jk,
        tempatLahir: extra.tempatLahir,
        tanggalLahir: extra.tanggalLahir,
        golDarah: extra.golDarah,
        pekerjaan: extra.pekerjaan,
        fotoUrl: extra.fotoUrl,
        createdAt: newPengurus.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating pengurus/anggota:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan anggota ke database', error: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Memperbarui data anggota / pengurus
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      nama,
      nik,
      jabatan,
      telepon,
      email,
      alamat,
      jk,
      tempatLahir,
      tanggalLahir,
      golDarah,
      pekerjaan,
      fotoUrl,
      actorName,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID anggota wajib disertakan' }, { status: 400 });
    }

    const existing = await prisma.pengurus.findUnique({
      where: { id },
      include: { ormas: { select: { namaOrmas: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data anggota tidak ditemukan' }, { status: 404 });
    }

    const prevExtra = parseExtraData(existing.fotoUrl);

    const extraSerialized = serializeExtraData({
      jk: jk !== undefined ? jk : prevExtra.jk,
      tempatLahir: tempatLahir !== undefined ? tempatLahir : prevExtra.tempatLahir,
      tanggalLahir: tanggalLahir !== undefined ? tanggalLahir : prevExtra.tanggalLahir,
      golDarah: golDarah !== undefined ? golDarah : prevExtra.golDarah,
      pekerjaan: pekerjaan !== undefined ? pekerjaan : prevExtra.pekerjaan,
      fotoUrl: fotoUrl !== undefined ? fotoUrl : prevExtra.fotoUrl,
    });

    const updated = await prisma.pengurus.update({
      where: { id },
      data: {
        nama: nama ? nama.trim() : existing.nama,
        nik: nik ? nik.trim() : existing.nik,
        jabatan: jabatan ? jabatan.trim() : existing.jabatan,
        telepon: telepon !== undefined ? telepon : existing.telepon,
        email: email !== undefined ? (email && email.trim() ? email.trim() : null) : existing.email,
        alamat: alamat !== undefined ? alamat : existing.alamat,
        fotoUrl: extraSerialized,
      },
    });

    // Catat log secara aman
    const ormasNameDisplay = existing.ormas?.namaOrmas || 'Ormas';
    await safeLogActivity({
      namaOrmas: ormasNameDisplay,
      ormasId: existing.ormasId,
      aktivitas: 'Pembaruan Data Anggota / Pengurus',
      pesan: `Informasi keanggotaan "${updated.nama}" (${updated.jabatan}) diperbarui.`,
      oleh: actorName || ormasNameDisplay,
    });

    const extra = parseExtraData(updated.fotoUrl);

    return NextResponse.json({
      success: true,
      message: 'Data anggota berhasil diperbarui!',
      data: {
        id: updated.id,
        ormasId: updated.ormasId,
        nama: updated.nama,
        nik: updated.nik,
        jabatan: updated.jabatan,
        telepon: updated.telepon,
        email: updated.email || '',
        alamat: updated.alamat,
        jk: extra.jk,
        tempatLahir: extra.tempatLahir,
        tanggalLahir: extra.tanggalLahir,
        golDarah: extra.golDarah,
        pekerjaan: extra.pekerjaan,
        fotoUrl: extra.fotoUrl,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating pengurus/anggota:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui data anggota', error: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus data anggota / pengurus
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    let id = idParam;
    let actorName = 'Pemohon Ormas';

    // Jika lewat body JSON
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
        if (body.actorName) actorName = body.actorName;
      } catch {
        // ignore
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID anggota wajib disertakan' }, { status: 400 });
    }

    const existing = await prisma.pengurus.findUnique({
      where: { id },
      include: { ormas: { select: { namaOrmas: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data anggota tidak ditemukan' }, { status: 404 });
    }

    await prisma.pengurus.delete({ where: { id } });

    // Catat log secara aman
    const ormasNameDisplay = existing.ormas?.namaOrmas || 'Ormas';
    await safeLogActivity({
      namaOrmas: ormasNameDisplay,
      ormasId: existing.ormasId,
      aktivitas: 'Penghapusan Anggota Organisasi',
      pesan: `Anggota "${existing.nama}" (${existing.jabatan}) dihapus dari daftar keanggotaan.`,
      oleh: actorName || ormasNameDisplay,
    });

    return NextResponse.json({
      success: true,
      message: `Data anggota "${existing.nama}" berhasil dihapus dari database!`,
    });
  } catch (error: any) {
    console.error('Error deleting pengurus/anggota:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus anggota', error: error?.message },
      { status: 500 }
    );
  }
}
