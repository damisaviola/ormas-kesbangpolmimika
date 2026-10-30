'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OrmasDashboardLoading from '@/app/dashboard-ormas/loading';
import OrmasSubmissionModal, { OrmasSubmissionPayload } from '@/components/dashboard/OrmasSubmissionModal';
import { INITIAL_TIMELINE_STEPS, INITIAL_DOKUMEN_PERSYARATAN } from '@/data/ormas-dashboard-data';
import { exportToCsv, printBuktiTandaTerimaPdf } from '@/utils/exportUtils';

// Helper perhitungan estimasi penyelesaian SKT berdasarkan SOP Kesbangpol 5-7 hari kerja
function calculateEstimatedCompletion(dateStr?: string | Date, currentStatus?: string) {
  const isDone = currentStatus === 'Disetujui' || currentStatus === 'disetujui' || currentStatus === 'resmi';
  if (isDone) {
    return {
      estimasiDate: 'SKT Telah Terbit',
      estimasiText: 'Proses Selesai',
    };
  }

  if (!dateStr || dateStr === '-') {
    return {
      estimasiDate: '± 5-7 Hari Kerja',
      estimasiText: 'Setelah Berkas Diajukan',
    };
  }

  const baseDate = new Date(dateStr);
  if (isNaN(baseDate.getTime())) {
    return {
      estimasiDate: '± 5-7 Hari Kerja',
      estimasiText: 'SOP Pelayanan Kesbangpol',
    };
  }

  // Tambahkan 5 hari kerja (Senin - Jumat) dari tanggal pengajuan
  const targetDate = new Date(baseDate);
  let addedWorkingDays = 0;
  while (addedWorkingDays < 5) {
    targetDate.setDate(targetDate.getDate() + 1);
    const day = targetDate.getDay();
    if (day !== 0 && day !== 6) {
      addedWorkingDays++;
    }
  }

  const formattedTargetDate = targetDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let countdownText = '± 5 Hari Kerja Lagi';
  if (diffDays <= 0) {
    countdownText = 'Tahap Finalisasi Verifikasi';
  } else {
    countdownText = `± ${Math.min(diffDays, 5)} Hari Kerja Lagi`;
  }

  return {
    estimasiDate: formattedTargetDate,
    estimasiText: countdownText,
  };
}

interface SubmissionResponseItem {
  id?: string;
  ormasId?: string;
  namaOrmas?: string;
  singkatan?: string;
  jenisOrmas?: string;
  nomorRegistrasi?: string;
  nomorTiket?: string;
  tanggalPengajuan?: string;
  tanggalPengajuanRaw?: string;
  status?: string;
  totalDokumen?: number;
  catatan?: string;
  petugasVerifikator?: string;
}

export default function OrmasBerandaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [showPrintToast, setShowPrintToast] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    nama?: string;
    email?: string;
    role?: string;
    ormasNama?: string;
    singkatan?: string;
    jenisOrmas?: string;
    nomorTiket?: string;
    statusSkt?: string;
  } | null>(null);

  const [hasSubmission, setHasSubmission] = useState(false);

  // Active submission data state
  const [submission, setSubmission] = useState<{
    id?: string;
    ormasId?: string;
    namaOrmas: string;
    singkatan: string;
    jenisOrmas: string;
    nomorTiket: string;
    tanggalPengajuan: string;
    tanggalPengajuanRaw?: string;
    status: string;
    stepNumber: number; // 0: belum, 1: pengisian/revisi, 2: verifikasi administrasi, 3: verifikasi lapangan, 4: SKT terbit
    totalDokumen: number;
    catatan?: string;
    petugasVerifikator?: string;
    estimasiTerbit: string;
    estimasiHariLagi: string;
  }>({
    namaOrmas: '',
    singkatan: '',
    jenisOrmas: 'Organisasi Kemasyarakatan',
    nomorTiket: '',
    tanggalPengajuan: '',
    status: 'Belum Diajukan',
    stepNumber: 0,
    totalDokumen: 0,
    estimasiTerbit: '± 5-7 Hari Kerja',
    estimasiHariLagi: 'Setelah Berkas Diajukan',
  });

  const [submissionToast, setSubmissionToast] = useState<{
    show: boolean;
    ticket: string;
    nama: string;
  }>({ show: false, ticket: '', nama: '' });

  const [totalAnggota, setTotalAnggota] = useState<number>(0);

  const handleCopyTicket = (ticket: string) => {
    if (!ticket || ticket === '-') return;
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  const handleExportSubmissionCsv = () => {
    if (!hasSubmission) {
      setShowPrintToast(true);
      setTimeout(() => setShowPrintToast(false), 3000);
      return;
    }

    const headers = [
      'Nomor Tiket Registrasi',
      'Nama Organisasi',
      'Singkatan',
      'Jenis Ormas',
      'Tanggal Pengajuan',
      'Status Verifikasi',
      'Estimasi Penyelesaian',
      'Petugas Verifikator',
      'Catatan Petugas',
    ];

    const rows = [
      [
        submission.nomorTiket,
        submission.namaOrmas,
        submission.singkatan || '',
        submission.jenisOrmas,
        submission.tanggalPengajuan,
        submission.status,
        submission.estimasiTerbit,
        submission.petugasVerifikator || 'Tim Verifikasi Bakesbangpol Mimika',
        submission.catatan || 'Berkas dalam proses verifikasi',
      ],
    ];

    const safeTicket = submission.nomorTiket.replace(/[^a-zA-Z0-9_-]/g, '_');
    exportToCsv(`Tanda_Terima_${safeTicket}`, headers, rows);
  };

  const handlePrintSubmissionPdf = () => {
    if (!hasSubmission) {
      setShowPrintToast(true);
      setTimeout(() => setShowPrintToast(false), 3000);
      return;
    }
    printBuktiTandaTerimaPdf(submission);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndSubmission() {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('kesbangpol_user') : null;
        const activeUser = stored ? JSON.parse(stored) : null;
        if (activeUser) {
          if (activeUser.ormasNama === 'Organisasi Baru' || activeUser.instansi === 'Organisasi Baru') {
            activeUser.ormasNama = '';
            activeUser.instansi = '';
            localStorage.setItem('kesbangpol_user', JSON.stringify(activeUser));
          }
          if (isMounted) setCurrentUser(activeUser);
        }

        const emailToSearch = activeUser?.email;
        let targetSubmission: SubmissionResponseItem | null = null;

        if (emailToSearch) {
          try {
            const res = await fetch(`/api/pengajuan?email=${encodeURIComponent(emailToSearch)}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              targetSubmission = json.data[0];
            }
          } catch {
            // fallback
          }
        }

        // Fallback jika email pendaftar tidak cocok persis tapi ada submission di database
        if (!targetSubmission) {
          try {
            const fallbackRes = await fetch(`/api/pengajuan`, { cache: 'no-store' });
            const fallbackJson = await fallbackRes.json();
            if (fallbackJson.success && Array.isArray(fallbackJson.data) && fallbackJson.data.length > 0) {
              if (activeUser?.ormasNama || activeUser?.instansi) {
                targetSubmission = fallbackJson.data.find(
                  (item: SubmissionResponseItem) =>
                    item.namaOrmas?.toLowerCase() === (activeUser.ormasNama || activeUser.instansi).toLowerCase()
                ) || null;
              }
              if (!targetSubmission && activeUser?.role === 'admin_ormas') {
                targetSubmission = fallbackJson.data[0];
              }
            }
          } catch {
            // Abaikan fallback error
          }
        }

        if (targetSubmission && isMounted) {
          const rawStatus = (targetSubmission.status || 'menunggu').toLowerCase();
          let formattedStatus = 'Menunggu Verifikasi';
          let step = 2; // Tahap 2: Verifikasi Administrasi Berkas

          if (rawStatus === 'disetujui' || rawStatus === 'resmi' || rawStatus === 'selesai' || rawStatus === 'aktif') {
            formattedStatus = 'Disetujui';
            step = 4;
          } else if (rawStatus === 'proses' || rawStatus === 'verifikasi lapangan' || rawStatus === 'lapangan') {
            formattedStatus = 'Verifikasi Lapangan';
            step = 3;
          } else if (rawStatus === 'ditolak') {
            formattedStatus = 'Ditolak';
            step = 0;
          } else if (rawStatus === 'revisi' || rawStatus === 'perlu_revisi') {
            formattedStatus = 'Perlu Perbaikan Berkas';
            step = 1;
          } else if (rawStatus === 'ditangguhkan') {
            formattedStatus = 'Ditangguhkan';
            step = 2;
          } else {
            formattedStatus = 'Menunggu Verifikasi';
            step = 2;
          }

          // Hitung estimasi waktu penyelesaian yang sinkron
          const est = calculateEstimatedCompletion(
            targetSubmission.tanggalPengajuanRaw || targetSubmission.tanggalPengajuan,
            formattedStatus
          );

          // Cek total dokumen terunggah
          let docCount = targetSubmission.totalDokumen ?? 0;
          if (docCount === 0 && targetSubmission.namaOrmas) {
            try {
              const dRes = await fetch(`/api/dokumen?namaOrmas=${encodeURIComponent(targetSubmission.namaOrmas)}`);
              const dJson = await dRes.json();
              if (dJson.success && Array.isArray(dJson.data)) {
                docCount = dJson.data.length;
              }
            } catch {
              // fallback
            }
          }

          setSubmission({
            id: targetSubmission.id,
            ormasId: targetSubmission.ormasId,
            namaOrmas: targetSubmission.namaOrmas || '',
            singkatan: targetSubmission.singkatan || '',
            jenisOrmas: targetSubmission.jenisOrmas || 'Organisasi Kemasyarakatan',
            nomorTiket: targetSubmission.nomorRegistrasi || targetSubmission.nomorTiket || targetSubmission.id || '-',
            tanggalPengajuan: targetSubmission.tanggalPengajuan || new Date().toLocaleDateString('id-ID'),
            tanggalPengajuanRaw: targetSubmission.tanggalPengajuanRaw,
            status: formattedStatus,
            stepNumber: step,
            totalDokumen: docCount,
            catatan: targetSubmission.catatan,
            petugasVerifikator: targetSubmission.petugasVerifikator,
            estimasiTerbit: est.estimasiDate,
            estimasiHariLagi: est.estimasiText,
          });

          // Ambil jumlah anggota & pengurus dari database
          try {
            const pRes = await fetch(
              `/api/pengurus?namaOrmas=${encodeURIComponent(targetSubmission.namaOrmas || '')}&userEmail=${encodeURIComponent(activeUser?.email || '')}`
            );
            const pJson = await pRes.json();
            if (pJson.success && Array.isArray(pJson.data) && isMounted) {
              setTotalAnggota(pJson.data.length);
            }
          } catch {
            // fallback
          }

          setHasSubmission(true);
          setIsLoading(false);
          return;
        }

        // Jika user belum memiliki pengajuan di database:
        if (isMounted) {
          setSubmission({
            namaOrmas: activeUser?.ormasNama || '',
            singkatan: activeUser?.singkatan || '',
            jenisOrmas: 'Organisasi Belum Didaftarkan',
            nomorTiket: '-',
            tanggalPengajuan: '-',
            status: 'Belum Diajukan',
            stepNumber: 0,
            totalDokumen: 0,
            estimasiTerbit: '± 5-7 Hari Kerja',
            estimasiHariLagi: 'Setelah Berkas Diajukan',
          });
          setHasSubmission(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user submission in dashboard-ormas:', err);
        if (isMounted) {
          setHasSubmission(false);
          setIsLoading(false);
        }
      }
    }

    loadUserAndSubmission();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmissionSuccess = (newSub: OrmasSubmissionPayload) => {
    const tiket = newSub.nomorTiket || `TIKET/SKT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    const tglNow = newSub.tanggalPengajuan || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const est = calculateEstimatedCompletion(new Date(), 'Menunggu Verifikasi');

    setSubmission({
      namaOrmas: newSub.namaOrganisasi,
      singkatan: newSub.namaSingkat || '',
      jenisOrmas: newSub.jenisOrganisasi,
      nomorTiket: tiket,
      tanggalPengajuan: tglNow,
      status: 'Menunggu Verifikasi',
      stepNumber: 2,
      totalDokumen: 8,
      catatan: newSub.catatan,
      petugasVerifikator: 'Yance Murib, S.STP (Subbid Ormas)',
      estimasiTerbit: est.estimasiDate,
      estimasiHariLagi: est.estimasiText,
    });
    setHasSubmission(true);

    setSubmissionToast({
      show: true,
      ticket: tiket,
      nama: newSub.namaOrganisasi,
    });

    setTimeout(() => {
      setSubmissionToast({ show: false, ticket: '', nama: '' });
    }, 6000);
  };

  if (isLoading) {
    return <OrmasDashboardLoading />;
  }

  // Helper tampilan status badge warna besar
  const getStatusBadgeConfig = () => {
    const st = submission.status.toLowerCase();
    if (st.includes('disetujui') || st.includes('resmi') || st.includes('aktif')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        text: 'SKT Telah Disetujui / Terbit',
        icon: '✓',
      };
    }
    if (st.includes('proses') || st.includes('lapangan')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500 animate-pulse',
        text: 'Tahap Verifikasi Lapangan',
        icon: '🔄',
      };
    }
    if (st.includes('revisi') || st.includes('perbaikan')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
        text: 'Perlu Perbaikan Dokumen',
        icon: '⚠️',
      };
    }
    if (st.includes('ditolak')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
        text: 'Pengajuan Ditolak',
        icon: '✕',
      };
    }
    return {
      bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      dot: 'bg-blue-500 animate-pulse',
      text: 'Menunggu Verifikasi Administrasi',
      icon: '⏳',
    };
  };

  const statusConfig = getStatusBadgeConfig();

  return (
    <div className="space-y-6 sm:space-y-8 w-full pb-12 font-sans">
      {/* Toast Notification Cetak */}
      {showPrintToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-semibold">Tanda Terima &amp; Bukti Pengajuan siap dicetak / diunduh (PDF)</span>
        </div>
      )}

      {/* Toast Notification Pengajuan Berhasil */}
      {submissionToast.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 p-5 rounded-3xl bg-emerald-700 text-white shadow-2xl max-w-md border border-emerald-500 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-white/20 rounded-2xl shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Pendaftaran Berhasil Dikirim!
              </p>
              <h4 className="text-sm font-black leading-tight">{submissionToast.nama}</h4>
              <p className="text-xs text-emerald-100">
                Nomor Registrasi: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{submissionToast.ticket}</span>
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-xl transition-colors hover:bg-emerald-50 shadow-xs"
                >
                  Lihat Tanda Terima
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionToast({ show: false, ticket: '', nama: '' })}
                  className="px-2.5 py-1.5 text-xs text-emerald-200 hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO BANNER: STATUS UTAMA ORGANISASI (Bersih, Rapi & Sangat Ramah) */}
      {/* ========================================================================= */}
      {hasSubmission ? (
        /* KONDISI A: ORMAS SUDAH TERDAFTAR */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            {/* Bagian Kiri: Identitas Organisasi & Nomor Tiket */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Portal Resmi Ormas Kesbangpol Mimika
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {submission.jenisOrmas}
                </span>
                {currentUser?.email && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Masuk: {currentUser.email}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {submission.namaOrmas || 'Organisasi Anda'}
                </h1>
                {submission.singkatan && (
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Dikenal sebagai: <strong className="text-slate-700 dark:text-slate-200">({submission.singkatan})</strong>
                  </p>
                )}
              </div>

              {/* Status Badge Menonjol & Nomor Tiket */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold shadow-2xs ${statusConfig.bg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot}`} />
                  <span>{statusConfig.text}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">No. Tiket:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{submission.nomorTiket}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(submission.nomorTiket)}
                    className="ml-1 p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
                    title="Salin nomor tiket ini"
                  >
                    {copiedTicket ? (
                      <span className="text-[10px] text-emerald-600 font-bold">Tersalin!</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bagian Kanan: Aksi Cepat & Cetak Bukti */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch gap-2.5 shrink-0 min-w-[220px]">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Cetak Tanda Terima</span>
              </button>

              <Link
                href="/dashboard-ormas/organisasi"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Kelola Berkas ({submission.totalDokumen}/8)</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* KONDISI B: BELUM MEMILIKI PENGAJUAN (Sambutan Ramah untuk Ormas Baru) */
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-sky-300 border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Selamat Datang di SI-ORMAS Kabupaten Mimika
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Daftarkan Organisasi Kemasyarakatan Anda Secara Mandiri &amp; Online
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Layanan permohonan Surat Keterangan Terdaftar (SKT) resmi dari Badan Kesatuan Bangsa dan Politik Kabupaten Mimika. Proses mudah, transparan, dan dapat dipantau langsung dari gawai Anda.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Daftarkan Ormas Baru Sekarang</span>
              </button>

              <Link
                href="/dashboard-ormas/panduan"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
              >
                <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lihat Panduan &amp; Syarat SKT</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RINGKASAN 4 KARTU METRIK UTAMA (Informasi Padat & Tidak Membingungkan) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kartu 1: Tahap Saat Ini */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tahap Permohonan</span>
            <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {submission.status}
            </div>
            <p className="text-xs text-blue-600 dark:text-sky-400 font-semibold mt-1">
              {!hasSubmission
                ? 'Belum ada pengajuan aktif'
                : `Tahap ${submission.stepNumber || 1} dari 4 Alur Pelayanan`}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {hasSubmission ? 'Dipantau berkala oleh Bakesbangpol' : 'Daftar untuk memulai proses verifikasi'}
          </div>
        </div>

        {/* Kartu 2: Kelengkapan Dokumen Legalitas */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dokumen Persyaratan</span>
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {submission.totalDokumen} / 8 Berkas
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {submission.totalDokumen >= 8 ? '✓ 100% Persyaratan Terpenuhi' : `${Math.round((submission.totalDokumen / 8) * 100)}% Kelengkapan Berkas`}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
            {submission.totalDokumen >= 8 ? 'Akta, NPWP, Domisili & AD/ART siap' : `${Math.max(0, 8 - submission.totalDokumen)} dokumen belum dilengkapi`}
          </div>
        </div>

        {/* Kartu 3: Pengurus & Anggota */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pengurus &amp; Anggota</span>
            <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalAnggota > 0 ? `${totalAnggota} Orang` : 'Pengurus Inti'}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
              Ketua, Sekretaris, Bendahara
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link href="/dashboard-ormas/organisasi?tab=pengurus" className="hover:text-purple-600 transition-colors">
              Kelola susunan pengurus &rarr;
            </Link>
          </div>
        </div>

        {/* Kartu 4: Estimasi Selesai */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estimasi Terbit SKT</span>
            <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
              {submission.estimasiTerbit}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {submission.estimasiHariLagi}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            SOP Pelayanan Kesbangpol Mimika
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ALUR TAHAPAN VERIFIKASI (Visual Stepper yang Bersih & Mudah Dipahami) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Alur &amp; Progres Penerbitan SKT Ormas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau perjalanan berkas Anda mulai dari pengisian, verifikasi, hingga penerbitan Surat Keterangan Terdaftar resmi
            </p>
          </div>

          {hasSubmission && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintSubmissionPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Unduh PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Kolom Stepper Alur */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {INITIAL_TIMELINE_STEPS.map((step) => {
            const stepNum = step.stepNumber;
            let isDone = false;
            let isCurrent = false;
            let isAlert = false;
            let statusText = 'Menunggu';
            let dateText = '';

            if (!hasSubmission) {
              if (stepNum === 1) {
                isCurrent = true;
                statusText = 'Siap Diisi';
              }
            } else {
              if (submission.status === 'Disetujui') {
                isDone = true;
                statusText = 'Selesai';
                if (stepNum === 1) dateText = submission.tanggalPengajuan;
                if (stepNum === 4) dateText = 'SKT Terbit';
              } else if (submission.status === 'Ditolak') {
                if (stepNum === 1) isDone = true;
                if (stepNum === 2) {
                  isAlert = true;
                  statusText = 'Ditolak';
                }
              } else if (submission.status === 'Perlu Perbaikan Berkas') {
                if (stepNum === 1) {
                  isAlert = true;
                  statusText = 'Perlu Revisi';
                  dateText = 'Unggah Ulang';
                }
              } else if (submission.stepNumber === 3) {
                if (stepNum < 3) {
                  isDone = true;
                  statusText = 'Selesai';
                } else if (stepNum === 3) {
                  isCurrent = true;
                  statusText = 'Sedang Berjalan';
                  dateText = 'Jadwal Peninjauan';
                }
              } else {
                // Default Step 2: Verifikasi Administrasi
                if (stepNum === 1) {
                  isDone = true;
                  statusText = 'Selesai';
                  dateText = submission.tanggalPengajuan;
                } else if (stepNum === 2) {
                  isCurrent = true;
                  statusText = 'Sedang Berjalan';
                  dateText = 'Pemeriksaan Berkas';
                }
              }
            }

            return (
              <div
                key={step.stepNumber}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                    : isAlert
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    : isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isAlert
                        ? 'bg-rose-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isDone ? '✓' : isAlert ? '!' : step.stepNumber}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        : isAlert
                        ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                        : isCurrent
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.description}
                </p>

                {dateText && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{dateText}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Kotak Catatan Verifikator & Bantuan Langsung */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs text-lg">
              💬
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Catatan Petugas Verifikator Kesbangpol:
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                {submission.catatan && submission.catatan.trim()
                  ? `"${submission.catatan}"`
                  : submission.status === 'Disetujui'
                  ? '"Selamat! Berkas dan legalitas organisasi Anda telah dinyatakan lengkap dan sah. SKT resmi telah diterbitkan."'
                  : hasSubmission
                  ? '"Berkas pendaftaran Anda telah diterima secara online. Tim verifikator sedang memeriksa keabsahan 8 dokumen persyaratan."'
                  : '"Silakan isi formulir pendaftaran ormas dan lengkapi 8 berkas persyaratan untuk diproses oleh verifikator."'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Petugas Verifikator: <strong>{submission.petugasVerifikator || 'Yance Murib, S.STP (Subbid Ormas)'}</strong>
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6281240998877"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors shrink-0"
          >
            <span>Hubungi Petugas (WhatsApp)</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PUSAT LAYANAN CEPAT (4 Menu Utama Beranda yang Sangat Rapi & Jelas) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Menu Utama &amp; Pelayanan Mandiri Ormas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih menu di bawah ini untuk mengelola berkas, susunan pengurus, atau membaca panduan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kelola Dokumen Legalitas */}
          <Link
            href="/dashboard-ormas/organisasi"
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              📂
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Kelola Dokumen Persyaratan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Unggah dan periksa 8 berkas legalitas seperti Akta Notaris, NPWP, AD/ART, dan Domisili.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 dark:text-sky-400 flex items-center gap-1">
              <span>Buka Dokumen</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Susunan Pengurus & Anggota */}
          <Link
            href="/dashboard-ormas/organisasi?tab=pengurus"
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              👥
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Pengurus &amp; Data Anggota
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kelola nama Ketua Umum, Sekretaris, Bendahara, serta rincian daftar anggota aktif.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Buka Pengurus</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

          {/* Card 3: Kalender & Masa Aktif SKT */}
          <Link
            href="/dashboard-ormas/kalender"
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Kalender SKT &amp; Kegiatan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Pantau tanggal jatuh tempo masa berlaku SKT dan agenda verifikasi lapangan Kesbangpol.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>Buka Kalender</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>

          {/* Card 4: Panduan Pendaftaran & SOP */}
          <Link
            href="/dashboard-ormas/panduan"
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                Panduan &amp; Standar Layanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Panduan lengkap tata cara pendaftaran, syarat berkas, dan ketentuan hukum Ormas.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>Baca Panduan</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CHECKLIST RINGKAS 8 PERSYARATAN WAJIB SKT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Daftar Checklist 8 Berkas Wajib SKT
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pastikan seluruh berkas berikut telah diunggah dalam format PDF atau gambar beresolusi jelas
            </p>
          </div>
          <Link
            href="/dashboard-ormas/organisasi"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Unggah / Lengkapi Berkas</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INITIAL_DOKUMEN_PERSYARATAN.map((doc, idx) => {
            const isUploaded = submission.totalDokumen > idx;

            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isUploaded
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {isUploaded ? '✓' : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {doc.namaDokumen}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Format: {doc.format} • Maks: {doc.ukuranMaks}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    isUploaded
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}
                >
                  {isUploaded ? 'Terunggah' : 'Belum Unggah'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL TANDA TERIMA PENDAFTARAN RESMI */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">Bukti Tanda Terima Pendaftaran SKT</h3>
                  <p className="text-xs text-slate-500">Badan Kesatuan Bangsa dan Politik Kabupaten Mimika</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Content / Printable Box */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
                {/* Kop Surat */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 border-b-2 border-slate-300 dark:border-slate-700 pb-4">
                  <Image
                    src="/assets/pic/logo_kabupatenmimika_removebg.png"
                    alt="Lambang Mimika"
                    width={56}
                    height={56}
                    className="h-12 w-auto sm:h-14 object-contain shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Pemerintah Kabupaten Mimika
                    </p>
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
                      Badan Kesatuan Bangsa dan Politik
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">
                      Pusat Pemerintahan Kab. Mimika SP3 Kuala Kencana - Timika, Papua Tengah 99910
                    </p>
                  </div>
                </div>

                <div className="text-center py-1">
                  <h1 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
                    Tanda Terima Pendaftaran SKT Ormas
                  </h1>
                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400 mt-0.5">
                    Nomor Tiket: {submission.nomorTiket || 'TIKET/SKT/2026/001'}
                  </p>
                </div>

                {/* Grid Detail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Organisasi</span>
                    <p className="font-black text-slate-900 dark:text-white">
                      {submission.namaOrmas || 'Organisasi Kemasyarakatan'}
                    </p>
                    {submission.singkatan && <p className="text-[11px] text-slate-500">Singkatan: {submission.singkatan}</p>}
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis Ormas</span>
                    <p className="font-bold text-slate-900 dark:text-white">{submission.jenisOrmas}</p>
                    <p className="text-[11px] text-slate-500">Pendaftaran Mandiri Online</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tanggal Pengajuan</span>
                    <p className="font-bold text-slate-900 dark:text-white">{submission.tanggalPengajuan}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Tercatat di Database SI-ORMAS</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Verifikasi</span>
                    <p className="font-bold text-blue-600 dark:text-sky-400">{submission.status}</p>
                    <p className="text-[11px] text-slate-500">Tahap {submission.stepNumber || 1} dari 4 Alur Pelayanan</p>
                  </div>
                </div>

                {/* Stempel & Petugas */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-500">Petugas Penerima / Verifikator:</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {submission.petugasVerifikator || 'Yance Murib, S.STP'}
                    </p>
                    <p className="text-[10px] text-slate-400">Subbid Ormas Bakesbangpol Kab. Mimika</p>
                  </div>
                  <div className="sm:text-right">
                    <div className="inline-block border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase px-3 py-1 rounded-lg tracking-widest">
                      RESMI TERDAFTAR ONLINE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 bg-slate-50 dark:bg-slate-950/50 shrink-0">
              <button
                type="button"
                onClick={handleExportSubmissionCsv}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                Unduh CSV / Excel
              </button>
              <button
                type="button"
                onClick={handlePrintSubmissionPdf}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                Cetak / Unduh Bukti PDF
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Ormas Baru */}
      <OrmasSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
