'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_REGISTERED_ORMAS } from '@/data/dashboard-data';
import { RegisteredOrmas } from '@/types/dashboard';

export default function OrganisasiPage() {
  const [ormasData] = useState<RegisteredOrmas[]>(INITIAL_REGISTERED_ORMAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = ormasData.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.jenisOrmas === categoryFilter;
    const matchesSearch =
      item.namaOrmas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ketuaUmum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorSk.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Direktori Organisasi Kemasyarakatan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master data Ormas terdaftar dan terverifikasi secara sah di Kesbangpol Kabupaten Mimika.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Kategori:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="all">Semua Jenis Ormas</option>
            <option value="Kebudayaan">Kebudayaan & Adat</option>
            <option value="Profesi">Profesi</option>
            <option value="Keagamaan">Keagamaan</option>
            <option value="Kepemudaan">Kepemudaan</option>
          </select>
        </div>

        <div className="w-full md:w-72 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama Ormas, SKT, Ketua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Nama Ormas</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Ketua Umum</th>
                <th className="py-3.5 px-4">No. SKT / SK</th>
                <th className="py-3.5 px-4">Masa Berlaku</th>
                <th className="py-3.5 px-4">Status Legal</th>
                <th className="py-3.5 px-4 text-right">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{item.namaOrmas}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.alamat}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.jenisOrmas}</td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{item.ketuaUmum}</td>
                    <td className="py-4 px-4 font-mono text-slate-700 dark:text-amber-400 text-[11px] font-bold">{item.nomorSk}</td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{item.tanggalBerlaku}</td>
                    <td className="py-4 px-4">
                      <TableBadge status={item.statusSk} />
                    </td>
                    <td className="py-4 px-4 text-right text-[11px]">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{item.telepon}</p>
                      <p className="text-slate-400 dark:text-slate-500">{item.email}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Tidak ada data organisasi yang sesuai pencarian.
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
