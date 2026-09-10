'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ORMAS_CALENDAR_DATA,
  calculateExpiryStatus,
} from '@/data/ormas-calendar-data';

export default function OrmasKalenderPage() {
  // Selected ormas for calendar view
  const [selectedOrmasId, setSelectedOrmasId] = useState<string>('ORM-001');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const activeOrmas = useMemo(() => {
    return ORMAS_CALENDAR_DATA.find((o) => o.id === selectedOrmasId) || ORMAS_CALENDAR_DATA[0] || null;
  }, [selectedOrmasId]);

  const expiryCalc = useMemo(() => {
    if (!activeOrmas?.tanggalKadaluarsa) return null;
    return calculateExpiryStatus(activeOrmas.tanggalKadaluarsa);
  }, [activeOrmas]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDayIndex = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (!activeOrmas || !expiryCalc) {
    return (
      <div className="space-y-6 pb-12">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Organisasi Terdaftar</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Kalender masa berlaku SKT akan otomatis aktif setelah organisasi Anda diverifikasi dan diterbitkan SKT oleh Kesbangpol.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard-ormas"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-500 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(activeOrmas.tanggalMulai);
  const expiryDate = new Date(activeOrmas.tanggalKadaluarsa);

  const isStartMonth = startDate.getFullYear() === year && startDate.getMonth() === month;
  const isExpiryMonth = expiryDate.getFullYear() === year && expiryDate.getMonth() === month;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Portal Legalitas Ormas
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kalender Masa Berlaku SKT Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pemantauan tanggal mulai terbit dan perhitungan mundur jatuh tempo perpanjangan izin SKT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetailModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Lihat Detail
          </button>
          <Link
            href="/dashboard-ormas/organisasi"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-xs"
          >
            Kelola Berkas Organisasi
          </Link>
        </div>
      </div>

      {/* Main Status & Countdown Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                {activeOrmas.nomorSk}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {activeOrmas.namaOrmas} {activeOrmas.singkatan && `(${activeOrmas.singkatan})`}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Ketua Umum: <strong className="text-white">{activeOrmas.ketuaUmum}</strong> • Wilayah: Distrik {activeOrmas.distrik}
              </p>
            </div>

            {/* Status Pill Badge */}
            <div className="self-start md:self-auto">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                  expiryCalc.status === 'kadaluarsa'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : expiryCalc.status === 'segera_berakhir'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    expiryCalc.status === 'kadaluarsa'
                      ? 'bg-rose-400'
                      : expiryCalc.status === 'segera_berakhir'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                ></span>
                {expiryCalc.statusLabel}
              </span>
            </div>
          </div>

          {/* Key Dates Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 text-[11px] font-semibold block">Tanggal Mulai Terbit</span>
              <p className="text-base font-bold text-white mt-1">
                {new Date(activeOrmas.tanggalMulai).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <span className="text-[10px] text-blue-300 mt-0.5 block">Resmi Dicatat Bakesbangpol</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 text-[11px] font-semibold block">Tanggal Kadaluarsa / Berakhir</span>
              <p className="text-base font-bold text-amber-300 mt-1">
                {new Date(activeOrmas.tanggalKadaluarsa).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <span className="text-[10px] text-slate-300 mt-0.5 block">Batas Akhir Legalitas SKT</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-slate-400 text-[11px] font-semibold block">Kalkulasi Sisa Waktu</span>
              <p className="text-base font-bold text-white mt-1">
                {expiryCalc.message}
              </p>
              <span className="text-[10px] text-slate-300 mt-0.5 block">Masa Berlaku {activeOrmas.masaBerlakuTahun} Tahun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kalender bulanan pemantauan agenda dan jatuh tempo SKT
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Bulan Lalu"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 8, 1))}
              className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Bulan Depan"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] rounded-xl bg-slate-50/50"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = year === 2026 && month === 8 && dayNum === 9;
            const isStartDay = isStartMonth && startDate.getDate() === dayNum;
            const isExpiryDay = isExpiryMonth && expiryDate.getDate() === dayNum;

            return (
              <div
                key={dayNum}
                className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isExpiryDay
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                    : isStartDay
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                    : isToday
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                      isToday
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : isExpiryDay
                        ? 'bg-rose-600 text-white font-black'
                        : isStartDay
                        ? 'bg-blue-900 text-white font-black'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                      Hari Ini
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  {isStartDay && (
                    <span className="block text-[10px] font-bold text-blue-900 bg-blue-100 px-1 py-0.5 rounded truncate">
                      Mulai Terbit SKT
                    </span>
                  )}
                  {isExpiryDay && (
                    <span className="block text-[10px] font-bold text-rose-900 bg-rose-100 px-1 py-0.5 rounded truncate animate-pulse">
                      Jatuh Tempo SKT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Box for Renewal */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-950">Petunjuk Perpanjangan SKT Ormas</h3>
            <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
              Pengurus ormas disarankan mengajukan berkas perpanjangan paling lambat <strong>30 s/d 60 hari</strong> sebelum tanggal kadaluarsa berakhir agar status keabsahan organisasi tetap aktif.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard-ormas/panduan"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-xs"
        >
          Lihat Syarat Perpanjangan
        </Link>
      </div>

      {/* Ormas Detail Modal Dialog */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 overflow-y-auto modal-backdrop"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative my-auto modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
              aria-label="Tutup modal"
            >
              ✕
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-100">
                  {activeOrmas.jenisOrmas}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {activeOrmas.id}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {activeOrmas.namaOrmas}
              </h3>
              {activeOrmas.singkatan && (
                <p className="text-xs font-bold text-blue-800 mt-0.5">
                  Singkatan: ({activeOrmas.singkatan})
                </p>
              )}
            </div>

            {/* Status Expiry Box */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                expiryCalc.status === 'kadaluarsa'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : expiryCalc.status === 'segera_berakhir'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest block">
                  Status Masa Berlaku
                </span>
                <p className="text-sm font-black mt-0.5">{expiryCalc.statusLabel}</p>
                <p className="text-xs font-medium mt-0.5">{expiryCalc.message}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block">Durasi</span>
                <span className="text-xs font-mono">{activeOrmas.masaBerlakuTahun} Tahun</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2.5">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Nomor SKT:</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{activeOrmas.nomorSk}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Tanggal Mulai Terbit:</span>
                <span className="col-span-2 font-medium text-slate-900">
                  {new Date(activeOrmas.tanggalMulai).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Tanggal Kadaluarsa:</span>
                <span className="col-span-2 font-medium text-slate-900">
                  {new Date(activeOrmas.tanggalKadaluarsa).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Ketua Umum:</span>
                <span className="col-span-2 font-bold text-slate-900">{activeOrmas.ketuaUmum}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Wilayah Distrik:</span>
                <span className="col-span-2 text-slate-800">Distrik {activeOrmas.distrik}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-500">Alamat Sekretariat:</span>
                <span className="col-span-2 text-slate-800 leading-relaxed">{activeOrmas.alamat}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="font-bold text-slate-500">Kontak Resmi:</span>
                <span className="col-span-2 text-slate-800">{activeOrmas.telepon} • {activeOrmas.email}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cetak Profil
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
