'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import TableBadge from '@/components/dashboard/TableBadge';
import DashboardLoading from '@/app/dashboard/loading';
import { INITIAL_METRICS } from '@/data/dashboard-data';
import { OrmasSubmission } from '@/types/dashboard';
import { getSubmissions, syncSubmissionsFromApi, subscribeToSubmissions } from '@/services/submissionStorage';

export default function DashboardBerandaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setSubmissions(getSubmissions());

    syncSubmissionsFromApi().then((fresh) => {
      if (fresh && fresh.length > 0) setSubmissions(fresh);
    });

    const unsubscribe = subscribeToSubmissions((updatedList) => {
      setSubmissions(updatedList);
    });

    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      return (
        (item.namaOrmas && item.namaOrmas.toLowerCase().includes(q)) ||
        (item.singkatan && item.singkatan.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.nomorRegistrasi && item.nomorRegistrasi.toLowerCase().includes(q)) ||
        (item.ketuaUmum && item.ketuaUmum.toLowerCase().includes(q)) ||
        (item.jenisOrmas && item.jenisOrmas.toLowerCase().includes(q)) ||
        (item.alamat && item.alamat.toLowerCase().includes(q)) ||
        (item.distrik && item.distrik.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.pendaftar && item.pendaftar.toLowerCase().includes(q)) ||
        ((item as any).nomorTiket && (item as any).nomorTiket.toLowerCase().includes(q))
      );
    });
  }, [submissions, selectedStatus, searchTerm]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            Badan Kesbangpol Kabupaten Mimika
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Selamat Datang, Admin Kesbangpol
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Kelola verifikasi pengajuan pendaftaran, direktori Ormas terdaftar, dan data master keorganisasian Kabupaten Mimika.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/pengajuan"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Verifikasi Pengajuan ({submissions.filter((s) => s.status === 'menunggu' || s.status === 'proses').length})
          </Link>
          <Link
            href="/dashboard/organisasi"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Direktori Ormas
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INITIAL_METRICS.map((metric, idx) => (
          <StatCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Table Section: Recent Submissions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Table Header: Title on Left, Clean Search Input on Right */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Pengajuan Pendaftaran Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar Ormas yang baru mengajukan pendaftaran SKT di Kesbangpol Mimika.
            </p>
          </div>

          {/* Clean Search Input */}
          <div className="relative w-full sm:w-72">
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
              placeholder="Cari nama Ormas, ID, ketua..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium placeholder-slate-400 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold leading-none"
                title="Hapus pencarian"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Bar & Result Count */}
        <div className="px-4 py-2.5 bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'menunggu', label: 'Menunggu' },
              { id: 'proses', label: 'Proses' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {searchTerm ? (
              <>
                <span>Hasil: <strong className="text-slate-800 dark:text-slate-200">&ldquo;{searchTerm}&rdquo;</strong> ({filteredSubmissions.length})</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
                >
                  Reset
                </button>
              </>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Total: {filteredSubmissions.length} data
              </span>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">No. ID</th>
                <th className="py-3 px-4 font-medium">Nama Ormas</th>
                <th className="py-3 px-4 font-medium">Jenis</th>
                <th className="py-3 px-4 font-medium">Ketua Umum</th>
                <th className="py-3 px-4 font-medium">Tgl Pengajuan</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                          {item.namaOrmas}
                        </span>
                        {item.singkatan && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            ({item.singkatan})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.jenisOrmas}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {item.ketuaUmum}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.tanggalPengajuan}
                    </td>
                    <td className="py-3.5 px-4">
                      <TableBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/pengajuan/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                      >
                        <span>Verifikasi</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {searchTerm
                        ? `Tidak ada pengajuan yang cocok dengan kata kunci "${searchTerm}"`
                        : 'Tidak ada data pengajuan dengan status ini.'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {searchTerm
                        ? 'Coba periksa ejaan atau gunakan kata kunci pencarian yang lain.'
                        : 'Belum ada pendaftaran baru pada kategori status ini.'}
                    </p>
                    {(searchTerm || selectedStatus !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                        }}
                        className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors inline-block"
                      >
                        Reset Pencarian & Filter
                      </button>
                    )}
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
