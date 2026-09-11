'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OrmasDashboardLoading from '@/app/dashboard-ormas/loading';
import OrmasSubmissionModal, { OrmasSubmissionPayload } from '@/components/dashboard/OrmasSubmissionModal';
import { INITIAL_TIMELINE_STEPS } from '@/data/ormas-dashboard-data';

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

export default function OrmasBerandaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [showPrintToast, setShowPrintToast] = useState(false);

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

  useEffect(() => {
    async function loadUserAndSubmission() {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('kesbangpol_user') : null;
        let activeUser = stored ? JSON.parse(stored) : null;
        if (activeUser) {
          if (activeUser.ormasNama === 'Organisasi Baru' || activeUser.instansi === 'Organisasi Baru') {
            activeUser.ormasNama = '';
            activeUser.instansi = '';
            localStorage.setItem('kesbangpol_user', JSON.stringify(activeUser));
          }
          setCurrentUser(activeUser);
        }

        const emailToSearch = activeUser?.email;
        let targetSubmission: any = null;

        if (emailToSearch) {
          const res = await fetch(`/api/pengajuan?email=${encodeURIComponent(emailToSearch)}`, { cache: 'no-store' });
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            targetSubmission = json.data[0];
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
                  (item: any) =>
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

        if (targetSubmission) {
          const rawStatus = (targetSubmission.status || 'menunggu').toLowerCase();
          let formattedStatus = 'Menunggu Verifikasi';
          let step = 2; // Tahap 2: Verifikasi Administrasi Berkas (karena berkas formulir sudah diunggah oleh pemohon)

          if (rawStatus === 'disetujui' || rawStatus === 'resmi' || rawStatus === 'selesai') {
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

          // Cek total dokumen terunggah jika belum tersedia
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
            namaOrmas: targetSubmission.namaOrmas,
            singkatan: targetSubmission.singkatan || '',
            jenisOrmas: targetSubmission.jenisOrmas || 'Organisasi Kemasyarakatan',
            nomorTiket: targetSubmission.nomorRegistrasi || targetSubmission.nomorTiket || targetSubmission.id,
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
          setHasSubmission(true);
          setIsLoading(false);
          return;
        }

        // Jika user belum memiliki pengajuan di database:
        setSubmission({
          namaOrmas: '',
          singkatan: '',
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
      } catch (err) {
        console.error('Error fetching user submission in dashboard-ormas:', err);
        setHasSubmission(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAndSubmission();
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
      stepNumber: 2, // Tahap 2: Berkas terunggah & sedang dalam antrean verifikasi
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

  return (
    <div className="space-y-6 w-full pb-8 font-sans">
      {/* Toast Notification Cetak */}
      {showPrintToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-semibold">Tanda Terima &amp; Bukti Pengajuan siap dicetak / diunduh (PDF)</span>
        </div>
      )}

      {/* Toast Notification Submission Berhasil */}
      {submissionToast.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl max-w-md border border-emerald-500 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-100">
                Pengajuan Berhasil Dikirim!
              </p>
              <p className="text-sm font-bold leading-tight">
                {submissionToast.nama}
              </p>
              <p className="text-xs text-emerald-100">
                No. Registrasi: <span className="font-mono font-black">{submissionToast.ticket}</span>
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/dashboard-ormas/organisasi"
                  className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 text-[11px] font-black rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  Buka Kelola Organisasi
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmissionToast({ show: false, ticket: '', nama: '' })}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-100 hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800 w-full">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-widest bg-sky-400/10 px-3 py-1 rounded-md border border-sky-400/20">
              Portal Pemohon Ormas Mimika
            </span>
            <span className="text-[11px] font-extrabold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20">
              {submission.jenisOrmas}
            </span>
            {currentUser?.email && (
              <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{currentUser.email}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang{submission.namaOrmas ? `, ${submission.namaOrmas}` : currentUser?.nama ? `, ${currentUser.nama}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Pantau tahapan verifikasi berkas SKT, kelola dokumen legalitas, dan perbarui susunan kepengurusan organisasi Anda secara mandiri di Badan Kesbangpol Kabupaten Mimika.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Input Pengajuan Baru
          </button>

          <Link
            href="/dashboard-ormas/organisasi"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Kelola Organisasi
          </Link>

          <Link
            href="/dashboard-ormas/profil"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil Akun
          </Link>
        </div>
      </div>

      {/* Warning banner jika user belum memiliki pengajuan */}
      {!hasSubmission && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold">Akun Anda Belum Memiliki Pengajuan Ormas Terdaftar</h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Email pendaftar <strong>{currentUser?.email}</strong> belum terhubung ke ormas. Klik <em>Input Pengajuan Baru</em> untuk mendaftarkan organisasi Anda ke Bakesbangpol Kab. Mimika.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-all shadow-xs"
          >
            Daftarkan Ormas Sekarang
          </button>
        </div>
      )}

      {/* Quick Action Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Pusat Pelayanan &amp; Pengajuan Mandiri SKT Ormas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ajukan permohonan baru, perpanjang masa berlaku SKT, atau perbarui dokumen legalitas organisasi secara langsung.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Input Pengajuan Baru</span>
          </button>
          <Link
            href="/dashboard-ormas/organisasi"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700"
          >
            <span>Kelola Berkas</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid - Sinkron dengan Data Aktual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {/* Card 1: Status Permohonan */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status Permohonan</span>
            <span className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{submission.status}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {!hasSubmission
                ? 'Tahap 1 dari 4: Pengisian Berkas'
                : submission.stepNumber === 2
                ? 'Tahap 2 dari 4 Proses SKT'
                : submission.stepNumber === 3
                ? 'Tahap 3 dari 4: Verifikasi Lapangan'
                : submission.stepNumber === 4
                ? 'Tahap 4 dari 4: SKT Terbit'
                : submission.status === 'Ditolak'
                ? 'Pengajuan Ditolak'
                : 'Tahap 1 dari 4: Revisi Berkas'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {!hasSubmission
              ? 'Silakan isi formulir dan lengkapi berkas'
              : submission.stepNumber === 2
              ? 'Menunggu pemeriksaan berkas Bakesbangpol'
              : submission.stepNumber === 3
              ? 'Peninjauan langsung kantor sekretariat'
              : submission.stepNumber === 4
              ? 'SKT resmi telah diterbitkan Bakesbangpol'
              : 'Pemeriksaan kelengkapan dokumen ormas'}
          </p>
        </div>

        {/* Card 2: Kelengkapan Berkas (Sinkron dengan jumlah dokumen di database) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Kelengkapan Berkas</span>
            <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {submission.totalDokumen >= 8
                ? '8 / 8 Berkas Valid'
                : `${submission.totalDokumen} / 8 Berkas Valid`}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {submission.totalDokumen >= 8
                ? '100% Persyaratan Lengkap'
                : `${Math.round((submission.totalDokumen / 8) * 100)}% Persyaratan Lengkap`}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
            {submission.totalDokumen >= 8
              ? 'Akta, AD/ART, Domisili & NPWP'
              : submission.totalDokumen > 0
              ? `${Math.max(0, 8 - submission.totalDokumen)} berkas persyaratan belum diunggah`
              : 'Belum ada berkas yang diunggah'}
          </p>
        </div>

        {/* Card 3: Nomor Registrasi */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Nomor Registrasi</span>
            <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M11 7h8M11 11h8M11 15h8M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white truncate">
              {submission.nomorTiket || '-'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              {hasSubmission ? `Tgl: ${submission.tanggalPengajuan}` : 'Belum Terdaftar'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {hasSubmission ? 'Didaftarkan secara online' : 'Ajukan melalui portal mandiri'}
          </p>
        </div>

        {/* Card 4: Estimasi Terbit SKT (Dihitung akurat sesuai SOP 5-7 Hari Kerja) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estimasi Terbit SKT</span>
            <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white truncate">
              {submission.estimasiTerbit}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {submission.estimasiHariLagi}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            SOP Pelayanan Kesbangpol
          </p>
        </div>
      </div>

      {/* Stepper Tracking Section - Sinkron Status Antara Tahapan */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tahapan &amp; Progres Verifikasi Pengajuan SKT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Alur resmi pengurusan Surat Keterangan Terdaftar Ormas di Badan Kesbangpol Kabupaten Mimika
            </p>
          </div>
          <button
            onClick={() => {
              if (hasSubmission) {
                setIsReceiptModalOpen(true);
              } else {
                setShowPrintToast(true);
                setTimeout(() => setShowPrintToast(false), 3000);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 self-start sm:self-auto shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Tanda Terima
          </button>
        </div>

        {/* Horizontal Timeline Tracker - Status Sinkron */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {INITIAL_TIMELINE_STEPS.map((step) => {
            const stepNum = step.stepNumber;
            let isCompleted = false;
            let isInProgress = false;
            let isRejected = false;
            let stepBadgeText = 'Menunggu';
            let stepDateText: string | undefined = undefined;

            if (!hasSubmission) {
              if (stepNum === 1) {
                isInProgress = true;
                stepBadgeText = 'Sedang Berjalan';
              } else {
                stepBadgeText = 'Menunggu';
              }
            } else {
              // Jika sudah ada pengajuan tersimpan:
              if (submission.status === 'Disetujui') {
                isCompleted = true;
                stepBadgeText = 'Selesai';
                if (stepNum === 1) stepDateText = submission.tanggalPengajuan;
                if (stepNum === 4) stepDateText = 'SKT Resmi Terbit';
              } else if (submission.status === 'Ditolak') {
                if (stepNum === 1) {
                  isCompleted = true;
                  stepBadgeText = 'Selesai';
                  stepDateText = submission.tanggalPengajuan;
                } else if (stepNum === 2) {
                  isRejected = true;
                  stepBadgeText = 'Ditolak';
                  stepDateText = 'Verifikasi Gagal';
                } else {
                  stepBadgeText = 'Menunggu';
                }
              } else if (submission.status === 'Perlu Perbaikan Berkas') {
                if (stepNum === 1) {
                  isInProgress = true;
                  stepBadgeText = 'Perlu Revisi';
                  stepDateText = 'Unggah Ulang Berkas';
                } else {
                  stepBadgeText = 'Menunggu';
                }
              } else if (submission.stepNumber === 3) {
                // Verifikasi Lapangan aktif
                if (stepNum < 3) {
                  isCompleted = true;
                  stepBadgeText = 'Selesai';
                  if (stepNum === 1) stepDateText = submission.tanggalPengajuan;
                  if (stepNum === 2) stepDateText = 'Berkas Valid';
                } else if (stepNum === 3) {
                  isInProgress = true;
                  stepBadgeText = 'Sedang Berjalan';
                  stepDateText = 'Jadwal Peninjauan';
                } else {
                  stepBadgeText = 'Menunggu';
                }
              } else {
                // Default: Step 2 Verifikasi Administrasi Berkas sedang berjalan
                // Step 1: Formulir & berkas sudah diisi & diunggah oleh pemohon -> SELESAI
                if (stepNum === 1) {
                  isCompleted = true;
                  stepBadgeText = 'Selesai';
                  stepDateText = submission.tanggalPengajuan;
                } else if (stepNum === 2) {
                  isInProgress = true;
                  stepBadgeText = 'Sedang Berjalan';
                  stepDateText = 'Pemeriksaan Berkas';
                } else {
                  stepBadgeText = 'Menunggu';
                }
              }
            }

            return (
              <div
                key={step.stepNumber}
                className={`p-5 rounded-2xl border relative transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : isRejected
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700'
                    : isInProgress
                    ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400/20'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isRejected
                        ? 'bg-rose-600 text-white'
                        : isInProgress
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isRejected ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : isRejected
                        ? 'bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                        : isInProgress
                        ? 'bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stepBadgeText}
                  </span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {step.description}
                </p>
                {stepDateText && (
                  <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{stepDateText}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Verifier Note Callout */}
        <div className="p-5 rounded-2xl bg-blue-50 dark:bg-slate-800/90 border border-blue-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Catatan Petugas Verifikator Kesbangpol:
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {submission.catatan && submission.catatan.trim()
                  ? `"${submission.catatan}"`
                  : submission.status === 'Disetujui'
                  ? `"Selamat! Seluruh tahapan verifikasi telah disetujui. Surat Keterangan Terdaftar (SKT) resmi diterbitkan oleh Badan Kesbangpol Kabupaten Mimika."`
                  : submission.stepNumber === 3
                  ? `"Dokumen administrasi dinyatakan lengkap & valid. Tim Verifikasi Kesbangpol dijadwalkan meninjau lokasi kantor sekretariat ${submission.namaOrmas}."`
                  : submission.status === 'Ditolak'
                  ? `"Pengajuan permohonan SKT belum memenuhi persyaratan legalitas. Silakan hubungi verifikator atau lengkapi berkas."`
                  : hasSubmission
                  ? `"Pengajuan online diterima pada ${submission.tanggalPengajuan}. Berkas administrasi sedang dalam antrean pemeriksaan oleh verifikator Subbid Ormas."`
                  : `"Silakan lengkapi formulir pendaftaran dan unggah seluruh dokumen persyaratan untuk memulai proses verifikasi SKT."`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Petugas:{' '}
                <strong>{submission.petugasVerifikator || 'Yance Murib, S.STP (Subbid Ormas)'}</strong>
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6281240998877"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors shrink-0 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Hubungi Verifikator
          </a>
        </div>
      </div>

      {/* Modal Tanda Terima Pendaftaran SKT */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold">Tanda Terima &amp; Bukti Pengajuan SKT</h3>
                  <p className="text-xs text-slate-500">Badan Kesatuan Bangsa dan Politik Kabupaten Mimika</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Content / Printable Area */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-950/40 space-y-6">
                {/* Header Kop Surat */}
                <div className="flex items-center gap-4 border-b-2 border-slate-300 dark:border-slate-700 pb-4">
                  <Image
                    src="/assets/pic/logo_kabupatenmimika_removebg.png"
                    alt="Lambang Mimika"
                    width={56}
                    height={56}
                    className="h-14 w-auto object-contain shrink-0"
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Pemerintah Kabupaten Mimika
                    </p>
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
                      Badan Kesatuan Bangsa dan Politik
                    </h2>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Pusat Pemerintahan Kab. Mimika SP3 Kuala Kencana - Timika, Papua Tengah 99910
                    </p>
                  </div>
                </div>

                <div className="text-center py-1">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Tanda Terima Pendaftaran SKT Ormas
                  </h1>
                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400 mt-0.5">
                    Nomor Registrasi: {submission.nomorTiket || 'TIKET/SKT/2026/001'}
                  </p>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Nama Organisasi</span>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {submission.namaOrmas || 'Organisasi Kemasyarakatan'}
                    </p>
                    {submission.singkatan && <p className="text-[11px] text-slate-500">Singkatan: {submission.singkatan}</p>}
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Jenis Ormas &amp; Layanan</span>
                    <p className="font-bold text-slate-900 dark:text-white">{submission.jenisOrmas}</p>
                    <p className="text-[11px] text-slate-500">Pendaftaran Baru / Mandiri</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Tanggal Pengajuan</span>
                    <p className="font-bold text-slate-900 dark:text-white">{submission.tanggalPengajuan}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Tercatat di Sistem SI-ORMAS</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Status &amp; Tahap Verifikasi</span>
                    <p className="font-bold text-purple-600 dark:text-purple-400">{submission.status}</p>
                    <p className="text-[11px] text-slate-500">
                      Tahap {submission.stepNumber || 1} dari 4 Alur Pelayanan SKT
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Kelengkapan Berkas</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {submission.totalDokumen >= 8 ? '8 / 8 Berkas Lengkap' : `${submission.totalDokumen} Dokumen Terlampir`}
                    </p>
                    <p className="text-[11px] text-slate-500">Akta, AD/ART, Domisili, NPWP &amp; SK</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Estimasi Terbit SKT</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400">{submission.estimasiTerbit}</p>
                    <p className="text-[11px] text-slate-500">{submission.estimasiHariLagi} (SOP 5-7 Hari Kerja)</p>
                  </div>
                </div>

                {/* Stempel & Petugas Box */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[11px] text-slate-500">Petugas Penerima / Verifikator:</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {submission.petugasVerifikator || 'Yance Murib, S.STP'}
                    </p>
                    <p className="text-[10px] text-slate-400">Subbid Ormas Bakesbangpol Mimika</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase px-3 py-1.5 rounded-lg tracking-widest rotate-[-2deg]">
                      TERDAFTAR RESMI ONLINE
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">{submission.nomorTiket}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak / Unduh Bukti PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Pengajuan Baru */}
      <OrmasSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
