"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth";

import { registerAccountFromForm } from "@/utils/userStorage";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Memanggil Server Action untuk menyimpan langsung ke database MySQL via Prisma
      const result = await registerUserAction({
        fullName,
        email,
        password,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Pendaftaran gagal diproses.");
        setIsLoading(false);
        return;
      }

      // Simpan juga ke userStorage agar data pengguna di mock admin tersinkronisasi
      registerAccountFromForm(fullName, email, password);

      setSuccessMessage(
        "Pendaftaran berhasil! Akun Anda telah tersimpan di database sistem SI-ORMAS. Mengalihkan ke halaman login..."
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Alihkan ke halaman login setelah 1.5 detik
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Kesalahan saat registrasi:", err);
      setErrorMessage("Gagal menghubungkan ke database MySQL. Pastikan server lokal aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-slate-100 font-sans text-slate-900">
      {/* Responsive Centered Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Branding Panel */}
        <div className="bg-sky-500 text-white p-6 sm:p-8 md:p-10 flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-4 flex flex-col items-center pt-2">
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
                Pendaftaran Akun <br className="hidden sm:inline" /> Kesbangpol Mimika
              </h1>
              <p className="text-[11px] sm:text-xs text-sky-100 font-medium">
                Badan Kesatuan Bangsa dan Politik <br />
                Kabupaten Mimika, Papua Tengah
              </p>
            </div>
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
              <span>Kembali ke <strong>Beranda</strong></span>
            </Link>
          </div>
        </div>

        {/* Right Side: Form Registrasi Sederhana */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-500 tracking-tight">
                Formulir Pendaftaran
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                Lengkapi formulir di bawah ini untuk membuat akun baru
              </p>
            </div>

            {/* Notifikasi Pesan Error */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Notifikasi Pesan Sukses */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Lengkap Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Maria Magdalena Maparey"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 2: Alamat E-Mail */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Alamat E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 3: Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-medium text-sky-600 hover:underline cursor-pointer"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field 4: Konfirmasi Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ulangi Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Sekarang</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Login Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Sudah memiliki akun? </span>
            <Link href="/login" className="font-bold text-sky-600 hover:underline">
              Login ke Sistem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
