'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_METRICS, INITIAL_SUBMISSIONS } from '@/data/dashboard-data';
import { OrmasSubmission } from '@/types/dashboard';

export default function DashboardBerandaPage() {
  const [submissions] = useState<OrmasSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredSubmissions = submissions.filter((item) => {
    if (selectedStatus === 'all') return true;
    return item.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
            Sistem Informasi Ormas Mimika
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            Selamat Datang, Admin Kesbangpol
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kelola verifikasi pengajuan pendaftaran, direktori Ormas terdaftar, dan data master keorganisasian Kabupaten Mimika.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/pengajuan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Verifikasi Pengajuan (18)
          </Link>
          <Link
            href="/dashboard/organisasi"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedStatus === tab.id
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
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
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">No. ID</th>
                <th className="py-3.5 px-4">Nama Ormas</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Ketua Umum</th>
                <th className="py-3.5 px-4">Tgl Pengajuan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-amber-400">
                      {item.id}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.namaOrmas}</p>
                        {item.singkatan && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                            ({item.singkatan})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {item.jenisOrmas}
                    </td>
                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {item.ketuaUmum}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {item.tanggalPengajuan}
                    </td>
                    <td className="py-4 px-4">
                      <TableBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href="/dashboard/pengajuan"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-amber-300 hover:text-blue-800 dark:hover:text-amber-200 bg-blue-50 dark:bg-amber-950/60 hover:bg-blue-100 dark:hover:bg-amber-900/60 px-3 py-1.5 rounded-md transition-colors border border-transparent dark:border-amber-800/60"
                      >
                        Periksa
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
