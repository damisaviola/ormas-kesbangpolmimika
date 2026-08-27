'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_JENIS_ORMAS } from '@/data/dashboard-data';
import { JenisOrmasItem } from '@/types/dashboard';

export default function DatabaseJenisOrmasPage() {
  const [categories, setCategories] = useState<JenisOrmasItem[]>(INITIAL_JENIS_ORMAS);
  const [showModal, setShowModal] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode) return;

    const item: JenisOrmasItem = {
      id: `JNS-00${categories.length + 1}`,
      kode: newKode.toUpperCase(),
      namaJenis: newNama,
      deskripsi: newDeskripsi || 'Kategori Ormas terdaftar.',
      jumlahOrmas: 0,
      status: 'aktif',
    };

    setCategories([...categories, item]);
    setNewKode('');
    setNewNama('');
    setNewDeskripsi('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Database Master
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Master Data Jenis Ormas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kategori klasifikasi jenis organisasi kemasyarakatan di Kabupaten Mimika.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jenis Ormas
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Kode</th>
                <th className="py-3.5 px-4">Nama Kategori</th>
                <th className="py-3.5 px-4">Deskripsi / Ruang Lingkup</th>
                <th className="py-3.5 px-4">Jumlah Ormas</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-mono font-bold text-blue-700 bg-blue-50/50 px-2 rounded w-fit">
                    {c.kode}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">{c.namaJenis}</td>
                  <td className="py-4 px-4 text-slate-500 max-w-xs">{c.deskripsi}</td>
                  <td className="py-4 px-4 font-bold text-slate-800">{c.jumlahOrmas} Ormas</td>
                  <td className="py-4 px-4">
                    <TableBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddCategory}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Jenis Ormas</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="KAG, KBD, PRF..."
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Jenis Ormas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pendidikan & Riset"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  placeholder="Ruang lingkup kegiatan organisasi..."
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
