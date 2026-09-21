import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

let isTableInitialized = false;

/**
 * Inisialisasi tabel notifikasi_sistem di MySQL jika belum ada
 */
async function ensureNotificationTable() {
  if (isTableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifikasi_sistem (
        id VARCHAR(64) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        pesan TEXT NOT NULL,
        tipe VARCHAR(20) DEFAULT 'info',
        kategori VARCHAR(30) DEFAULT 'sistem',
        pengirim VARCHAR(100) NOT NULL,
        peran_target VARCHAR(20) DEFAULT 'all',
        target_ormas VARCHAR(255) NULL,
        target_email VARCHAR(255) NULL,
        tautan VARCHAR(255) NULL,
        dibaca BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring notifikasi_sistem table:', err);
  }
}

interface RawNotifRow {
  id: string;
  judul: string;
  pesan: string;
  tipe: string;
  kategori: string;
  pengirim: string;
  peran_target: string;
  target_ormas: string | null;
  target_email: string | null;
  tautan: string | null;
  dibaca: boolean | number;
  created_at: Date;
}

// GET: Mengambil daftar notifikasi untuk peran (admin / ormas / all)
export async function GET(req: NextRequest) {
  try {
    await ensureNotificationTable();

    const { searchParams } = new URL(req.url);
    const role = (searchParams.get('role') || 'all').toLowerCase();
    const namaOrmas = searchParams.get('namaOrmas')?.trim();

    // 1. Ambil dari tabel notifikasi_sistem
    let query = `
      SELECT id, judul, pesan, tipe, kategori, pengirim, peran_target, target_ormas, target_email, tautan, dibaca, created_at
      FROM notifikasi_sistem
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (role === 'admin') {
      conditions.push(`(peran_target = 'admin' OR peran_target = 'all')`);
    } else if (role === 'ormas') {
      if (namaOrmas) {
        conditions.push(`(peran_target = 'ormas' OR peran_target = 'all') AND (target_ormas IS NULL OR target_ormas = '' OR LOWER(target_ormas) = LOWER(?))`);
        params.push(namaOrmas);
      } else {
        conditions.push(`(peran_target = 'ormas' OR peran_target = 'all')`);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    let directNotifs: RawNotifRow[] = [];
    try {
      directNotifs = (await prisma.$queryRawUnsafe(query, ...params)) as RawNotifRow[];
    } catch (dbErr) {
      console.error('Error querying notifikasi_sistem:', dbErr);
    }

    // 2. Ambil juga riwayat aktivitas penting dari log_aktivitas & pengajuan untuk disintesis
    const combinedNotifs: any[] = directNotifs.map((row) => ({
      id: row.id,
      title: row.judul,
      message: row.pesan,
      type: row.tipe,
      category: row.kategori || 'sistem',
      sender: row.pengirim,
      recipientRole: row.peran_target,
      targetOrmas: row.target_ormas,
      targetEmail: row.target_email,
      link: row.tautan,
      isRead: Boolean(row.dibaca),
      createdAt: new Date(row.created_at).toISOString(),
    }));

    // Ambil log aktivitas terbaru untuk melengkapi notifikasi
    try {
      const logs = (await prisma.$queryRawUnsafe(
        `SELECT id, nama_ormas, aktivitas, pesan, oleh, created_at FROM log_aktivitas ORDER BY created_at DESC LIMIT 20`
      )) as any[];

      for (const log of logs) {
        const isFromKesbang =
          log.oleh?.toLowerCase().includes('kesbangpol') ||
          log.oleh?.toLowerCase().includes('verifikator') ||
          log.oleh?.toLowerCase().includes('admin');

        const notifRecipient = isFromKesbang ? 'ormas' : 'admin';

        // Filter apakah log relevan untuk role yang meminta
        if (role !== 'all' && role !== notifRecipient) continue;
        if (role === 'ormas' && namaOrmas && log.nama_ormas && log.nama_ormas.toLowerCase() !== namaOrmas.toLowerCase()) {
          continue;
        }

        const syntheticId = `LOGNOTIF-${log.id}`;
        // Jangan duplikat jika sudah ada di directNotifs
        if (combinedNotifs.some((n) => n.id === syntheticId || n.id === log.id)) continue;

        let notifType = 'info';
        let notifCategory = 'sistem';
        const actLower = (log.aktivitas || '').toLowerCase();
        const msgLower = (log.pesan || '').toLowerCase();

        if (actLower.includes('setuju') || actLower.includes('resmi') || msgLower.includes('disetujui')) {
          notifType = 'success';
          notifCategory = 'pengajuan';
        } else if (actLower.includes('revisi') || actLower.includes('perbaikan') || msgLower.includes('revisi')) {
          notifType = 'warning';
          notifCategory = 'pengajuan';
        } else if (actLower.includes('tolak') || msgLower.includes('ditolak')) {
          notifType = 'danger';
          notifCategory = 'pengajuan';
        } else if (actLower.includes('dokumen') || actLower.includes('berkas')) {
          notifType = 'info';
          notifCategory = 'dokumen';
        } else if (actLower.includes('anggota') || actLower.includes('pengurus')) {
          notifType = 'info';
          notifCategory = 'anggota';
        }

        let link = null;
        if (notifRecipient === 'admin') {
          link = notifCategory === 'anggota' ? '/dashboard/organisasi' : '/dashboard/pengajuan';
        } else {
          link =
            notifCategory === 'dokumen'
              ? '/dashboard-ormas/organisasi?tab=dokumen'
              : notifCategory === 'anggota'
              ? '/dashboard-ormas/organisasi?tab=pengurus'
              : '/dashboard-ormas';
        }

        combinedNotifs.push({
          id: syntheticId,
          title: log.aktivitas,
          message: log.pesan && log.pesan !== '-' ? log.pesan : `Pembaruan data terkait ${log.nama_ormas || 'organisasi'}`,
          type: notifType,
          category: notifCategory,
          sender: log.oleh || (isFromKesbang ? 'Bakesbangpol Mimika' : `Pemohon (${log.nama_ormas})`),
          recipientRole: notifRecipient,
          targetOrmas: log.nama_ormas,
          targetEmail: null,
          link,
          isRead: false,
          createdAt: new Date(log.created_at).toISOString(),
        });
      }
    } catch (logErr) {
      console.warn('Error reading log_aktivitas for notifications:', logErr);
    }

    // Jika notifikasi masih kosong, buat seeded notification pembuka
    if (combinedNotifs.length === 0) {
      if (role === 'admin' || role === 'all') {
        combinedNotifs.push({
          id: 'SEED-ADMIN-1',
          title: 'Sistem SI-ORMAS Siap & Beroperasi',
          message: 'Sistem Pengawasan dan Verifikasi Organisasi Kemasyarakatan Bakesbangpol Kabupaten Mimika aktif.',
          type: 'info',
          category: 'sistem',
          sender: 'Sistem Bakesbangpol',
          recipientRole: 'admin',
          targetOrmas: null,
          link: '/dashboard/pengajuan',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
      if (role === 'ormas' || role === 'all') {
        combinedNotifs.push({
          id: 'SEED-ORMAS-1',
          title: 'Registrasi Berkas SKT Ormas',
          message: 'Lengkapi profil organisasi, susunan pengurus, dan berkas persyaratan legalitas untuk verifikasi SKT.',
          type: 'info',
          category: 'dokumen',
          sender: 'Bakesbangpol Kabupaten Mimika',
          recipientRole: 'ormas',
          targetOrmas: namaOrmas || null,
          link: '/dashboard-ormas/organisasi?tab=dokumen',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Urutkan berdasarkan createdAt DESC
    combinedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: combinedNotifs.slice(0, 50),
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil notifikasi', error: error?.message },
      { status: 500 }
    );
  }
}

// POST: Menambahkan notifikasi baru ke database MySQL
export async function POST(req: NextRequest) {
  try {
    await ensureNotificationTable();

    const body = await req.json();
    const {
      title,
      message,
      type = 'info',
      category = 'sistem',
      sender = 'Sistem',
      recipientRole = 'all',
      targetOrmas = null,
      targetEmail = null,
      link = null,
      id,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Judul dan pesan notifikasi wajib diisi' },
        { status: 400 }
      );
    }

    const notifId = id || `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO notifikasi_sistem (id, judul, pesan, tipe, kategori, pengirim, peran_target, target_ormas, target_email, tautan, dibaca, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      notifId,
      title.trim(),
      message.trim(),
      type,
      category,
      sender.trim(),
      recipientRole,
      targetOrmas ? targetOrmas.trim() : null,
      targetEmail ? targetEmail.trim().toLowerCase() : null,
      link ? link.trim() : null
    );

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dibuat',
      data: {
        id: notifId,
        title,
        message,
        type,
        category,
        sender,
        recipientRole,
        targetOrmas,
        targetEmail,
        link,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat notifikasi', error: error?.message },
      { status: 500 }
    );
  }
}

// PATCH: Menandai notifikasi telah dibaca
export async function PATCH(req: NextRequest) {
  try {
    await ensureNotificationTable();

    const body = await req.json();
    const { id, action, role, namaOrmas } = body;

    if (action === 'read_all') {
      let query = `UPDATE notifikasi_sistem SET dibaca = TRUE`;
      const conditions: string[] = [];
      const params: any[] = [];

      if (role === 'admin') {
        conditions.push(`(peran_target = 'admin' OR peran_target = 'all')`);
      } else if (role === 'ormas') {
        conditions.push(`(peran_target = 'ormas' OR peran_target = 'all')`);
        if (namaOrmas) {
          conditions.push(`(target_ormas IS NULL OR LOWER(target_ormas) = LOWER(?))`);
          params.push(namaOrmas);
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      await prisma.$executeRawUnsafe(query, ...params);

      return NextResponse.json({
        success: true,
        message: 'Seluruh notifikasi berhasil ditandai telah dibaca',
      });
    }

    if (id) {
      await prisma.$executeRawUnsafe(
        `UPDATE notifikasi_sistem SET dibaca = TRUE WHERE id = ?`,
        id
      );

      return NextResponse.json({
        success: true,
        message: 'Notifikasi berhasil ditandai telah dibaca',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Parameter id atau action diperlukan' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating notification status:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui notifikasi', error: error?.message },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus notifikasi
export async function DELETE(req: NextRequest) {
  try {
    await ensureNotificationTable();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const role = searchParams.get('role');
    const namaOrmas = searchParams.get('namaOrmas');

    if (action === 'clear_all') {
      let query = `DELETE FROM notifikasi_sistem`;
      const conditions: string[] = [];
      const params: any[] = [];

      if (role === 'admin') {
        conditions.push(`(peran_target = 'admin' OR peran_target = 'all')`);
      } else if (role === 'ormas') {
        conditions.push(`(peran_target = 'ormas' OR peran_target = 'all')`);
        if (namaOrmas) {
          conditions.push(`(target_ormas IS NULL OR LOWER(target_ormas) = LOWER(?))`);
          params.push(namaOrmas);
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      await prisma.$executeRawUnsafe(query, ...params);

      return NextResponse.json({
        success: true,
        message: 'Seluruh notifikasi berhasil dibersihkan',
      });
    }

    if (id) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM notifikasi_sistem WHERE id = ?`,
        id
      );

      return NextResponse.json({
        success: true,
        message: 'Notifikasi berhasil dihapus',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Parameter id atau action=clear_all diperlukan' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus notifikasi', error: error?.message },
      { status: 500 }
    );
  }
}
