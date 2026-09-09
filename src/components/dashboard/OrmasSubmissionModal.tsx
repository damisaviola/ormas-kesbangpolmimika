'use client';

import React, { useState, useEffect } from 'react';

interface OrmasSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubmission: any) => void;
  initialData?: any;
}

export default function OrmasSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: OrmasSubmissionModalProps) {
  const [formData, setFormData] = useState({
    namaOrganisasi: '',
    namaSingkat: '',
    jenisOrganisasi: '',
    alamatKantor: '',
    kodePos: '',
    noTelepon: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        namaOrganisasi: initialData.namaOrganisasi || initialData.namaOrmas || '',
        namaSingkat: initialData.namaSingkat || initialData.singkatan || '',
        jenisOrganisasi: initialData.jenisOrganisasi || initialData.jenisOrmas || '',
        alamatKantor: initialData.alamatKantor || initialData.alamatSekretariat || '',
        kodePos: initialData.kodePos || '',
        noTelepon: initialData.noTelepon || initialData.teleponKantor || '',
      });
    } else {
      setFormData({
        namaOrganisasi: '',
        namaSingkat: '',
        jenisOrganisasi: '',
        alamatKantor: '',
        kodePos: '',
        noTelepon: '',
      });
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.namaOrganisasi.trim()) {
      setErrorMessage('Nama Organisasi wajib diisi!');
      return;
    }

    if (!formData.jenisOrganisasi || formData.jenisOrganisasi === '-- Pilih --') {
      setErrorMessage('Silakan pilih Jenis Organisasi!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newEntry = {
        id: `ORM-${Date.now().toString().slice(-4)}`,
        nomorTiket: `TIKET/SKT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        namaOrganisasi: formData.namaOrganisasi,
        namaSingkat: formData.namaSingkat,
        jenisOrganisasi: formData.jenisOrganisasi,
        alamatKantor: formData.alamatKantor,
        kodePos: formData.kodePos,
        noTelepon: formData.noTelepon,
        tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: 'Menunggu Verifikasi',
      };

      onSuccess(newEntry);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 text-slate-800 dark:text-slate-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Buat Organisasi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup Modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Field 1: Nama Organisasi */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Nama Organisasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.namaOrganisasi}
              onChange={(e) => setFormData({ ...formData, namaOrganisasi: e.target.value })}
              placeholder="Masukkan nama lengkap organisasi"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all text-xs"
            />
          </div>

          {/* Field 2: Nama Singkat */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Nama Singkat
            </label>
            <input
              type="text"
              value={formData.namaSingkat}
              onChange={(e) => setFormData({ ...formData, namaSingkat: e.target.value })}
              placeholder="contoh: IPAM / PWKM"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all text-xs"
            />
          </div>

          {/* Field 3: Jenis Organisasi */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Jenis Organisasi <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.jenisOrganisasi}
              onChange={(e) => setFormData({ ...formData, jenisOrganisasi: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all text-xs cursor-pointer"
            >
              <option value="">-- Pilih --</option>
              <option value="ORMAS">ORMAS</option>
              <option value="FKUB">FKUB</option>
            </select>
          </div>

          {/* Field 4: Alamat Kantor */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              Alamat Kantor
            </label>
            <textarea
              rows={3}
              value={formData.alamatKantor}
              onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
              placeholder="Masukkan alamat lengkap kantor sekretariat"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all text-xs resize-none"
            />
          </div>

          {/* Field 5 & 6: Kode Pos & No. Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Kode Pos
              </label>
              <input
                type="text"
                value={formData.kodePos}
                onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                placeholder="contoh: 99910"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                No. Telepon
              </label>
              <input
                type="text"
                value={formData.noTelepon}
                onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                placeholder="contoh: 0812-4099-1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all text-xs"
              />
            </div>
          </div>

          {/* Action Buttons: Simpan & Batal */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
