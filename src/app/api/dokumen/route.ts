import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ormasId = searchParams.get('ormasId');
    const namaOrmas = searchParams.get('namaOrmas');

    let whereClause: any = {};

    if (ormasId) {
      whereClause.ormasId = ormasId;
    } else if (namaOrmas) {
      const ormas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { namaOrmas: { contains: namaOrmas } },
            { singkatan: { contains: namaOrmas } },
          ],
        },
      });
      if (ormas) {
        whereClause.ormasId = ormas.id;
      }
    }

    const docs = await prisma.dokumenPersyaratan.findMany({
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    console.error('Error fetching dokumen:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data dokumen dari database', error: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { docId, namaDokumen, namaOrmas, ormasId, actorName, userEmail, pengajuanId } = body;

    if (!docId && !namaDokumen) {
      return NextResponse.json(
        { success: false, message: 'docId atau namaDokumen wajib disertakan' },
        { status: 400 }
      );
    }

    let targetOrmas = null;
    if (ormasId) {
      targetOrmas = await prisma.ormas.findUnique({ where: { id: ormasId } });
    } else if (namaOrmas) {
      targetOrmas = await prisma.ormas.findFirst({
        where: {
          OR: [
            { namaOrmas: { contains: namaOrmas } },
            { singkatan: { contains: namaOrmas } },
          ],
        },
      });
    }

    let doc = null;
    if (docId) {
      doc = await prisma.dokumenPersyaratan.findUnique({ where: { id: docId } });
    }

    if (!doc && targetOrmas && namaDokumen) {
      doc = await prisma.dokumenPersyaratan.findFirst({
        where: {
          ormasId: targetOrmas.id,
          namaDokumen: namaDokumen,
        },
      });
    }

    if (!doc && namaDokumen) {
      doc = await prisma.dokumenPersyaratan.findFirst({
        where: {
          namaDokumen: namaDokumen,
        },
      });
    }

    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Dokumen tidak ditemukan di database' },
        { status: 404 }
      );
    }

    // 1. Hapus file fisik jika ada di disk
    if (doc.fileUrl) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const relativePath = doc.fileUrl.startsWith('/') ? doc.fileUrl.slice(1) : doc.fileUrl;
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileErr) {
        console.warn('Could not delete physical file:', fileErr);
      }
    }

    // 2. Hapus data dokumen dari tabel dokumen_persyaratan
    await prisma.dokumenPersyaratan.delete({
      where: { id: doc.id },
    });

    // 3. Catat riwayat penghapusan berkas ke log_aktivitas
    const actor = actorName || (targetOrmas?.namaOrmas ?? 'Pemohon Ormas');
    const userEmailToLog = userEmail || targetOrmas?.emailResmi || null;
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const logAktivitas = `Hapus Berkas: ${doc.namaDokumen}`;
    const logPesan = `Berkas "${doc.namaFile || doc.namaDokumen}" berhasil dihapus dari sistem oleh ${actor}.`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO log_aktivitas (id, nama_ormas, ormas_id, pengajuan_id, user_email, aktivitas, pesan, oleh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      logId,
      targetOrmas?.namaOrmas || doc.namaDokumen,
      targetOrmas?.id || doc.ormasId || null,
      pengajuanId || null,
      userEmailToLog,
      logAktivitas,
      logPesan,
      actor
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

    const activityLogData = {
      timestamp: `${dateStr} ${timeStr}`,
      aktivitas: logAktivitas,
      pesan: logPesan,
      oleh: actor,
    };

    return NextResponse.json({
      success: true,
      message: `Berkas "${doc.namaDokumen}" berhasil dihapus dari database.`,
      activityLog: activityLogData,
    });
  } catch (error: any) {
    console.error('Error deleting dokumen:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus dokumen dari database', error: error?.message },
      { status: 500 }
    );
  }
}

