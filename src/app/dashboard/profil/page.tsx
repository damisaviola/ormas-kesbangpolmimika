'use client';

import React, { useState } from 'react';

export default function ProfilPage() {
  const [saved, setSaved] = useState(false);
  const [nama, setNama] = useState('Administrator Utama');
  const [email, setEmail] = useState('admin.kesbangpol@mimikakab.go.id');
  const [nik, setNik] = useState('9109012304850001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Pengaturan Profil Admin</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola data pribadi, informasi akun verifikator, dan opsi keamanan kata sandi.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Perubahan profil berhasil disimpan!
        </div>
      )}

      {/* Account Info Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Informasi Akun
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Peran / Role</label>
            <input
              type="text"
              value="Superadmin Kesbangpol"
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Keamanan Kata Sandi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kata Sandi Lama</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
}
