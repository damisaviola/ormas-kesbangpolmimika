'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_JABATAN } from '@/data/dashboard-data';
import { JabatanItem } from '@/types/dashboard';

export default function DatabaseJabatanPage() {
  const [jabatanList, setJabatanList] = useState<JabatanItem[]>(INITIAL_JABATAN);
  const [showModal, setShowModal] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newTingkat, setNewTingkat] = useState<'Utama' | 'Pengurus Harian' | 'Pembina/Penasihat' | 'Divisi'>('Pengurus Harian');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const handleAddJabatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode) return;

    const item: JabatanItem = {
      id: `JBT-00${jabatanList.length + 1}`,
      kode: newKode.toUpperCase(),
      namaJabatan: newNama,
      tingkat: newTingkat,
      deskripsi: newDeskripsi || 'Jabatan struktur organisasi.',
      status: 'aktif',
    };

    setJabatanList([...jabatanList, item]);
    setNewKode('');
    setNewNama('');
    setNewDeskripsi('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Database Master
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Master Data Jabatan Organisasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Struktur tingkatan jabatan resmi pengurus Ormas yang terdaftar di Kesbangpol.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jabatan Baru
        </button>
      </div>

      {/* Jabatan Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Kode</th>
                <th className="py-3.5 px-4">Nama Jabatan</th>
                <th className="py-3.5 px-4">Tingkat Struktur</th>
                <th className="py-3.5 px-4">Deskripsi Tugas</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jabatanList.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-amber-400">
                    {j.kode}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{j.namaJabatan}</td>
                  <td className="py-4 px-4 font-semibold">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {j.tingkat}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 max-w-xs">{j.deskripsi}</td>
                  <td className="py-4 px-4">
                    <TableBadge status={j.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Jabatan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleAddJabatan}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tambah Jabatan Baru</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="KETUM, BENDA, KORBID..."
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono uppercase text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koordinator Humas"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tingkat Struktur</label>
                <select
                  value={newTingkat}
                  onChange={(e) => setNewTingkat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none text-slate-900 dark:text-slate-100"
                >
                  <option value="Utama">Utama</option>
                  <option value="Pengurus Harian">Pengurus Harian</option>
                  <option value="Pembina/Penasihat">Pembina/Penasihat</option>
                  <option value="Divisi">Divisi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi tugas dan fungsi..."
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Simpan Jabatan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
