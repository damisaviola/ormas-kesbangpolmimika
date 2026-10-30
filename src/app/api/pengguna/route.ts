import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil seluruh daftar pengguna langsung dari database MySQL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const searchParam = searchParams.get('search');

    const whereClause: {
      role?: string;
      OR?: Array<{ [key: string]: { contains: string } }>;
    } = {};

    if (roleParam && roleParam !== 'all') {
      if (roleParam === 'admin') {
        whereClause.role = 'superadmin';
      } else {
        whereClause.role = 'admin_ormas';
      }
    }

    if (searchParam && searchParam.trim()) {
      const q = searchParam.trim();
      whereClause.OR = [
        { nama: { contains: q } },
        { email: { contains: q } },
        { instansi: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        ormas: {
          select: {
            id: true,
            namaOrmas: true,
            singkatan: true,
            jenisOrmas: true,
            statusSkt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => {
      const isSuperadmin = u.role === 'superadmin' || u.role === 'admin';
      const userOrmas = u.ormas?.[0];
      const instansiNama =
        userOrmas?.namaOrmas ||
        u.instansi ||
        (isSuperadmin ? 'Badan Kesbangpol Kabupaten Mimika' : 'Organisasi Kemasyarakatan');

      return {
        id: u.id,
        nama: u.nama,
        email: u.email,
        nip: u.nip || '-',
        nik: u.nik || '-',
        role: isSuperadmin ? 'admin' : 'pengguna',
        rawRole: u.role,
        status: u.status || 'aktif',
        instansi: instansiNama,
        terakhirLogin: u.terakhirLogin
          ? new Date(u.terakhirLogin).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIT'
          : 'Belum pernah login',
        tanggalDaftar: new Date(u.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        telepon: u.telepon || '-',
        ormasId: userOrmas?.id || null,
        ormasNama: userOrmas?.namaOrmas || null,
        statusSkt: userOrmas?.statusSkt || null,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users from DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengguna dari database', error: message },
      { status: 500 }
    );
  }
}

// POST: Membuat pengguna baru langsung di database MySQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, password, role, instansi, telepon, nip } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, Email, dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Periksa apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Alamat email ini sudah terdaftar di database sistem.' },
        { status: 400 }
      );
    }

    const dbRole = role === 'admin' ? 'superadmin' : 'admin_ormas';

    // Buat pengguna di MySQL
    const newUser = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: cleanEmail,
        password: password,
        role: dbRole,
        status: 'aktif',
        instansi: instansi?.trim() || (dbRole === 'superadmin' ? 'Badan Kesbangpol Kabupaten Mimika' : 'Organisasi Kemasyarakatan'),
        telepon: telepon?.trim() || null,
        nip: nip?.trim() || null,
      },
    });

    // Jika role ormas dan ada nama instansi, otomatis buat record Ormas di database
    if (dbRole === 'admin_ormas' && instansi && instansi.trim() && instansi !== 'Organisasi Kemasyarakatan') {
      await prisma.ormas.create({
        data: {
          userId: newUser.id,
          namaOrmas: instansi.trim(),
          jenisOrmas: 'Sosial Kemasyarakatan',
          alamatSekretariat: 'Alamat sekretariat belum dilengkapi',
          distrik: 'Mimika Baru',
          teleponKantor: telepon?.trim() || null,
          emailResmi: cleanEmail,
          statusSkt: 'Menunggu Verifikasi',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil disimpan langsung ke database!',
      data: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user in DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan pengguna ke database', error: message },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui data pengguna atau toggle status (aktif / nonaktif) di MySQL
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nama, email, role, status, instansi, telepon, nip, password } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna wajib disertakan' },
        { status: 400 }
      );
    }

    const updateData: {
      nama?: string;
      email?: string;
      role?: string;
      status?: string;
      instansi?: string;
      telepon?: string | null;
      nip?: string | null;
      password?: string;
    } = {};

    if (nama) updateData.nama = nama.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role === 'admin' ? 'superadmin' : 'admin_ormas';
    if (status) updateData.status = status;
    if (instansi) updateData.instansi = instansi.trim();
    if (telepon !== undefined) updateData.telepon = telepon && telepon.trim() ? telepon.trim() : null;
    if (nip !== undefined) updateData.nip = nip && nip.trim() ? nip.trim() : null;
    if (password && password.trim()) updateData.password = password.trim();

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui di database!',
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating user in DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pengguna di database', error: message },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus pengguna langsung dari database MySQL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna wajib disertakan' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan di database' },
        { status: 404 }
      );
    }

    if (user.email === 'admin.kesbangpol@mimikakab.go.id') {
      return NextResponse.json(
        { success: false, message: 'Akun Administrator Utama tidak boleh dihapus!' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Akun "${user.nama}" (${user.email}) berhasil dihapus dari database!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting user from DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pengguna dari database', error: message },
      { status: 500 }
    );
  }
}

