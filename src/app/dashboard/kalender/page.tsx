'use client';

import React, { useState, useMemo } from 'react';
import {
  ORMAS_CALENDAR_DATA,
  OrmasCalendarItem,
  calculateExpiryStatus,
  ExpiryStatus,
} from '@/data/ormas-calendar-data';
import { createNotification } from '@/services/notificationService';

export default function KalenderPage() {
  // Current view date (Default: September 2026 as per local system context)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpiryStatus>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'mulai' | 'kadaluarsa'>('all');
  const [selectedOrmas, setSelectedOrmas] = useState<OrmasCalendarItem | null>(null);
  const [notificationSentOrmas, setNotificationSentOrmas] = useState<string | null>(null);

  // Month & Year calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Adjust so Monday is 0, Sunday is 6
  const startingDayIndex = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 1));
    setSelectedDay(9); // 9 September 2026
  };

  // Find all events mapped by day in current month
  const eventsInCurrentMonth = useMemo(() => {
    const map: { [day: number]: { mulai: OrmasCalendarItem[]; kadaluarsa: OrmasCalendarItem[] } } = {};

    ORMAS_CALENDAR_DATA.forEach((item) => {
      // Check start date
      const start = new Date(item.tanggalMulai);
      if (start.getFullYear() === year && start.getMonth() === month) {
        const day = start.getDate();
        if (!map[day]) map[day] = { mulai: [], kadaluarsa: [] };
        map[day].mulai.push(item);
      }

      // Check expiry date
      const expiry = new Date(item.tanggalKadaluarsa);
      if (expiry.getFullYear() === year && expiry.getMonth() === month) {
        const day = expiry.getDate();
        if (!map[day]) map[day] = { mulai: [], kadaluarsa: [] };
        map[day].kadaluarsa.push(item);
      }
    });

    return map;
  }, [year, month]);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    let aktif = 0;
    let segeraBerakhir = 0;
    let kadaluarsa = 0;

    ORMAS_CALENDAR_DATA.forEach((item) => {
      const calc = calculateExpiryStatus(item.tanggalKadaluarsa);
      if (calc.status === 'aktif') aktif++;
      else if (calc.status === 'segera_berakhir') segeraBerakhir++;
      else if (calc.status === 'kadaluarsa') kadaluarsa++;
    });

    return {
      total: ORMAS_CALENDAR_DATA.length,
      aktif,
      segeraBerakhir,
      kadaluarsa,
    };
  }, []);

  // Filtered list for the detection table
  const filteredOrmas = useMemo(() => {
    return ORMAS_CALENDAR_DATA.filter((item) => {
      const calc = calculateExpiryStatus(item.tanggalKadaluarsa);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.namaOrmas.toLowerCase().includes(q) ||
        (item.singkatan && item.singkatan.toLowerCase().includes(q)) ||
        item.nomorSk.toLowerCase().includes(q) ||
        item.ketuaUmum.toLowerCase().includes(q) ||
        item.distrik.toLowerCase().includes(q);

      // Status match
      const matchStatus = statusFilter === 'all' || calc.status === statusFilter;

      // Event type match
      let matchEventType = true;
      if (eventTypeFilter === 'mulai') {
        const start = new Date(item.tanggalMulai);
        matchEventType = start.getFullYear() === year && start.getMonth() === month;
      } else if (eventTypeFilter === 'kadaluarsa') {
        const expiry = new Date(item.tanggalKadaluarsa);
        matchEventType = expiry.getFullYear() === year && expiry.getMonth() === month;
      }

      // Selected day filter
      let matchDay = true;
      if (selectedDay !== null) {
        const start = new Date(item.tanggalMulai);
        const expiry = new Date(item.tanggalKadaluarsa);
        const isStartDay = start.getFullYear() === year && start.getMonth() === month && start.getDate() === selectedDay;
        const isExpiryDay = expiry.getFullYear() === year && expiry.getMonth() === month && expiry.getDate() === selectedDay;
        matchDay = isStartDay || isExpiryDay;
      }

      return matchSearch && matchStatus && matchEventType && matchDay;
    });
  }, [searchQuery, statusFilter, eventTypeFilter, selectedDay, year, month]);

  const handleSendReminder = (ormas: OrmasCalendarItem) => {
    setNotificationSentOrmas(ormas.namaOrmas);

    // Buat notifikasi sistem resmi ke pihak Ormas terkait
    createNotification({
      title: `Pemberitahuan Jatuh Tempo SKT: ${ormas.namaOrmas}`,
      message: `Masa berlaku Surat Keterangan Terdaftar (SKT) organisasi Anda berakhir pada ${ormas.tanggalKadaluarsa}. Mohon segera mengajukan perpanjangan berkas ke Badan Kesbangpol Mimika.`,
      type: 'warning',
      category: 'skt',
      sender: 'Bakesbangpol Kabupaten Mimika',
      recipientRole: 'ormas',
      targetOrmas: ormas.namaOrmas,
      link: '/dashboard-ormas/pengajuan',
    });

    setTimeout(() => {
      setNotificationSentOrmas(null);
    }, 4000);
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Sistem Deteksi Masa Berlaku
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kalender &amp; Pemantauan Kadaluarsa Ormas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mendeteksi tanggal mulai terbit SKT dan otomatis memantau tanggal kadaluarsa ormas di Kabupaten Mimika.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak Jadwal</span>
          </button>
        </div>
      </div>

      {/* Alert Notifikasi Berhasil */}
      {notificationSentOrmas && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold">Surat Peringatan Perpanjangan Terkirim!</p>
              <p className="text-[11px] text-emerald-700">
                Pemberitahuan resmi jatuh tempo SKT telah dikirim ke alamat email resmi <strong>{notificationSentOrmas}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationSentOrmas(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Terpantau */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Terpantau</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{metrics.total}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Organisasi dalam basis data</p>
          </div>
        </div>

        {/* Masih Aktif */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'aktif' ? 'all' : 'aktif')}
          className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'aktif' ? 'ring-2 ring-emerald-500 border-emerald-400' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Masih Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{metrics.aktif}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Masa berlaku &gt; 90 hari</p>
          </div>
        </div>

        {/* Segera Berakhir */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'segera_berakhir' ? 'all' : 'segera_berakhir')}
          className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'segera_berakhir' ? 'ring-2 ring-amber-500 border-amber-400' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Segera Berakhir</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200/60 dark:border-amber-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{metrics.segeraBerakhir}</div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Jatuh tempo dlm ≤ 90 hari</p>
          </div>
        </div>

        {/* Sudah Kadaluarsa */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'kadaluarsa' ? 'all' : 'kadaluarsa')}
          className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'kadaluarsa' ? 'ring-2 ring-rose-500 border-rose-400' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Sudah Kadaluarsa</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center border border-rose-200/60 dark:border-rose-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">{metrics.kadaluarsa}</div>
            <p className="text-xs text-rose-600 dark:text-rose-500 mt-0.5">Wajib perpanjangan SKT</p>
          </div>
        </div>
      </div>

      {/* Main Calendar View Section */}
      {/* Main Calendar View Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 space-y-5 transition-colors">
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
            >
              Bulan Sekarang
            </button>
            {selectedDay !== null && (
              <button
                onClick={() => setSelectedDay(null)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hapus Filter ({selectedDay} {monthNames[month]}) ✕
              </button>
            )}
          </div>

          {/* Month Stepper Buttons & Legend */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Tanggal Mulai
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Tanggal Kadaluarsa
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Bulan Sebelumnya"
                aria-label="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Bulan Berikutnya"
                aria-label="Next Month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty spacer cells before month starts */}
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[70px] sm:min-h-[90px] rounded-lg bg-slate-50/40 dark:bg-slate-800/20 border border-transparent"></div>
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dayEvents = eventsInCurrentMonth[dayNum];
            const hasMulai = dayEvents && dayEvents.mulai.length > 0;
            const hasKadaluarsa = dayEvents && dayEvents.kadaluarsa.length > 0;
            const isToday = year === 2026 && month === 8 && dayNum === 9;
            const isSelected = selectedDay === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600'
                    : isToday
                    ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold rounded-md w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline-block text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 rounded">
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* Event Tags inside Day Cell */}
                <div className="space-y-1 mt-1">
                  {hasMulai && (
                    <div
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 truncate flex items-center gap-1"
                      title={`${dayEvents.mulai.length} Ormas Terbit SKT`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span className="truncate">
                        {dayEvents.mulai[0].singkatan || dayEvents.mulai[0].namaOrmas}
                      </span>
                    </div>
                  )}

                  {hasKadaluarsa && (
                    <div
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 truncate flex items-center gap-1"
                      title={`${dayEvents.kadaluarsa.length} Ormas Jatuh Tempo/Kadaluarsa`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                      <span className="truncate">
                        {dayEvents.kadaluarsa[0].singkatan || dayEvents.kadaluarsa[0].namaOrmas}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Detection Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tabel Deteksi Tanggal Mulai &amp; Kadaluarsa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedDay !== null
                ? `Menampilkan agenda khusus pada tanggal ${selectedDay} ${monthNames[month]} ${year}`
                : `Daftar seluruh ormas dengan status masa berlaku terhitung`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total <strong className="text-slate-800 dark:text-slate-200">{filteredOrmas.length}</strong> ormas ditemukan
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ormas, nomor SKT, atau ketua..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">Semua Status Masa Berlaku</option>
              <option value="aktif">Masih Aktif (&gt; 90 Hari)</option>
              <option value="segera_berakhir">Segera Berakhir (≤ 90 Hari)</option>
              <option value="kadaluarsa">Sudah Kadaluarsa</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">Semua Tanggal</option>
              <option value="mulai">Tanggal Mulai Bulan Ini</option>
              <option value="kadaluarsa">Tanggal Kadaluarsa Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Organisasi &amp; SKT</th>
                <th className="py-3 px-4">Tanggal Mulai (Terbit)</th>
                <th className="py-3 px-4">Tanggal Kadaluarsa</th>
                <th className="py-3 px-4">Perhitungan Sisa Waktu</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrmas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">Tidak ada ormas yang sesuai dengan filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba ubah tanggal atau bersihkan kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredOrmas.map((item, idx) => {
                  const calc = calculateExpiryStatus(item.tanggalKadaluarsa);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrmas(item)}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">
                          {item.namaOrmas}
                        </div>
                        {item.singkatan && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/60">
                            {item.singkatan}
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {item.nomorSk}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          {new Date(item.tanggalMulai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              calc.status === 'kadaluarsa'
                                ? 'bg-rose-600'
                                : calc.status === 'segera_berakhir'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                          ></span>
                          {new Date(item.tanggalKadaluarsa).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            calc.status === 'kadaluarsa'
                              ? 'text-rose-600 dark:text-rose-400'
                              : calc.status === 'segera_berakhir'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {calc.message}
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Masa berlaku {item.masaBerlakuTahun} tahun
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {calc.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Masih Aktif
                          </span>
                        ) : calc.status === 'segera_berakhir' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Segera Berakhir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Kadaluarsa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrmas(item);
                            }}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            Detail
                          </button>
                          {(calc.status === 'segera_berakhir' || calc.status === 'kadaluarsa') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminder(item);
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 transition-colors"
                              title="Kirim surat pengingat perpanjangan ke pengurus"
                            >
                              Kirim Peringatan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal Dialog */}
      {selectedOrmas && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 md:p-6 overflow-y-auto modal-backdrop"
          onClick={() => setSelectedOrmas(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col overflow-hidden modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrmas(null)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs z-10 shrink-0"
            >
              ✕
            </button>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 pr-0.5 sm:pr-1 space-y-4">
              {/* Header Modal */}
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                    {selectedOrmas.jenisOrmas}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{selectedOrmas.id}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedOrmas.namaOrmas}
                </h3>
                {selectedOrmas.singkatan && (
                  <p className="text-xs font-semibold text-blue-800 mt-0.5">
                    ({selectedOrmas.singkatan})
                  </p>
                )}
              </div>

              {/* Status Expiry Box */}
              {(() => {
                const calc = calculateExpiryStatus(selectedOrmas.tanggalKadaluarsa);
                return (
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      calc.status === 'kadaluarsa'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : calc.status === 'segera_berakhir'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest block">
                        Status Masa Berlaku
                      </span>
                      <p className="text-xs sm:text-sm font-black mt-0.5">{calc.statusLabel}</p>
                      <p className="text-[11px] sm:text-xs font-medium mt-0.5">{calc.message}</p>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 pt-1.5 sm:pt-0 border-current/10">
                      <span className="text-[10px] sm:text-xs font-bold block">Durasi</span>
                      <span className="text-xs font-mono">{selectedOrmas.masaBerlakuTahun} Tahun</span>
                    </div>
                  </div>
                );
              })()}

              {/* Metadata Detail */}
              <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Nomor SKT:</span>
                  <span className="sm:col-span-2 font-mono font-bold text-slate-900 break-all">{selectedOrmas.nomorSk}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Tanggal Mulai Terbit:</span>
                  <span className="sm:col-span-2 font-medium text-slate-900">
                    {new Date(selectedOrmas.tanggalMulai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Tanggal Kadaluarsa:</span>
                  <span className="sm:col-span-2 font-medium text-slate-900">
                    {new Date(selectedOrmas.tanggalKadaluarsa).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Ketua Umum:</span>
                  <span className="sm:col-span-2 font-bold text-slate-900">{selectedOrmas.ketuaUmum}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Wilayah Distrik:</span>
                  <span className="sm:col-span-2 text-slate-800">Distrik {selectedOrmas.distrik}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">Alamat Sekretariat:</span>
                  <span className="sm:col-span-2 text-slate-800 leading-relaxed">{selectedOrmas.alamat}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 py-1">
                  <span className="font-bold text-slate-500">Kontak Resmi:</span>
                  <span className="sm:col-span-2 text-slate-800 break-words">{selectedOrmas.telepon} • {selectedOrmas.email}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0 mt-3">
              <button
                onClick={() => setSelectedOrmas(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleSendReminder(selectedOrmas);
                  setSelectedOrmas(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs text-center"
              >
                Kirim Notifikasi Perpanjangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
