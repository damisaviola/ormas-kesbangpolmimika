'use client';

import React, { useState, useEffect } from 'react';
import JenisOrmasLoading from '@/app/dashboard/database/jenis-ormas/loading';
import { INITIAL_JENIS_ORMAS } from '@/data/dashboard-data';
import { JenisOrmasItem } from '@/types/dashboard';

const STORAGE_KEY = 'siormas_jenis_organisasi_v2';

export default function DatabaseJenisOrmasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<JenisOrmasItem[]>(INITIAL_JENIS_ORMAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<JenisOrmasItem | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<JenisOrmasItem | null>(null);

  // Form state for add
  const [newNama, setNewNama] = useState('');
  const [newJumlah, setNewJumlah] = useState<number>(0);
  const [newDeskripsi, setNewDeskripsi] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from localStorage or fallback
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JENIS_ORMAS));
      }
    } catch {
      // fallback
    }
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const saveToStorage = (data: JenisOrmasItem[]) => {
    setCategories(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  if (isLoading) {
    return <JenisOrmasLoading />;
  }

  // Filter
  const filtered = categories.filter((c) =>
    c.namaJenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.deskripsi && c.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  // Actions
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;

    const item: JenisOrmasItem = {
      id: `JNS-${String(Date.now()).slice(-4)}`,
      kode: newNama.trim().slice(0, 5).toUpperCase(),
      namaJenis: newNama.trim().toUpperCase(),
      deskripsi: newDeskripsi.trim() || 'Kategori Organisasi di Kabupaten Mimika.',
      jumlahOrmas: Number(newJumlah) || 0,
      status: 'aktif',
    };

    const updated = [...categories, item];
    saveToStorage(updated);
    setNewNama('');
    setNewJumlah(0);
    setNewDeskripsi('');
    setShowAddModal(false);
    showToast(`Jenis organisasi "${item.namaJenis}" berhasil ditambahkan.`);
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForEdit) return;

    const updated = categories.map((c) =>
      c.id === selectedForEdit.id ? selectedForEdit : c
    );
    saveToStorage(updated);
    showToast(`Data jenis organisasi "${selectedForEdit.namaJenis}" berhasil diperbarui.`);
    setSelectedForEdit(null);
  };

  const handleDeleteCategory = () => {
    if (!selectedForDelete) return;

    const updated = categories.filter((c) => c.id !== selectedForDelete.id);
    saveToStorage(updated);
    showToast(`Jenis organisasi "${selectedForDelete.namaJenis}" berhasil dihapus.`);
    setSelectedForDelete(null);
  };

  const handleResetDefault = () => {
    if (confirm('Pulihkan jenis organisasi ke daftar default?')) {
      saveToStorage(INITIAL_JENIS_ORMAS);
      showToast('Data jenis organisasi telah dipulihkan ke default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Database Master
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Manajemen Jenis Organisasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar klasifikasi dan jumlah organisasi kemasyarakatan yang terdaftar di Kesbangpol Mimika.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs"
            title="Pulihkan data default"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Default</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Jenis Organisasi
          </button>
        </div>
      </div>

      {/* Control Bar: Tampilkan [10 25 50 100] & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
        {/* Entries Page Size Selector */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Tampilkan</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            {[10, 25, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  pageSize === size
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-slate-500 dark:text-slate-400">data per halaman</span>
        </div>

        {/* Search Bar Input */}
        <div className="w-full sm:w-72 relative">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari jenis organisasi..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Table: No, Nama, Jumlah Organisasi, Aksi */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 w-16 text-center">No</th>
                <th className="py-3.5 px-4">Nama</th>
                <th className="py-3.5 px-4">Jumlah Organisasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6 text-center font-bold text-slate-500 dark:text-slate-400">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white tracking-wide">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-blue-900 dark:text-blue-400">
                          {item.namaJenis}
                        </span>
                        {item.deskripsi && (
                          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 hidden md:inline">
                            • {item.deskripsi}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                        {item.jumlahOrmas}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => setSelectedForEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="Edit Jenis Organisasi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setSelectedForDelete(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Hapus Jenis Organisasi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ditemukan jenis organisasi yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar: [Pertama] [Sebelumnya] / 1 halaman [Selanjutnya] [Terakhir] */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan {filtered.length > 0 ? startIndex + 1 : 0} sampai{' '}
            {Math.min(startIndex + pageSize, filtered.length)} dari {filtered.length} jenis organisasi
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pertama */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              Pertama
            </button>

            {/* Sebelumnya */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              Sebelumnya
            </button>

            {/* Halaman info */}
            <div className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800">
              {validCurrentPage} / {totalPages} halaman
            </div>

            {/* Selanjutnya */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              Selanjutnya
            </button>

            {/* Terakhir */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              Terakhir
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Jenis Organisasi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleAddCategory}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Tambah Jenis Organisasi
                </h3>
                <p className="text-xs text-slate-400">Buat klasifikasi kategori organisasi baru.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Jenis Organisasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ORMAS, FKUB, YAYASAN..."
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Organisasi Terdaftar
                </label>
                <input
                  type="number"
                  min="0"
                  value={newJumlah}
                  onChange={(e) => setNewJumlah(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan klasifikasi organisasi..."
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
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

      {/* Modal: Edit Jenis Organisasi */}
      {selectedForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleEditCategory}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit Jenis Organisasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForEdit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Jenis Organisasi
                </label>
                <input
                  type="text"
                  required
                  value={selectedForEdit.namaJenis}
                  onChange={(e) =>
                    setSelectedForEdit({ ...selectedForEdit, namaJenis: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Organisasi
                </label>
                <input
                  type="number"
                  min="0"
                  value={selectedForEdit.jumlahOrmas}
                  onChange={(e) =>
                    setSelectedForEdit({
                      ...selectedForEdit,
                      jumlahOrmas: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={selectedForEdit.deskripsi}
                  onChange={(e) =>
                    setSelectedForEdit({ ...selectedForEdit, deskripsi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedForEdit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Hapus Jenis Organisasi */}
      {selectedForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hapus Jenis Organisasi?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus kategori{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedForDelete.namaJenis}
                </strong>
                ?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedForDelete(null)}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="w-full py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
