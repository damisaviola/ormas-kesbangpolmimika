import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface LogAktivitasRow {
  id: string;
  nama_ormas: string | null;
  ormas_id: string | null;
  pengajuan_id: string | null;
  user_email: string | null;
  aktivitas: string;
  pesan: string;
  oleh: string;
  created_at: Date;
}

// GET: Mengambil riwayat log aktivitas pengguna / ormas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const namaOrmas = searchParams.get('namaOrmas')?.trim();
    const userEmail = searchParams.get('userEmail')?.trim().toLowerCase();
    const pengajuanId = searchParams.get('pengajuanId')?.trim();
    const ormasId = searchParams.get('ormasId')?.trim();

    let query = `SELECT id, nama_ormas, ormas_id, pengajuan_id, user_email, aktivitas, pesan, oleh, created_at 
                 FROM log_aktivitas`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (namaOrmas) {
      conditions.push(`(nama_ormas = ? OR nama_ormas LIKE ?)`);
      params.push(namaOrmas, `%${namaOrmas}%`);
    }
    if (userEmail) {
      conditions.push(`user_email = ?`);
      params.push(userEmail);
    }
    if (pengajuanId) {
      conditions.push(`pengajuan_id = ?`);
      params.push(pengajuanId);
    }
    if (ormasId) {
      conditions.push(`ormas_id = ?`);
      params.push(ormasId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' OR ');
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const rows = (await prisma.$queryRawUnsafe(query, ...params)) as LogAktivitasRow[];

    const formatted = rows.map((row) => {
      const d = new Date(row.created_at);
      const dateStr = d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');
      const timeStr = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        id: row.id,
        timestamp: `${dateStr} ${timeStr}`,
        aktivitas: row.aktivitas,
        pesan: row.pesan,
        oleh: row.oleh,
        namaOrmas: row.nama_ormas,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching log aktivitas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data log aktivitas', error: error?.message },
      { status: 500 }
    );
  }
}

// POST: Mencatat riwayat log aktivitas baru ke database MySQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { namaOrmas, userEmail, pengajuanId, ormasId, aktivitas, pesan, oleh } = body;

    if (!aktivitas || !pesan) {
      return NextResponse.json(
        { success: false, message: 'Kolom aktivitas dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cleanOleh = oleh?.trim() || namaOrmas?.trim() || 'Pemohon Ormas';

    await prisma.$executeRawUnsafe(
      `INSERT INTO log_aktivitas (id, nama_ormas, ormas_id, pengajuan_id, user_email, aktivitas, pesan, oleh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      logId,
      namaOrmas?.trim() || null,
      ormasId?.trim() || null,
      pengajuanId?.trim() || null,
      userEmail?.trim().toLowerCase() || null,
      aktivitas.trim(),
      pesan.trim(),
      cleanOleh
    );

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newLogItem = {
      id: logId,
      timestamp: `${dateStr} ${timeStr}`,
      aktivitas: aktivitas.trim(),
      pesan: pesan.trim(),
      oleh: cleanOleh,
      namaOrmas: namaOrmas?.trim() || null,
      createdAt: now.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Log aktivitas berhasil dicatat ke database.',
      data: newLogItem,
    });
  } catch (error: any) {
    console.error('Error recording log aktivitas:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mencatat log aktivitas', error: error?.message },
      { status: 500 }
    );
  }
}
