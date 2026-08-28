'use client';

import React, { useState } from 'react';

export default function ProfilPage() {
  const [saved, setSaved] = useState(false);
  const [nama, setNama] = useState('Administrator Utama');
  const [email, setEmail] = useState('admin.kesbangpol@mimikakab.go.id');
  const [nip, setNip] = useState('19850423 201001 1 002');
  const [telepon, setTelepon] = useState('081240998877');
  const [instansi, setInstansi] = useState('Badan Kesatuan Bangsa dan Politik Kabupaten Mimika');
  const [jabatan, setJabatan] = useState('Kepala Sub Bidang Ormas & Lembaga');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Pengaturan Profil & Akun Admin
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola data pribadi, identitas pegawai Kesbangpol, dan opsi keamanan akun verifikator.
        </p>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-lg text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Perubahan data profil berhasil diperbarui dan disimpan ke sistem!
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-600 dark:bg-blue-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 select-none">
          AU
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{nama}</h2>
            <span className="px-3 py-1 text-xs font-extrabold rounded-md uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800">
              Superadmin Kesbangpol
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{jabatan}</p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">NIP: {nip} • {email}</p>
        </div>
      </div>

      {/* Main Account Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-xs space-y-8 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Informasi Pribadi & Pegawai
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data identitas utama yang terverifikasi dalam sistem SI-ORMAS Kesbangpol Mimika
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Nama Lengkap & Gelar
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              NIP (Nomor Induk Pegawai)
            </label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Email Kedinasan Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Instansi Pemerintah
            </label>
            <input
              type="text"
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Jabatan Dinas
            </label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-98"
          >
            Simpan Perubahan Profil
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Keamanan & Kata Sandi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perbarui kata sandi akun secara berkala untuk menjaga keamanan data pendaftaran Ormas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
}
