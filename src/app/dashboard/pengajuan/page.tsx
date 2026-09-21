'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TableBadge from '@/components/dashboard/TableBadge';
import PengajuanLoading from '@/app/dashboard/pengajuan/loading';
import { OrmasSubmission, StatusPengajuan } from '@/types/dashboard';
import {
  getSubmissions,
  syncSubmissionsFromApi,
  updateSubmissionStatus,
  subscribeToSubmissions,
} from '@/services/submissionStorage';
import { exportToCsv, printReportPdf } from '@/utils/exportUtils';

// 10 Error Bawaan Next.js & Prisma untuk Simulasi Error Overlay
const NEXT_ERRORS = [
  {
    id: 1,
    badge: 'Unhandled Runtime Error',
    title: 'Error: PrismaClientKnownRequestError: P2034',
    message: 'Transaction failed due to a write conflict or a deadlock on table `pengajuan`. Deadlock found when trying to get lock; try restarting transaction in MySQL InnoDB engine.',
    source: 'src/app/dashboard/pengajuan/page.tsx (45:11) @ POST',
    file: 'src/app/dashboard/pengajuan/page.tsx',
    lang: 'TypeScript JSX',
    codeLines: [
      { line: 42, text: '  // Verifikasi transaksi cluster database MySQL' },
      { line: 43, text: '  const tx = await prisma.$transaction(async (prisma) => {' },
      { line: 44, text: '    const item = await prisma.pengajuan.findUnique({ where: { id } });' },
      { line: 45, text: '    await prisma.pengajuan.update({', isError: true, caret: '          ^' },
      { line: 46, text: '      where: { id: item.id },' },
      { line: 47, text: "      data: { status: 'proses', tahapanAktif: 2 }" },
      { line: 48, text: '    });' },
      { line: 49, text: '  });' },
    ],
    stack: [
      '> PrismaClient.executeRequest (node_modules/@prisma/client/runtime/library.js:142:15)',
      '> async syncTableState (src/services/submissionStorage.ts:64:12)',
      '> async POST (src/app/dashboard/pengajuan/page.tsx:45:11)',
    ],
  },
  {
    id: 2,
    badge: 'Unhandled Runtime Error',
    title: 'Error: PrismaClientInitializationError: Can\'t reach database server at 127.0.0.1:3306',
    message: 'Please make sure your MySQL database server is running at 127.0.0.1:3306. Connection refused by target machine during connection pool warmup.',
    source: 'src/lib/db.ts (18:5) @ getPrismaClient',
    file: 'src/lib/db.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 15, text: 'const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };' },
      { line: 16, text: 'export const prisma =' },
      { line: 17, text: '  globalForPrisma.prisma ??' },
      { line: 18, text: '  new PrismaClient({', isError: true, caret: '  ^' },
      { line: 19, text: "    log: ['query', 'error', 'warn']," },
      { line: 20, text: '  });' },
      { line: 21, text: 'if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;' },
    ],
    stack: [
      '> PrismaClientInitializationError (node_modules/@prisma/client/runtime/library.js:98:12)',
      '> Object.getPrismaClient (src/lib/db.ts:18:5)',
      '> async syncSubmissionsFromApi (src/services/submissionStorage.ts:31:18)',
    ],
  },
  {
    id: 3,
    badge: 'Unhandled Runtime Error',
    title: 'TypeError: Cannot read properties of undefined (reading \'dokumen\')',
    message: 'Failed to access nested relation property \'dokumen\' on Ormas entity with id \'010079c0-fdb5-8463-5ede-bd9790a0bec7\'.',
    source: 'src/app/api/pengajuan/route.ts (32:13) @ GET',
    file: 'src/app/api/pengajuan/route.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 29, text: '      include: {' },
      { line: 30, text: '        ormas: {' },
      { line: 31, text: '          include: {' },
      { line: 32, text: '            dokumen: true,', isError: true, caret: '            ^' },
      { line: 33, text: '            pengurus: true,' },
      { line: 34, text: '            user: {' },
    ],
    stack: [
      '> Object.includeRelations (src/app/api/pengajuan/route.ts:32:13)',
      '> async GET (src/app/api/pengajuan/route.ts:26:27)',
      '> AppRouteRouteHandlers.execute (node_modules/next/dist/server/future/route-modules/app-route/module.js:254:37)',
    ],
  },
  {
    id: 4,
    badge: 'Unhandled Runtime Error',
    title: 'Error: PrismaClientKnownRequestError: P2002',
    message: 'Unique constraint failed on the constraint: `pengajuan_nomor_tiket_key`. Key (nomor_tiket)=(SUB-2026-089) already exists in table `pengajuan`.',
    source: 'src/services/submissionStorage.ts (89:7) @ createSubmission',
    file: 'src/services/submissionStorage.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 86, text: 'export async function createSubmission(payload: OrmasSubmissionPayload) {' },
      { line: 87, text: '  const newTicket = generateNomorTiket();' },
      { line: 88, text: '  const result = await prisma.pengajuan.create({' },
      { line: 89, text: '    data: { nomorTiket: newTicket, ...payload },', isError: true, caret: '    ^' },
      { line: 90, text: '  });' },
      { line: 91, text: '  return result;' },
    ],
    stack: [
      '> PrismaClient.executeRequest (node_modules/@prisma/client/runtime/library.js:142:15)',
      '> async createSubmission (src/services/submissionStorage.ts:89:7)',
      '> async POST (src/app/api/pengajuan/route.ts:108:24)',
    ],
  },
  {
    id: 5,
    badge: 'Unhandled Runtime Error',
    title: 'Error: Hydration failed because the initial UI does not match what was rendered on the server',
    message: 'Warning: Text content did not match. Server: "Menunggu Verifikasi" Client: "Dalam Proses". See more info here: https://nextjs.org/docs/messages/react-hydration-error',
    source: 'src/app/dashboard/pengajuan/page.tsx (142:9) @ TableBadge',
    file: 'src/app/dashboard/pengajuan/page.tsx',
    lang: 'TypeScript JSX',
    codeLines: [
      { line: 139, text: '  <td className="py-4 px-4 font-mono font-bold">' },
      { line: 140, text: '    {item.nomorRegistrasi}' },
      { line: 141, text: '  </td>' },
      { line: 142, text: '  <TableBadge status={item.status} />', isError: true, caret: '  ^' },
      { line: 143, text: '  <td className="py-4 px-4">' },
      { line: 144, text: '    {item.tanggalPengajuan}' },
    ],
    stack: [
      '> throwOnHydrationMismatch (node_modules/react-dom/cjs/react-dom-client.development.js:12507:11)',
      '> tryToClaimChildren (node_modules/react-dom/cjs/react-dom-client.development.js:12640:7)',
      '> updateHostComponent$1 (node_modules/react-dom/cjs/react-dom-client.development.js:19717:5)',
    ],
  },
  {
    id: 6,
    badge: 'Unhandled Runtime Error',
    title: 'Error: ENOENT: no such file or directory, open \'E:\\Code\\ormas-kesbangpolmimika\\public\\uploads\\dokumen_skt_mimika_2026.pdf\'',
    message: 'File stream read error: The requested document file was moved or deleted while generating preview thumbnail buffer.',
    source: 'src/app/api/dokumen/route.ts (54:19) @ GET',
    file: 'src/app/api/dokumen/route.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 51, text: '  const docPath = path.join(process.cwd(), "public", "uploads", fileName);' },
      { line: 52, text: '  // Read file from disk' },
      { line: 53, text: '  const fileExists = await fs.stat(docPath);' },
      { line: 54, text: '  const buffer = await fs.readFile(docPath);', isError: true, caret: '                       ^' },
      { line: 55, text: '  return new NextResponse(buffer, { headers: { "Content-Type": "application/pdf" } });' },
    ],
    stack: [
      '> Object.open (node:internal/fs/promises:639:19)',
      '> async Object.readFile (node:internal/fs/promises:1242:14)',
      '> async GET (src/app/api/dokumen/route.ts:54:19)',
    ],
  },
  {
    id: 7,
    badge: 'Unhandled Runtime Error',
    title: 'Error: Connection lost: The server closed the connection (PROTOCOL_CONNECTION_LOST)',
    message: 'Fatal MySQL socket disconnect on 127.0.0.1:3306 while executing batch update on table `riwayat_verifikasi`. Connection pool closed socket abruptly.',
    source: 'node_modules/mysql2/lib/connection.js (312:14) @ Connection.handlePacket',
    file: 'node_modules/mysql2/lib/connection.js',
    lang: 'JavaScript',
    codeLines: [
      { line: 309, text: '  if (packet.isError()) {' },
      { line: 310, text: '    const err = packet.asError(this.clientEncoding);' },
      { line: 311, text: '    if (err.code === "PROTOCOL_CONNECTION_LOST") {' },
      { line: 312, text: '      throw new Error("Connection lost: The server closed the connection");', isError: true, caret: '            ^' },
      { line: 313, text: '    }' },
      { line: 314, text: '  }' },
    ],
    stack: [
      '> Connection.handlePacket (node_modules/mysql2/lib/connection.js:312:14)',
      '> PacketParser.execute (node_modules/mysql2/lib/packet_parser.js:75:12)',
      '> Socket.<anonymous> (node_modules/mysql2/lib/connection.js:102:31)',
    ],
  },
  {
    id: 8,
    badge: 'Unhandled Runtime Error',
    title: 'Error: PrismaClientKnownRequestError: P2003',
    message: 'Foreign key constraint failed on the field: `ormas_id` (table: `dokumen_persyaratan`). Referenced record in parent table `ormas` was not found.',
    source: 'src/services/submissionStorage.ts (114:9) @ syncSubmissionsFromApi',
    file: 'src/services/submissionStorage.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 111, text: '  await prisma.$transaction(async (tx) => {' },
      { line: 112, text: '    await tx.dokumenPersyaratan.create({' },
      { line: 113, text: '      data: {' },
      { line: 114, text: '        ormasId: submission.ormasId,', isError: true, caret: '        ^' },
      { line: 115, text: '        namaDokumen: "SK Kemenkumham.pdf",' },
      { line: 116, text: '      },' },
    ],
    stack: [
      '> PrismaClient.executeRequest (node_modules/@prisma/client/runtime/library.js:142:15)',
      '> async syncSubmissionsFromApi (src/services/submissionStorage.ts:114:9)',
      '> async PengajuanPage (src/app/dashboard/pengajuan/page.tsx:34:5)',
    ],
  },
  {
    id: 9,
    badge: 'Unhandled Runtime Error',
    title: 'RangeError: Maximum call stack size exceeded at resolveRelationCascade',
    message: 'Recursive relation cycle detected between models \'Pengajuan\', \'Ormas\', and \'RiwayatVerifikasi\'. Circular eager loading cascade overflowed call stack.',
    source: 'src/lib/db.ts (189:22) @ resolveRelationCascade',
    file: 'src/lib/db.ts',
    lang: 'TypeScript',
    codeLines: [
      { line: 186, text: 'function resolveRelationCascade(model: string, visited: Set<string>): any {' },
      { line: 187, text: '  visited.add(model);' },
      { line: 188, text: '  const rel = getModelRelations(model);' },
      { line: 189, text: '  return resolveRelationCascade(rel.targetModel, visited);', isError: true, caret: '         ^' },
      { line: 190, text: '}' },
    ],
    stack: [
      '> resolveRelationCascade (src/lib/db.ts:189:22)',
      '> resolveRelationCascade (src/lib/db.ts:189:22)',
      '> resolveRelationCascade (src/lib/db.ts:189:22)',
      '> resolveRelationCascade (src/lib/db.ts:189:22)',
      '> Object.getIncludeTree (src/lib/db.ts:204:12)',
    ],
  },
  {
    id: 10,
    badge: 'Fast Refresh Error',
    title: 'Error: [Fast Refresh] rebuilding failed: Module build failed',
    message: 'SyntaxError: Unexpected token `}`. Expected valid expression in JSX element attribute during Turbopack compilation.',
    source: 'src/app/dashboard/pengajuan/page.tsx (1:1) @ ModuleBuildError',
    file: 'src/app/dashboard/pengajuan/page.tsx',
    lang: 'TypeScript JSX',
    codeLines: [
      { line: 1, text: "'use client';", isError: true, caret: '^' },
      { line: 2, text: "import React, { useState, useEffect } from 'react';" },
      { line: 3, text: "import Link from 'next/link';" },
      { line: 4, text: "import TableBadge from '@/components/dashboard/TableBadge';" },
    ],
    stack: [
      '> ModuleBuildError: Module build failed (node_modules/next/dist/build/webpack/loaders/next-swc-loader.js:42:18)',
      '> async handleCompilationHmr (node_modules/next/dist/server/dev/hot-reloader-turbopack.js:189:12)',
      '> TurbopackWatchPipeline.onBuildError (node_modules/next/dist/build/swc/index.js:84:15)',
    ],
  },
];

export default function PengajuanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<keyof OrmasSubmission>('tanggalPengajuan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // State Next.js Error Overlay (Simulasi 10 Error Bawaan Next.js)
  const [showNextErrorOverlay, setShowNextErrorOverlay] = useState(true);
  const [currentErrorIdx, setCurrentErrorIdx] = useState(0);
  const [showStackTrace, setShowStackTrace] = useState(false);

  // Navigasi keyboard (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!showNextErrorOverlay) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentErrorIdx((prev) => (prev > 0 ? prev - 1 : NEXT_ERRORS.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentErrorIdx((prev) => (prev < NEXT_ERRORS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setShowNextErrorOverlay(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNextErrorOverlay]);

  useEffect(() => {
    // Muat data pengajuan (termasuk yang baru saja diajukan di portal Ormas)
    setSubmissions(getSubmissions());

    // Selaraskan dengan database MySQL
    syncSubmissionsFromApi().then((fresh) => {
      if (fresh && fresh.length > 0) setSubmissions(fresh);
    });

    // Berlangganan perubahan data antar-halaman / tab
    const unsubscribe = subscribeToSubmissions((updatedList) => {
      setSubmissions(updatedList);
    });

    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <PengajuanLoading />;
  }

  const handleSort = (field: keyof OrmasSubmission) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = submissions.filter((item) => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.namaOrmas.toLowerCase().includes(searchLower) ||
      item.ketuaUmum.toLowerCase().includes(searchLower) ||
      item.id.toLowerCase().includes(searchLower) ||
      (item.nomorRegistrasi && item.nomorRegistrasi.toLowerCase().includes(searchLower)) ||
      (item.alamat && item.alamat.toLowerCase().includes(searchLower)) ||
      (item.jenisOrmas && item.jenisOrmas.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = (a[sortField] || '') as string;
    let valB = (b[sortField] || '') as string;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Hitung jumlah pengajuan per status
  const counts = {
    all: submissions.length,
    menunggu: submissions.filter((s) => s.status === 'menunggu').length,
    proses: submissions.filter((s) => s.status === 'proses').length,
    disetujui: submissions.filter((s) => s.status === 'disetujui').length,
    ditolak: submissions.filter((s) => s.status === 'ditolak').length,
  };

  const newSubmissionsCount = submissions.filter((s) => s.isCustomSubmission || s.nomorRegistrasi?.startsWith('TIKET/')).length;

  const handleExportCsv = () => {
    const headers = [
      'Nomor Registrasi / Tiket',
      'Nama Organisasi',
      'Singkatan',
      'Jenis/Bidang',
      'Ketua Umum',
      'Tanggal Pengajuan',
      'Status',
      'Alamat',
      'Telepon',
      'Email Pemohon',
    ];

    const rows = sorted.map((item) => [
      item.nomorRegistrasi || item.id,
      item.namaOrmas,
      item.singkatan || '',
      item.jenisOrmas || '',
      item.ketuaUmum || '',
      item.tanggalPengajuan || '',
      item.status,
      item.alamat || '',
      item.telepon || '',
      item.pendaftarEmail || item.email || '',
    ]);

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToCsv(`Data_Pengajuan_Ormas_Kesbangpol_Mimika_${timestamp}`, headers, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['No. Tiket / ID', 'Nama Organisasi', 'Jenis / Bidang', 'Ketua Umum', 'Tgl Pengajuan', 'Status'];
    const rows = sorted.map((item) => [
      item.nomorRegistrasi || item.id,
      item.singkatan ? `${item.namaOrmas} (${item.singkatan})` : item.namaOrmas,
      item.jenisOrmas || 'Umum',
      item.ketuaUmum || '-',
      item.tanggalPengajuan || '-',
      item.status,
    ]);

    const statusLabel = selectedStatus === 'all' ? 'Semua Status Pengajuan' : `Status: ${selectedStatus.toUpperCase()}`;
    const searchNote = searchTerm ? `Pencarian: "${searchTerm}"` : '';
    const filterDesc = [statusLabel, searchNote].filter(Boolean).join(' | ');

    printReportPdf({
      title: 'LAPORAN REKAPITULASI PENGAJUAN SKT ORMAS',
      subtitle: 'Daftar Berkas Permohonan Surat Keterangan Terdaftar (SKT) Bakesbangpol Kab. Mimika',
      headers,
      rows,
      keteranganFilter: filterDesc,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Verifikasi Pengajuan Ormas
            </h1>
            {newSubmissionsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                {newSubmissionsCount} Pengajuan dari Portal
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola dan lakukan verifikasi berkas permohonan pendaftaran Ormas baru dari pemohon di Kesbangpol Mimika.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNextErrorOverlay(!showNextErrorOverlay)}
            title="Klik untuk memicu simulasi error bawaan Next.js"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              showNextErrorOverlay
                ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
                : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:text-rose-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showNextErrorOverlay ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{showNextErrorOverlay ? '▲ Next.js (10 Errors): ON' : 'Mode Normal'}</span>
          </button>
          <button
            onClick={handleExportCsv}
            title="Unduh seluruh data pengajuan yang aktif ke format file Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrintPdf}
            title="Cetak atau simpan rekapitulasi sebagai PDF ber-KOP resmi Kesbangpol"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-800 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak / Unduh PDF</span>
          </button>
          <Link
            href="/dashboard-ormas"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Portal Pemohon</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Status', count: counts.all },
            { id: 'menunggu', label: 'Menunggu Verifikasi', count: counts.menunggu },
            { id: 'proses', label: 'Dalam Proses', count: counts.proses },
            { id: 'disetujui', label: 'Disetujui', count: counts.disetujui },
            { id: 'ditolak', label: 'Ditolak', count: counts.ditolak },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedStatus === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full md:w-80 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama Ormas, tiket, ketua, distrik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 w-12 text-center">No</th>
                <th
                  onClick={() => handleSort('namaOrmas')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Organisasi</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'namaOrmas' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nomorRegistrasi')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>No. Registrasi / Tiket</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'nomorRegistrasi' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('alamat')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Alamat Sekretariat</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'alamat' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ketuaUmum')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Pendaftar / Ketua</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'ketuaUmum' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.length > 0 ? (
                sorted.map((item, idx) => {
                  const isNewlySubmitted = item.isCustomSubmission || item.nomorRegistrasi?.startsWith('TIKET/');

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isNewlySubmitted ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6 text-center font-bold text-slate-500 dark:text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 dark:text-white">{item.namaOrmas}</p>
                          {isNewlySubmitted && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                              Baru Masuk
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                          {item.singkatan && <span className="font-semibold">({item.singkatan})</span>}
                          <span>•</span>
                          <span>{item.jenisOrmas}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.nomorRegistrasi || item.id}
                        <p className="text-[10px] font-sans font-medium text-slate-400 mt-0.5">
                          Tgl: {item.tanggalPengajuan}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-xs">
                        {item.alamat || 'Kabupaten Mimika'}
                      </td>
                      <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.pendaftar || item.ketuaUmum}
                        </p>
                        {(item.email || item.pendaftarEmail) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate max-w-[170px]">{item.email || item.pendaftarEmail}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <TableBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/dashboard/pengajuan/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors border border-blue-200/80 dark:border-blue-800"
                          title="Tinjau Detail Pengajuan"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Tinjau
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Tidak ditemukan data pengajuan yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SIMULASI ERROR BAWAAN NEXT.JS (UNHANDLED RUNTIME ERROR OVERLAY) */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* SIMULASI ERROR BAWAAN NEXT.JS (10 UNHANDLED RUNTIME ERRORS)   */}
      {/* ============================================================== */}
      {showNextErrorOverlay && (() => {
        const currentError = NEXT_ERRORS[currentErrorIdx] || NEXT_ERRORS[0];
        return (
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 select-text font-sans">
            <div className="bg-[#111111] border border-[#2a2a2a] text-[#ededed] rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header Overlay Bawaan Next.js dengan Navigasi 10 Error */}
              <div className="bg-[#181818] px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 180 180">
                    <mask height="180" id="nextjs-mask" maskUnits="userSpaceOnUse" width="180">
                      <circle cx="90" cy="90" fill="white" r="90" />
                    </mask>
                    <g mask="url(#nextjs-mask)">
                      <circle cx="90" cy="90" fill="black" r="90" />
                      <path d="M149.508 157.438L69.1478 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.137 149.508 157.438Z" fill="white" />
                      <rect fill="white" height="72" width="12" x="115" y="54" />
                    </g>
                  </svg>
                  <span className="text-xs font-semibold text-[#888] hidden sm:inline">
                    Next.js 16.3.3 (Turbopack)
                  </span>

                  {/* Navigasi Paginasi 10 Error Khas Next.js */}
                  <div className="flex items-center gap-1 sm:ml-2">
                    <button
                      type="button"
                      onClick={() => setCurrentErrorIdx((prev) => (prev > 0 ? prev - 1 : NEXT_ERRORS.length - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#888] hover:text-white hover:bg-[#262626] transition-colors cursor-pointer select-none text-xs font-mono"
                      title="Error sebelumnya (Panah Kiri / ←)"
                    >
                      ◀
                    </button>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#262626] text-[#aaa] font-medium font-mono">
                      {currentErrorIdx + 1} of {NEXT_ERRORS.length} unhandled errors
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentErrorIdx((prev) => (prev < NEXT_ERRORS.length - 1 ? prev + 1 : 0))}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#888] hover:text-white hover:bg-[#262626] transition-colors cursor-pointer select-none text-xs font-mono"
                      title="Error selanjutnya (Panah Kanan / →)"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNextErrorOverlay(false)}
                    className="text-[#888] hover:text-white p-1 rounded hover:bg-[#262626] transition-colors cursor-pointer"
                    title="Tutup overlay (Esc)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Badan Error Overlay Dinamis Berdasarkan Index Error */}
              <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e5484d]/15 border border-[#e5484d]/30 text-[#ff6369] text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#e5484d]"></span>
                    <span>{currentError.badge}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug break-words">
                    {currentError.title}
                  </h2>

                  <p className="text-sm text-[#bbb] leading-relaxed break-words">
                    {currentError.message}
                  </p>

                  <p className="text-xs font-mono text-[#888] break-all">
                    Source: <span className="text-[#3291ff] hover:underline cursor-pointer">{currentError.source}</span>
                  </p>
                </div>

                {/* Code Frame Khas Next.js dengan Highlight Baris Merah */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 font-mono text-xs overflow-x-auto leading-relaxed text-[#ccc]">
                  <div className="text-[11px] text-[#666] mb-2 pb-1 border-b border-[#222] flex justify-between">
                    <span>{currentError.file}</span>
                    <span>{currentError.lang}</span>
                  </div>
                  {currentError.codeLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      <div className={line.isError ? "bg-[#e5484d]/15 text-[#ff8b8f] -mx-4 px-4 py-0.5 border-l-2 border-[#e5484d] font-bold" : ""}>
                        <span className={`${line.isError ? "text-[#e5484d]" : "text-[#555]"} select-none inline-block w-8 text-right mr-3`}>
                          {line.isError ? `> ${line.line} |` : `${line.line} |`}
                        </span>
                        <span className={line.isError ? "text-[#ff8b8f]" : "text-[#999]"}>{line.text}</span>
                      </div>
                      {line.caret && (
                        <div className="text-[#e5484d] select-none pl-11 py-0.2">
                          <span>{line.caret}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Call Stack Khas Next.js */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowStackTrace(!showStackTrace)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{showStackTrace ? '▼' : '▶'}</span>
                    <span>Call Stack</span>
                    <span className="text-[10px] text-[#555]">({currentError.stack.length} frames)</span>
                  </button>

                  {showStackTrace && (
                    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 font-mono text-xs space-y-1.5 text-[#888]">
                      {currentError.stack.map((frame, idx) => (
                        <div key={idx} className={idx === 0 ? "text-[#ccc] break-all" : "break-all"}>
                          {frame}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Overlay Bawaan Next.js */}
              <div className="bg-[#181818] px-4 py-3 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-[#777]">
                  Learn more about{' '}
                  <a
                    href="https://nextjs.org/docs/messages/unhandled-runtime-error"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3291ff] hover:underline"
                  >
                    Unhandled Runtime Errors
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNextErrorOverlay(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#ccc] bg-[#222] hover:bg-[#2a2a2a] rounded-lg border border-[#333] transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Next.js Dev Error Badge 10 Errors (Ketika overlay diminimalkan) */}
      {!showNextErrorOverlay && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setShowNextErrorOverlay(true)}
            title="Klik untuk membuka kembali Next.js 10 Errors Overlay"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#111] hover:bg-[#1a1a1a] text-white border border-[#333] rounded-full shadow-2xl text-xs font-mono cursor-pointer transition-all hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-bold text-red-400">10 Errors</span>
            <span className="text-slate-500 text-[10px]">| Next.js Dev</span>
          </button>
        </div>
      )}
    </div>
  );
}
