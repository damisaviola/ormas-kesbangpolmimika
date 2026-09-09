'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OrmasDashboardLoading from '@/app/dashboard-ormas/loading';
import OrmasSubmissionModal from '@/components/dashboard/OrmasSubmissionModal';
import {
  INITIAL_ORMAS_PROFILE,
  INITIAL_TIMELINE_STEPS,
} from '@/data/ormas-dashboard-data';

export default function OrmasBerandaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrintToast, setShowPrintToast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <OrmasDashboardLoading />;
  }

  return (
    <div className="space-y-6 w-full pb-8 font-sans">
      {/* Toast Notification */}
      {showPrintToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-semibold">Tanda Terima & Bukti Pengajuan siap dicetak / diunduh (PDF)</span>
        </div>
      )}

      {/* Top Welcome & Actions Header (Full Width & Spacious) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800 w-full">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-widest bg-sky-400/10 px-3 py-1 rounded-md border border-sky-400/20">
              Portal Pemohon Ormas Mimika
            </span>
            <span className="text-[11px] font-extrabold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20">
              {INITIAL_ORMAS_PROFILE.jenisOrmas}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {INITIAL_ORMAS_PROFILE.namaOrmas}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Pantau tahapan verifikasi berkas SKT, kelola dokumen legalitas, dan perbarui susunan kepengurusan organisasi Anda secara mandiri di Badan Kesbangpol Kabupaten Mimika.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
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

      {/* Metrics Cards Grid (Spacious Full Width) */}
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
            <div className="text-xl font-black text-slate-900 dark:text-white">Verifikasi Lapangan</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
              Tahap 3 dari 4 Proses SKT
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Peninjauan kantor sekretariat
          </p>
        </div>

        {/* Card 2: Kelengkapan Berkas */}
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
            <div className="text-xl font-black text-slate-900 dark:text-white">8 / 8 Berkas Valid</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              100% Persyaratan Lengkap
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Akta, AD/ART, Domisili & NPWP
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
              TIKET/SKT/2026/019
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Tgl: 20 Agustus 2026
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Didaftarkan secara online
          </p>
        </div>

        {/* Card 4: Estimasi Terbit SKT */}
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
            <div className="text-xl font-black text-slate-900 dark:text-white">04 Sep 2026</div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              ± 5 Hari Kerja Lagi
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            SOP Pelayanan Kesbangpol
          </p>
        </div>
      </div>

      {/* Stepper Tracking Section (Alur Resmi Kesbangpol - Full Width) */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tahapan & Progres Verifikasi Pengajuan SKT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Alur resmi pengurusan Surat Keterangan Terdaftar Ormas di Badan Kesbangpol Kabupaten Mimika
            </p>
          </div>
          <button
            onClick={() => {
              setShowPrintToast(true);
              setTimeout(() => setShowPrintToast(false), 3000);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 self-start sm:self-auto shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Tanda Terima
          </button>
        </div>

        {/* Horizontal Timeline Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {INITIAL_TIMELINE_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className={`p-5 rounded-2xl border relative transition-all ${
                step.status === 'completed'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : step.status === 'in_progress'
                  ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400/20'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    step.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : step.status === 'in_progress'
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.stepNumber
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    step.status === 'completed'
                      ? 'bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : step.status === 'in_progress'
                      ? 'bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step.status === 'completed'
                    ? 'Selesai'
                    : step.status === 'in_progress'
                    ? 'Sedang Berjalan'
                    : 'Menunggu'}
                </span>
              </div>

              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                {step.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {step.description}
              </p>
              {step.date && (
                <div className="mt-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{step.date}</span>
                </div>
              )}
            </div>
          ))}
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
                "Dokumen administrasi lengkap & valid. Tim Verifikasi Kesbangpol dijadwalkan meninjau lokasi kantor sekretariat pada hari Rabu, 02 September 2026."
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Petugas: <strong>Yance Murib, S.STP (Subbid Ormas)</strong>
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
            Konfirmasi Lokasi Peninjauan
          </a>
        </div>
      </div>

      {/* Modal Buat Pengajuan Baru */}
      <OrmasSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
