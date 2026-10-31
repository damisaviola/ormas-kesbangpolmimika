'use server';

import { prisma } from '@/lib/prisma';

export interface RegisterResult {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  ormasId?: string | null;
}

export async function registerUserAction(payload: {
  fullName: string;
  namaOrmas?: string;
  telepon?: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    const { fullName, namaOrmas, telepon, email, password } = payload;

    if (!fullName || !fullName.trim()) {
      return { success: false, error: 'Nama lengkap penanggung jawab wajib diisi.' };
    }
    if (!email || !email.trim()) {
      return { success: false, error: 'Alamat email wajib diisi.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Kata sandi minimal harus 6 karakter.' };
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Cek apakah email sudah terdaftar di database MySQL (di kedua tabel)
    const existingAdmin = await prisma.adminKesbangpol.findUnique({
      where: { email: cleanEmail },
    });
    const existingPengajuan = await prisma.userPengajuan.findUnique({
      where: { email: cleanEmail },
    });

    if (existingAdmin || existingPengajuan) {
      return {
        success: false,
        error: 'Email ini sudah terdaftar di sistem. Silakan gunakan email lain atau langsung login.',
      };
    }

    // 2. Buat User baru di tabel `user_pengajuan` MySQL
    const newUser = await prisma.userPengajuan.create({
      data: {
        nama: fullName.trim(),
        email: cleanEmail,
        password: password,
        role: 'admin_ormas',
        status: 'aktif',
        telepon: telepon && telepon.trim() ? telepon.trim() : null,
        namaOrmas: namaOrmas && namaOrmas.trim() ? namaOrmas.trim() : null,
      },
    });

    // 3. Jika nama Ormas diisi, otomatis buat data awal di tabel `ormas`
    let newOrmasId: string | null = null;
    if (namaOrmas && namaOrmas.trim()) {
      const newOrmas = await prisma.ormas.create({
        data: {
          userId: newUser.id,
          namaOrmas: namaOrmas.trim(),
          jenisOrmas: 'Sosial Kemasyarakatan',
          alamatSekretariat: 'Alamat sekretariat belum dilengkapi',
          distrik: 'Mimika Baru',
          teleponKantor: telepon && telepon.trim() ? telepon.trim() : null,
          emailResmi: cleanEmail,
          statusSkt: 'Menunggu Verifikasi',
        },
      });
      newOrmasId = newOrmas.id;
    }

    return {
      success: true,
      message: 'Pendaftaran akun pemohon berhasil! Akun Anda telah tersimpan di database. Silakan login untuk melengkapi profil organisasi kemasyarakatan Anda.',
      userId: newUser.id,
      ormasId: newOrmasId,
    };
  } catch (error) {
    console.error('Kesalahan saat registrasi user di database:', error);
    return {
      success: false,
      error: 'Gagal menghubungkan ke database MySQL. Pastikan service MySQL di XAMPP/Laragon tetap aktif.',
    };
  }
}

export async function loginUserAction(payload: {
  username: string;
  password: string;
}) {
  try {
    const { username, password } = payload;

    if (!username || !password) {
      return {
        success: false,
        error: 'Silakan isi Alamat E-Mail dan Kata Sandi Anda.',
      };
    }

    const cleanEmail = username.toLowerCase().trim();

    // 1. Cek di tabel `admin_kesbangpol` (Aparatur / Tim Verifikator)
    const adminUser = await prisma.adminKesbangpol.findUnique({
      where: { email: cleanEmail },
    });

    if (adminUser) {
      if (adminUser.status !== 'aktif') {
        return {
          success: false,
          error: 'Akun Administrator Anda sedang dinonaktifkan.',
        };
      }

      if (adminUser.password !== password) {
        return {
          success: false,
          error: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
        };
      }

      // Update waktu login terakhir
      await prisma.adminKesbangpol.update({
        where: { id: adminUser.id },
        data: { terakhirLogin: new Date() },
      });

      return {
        success: true,
        user: {
          id: adminUser.id,
          nama: adminUser.nama,
          email: adminUser.email,
          role: adminUser.role, // 'superadmin' | 'verifikator'
          nip: adminUser.nip,
          instansi: adminUser.instansi || 'Badan Kesbangpol Kabupaten Mimika',
          telepon: adminUser.telepon,
          ormasId: null,
          ormasNama: null,
          singkatan: null,
          jenisOrmas: null,
          alamat: null,
          nomorTiket: null,
          statusSkt: null,
        },
      };
    }

    // 2. Jika bukan admin, cek di tabel `user_pengajuan` (Ormas / Pemohon SKT)
    const ormasUser = await prisma.userPengajuan.findUnique({
      where: { email: cleanEmail },
      include: {
        ormas: {
          include: {
            pengajuan: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (ormasUser) {
      if (ormasUser.status !== 'aktif') {
        return {
          success: false,
          error: 'Akun Anda sedang dinonaktifkan oleh administrator Kesbangpol.',
        };
      }

      if (ormasUser.password !== password) {
        return {
          success: false,
          error: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
        };
      }

      // Update waktu login terakhir
      await prisma.userPengajuan.update({
        where: { id: ormasUser.id },
        data: { terakhirLogin: new Date() },
      });

      const userOrmas = ormasUser.ormas?.[0];
      const latestPengajuan = userOrmas?.pengajuan?.[0];

      return {
        success: true,
        user: {
          id: ormasUser.id,
          nama: ormasUser.nama,
          email: ormasUser.email,
          role: ormasUser.role, // 'admin_ormas'
          instansi: ormasUser.namaOrmas || userOrmas?.namaOrmas || null,
          telepon: ormasUser.telepon,
          ormasId: userOrmas?.id || null,
          ormasNama: userOrmas?.namaOrmas || ormasUser.namaOrmas || '',
          singkatan: userOrmas?.singkatan || '',
          jenisOrmas: userOrmas?.jenisOrmas || '',
          alamat: userOrmas?.alamatSekretariat || '',
          nomorTiket: latestPengajuan?.nomorTiket || null,
          statusSkt: latestPengajuan?.status || userOrmas?.statusSkt || null,
        },
      };
    }

    return {
      success: false,
      error: 'Akun dengan alamat email tersebut tidak ditemukan di database.',
    };
  } catch (error) {
    console.error('Kesalahan saat login ke database:', error);
    return {
      success: false,
      error: 'Terjadi kegagalan koneksi database saat memproses login.',
    };
  }
}
