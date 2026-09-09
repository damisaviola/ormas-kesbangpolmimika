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

    // 1. Cek apakah email sudah terdaftar di database MySQL
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return {
        success: false,
        error: 'Email ini sudah terdaftar di sistem. Silakan gunakan email lain atau langsung login.',
      };
    }

    // 2. Buat User baru di tabel `users` MySQL
    const newUser = await prisma.user.create({
      data: {
        nama: fullName.trim(),
        email: cleanEmail,
        password: password,
        role: 'admin_ormas',
        status: 'aktif',
        telepon: telepon && telepon.trim() ? telepon.trim() : null,
        instansi: namaOrmas && namaOrmas.trim() ? namaOrmas.trim() : 'Organisasi Baru',
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
      message: 'Pendaftaran berhasil! Akun Anda telah resmi tersimpan di database MySQL.',
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

    // Cari akun di database MySQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        ormas: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Akun dengan alamat email tersebut tidak ditemukan di database.',
      };
    }

    if (user.status !== 'aktif') {
      return {
        success: false,
        error: 'Akun Anda sedang dinonaktifkan oleh administrator Kesbangpol.',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
      };
    }

    // Update waktu login terakhir
    await prisma.user.update({
      where: { id: user.id },
      data: { terakhirLogin: new Date() },
    });

    return {
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role, // 'superadmin' | 'verifikator' | 'admin_ormas'
        instansi: user.instansi,
        ormasNama: user.ormas?.[0]?.namaOrmas || user.instansi,
      },
    };
  } catch (error) {
    console.error('Kesalahan saat login ke database:', error);
    return {
      success: false,
      error: 'Terjadi kegagalan koneksi database saat memproses login.',
    };
  }
}
