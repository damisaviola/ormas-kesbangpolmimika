import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil daftar pengguna dari tabel terpisah: `admin_kesbangpol` & `user_pengajuan`
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');

    const shouldFetchAdmin =
      typeParam === 'admin' ||
      roleParam === 'admin' ||
      (!typeParam && !roleParam) ||
      typeParam === 'semua';

    const shouldFetchOrmas =
      typeParam === 'pengajuan' ||
      typeParam === 'ormas' ||
      roleParam === 'pengguna' ||
      (!typeParam && !roleParam) ||
      typeParam === 'semua';

    let formattedAdmins: any[] = [];
    let formattedOrmas: any[] = [];

    // 1. Ambil data dari tabel `admin_kesbangpol`
    if (shouldFetchAdmin) {
      const adminWhere: any = {};
      if (searchParam && searchParam.trim()) {
        const q = searchParam.trim();
        adminWhere.OR = [
          { nama: { contains: q } },
          { email: { contains: q } },
          { nip: { contains: q } },
          { instansi: { contains: q } },
        ];
      }

      const adminUsers = await prisma.adminKesbangpol.findMany({
        where: adminWhere,
        orderBy: { createdAt: 'desc' },
      });

      formattedAdmins = adminUsers.map((u) => ({
        id: u.id,
        nama: u.nama,
        email: u.email,
        nip: u.nip || '-',
        nik: '-',
        role: 'admin',
        rawRole: u.role,
        userType: 'admin',
        status: u.status || 'aktif',
        instansi: u.instansi || 'Badan Kesbangpol Kabupaten Mimika',
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
        ormasId: null,
        ormasNama: null,
        singkatan: null,
        statusSkt: null,
        nomorTiket: null,
        jumlahPengajuan: 0,
      }));
    }

    // 2. Ambil data dari tabel `user_pengajuan`
    if (shouldFetchOrmas) {
      const ormasWhere: any = {};
      if (searchParam && searchParam.trim()) {
        const q = searchParam.trim();
        ormasWhere.OR = [
          { nama: { contains: q } },
          { email: { contains: q } },
          { namaOrmas: { contains: q } },
          { telepon: { contains: q } },
        ];
      }

      const ormasUsers = await prisma.userPengajuan.findMany({
        where: ormasWhere,
        include: {
          ormas: {
            select: {
              id: true,
              namaOrmas: true,
              singkatan: true,
              jenisOrmas: true,
              statusSkt: true,
              teleponKantor: true,
              distrik: true,
              pengajuan: {
                select: {
                  id: true,
                  nomorTiket: true,
                  status: true,
                  tanggalPengajuan: true,
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      formattedOrmas = ormasUsers.map((u) => {
        const userOrmas = u.ormas?.[0];
        const latestPengajuan = userOrmas?.pengajuan?.[0];
        const instansiNama =
          userOrmas?.namaOrmas || u.namaOrmas || 'Organisasi Kemasyarakatan';

        return {
          id: u.id,
          nama: u.nama,
          email: u.email,
          nip: '-',
          nik: u.nik || '-',
          role: 'pengguna',
          rawRole: u.role,
          userType: 'pengajuan',
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
          telepon: u.telepon || userOrmas?.teleponKantor || '-',
          ormasId: userOrmas?.id || null,
          ormasNama: instansiNama,
          singkatan: userOrmas?.singkatan || null,
          statusSkt:
            latestPengajuan?.status ||
            userOrmas?.statusSkt ||
            (userOrmas ? 'Menunggu Verifikasi' : 'Belum Ada Pengajuan'),
          nomorTiket: latestPengajuan?.nomorTiket || null,
          jumlahPengajuan: userOrmas?.pengajuan ? userOrmas.pengajuan.length : 0,
        };
      });
    }

    const combined = [...formattedAdmins, ...formattedOrmas];
    return NextResponse.json({ success: true, data: combined });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users from DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengguna dari database', error: message },
      { status: 500 }
    );
  }
}

// POST: Membuat pengguna baru langsung di tabel yang sesuai (`admin_kesbangpol` atau `user_pengajuan`)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, password, role, instansi, telepon, nip, namaOrmas } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, Email, dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Periksa apakah email sudah terdaftar di admin_kesbangpol atau user_pengajuan
    const existingAdmin = await prisma.adminKesbangpol.findUnique({
      where: { email: cleanEmail },
    });
    const existingPengajuan = await prisma.userPengajuan.findUnique({
      where: { email: cleanEmail },
    });

    if (existingAdmin || existingPengajuan) {
      return NextResponse.json(
        { success: false, message: 'Alamat email ini sudah terdaftar di database sistem.' },
        { status: 400 }
      );
    }

    const isTargetAdmin = role === 'admin' || role === 'superadmin' || role === 'verifikator';

    if (isTargetAdmin) {
      // Simpan ke tabel `admin_kesbangpol`
      const newAdmin = await prisma.adminKesbangpol.create({
        data: {
          nama: nama.trim(),
          email: cleanEmail,
          password: password,
          role: role === 'verifikator' ? 'verifikator' : 'superadmin',
          status: 'aktif',
          instansi: instansi?.trim() || 'Badan Kesbangpol Kabupaten Mimika',
          telepon: telepon?.trim() || null,
          nip: nip?.trim() || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Akun Admin Kesbangpol "${nama}" berhasil disimpan ke tabel admin_kesbangpol!`,
        data: newAdmin,
      });
    } else {
      // Simpan ke tabel `user_pengajuan`
      const ormasName = namaOrmas?.trim() || instansi?.trim() || `Ormas ${nama.trim()}`;
      const newPengajuan = await prisma.userPengajuan.create({
        data: {
          nama: nama.trim(),
          email: cleanEmail,
          password: password,
          role: 'admin_ormas',
          status: 'aktif',
          namaOrmas: ormasName,
          telepon: telepon?.trim() || null,
        },
      });

      // Otomatis buat entitas Ormas di database
      await prisma.ormas.create({
        data: {
          userId: newPengajuan.id,
          namaOrmas: ormasName,
          jenisOrmas: 'Sosial Kemasyarakatan',
          alamatSekretariat: 'Alamat sekretariat belum dilengkapi',
          distrik: 'Mimika Baru',
          teleponKantor: telepon?.trim() || null,
          emailResmi: cleanEmail,
          statusSkt: 'Menunggu Verifikasi',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Akun User Pengajuan Ormas "${nama}" berhasil disimpan ke tabel user_pengajuan!`,
        data: newPengajuan,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user in DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan pengguna ke database', error: message },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui data pengguna di tabel yang sesuai
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

    // 1. Cek di tabel `admin_kesbangpol`
    const admin = await prisma.adminKesbangpol.findUnique({ where: { id } });
    if (admin) {
      const updateData: any = {};
      if (nama) updateData.nama = nama.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (role) updateData.role = role === 'verifikator' ? 'verifikator' : 'superadmin';
      if (status) updateData.status = status;
      if (instansi) updateData.instansi = instansi.trim();
      if (telepon !== undefined) updateData.telepon = telepon && telepon.trim() ? telepon.trim() : null;
      if (nip !== undefined) updateData.nip = nip && nip.trim() ? nip.trim() : null;
      if (password && password.trim()) updateData.password = password.trim();

      const updated = await prisma.adminKesbangpol.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: 'Data admin berhasil diperbarui di tabel admin_kesbangpol!',
        data: updated,
      });
    }

    // 2. Cek di tabel `user_pengajuan`
    const ormasUser = await prisma.userPengajuan.findUnique({ where: { id } });
    if (ormasUser) {
      const updateData: any = {};
      if (nama) updateData.nama = nama.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (status) updateData.status = status;
      if (instansi) updateData.namaOrmas = instansi.trim();
      if (telepon !== undefined) updateData.telepon = telepon && telepon.trim() ? telepon.trim() : null;
      if (password && password.trim()) updateData.password = password.trim();

      const updated = await prisma.userPengajuan.update({
        where: { id },
        data: updateData,
      });

      // Update nama ormas jika instansi diubah
      if (instansi) {
        await prisma.ormas.updateMany({
          where: { userId: id },
          data: { namaOrmas: instansi.trim() },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Data pemohon berhasil diperbarui di tabel user_pengajuan!',
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Pengguna tidak ditemukan di database' },
      { status: 404 }
    );
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

    // 1. Cek di tabel `admin_kesbangpol`
    const admin = await prisma.adminKesbangpol.findUnique({ where: { id } });
    if (admin) {
      if (admin.email === 'admin.kesbangpol@mimikakab.go.id') {
        return NextResponse.json(
          { success: false, message: 'Akun Administrator Utama tidak boleh dihapus!' },
          { status: 403 }
        );
      }

      await prisma.adminKesbangpol.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: `Akun Admin "${admin.nama}" (${admin.email}) berhasil dihapus dari tabel admin_kesbangpol!`,
      });
    }

    // 2. Cek di tabel `user_pengajuan`
    const ormasUser = await prisma.userPengajuan.findUnique({ where: { id } });
    if (ormasUser) {
      await prisma.userPengajuan.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: `Akun User Pengajuan "${ormasUser.nama}" (${ormasUser.email}) berhasil dihapus dari tabel user_pengajuan!`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Pengguna tidak ditemukan di database' },
      { status: 404 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting user from DB:', message);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pengguna dari database', error: message },
      { status: 500 }
    );
  }
}
