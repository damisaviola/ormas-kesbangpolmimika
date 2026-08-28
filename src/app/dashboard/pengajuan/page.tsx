'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_SUBMISSIONS } from '@/data/dashboard-data';
import { OrmasSubmission, StatusPengajuan } from '@/types/dashboard';

export default function PengajuanPage() {
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal details state
  const [activeItem, setActiveItem] = useState<OrmasSubmission | null>(null);

  const filtered = submissions.filter((item) => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch =
      item.namaOrmas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ketuaUmum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: StatusPengajuan) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: newStatus,
            nomorRegistrasi:
              newStatus === 'disetujui'
                ? `230/SKT/KESBANGPOL/${new Date().getFullYear()}`
                : sub.nomorRegistrasi,
          };
        }
        return sub;
      })
    );
    if (activeItem && activeItem.id === id) {
      setActiveItem({
        ...activeItem,
        status: newStatus,
        nomorRegistrasi:
          newStatus === 'disetujui'
            ? `230/SKT/KESBANGPOL/${new Date().getFullYear()}`
            : activeItem.nomorRegistrasi,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Verifikasi Pengajuan Ormas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan lakukan verifikasi berkas permohonan pendaftaran Ormas baru di Kesbangpol Mimika.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'menunggu', label: 'Menunggu Verifikasi' },
            { id: 'proses', label: 'Dalam Proses' },
            { id: 'disetujui', label: 'Disetujui' },
            { id: 'ditolak', label: 'Ditolak' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedStatus === tab.id
                  ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama Ormas, Ketua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama</th>
                <th className="py-3.5 px-4">Alamat</th>
                <th className="py-3.5 px-4">Pendaftar</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 text-center font-bold text-slate-500 dark:text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.namaOrmas}</p>
                      {item.singkatan && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">({item.singkatan})</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-xs">
                      {item.alamat || 'Jl. Cendrawasih SP3, Mimika'}
                    </td>
                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {item.pendaftar || item.ketuaUmum}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {item.jenisOrmas}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-amber-300 bg-blue-50 dark:bg-amber-950/60 hover:bg-blue-100 dark:hover:bg-amber-900/60 rounded-md transition-colors border border-transparent dark:border-amber-800/60"
                      >
                        Detail & Verifikasi
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    Tidak ditemukan data pengajuan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Verifikasi */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Detail Pengajuan • {activeItem.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeItem.namaOrmas}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 dark:text-slate-500 font-medium">Jenis Ormas</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeItem.jenisOrmas}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 font-medium">Ketua Umum</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeItem.ketuaUmum}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 font-medium">Tanggal Pengajuan</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeItem.tanggalPengajuan}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 font-medium">Status Saat Ini</p>
                <div className="mt-1">
                  <TableBadge status={activeItem.status} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Catatan Verifikasi:</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{activeItem.catatan || 'Belum ada catatan'}</p>
            </div>

            {/* Verification Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => handleUpdateStatus(activeItem.id, 'ditolak')}
                className="px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors border border-transparent dark:border-rose-800"
              >
                Tolak / Minta Revisi
              </button>
              <button
                onClick={() => handleUpdateStatus(activeItem.id, 'proses')}
                className="px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors border border-transparent dark:border-amber-800"
              >
                Set Status: Dalam Proses
              </button>
              <button
                onClick={() => handleUpdateStatus(activeItem.id, 'disetujui')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
              >
                Setujui & Terbitkan SKT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
