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

export default function PengajuanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<keyof OrmasSubmission>('tanggalPengajuan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
            onClick={handleExportCsv}
            title="Unduh data pengajuan ke format CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrintPdf}
            title="Cetak atau simpan rekapitulasi sebagai PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak PDF</span>
          </button>
          <Link
            href="/dashboard-ormas"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    </div>
  );
}
