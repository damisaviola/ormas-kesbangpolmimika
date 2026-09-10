'use client';

import React, { useState, useEffect } from 'react';
import ProfilLoading from '@/app/dashboard-ormas/profil/loading';
import { INITIAL_USER_ORMAS } from '@/data/ormas-dashboard-data';
import { UserOrmasProfile } from '@/types/ormas-dashboard';

export default function OrmasProfilPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [userProfile, setUserProfile] = useState<UserOrmasProfile>(INITIAL_USER_ORMAS);

  // Form states
  const [nama, setNama] = useState(userProfile.namaLengkap);
  const [nik, setNik] = useState(userProfile.nik);
  const [email, setEmail] = useState(userProfile.email);
  const [telepon, setTelepon] = useState(userProfile.telepon);
  const [jabatan, setJabatan] = useState(userProfile.jabatanDiOrmas);
  const [alamat, setAlamat] = useState(userProfile.alamatTinggal);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Notification preferences
  const [notifWa, setNotifWa] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifAgenda, setNotifAgenda] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('kesbangpol_user') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.nama) setNama(parsed.nama);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.telepon) setTelepon(parsed.telepon);
        setUserProfile((prev) => ({
          ...prev,
          namaLengkap: parsed.nama || prev.namaLengkap,
          email: parsed.email || prev.email,
          telepon: parsed.telepon || prev.telepon,
          namaOrmas: parsed.ormasNama || parsed.instansi || prev.namaOrmas,
        }));
      }
    } catch (err) {
      console.error('Error reading kesbangpol_user in profil:', err);
    }
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      namaLengkap: nama,
      nik: nik,
      email: email,
      telepon: telepon,
      jabatanDiOrmas: jabatan,
      alamatTinggal: alamat,
    });

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kesbangpol_user');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          'kesbangpol_user',
          JSON.stringify({
            ...parsed,
            nama,
            email,
            telepon,
          })
        );
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Error saving updated user to localStorage:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback('Silakan lengkapi semua kolom kata sandi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('Kata sandi baru dan konfirmasi tidak cocok!');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback('Kata sandi baru minimal 6 karakter!');
      return;
    }

    setPasswordFeedback('Kata sandi berhasil diperbarui!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordFeedback(''), 3500);
  };

  if (isLoading) {
    return <ProfilLoading />;
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pengaturan Profil & Akun Pemohon
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola data penanggung jawab organisasi, nomor kontak verifikasi, dan keamanan akun SI-ORMAS.
        </p>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-lg text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Perubahan profil penanggung jawab berhasil disimpan!
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 select-none">
          MM
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{nama}</h2>
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-sky-300 dark:border-blue-800">
              {jabatan}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {userProfile.namaOrmas}
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            NIK: {nik} • {email} • WA: {telepon}
          </p>
        </div>
      </div>

      {/* Main Form: Profile PIC */}
      <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Informasi Penanggung Jawab / Pendaftar (PIC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identitas kontak yang akan dihubungi petugas Kesbangpol Mimika terkait proses verifikasi berkas dan peninjauan lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Nama Lengkap Pemohon (Sesuai KTP)
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              NIK (Nomor Induk Kependudukan)
            </label>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Jabatan dalam Organisasi
            </label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Nomor WhatsApp / HP Aktif
            </label>
            <input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Alamat Email Pemohon
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Alamat Tinggal Domisili
            </label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-98"
          >
            Simpan Perubahan Data
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Keamanan & Kata Sandi Akun
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbarui kata sandi untuk melindungi kerahasiaan dokumen legalitas Ormas Anda.
          </p>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold ${
              passwordFeedback.includes('berhasil')
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {passwordFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Ulangi Kata Sandi Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors text-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Preferensi Notifikasi Status Berkas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih jalur notifikasi saat status permohonan SKT mengalami perubahan atau memerlukan kelengkapan berkas.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Notifikasi WhatsApp Otomatis</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kirim pemberitahuan langsung ke nomor WhatsApp pemohon saat verifikator memperbarui berkas.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifWa}
              onChange={(e) => setNotifWa(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Notifikasi Email Resmi</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Terima salinan bukti pengajuan, jadwal peninjauan, dan dokumen SKT melalui email.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
