'use client';

import React, { useState, useEffect } from 'react';
import { addSubmissionFromPayload } from '@/services/submissionStorage';

export interface OrmasSubmissionPayload {
  id?: string;
  nomorTiket?: string;
  namaOrganisasi: string;
  namaSingkat?: string;
  jenisOrganisasi: string;
  alamatKantor?: string;
  kodePos?: string;
  noTelepon?: string;
  [key: string]: any;
}

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
        alamatKantor: initialData.alamatKantor || initialData.alamatSekretariat || initialData.alamat || '',
        kodePos: initialData.kodePos || '',
        noTelepon: initialData.noTelepon || initialData.teleponKantor || initialData.telepon || '',
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

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

      // Ambil informasi akun yang sedang login untuk disinkronkan
      let userEmail = '';
      let userId = '';
      let userName = '';
      if (typeof window !== 'undefined') {
        try {
          const rawUser = localStorage.getItem('kesbangpol_user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            userEmail = parsed.email || '';
            userId = parsed.id || '';
            userName = parsed.nama || '';
          }
        } catch (e) {
          console.error('Error reading logged in user:', e);
        }
      }

      const newEntry = {
        id: `ORM-${Date.now().toString().slice(-4)}`,
        nomorTiket: `TIKET/SKT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        namaOrganisasi: formData.namaOrganisasi.trim(),
        namaSingkat: formData.namaSingkat.trim(),
        jenisOrganisasi: formData.jenisOrganisasi,
        alamatKantor: formData.alamatKantor.trim(),
        kodePos: formData.kodePos.trim() || '99910',
        noTelepon: formData.noTelepon.trim(),
        email: userEmail,
        emailResmi: userEmail,
        userId: userId,
        pendaftar: userName || formData.namaOrganisasi.trim(),
        tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: 'Menunggu Verifikasi',
      };

      // Perbarui cache sesi pengguna dengan ormas baru yang didaftarkan
      if (typeof window !== 'undefined' && userEmail) {
        try {
          const rawUser = localStorage.getItem('kesbangpol_user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            localStorage.setItem(
              'kesbangpol_user',
              JSON.stringify({
                ...parsed,
                ormasNama: newEntry.namaOrganisasi,
                singkatan: newEntry.namaSingkat,
                jenisOrmas: newEntry.jenisOrganisasi,
                alamat: newEntry.alamatKantor,
                nomorTiket: newEntry.nomorTiket,
                statusSkt: 'Menunggu Verifikasi',
              })
            );
          }
        } catch (e) {}
      }

      // Simpan ke database MySQL dan storage
      addSubmissionFromPayload(newEntry);

      onSuccess(newEntry);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 overflow-y-auto modal-backdrop">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col text-slate-800 dark:text-slate-200 modal-card">
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60 shrink-0">
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
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
              placeholder="contoh: FPK / KNPI"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
