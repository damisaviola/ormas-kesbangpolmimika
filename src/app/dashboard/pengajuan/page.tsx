'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TableBadge from '@/components/dashboard/TableBadge';
import PengajuanLoading from '@/app/dashboard/pengajuan/loading';
import { OrmasSubmission } from '@/types/dashboard';
import {
  getSubmissions,
  syncSubmissionsFromApi,
  subscribeToSubmissions,
} from '@/services/submissionStorage';
import { exportToCsv, printReportPdf } from '@/utils/exportUtils';

export default function PengajuanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>(() => getSubmissions());

  // Filter & Search states
  const [selectedStatus, setSelectedStatusRaw] = useState<string>('all');
  const [selectedJenis, setSelectedJenisRaw] = useState<string>('all');
  const [searchTerm, setSearchTermRaw] = useState('');
  const [sortBy, setSortByRaw] = useState<'terbaru' | 'terlama' | 'nama-asc' | 'nama-desc'>('terbaru');

  // UI state: 'card' (Grid Kartu) atau 'table' (Tabel)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showGuide, setShowGuide] = useState(true);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageRaw] = useState(8);

  const setSelectedStatus = (val: string) => {
    setSelectedStatusRaw(val);
    setCurrentPage(1);
  };

  const setSelectedJenis = (val: string) => {
    setSelectedJenisRaw(val);
    setCurrentPage(1);
  };

  const setSearchTerm = (val: string) => {
    setSearchTermRaw(val);
    setCurrentPage(1);
  };

  const setSortBy = (val: 'terbaru' | 'terlama' | 'nama-asc' | 'nama-desc') => {
    setSortByRaw(val);
    setCurrentPage(1);
  };

  const setItemsPerPage = (val: number) => {
    setItemsPerPageRaw(val);
    setCurrentPage(1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    showToast(`Nomor Tiket ${ticket} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedTicket(null), 2500);
  };

  // Muat data awal dan sinkronkan dengan database
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsRefreshing(true);
    try {
      const cached = getSubmissions();
      if (cached && cached.length > 0) {
        setSubmissions(cached);
      }
      const fresh = await syncSubmissionsFromApi();
      if (fresh && fresh.length > 0) {
        setSubmissions(fresh);
      }
    } catch (err) {
      console.warn('Gagal memuat pengajuan:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Selaraskan data fresh dari API database
    syncSubmissionsFromApi().then((fresh) => {
      if (isMounted && fresh && fresh.length > 0) {
        setSubmissions(fresh);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    const unsubscribe = subscribeToSubmissions((updatedList) => {
      if (isMounted) {
        setSubmissions(updatedList);
      }
    });

    // Fallback timer jika sinkronisasi cepat
    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Ekstraksi daftar jenis ormas unik untuk opsi filter
  const jenisList = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.jenisOrmas && s.jenisOrmas.trim()) {
        set.add(s.jenisOrmas.trim());
      }
    });
    return Array.from(set);
  }, [submissions]);

  // Hitung jumlah pengajuan per status (normalisasi lowercase)
  const counts = useMemo(() => {
    return {
      all: submissions.length,
      menunggu: submissions.filter((s) => {
        const st = (s.status || '').toLowerCase();
        return st === 'menunggu' || st === 'diajukan' || st === 'disiapkan';
      }).length,
      proses: submissions.filter((s) => {
        const st = (s.status || '').toLowerCase();
        return st === 'proses' || st === 'verifikasi lapangan' || st === 'lapangan';
      }).length,
      disetujui: submissions.filter((s) => {
        const st = (s.status || '').toLowerCase();
        return st === 'disetujui' || st === 'resmi' || st === 'selesai' || st === 'aktif';
      }).length,
      ditolak: submissions.filter((s) => {
        const st = (s.status || '').toLowerCase();
        return st === 'ditolak' || st === 'revisi' || st === 'perlu_revisi';
      }).length,
    };
  }, [submissions]);

  // Filter data sesuai kriteria pencarian dan filter aktif
  const filtered = useMemo(() => {
    return submissions.filter((item) => {
      const itemStatus = (item.status || '').toLowerCase();

      // Filter status
      let matchesStatus = true;
      if (selectedStatus === 'menunggu') {
        matchesStatus = itemStatus === 'menunggu' || itemStatus === 'diajukan' || itemStatus === 'disiapkan';
      } else if (selectedStatus === 'proses') {
        matchesStatus = itemStatus === 'proses' || itemStatus === 'verifikasi lapangan' || itemStatus === 'lapangan';
      } else if (selectedStatus === 'disetujui') {
        matchesStatus = itemStatus === 'disetujui' || itemStatus === 'resmi' || itemStatus === 'selesai' || itemStatus === 'aktif';
      } else if (selectedStatus === 'ditolak') {
        matchesStatus = itemStatus === 'ditolak' || itemStatus === 'revisi' || itemStatus === 'perlu_revisi';
      }

      // Filter jenis ormas
      let matchesJenis = true;
      if (selectedJenis !== 'all') {
        matchesJenis = (item.jenisOrmas || '').toLowerCase() === selectedJenis.toLowerCase();
      }

      // Pencarian kata kunci
      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        (item.namaOrmas && item.namaOrmas.toLowerCase().includes(searchLower)) ||
        (item.ketuaUmum && item.ketuaUmum.toLowerCase().includes(searchLower)) ||
        (item.id && item.id.toLowerCase().includes(searchLower)) ||
        (item.nomorRegistrasi && item.nomorRegistrasi.toLowerCase().includes(searchLower)) ||
        (item.alamat && item.alamat.toLowerCase().includes(searchLower)) ||
        (item.distrik && item.distrik.toLowerCase().includes(searchLower)) ||
        (item.pendaftar && item.pendaftar.toLowerCase().includes(searchLower)) ||
        (item.pendaftarEmail && item.pendaftarEmail.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.jenisOrmas && item.jenisOrmas.toLowerCase().includes(searchLower));

      return matchesStatus && matchesJenis && matchesSearch;
    });
  }, [submissions, selectedStatus, selectedJenis, searchTerm]);

  // Urutkan data yang sudah difilter
  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'terbaru':
        return list.reverse();
      case 'terlama':
        return list;
      case 'nama-asc':
        return list.sort((a, b) => (a.namaOrmas || '').localeCompare(b.namaOrmas || ''));
      case 'nama-desc':
        return list.sort((a, b) => (b.namaOrmas || '').localeCompare(a.namaOrmas || ''));
      default:
        return list;
    }
  }, [filtered, sortBy]);

  // Pagination perhitungan
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedJenis('all');
    setSearchTerm('');
    setSortBy('terbaru');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      'Nomor Registrasi / Tiket',
      'Nama Organisasi',
      'Singkatan',
      'Jenis/Bidang',
      'Ketua Umum',
      'Tanggal Pengajuan',
      'Status Verifikasi',
      'Distrik',
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
      item.distrik || 'Mimika Baru',
      item.alamat || '',
      item.telepon || '',
      item.pendaftarEmail || item.email || '',
    ]);

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToCsv(`Rekapitulasi_Pengajuan_Ormas_Mimika_${timestamp}`, headers, rows);
    showToast('Laporan data pengajuan berhasil diekspor ke file CSV/Excel');
  };

  const handlePrintPdf = () => {
    const headers = ['No. Tiket / ID', 'Nama Organisasi', 'Jenis / Bidang', 'Ketua Umum', 'Tgl Masuk', 'Status'];
    const rows = sorted.map((item) => [
      item.nomorRegistrasi || item.id,
      item.singkatan ? `${item.namaOrmas} (${item.singkatan})` : item.namaOrmas,
      item.jenisOrmas || 'Umum',
      item.ketuaUmum || '-',
      item.tanggalPengajuan || '-',
      item.status,
    ]);

    const statusDesc = selectedStatus === 'all' ? 'Semua Status' : `Status: ${selectedStatus.toUpperCase()}`;
    const searchNote = searchTerm ? `Pencarian: "${searchTerm}"` : '';
    const filterDesc = [statusDesc, searchNote].filter(Boolean).join(' | ');

    printReportPdf({
      title: 'LAPORAN REKAPITULASI PENGAJUAN SKT ORMAS',
      subtitle: 'Badan Kesatuan Bangsa dan Politik Kabupaten Mimika - Provinsi Papua Tengah',
      headers,
      rows,
      keteranganFilter: filterDesc,
    });
  };

  if (isLoading) {
    return <PengajuanLoading />;
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notifikasi Mengambang */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Utama yang Ramah & Jelas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Badan Kesbangpol Kab. Mimika
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Pusat Pelayanan SKT Ormas
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Daftar &amp; Verifikasi Pengajuan Ormas
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Kelola, periksa kelengkapan 8 dokumen legalitas, dan tetapkan status persetujuan permohonan SKT dari seluruh Organisasi Kemasyarakatan di Kabupaten Mimika.
            </p>
          </div>

          {/* Tombol Aksi Cepat di Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Perbarui dan sinkronkan data terbaru dari server"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isRefreshing ? 'Menyinkronkan...' : 'Muat Ulang'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              title="Unduh seluruh rekapitulasi data ke format Excel / CSV"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Ekspor Excel/CSV</span>
            </button>

            <button
              onClick={handlePrintPdf}
              title="Cetak rekapitulasi pengajuan resmi sebagai dokumen PDF"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all border border-blue-200 dark:border-blue-800 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak Rekap PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan Status Interaktif (Bisa Langsung Diklik untuk Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Semua Pengajuan */}
        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all border relative cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/40 dark:bg-blue-600 dark:border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedStatus === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            {selectedStatus === 'all' && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Dipilih
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none">{counts.all}</div>
          <div className={`text-xs font-bold mt-1.5 ${selectedStatus === 'all' ? 'text-slate-200 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            Semua Pengajuan
          </div>
          <p className={`text-[10px] mt-1 truncate ${selectedStatus === 'all' ? 'text-slate-300 dark:text-blue-100' : 'text-slate-400'}`}>
            Total keseluruhan berkas
          </p>
        </button>

        {/* 2. Menunggu Verifikasi (Highlight Penting) */}
        <button
          type="button"
          onClick={() => setSelectedStatus('menunggu')}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all border relative cursor-pointer ${
            selectedStatus === 'menunggu'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 dark:ring-blue-700'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-blue-200/90 dark:border-blue-900/40 hover:border-blue-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedStatus === 'menunggu'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            {counts.menunggu > 0 && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                selectedStatus === 'menunggu' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
              }`}>
                Perlu Ditinjau
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none">{counts.menunggu}</div>
          <div className={`text-xs font-bold mt-1.5 ${selectedStatus === 'menunggu' ? 'text-white' : 'text-blue-700 dark:text-blue-300'}`}>
            Menunggu Verifikasi
          </div>
          <p className={`text-[10px] mt-1 truncate ${selectedStatus === 'menunggu' ? 'text-blue-100' : 'text-slate-400'}`}>
            Prioritas pemeriksaan berkas
          </p>
        </button>

        {/* 3. Sedang Diproses */}
        <button
          type="button"
          onClick={() => setSelectedStatus('proses')}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all border relative cursor-pointer ${
            selectedStatus === 'proses'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 dark:ring-amber-700'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-amber-200/90 dark:border-amber-900/40 hover:border-amber-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedStatus === 'proses'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
            {selectedStatus === 'proses' && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Dipilih
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none">{counts.proses}</div>
          <div className={`text-xs font-bold mt-1.5 ${selectedStatus === 'proses' ? 'text-white' : 'text-amber-700 dark:text-amber-300'}`}>
            Sedang Diproses
          </div>
          <p className={`text-[10px] mt-1 truncate ${selectedStatus === 'proses' ? 'text-amber-100' : 'text-slate-400'}`}>
            Verifikasi administrasi/lapangan
          </p>
        </button>

        {/* 4. Disetujui / SKT Terbit */}
        <button
          type="button"
          onClick={() => setSelectedStatus('disetujui')}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all border relative cursor-pointer ${
            selectedStatus === 'disetujui'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 dark:ring-emerald-700'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedStatus === 'disetujui'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {selectedStatus === 'disetujui' && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Dipilih
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none">{counts.disetujui}</div>
          <div className={`text-xs font-bold mt-1.5 ${selectedStatus === 'disetujui' ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'}`}>
            Disetujui / SKT Terbit
          </div>
          <p className={`text-[10px] mt-1 truncate ${selectedStatus === 'disetujui' ? 'text-emerald-100' : 'text-slate-400'}`}>
            SKT resmi telah diterbitkan
          </p>
        </button>

        {/* 5. Perlu Perbaikan / Ditolak */}
        <button
          type="button"
          onClick={() => setSelectedStatus('ditolak')}
          className={`col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl text-left transition-all border relative cursor-pointer ${
            selectedStatus === 'ditolak'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300 dark:ring-rose-700'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-rose-200/90 dark:border-rose-900/40 hover:border-rose-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedStatus === 'ditolak'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            {selectedStatus === 'ditolak' && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Dipilih
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none">{counts.ditolak}</div>
          <div className={`text-xs font-bold mt-1.5 ${selectedStatus === 'ditolak' ? 'text-white' : 'text-rose-700 dark:text-rose-300'}`}>
            Perlu Revisi / Ditolak
          </div>
          <p className={`text-[10px] mt-1 truncate ${selectedStatus === 'ditolak' ? 'text-rose-100' : 'text-slate-400'}`}>
            Berkas kurang / ditolak
          </p>
        </button>
      </div>

      {/* Petunjuk Alur Verifikasi Ringkas (Bisa di-expand/collapse) */}
      {showGuide && (
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200 transition-colors shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                💡
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-sky-950 dark:text-white">
                  Panduan Alur Verifikasi untuk Petugas &amp; Tim Kesbangpol
                </h3>
                <p className="text-[11px] sm:text-xs text-sky-800/90 dark:text-sky-300/90 leading-relaxed">
                  Ikuti 4 langkah mudah: <strong>1.</strong> Pilih status <em className="font-semibold">Menunggu Verifikasi</em> di atas &rarr; <strong>2.</strong> Klik tombol <em className="font-semibold">Tinjau Berkas</em> pada ormas &rarr; <strong>3.</strong> Periksa kelengkapan 8 dokumen persyaratan &rarr; <strong>4.</strong> Tentukan status verifikasi (Disetujui, Verifikasi Lapangan, atau Revisi Berkas).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-sky-600 hover:text-sky-800 dark:text-sky-400 text-xs font-bold shrink-0 p-1"
              title="Tutup panduan"
            >
              &times; Tutup
            </button>
          </div>
        </div>
      )}

      {/* Bilah Kontrol: Pencarian, Filter Kategori, Pengurutan, dan Pilihan Tampilan (Kartu/Tabel) */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Input Pencarian Cerdas dengan Tombol Hapus */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama Ormas, nomor tiket, ketua umum, distrik, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base"
                title="Hapus pencarian"
              >
                &times;
              </button>
            )}
          </div>

          {/* Grup Filter & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Jenis Ormas */}
            <div className="relative">
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Semua Jenis / Bidang</option>
                {jenisList.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Pengurutan */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'terbaru' | 'terlama' | 'nama-asc' | 'nama-desc')}
                className="text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="terbaru">Terbaru Masuk</option>
                <option value="terlama">Terlama Masuk</option>
                <option value="nama-asc">Nama Ormas (A - Z)</option>
                <option value="nama-desc">Nama Ormas (Z - A)</option>
              </select>
            </div>

            {/* Switch Mode: Kartu vs Tabel */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Tampilkan dalam bentuk Kartu (Sangat ramah sentuhan & tablet)"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Kartu</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Tampilkan dalam bentuk Tabel Spreadsheet"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Tabel</span>
              </button>
            </div>

            {/* Tombol Reset Filter jika ada filter aktif */}
            {(selectedStatus !== 'all' || selectedJenis !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Baris Informasi Hasil Pencarian */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div>
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{paginatedItems.length}</strong> dari{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> pengajuan yang sesuai
            {selectedStatus !== 'all' && (
              <span className="ml-1">
                (Kategori status: <strong className="uppercase">{selectedStatus}</strong>)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Konten Utama: MODE KARTU ATAU MODE TABEL */}
      {paginatedItems.length > 0 ? (
        viewMode === 'card' ? (
          /* ========================================================== */
          /* 1. TAMPILAN MODE KARTU (User Friendly, Ramah untuk Semua) */
          /* ========================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {paginatedItems.map((item) => {
              const ticket = item.nomorRegistrasi || item.id;
              const isNewlySubmitted =
                item.isCustomSubmission || item.nomorRegistrasi?.startsWith('TIKET/');
              const isCopy = copiedTicket === ticket;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 group relative"
                >
                  {/* Top Card: Status Badge & Jenis Ormas */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <TableBadge status={item.status} />

                      {isNewlySubmitted && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800 shrink-0">
                          Baru Masuk
                        </span>
                      )}
                    </div>

                    {/* Nama Organisasi */}
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                        {item.namaOrmas}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.singkatan && (
                          <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold">
                            {item.singkatan}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-300">{item.jenisOrmas}</span>
                      </div>
                    </div>

                    {/* Nomor Tiket dengan Tombol Salin */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          No. Registrasi / Tiket
                        </span>
                        <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-xs">
                          {ticket}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyTicket(ticket)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-sky-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title="Salin nomor tiket ini"
                      >
                        {isCopy ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Disalin!</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Informasi Rincian Pemohon */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {/* Pendaftar / Ketua Umum */}
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 block font-medium">Ketua / Pendaftar:</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {item.ketuaUmum || item.pendaftar || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Alamat & Distrik */}
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400 block font-medium">Lokasi Sekretariat:</span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-1">
                            {item.distrik ? `Distrik ${item.distrik}` : item.alamat || 'Kabupaten Mimika'}
                          </span>
                        </div>
                      </div>

                      {/* Tanggal Masuk */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Masuk: <strong>{item.tanggalPengajuan || '-'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Utama yang Sangat Jelas & Ramah */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/dashboard/pengajuan/${item.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-xs hover:shadow group-hover:bg-blue-600"
                    >
                      <span>Tinjau &amp; Verifikasi Berkas</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================== */
          /* 2. TAMPILAN MODE TABEL (Rapi, Bersih, Format Spreadsheet) */
          /* ========================================================== */
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
                  <tr>
                    <th className="py-4 px-4 sm:px-6 w-12 text-center">No</th>
                    <th className="py-4 px-4">Nama Organisasi &amp; Bidang</th>
                    <th className="py-4 px-4">No. Registrasi / Tiket</th>
                    <th className="py-4 px-4">Ketua Umum &amp; Kontak</th>
                    <th className="py-4 px-4">Lokasi &amp; Distrik</th>
                    <th className="py-4 px-4">Status Pengajuan</th>
                    <th className="py-4 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedItems.map((item, idx) => {
                    const ticket = item.nomorRegistrasi || item.id;
                    const isNewlySubmitted =
                      item.isCustomSubmission || item.nomorRegistrasi?.startsWith('TIKET/');

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          isNewlySubmitted ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <td className="py-4 px-4 sm:px-6 text-center font-bold text-slate-400">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {item.namaOrmas}
                            </span>
                            {isNewlySubmitted && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                                Baru
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            {item.singkatan && <span className="font-semibold text-slate-600 dark:text-slate-300">({item.singkatan})</span>}
                            <span>•</span>
                            <span>{item.jenisOrmas}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                              {ticket}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTicket(ticket)}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 p-1 rounded"
                              title="Salin nomor tiket"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Tgl: {item.tanggalPengajuan || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.ketuaUmum || item.pendaftar || '-'}
                          </div>
                          {(item.email || item.pendaftarEmail) && (
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {item.email || item.pendaftarEmail}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            Distrik {item.distrik || 'Mimika Baru'}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {item.alamat || 'Kabupaten Mimika'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <TableBadge status={item.status} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Link
                            href={`/dashboard/pengajuan/${item.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-all border border-blue-200/80 dark:border-blue-800 shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Tinjau</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State yang Bersahabat */
        <div className="p-10 sm:p-14 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Tidak Ada Pengajuan yang Cocok
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tidak ditemukan data pengajuan dengan kata kunci &ldquo;{searchTerm}&rdquo; atau filter yang sedang aktif.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Tampilkan Semua Pengajuan
          </button>
        </div>
      )}

      {/* Kontrol Navigasi Halaman (Pagination yang Ramah Pengguna) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Halaman <strong className="text-slate-900 dark:text-white">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalItems} Pengajuan)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &larr; Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Batasi tampilan nomor halaman jika terlalu banyak
              if (
                totalPages > 7 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span key={pageNum} className="px-2 text-xs text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
