'use client';

import React, { useState, useEffect } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import OrganisasiLoading from '@/app/dashboard/organisasi/loading';
import { INITIAL_REGISTERED_ORMAS } from '@/data/dashboard-data';
import { RegisteredOrmas } from '@/types/dashboard';
import { exportToCsv, printReportPdf, printOrmasDetailPdf } from '@/utils/exportUtils';

export default function OrganisasiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [ormasData, setOrmasData] = useState<RegisteredOrmas[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [sortField, setSortField] = useState<keyof RegisteredOrmas>('namaOrmas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Detail Modal State
  const [selectedOrmasForDetail, setSelectedOrmasForDetail] = useState<RegisteredOrmas | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrmas() {
      try {
        const res = await fetch('/api/ormas', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOrmasData(json.data);
        }
      } catch (err) {
        console.error('Failed to load ormas from API:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrmas();
  }, []);

  // Keyboard shortcut (Escape) to close detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrmasForDetail(null);
      }
    };
    if (selectedOrmasForDetail) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedOrmasForDetail]);

  if (isLoading) {
    return <OrganisasiLoading />;
  }

  const handleSort = (field: keyof RegisteredOrmas) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const filtered = ormasData.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.jenisOrmas === categoryFilter;
    const matchesSearch =
      item.namaOrmas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ketuaUmum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorSk.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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

  const handleExportCsv = () => {
    const headers = [
      'Nama Organisasi',
      'Singkatan',
      'Jenis/Bidang',
      'Ketua Umum',
      'Nomor SKT',
      'Masa Berlaku',
      'Status SKT',
      'Alamat Sekretariat',
      'Telepon',
      'Email',
    ];

    const rows = sorted.map((item) => [
      item.namaOrmas,
      item.singkatan || '',
      item.jenisOrmas,
      item.ketuaUmum,
      item.nomorSk,
      item.tanggalBerlaku,
      item.statusSk,
      item.alamat,
      item.telepon,
      item.email,
    ]);

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToCsv(`Data_Direktori_Ormas_Kesbangpol_Mimika_${timestamp}`, headers, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['Nama Organisasi', 'Jenis / Bidang', 'Ketua Umum', 'Nomor SKT', 'Masa Berlaku', 'Status'];
    const rows = sorted.map((item) => [
      item.singkatan ? `${item.namaOrmas} (${item.singkatan})` : item.namaOrmas,
      item.jenisOrmas,
      item.ketuaUmum,
      item.nomorSk,
      item.tanggalBerlaku,
      item.statusSk,
    ]);

    const kategoriLabel = categoryFilter === 'all' ? 'Semua Kategori' : categoryFilter;
    const searchNote = searchTerm ? `Pencarian: "${searchTerm}"` : '';
    const filterDesc = [kategoriLabel, searchNote].filter(Boolean).join(' | ');

    printReportPdf({
      title: 'LAPORAN DIREKTORI ORGANISASI KEMASYARAKATAN (ORMAS)',
      subtitle: 'Data Organisasi Resmi Terdaftar di Badan Kesbangpol Kabupaten Mimika',
      headers,
      rows,
      keteranganFilter: filterDesc,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Direktori Organisasi Kemasyarakatan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Master data Ormas terdaftar dan terverifikasi secara sah di Kesbangpol Kabupaten Mimika.
          </p>
        </div>

        {/* Tombol Ekspor & Cetak */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            title="Unduh seluruh data tabel yang aktif ke format file Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrintPdf}
            title="Cetak atau simpan sebagai PDF ber-KOP resmi Kesbangpol"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Kategori:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium w-full sm:w-auto"
          >
            <option value="all">Semua Jenis Ormas</option>
            <option value="Kebudayaan">Kebudayaan & Adat</option>
            <option value="Profesi">Profesi</option>
            <option value="Keagamaan">Keagamaan</option>
            <option value="Kepemudaan">Kepemudaan</option>
          </select>
        </div>

        <div className="w-full sm:w-72 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama Ormas, SKT, Ketua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => handleSort('namaOrmas')}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Ormas</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'namaOrmas' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('jenisOrmas')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Jenis</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'jenisOrmas' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ketuaUmum')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Ketua Umum</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'ketuaUmum' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nomorSk')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>No. SKT / SK</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'nomorSk' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4">Masa Berlaku</th>
                <th
                  onClick={() => handleSort('statusSk')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Status Legal</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'statusSk' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.length > 0 ? (
                sorted.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedOrmasForDetail(item)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.namaOrmas}
                      </p>
                      {item.singkatan && (
                        <span className="inline-block text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900 mt-0.5">
                          {item.singkatan}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate max-w-xs">{item.alamat}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.jenisOrmas}</td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{item.ketuaUmum}</td>
                    <td className="py-4 px-4 font-mono text-slate-700 dark:text-amber-400 text-[11px] font-bold">{item.nomorSk}</td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{item.tanggalBerlaku}</td>
                    <td className="py-4 px-4">
                      <TableBadge status={item.statusSk} />
                    </td>
                    <td className="py-4 px-4 text-[11px]">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{item.telepon}</p>
                      <p className="text-slate-400 dark:text-slate-500">{item.email}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrmasForDetail(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors border border-blue-200/80 dark:border-blue-800 shadow-2xs"
                        title="Lihat Detail Profil Organisasi"
                      >
                        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>
                        {ormasData.length === 0
                          ? 'Belum ada data organisasi kemasyarakatan yang terdaftar di database Kesbangpol.'
                          : 'Tidak ada data organisasi yang sesuai kriteria pencarian.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Ormas Detail Modal */}
      {selectedOrmasForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 md:p-6 overflow-y-auto modal-backdrop"
          onClick={() => setSelectedOrmasForDetail(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col overflow-hidden modal-card text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedOrmasForDetail(null)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors font-bold text-sm z-10 shrink-0"
              aria-label="Tutup modal"
            >
              ✕
            </button>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 pr-0.5 sm:pr-1 space-y-4">
              {/* Institution Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    BAKESBANGPOL KABUPATEN MIMIKA • DETAIL ORGANISASI
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  ID: {selectedOrmasForDetail.id}
                </span>
              </div>

              {/* Header: Name & Status */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <TableBadge status={selectedOrmasForDetail.statusSk} />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    {selectedOrmasForDetail.jenisOrmas}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedOrmasForDetail.namaOrmas}
                </h2>
                {selectedOrmasForDetail.singkatan && (
                  <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">
                    Singkatan: <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">{selectedOrmasForDetail.singkatan}</span>
                  </p>
                )}
              </div>

              {/* Information Grid */}
              <div className="bg-slate-50/90 dark:bg-slate-950/60 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-xs">
                {/* SKT Card */}
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Nomor SKT / SK Kesbangpol
                    </span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-amber-400 mt-0.5 block select-all break-all">
                      {selectedOrmasForDetail.nomorSk}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedOrmasForDetail.nomorSk, 'skt')}
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      copiedText === 'skt'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {copiedText === 'skt' ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Salin SK
                      </>
                    )}
                  </button>
                </div>

                {/* Data Rows */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1 py-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Ketua Umum:</span>
                    <span className="sm:col-span-2 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {selectedOrmasForDetail.ketuaUmum}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1 py-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Masa Berlaku SKT:</span>
                    <span className="sm:col-span-2 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedOrmasForDetail.tanggalBerlaku}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1 py-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Alamat Sekretariat:</span>
                    <span className="sm:col-span-2 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {selectedOrmasForDetail.alamat}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1 py-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Telepon / WhatsApp:</span>
                    <span className="sm:col-span-2 text-slate-800 dark:text-slate-200 font-mono">
                      <a href={`tel:${selectedOrmasForDetail.telepon}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedOrmasForDetail.telepon}
                      </a>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1 py-1.5">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Email Resmi:</span>
                    <span className="sm:col-span-2 text-slate-800 dark:text-slate-200 font-mono break-all">
                      <a href={`mailto:${selectedOrmasForDetail.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedOrmasForDetail.email}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Verification Notice */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-3 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="leading-relaxed">
                  Status legalitas organisasi ini diverifikasi aktif oleh Bakesbangpol Kabupaten Mimika. Semua berkas persyaratan telah dinyatakan sah.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-3">
              <button
                onClick={() =>
                  selectedOrmasForDetail &&
                  printOrmasDetailPdf({
                    namaOrmas: selectedOrmasForDetail.namaOrmas,
                    singkatan: selectedOrmasForDetail.singkatan,
                    jenisOrmas: selectedOrmasForDetail.jenisOrmas,
                    nomorSk: selectedOrmasForDetail.nomorSk,
                    masaBerlaku: selectedOrmasForDetail.tanggalBerlaku,
                    ketuaUmum: selectedOrmasForDetail.ketuaUmum,
                    alamat: selectedOrmasForDetail.alamat,
                    telepon: selectedOrmasForDetail.telepon,
                    email: selectedOrmasForDetail.email,
                    statusSkt: selectedOrmasForDetail.statusSk,
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Lembar Profil (PDF)
              </button>
              <button
                onClick={() => setSelectedOrmasForDetail(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-2xs text-center"
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
