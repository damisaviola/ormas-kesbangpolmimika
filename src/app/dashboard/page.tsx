'use client';

import React, { useState, useEffect } from 'react';
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

  if (isLoading) {
    return <DashboardLoading />;
  }

  const filteredSubmissions = submissions.filter((item) => {
    if (selectedStatus === 'all') return true;
    return item.status === selectedStatus;
  });

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
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Pengajuan Pendaftaran Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar Ormas yang baru mengajukan pendaftaran SKT di Kesbangpol.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'menunggu', label: 'Menunggu' },
              { id: 'proses', label: 'Proses' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedStatus === tab.id
                    ? 'bg-slate-900 dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 sm:px-6">No. ID</th>
                <th className="py-3 px-4">Nama Ormas</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Ketua Umum</th>
                <th className="py-3 px-4">Tgl Pengajuan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.namaOrmas}</p>
                          {(item.isCustomSubmission || item.nomorRegistrasi?.startsWith('TIKET/')) && (
                            <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded">
                              Baru
                            </span>
                          )}
                        </div>
                        {item.singkatan && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            ({item.singkatan})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
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
                        className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                      >
                        Periksa →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada data pengajuan dengan status ini.
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
