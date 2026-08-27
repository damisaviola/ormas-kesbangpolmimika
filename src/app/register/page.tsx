"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Silakan lengkapi seluruh kolom pendaftaran.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Pendaftaran akun berhasil! Silakan login untuk melanjutkan.");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-slate-100 font-sans text-slate-900">
      {/* Responsive Centered Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Tight-Gapped Compact Branding Panel */}
        <div className="bg-sky-500 text-white p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6">
          {/* Logo Badge */}
          <div className="bg-white p-2.5 rounded-2xl shadow-xs inline-block">
            <Image
              src="/assets/pic/Lambang_Kabupaten_Mimika.jpg"
              alt="Lambang Kabupaten Mimika"
              width={60}
              height={60}
              priority
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug">
              Pendaftaran Organisasi <br className="hidden sm:inline" /> Kesbangpol Mimika
            </h1>
            <p className="text-[11px] sm:text-xs text-sky-100 font-medium">
              SI-ORMAS • Kabupaten Mimika
            </p>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Kembali ke <strong className="font-bold">Beranda</strong></span>
            </Link>
          </div>
        </div>

        {/* Right Side: Simple Clean Registration Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white space-y-5 sm:space-y-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-500 tracking-tight">
                Daftar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                Buat akun baru untuk pengajuan legalitas ORMAS
              </p>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Penanggung Jawab"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 2: Alamat E-Mail */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Alamat E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: akun@mimikakab.go.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 3: Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-medium text-sky-600 hover:underline"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat Password"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 4: Ulangi Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Ulangi Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 min-h-[44px]"
                >
                  {isLoading ? "Memproses..." : "Daftar"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Login Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Sudah memiliki akun? </span>
            <Link href="/login" className="font-bold text-sky-600 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
