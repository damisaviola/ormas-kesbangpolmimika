"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUserAction } from "@/actions/auth";

import { getRegisteredUsers, updateRegisteredUser } from "@/utils/userStorage";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Silakan isi Alamat E-Mail dan Password Anda.");
      return;
    }

    setIsLoading(true);

    try {
      // Memanggil Server Action untuk memeriksa kredensial ke database MySQL
      const result = await loginUserAction({ username, password });

      if (!result.success || !result.user) {
        setErrorMessage(result.error || "Login gagal. Periksa kembali email dan kata sandi Anda.");
        setIsLoading(false);
        return;
      }

      // Simpan informasi sesi login ke localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("kesbangpol_user", JSON.stringify(result.user));
      }

      // Sinkronisasi status terakhir login ke userStorage jika ada di mock
      const users = getRegisteredUsers();
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === username.trim().toLowerCase() ||
          u.nama.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched) {
        const now = new Date();
        const formattedDate =
          now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) +
          ', ' +
          now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }) +
          ' WIT';

        updateRegisteredUser({
          ...matched,
          terakhirLogin: formattedDate,
        });
      }

      // Pembeda otomatis berdasarkan Role di Database:
      // Jika role adalah Admin (superadmin / verifikator) -> langsung ke /dashboard
      // Jika role adalah Ormas (admin_ormas) -> langsung ke /dashboard-ormas
      if (result.user.role === "superadmin" || result.user.role === "verifikator") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard-ormas");
      }
    } catch (err) {
      console.error("Kesalahan koneksi login:", err);
      setErrorMessage("Gagal menghubungkan ke server. Pastikan service MySQL di XAMPP/Laragon aktif.");
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
                Portal Pelayanan Ormas <br className="hidden sm:inline" /> Kesbangpol Mimika
              </h1>
              <p className="text-[11px] sm:text-xs text-sky-100 font-medium">
                Satu Pintu Masuk untuk Administrator <br className="hidden sm:inline" /> & Pemohon Organisasi
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-sky-600/60 rounded-xl p-3.5 border border-sky-400/40 text-left text-xs space-y-1.5 text-sky-50 w-full">
            <p className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <svg className="w-4 h-4 text-sky-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Otentikasi Terpadu
            </p>
            <p className="text-[11px] text-sky-100/90 leading-relaxed">
              Sistem akan otomatis mendeteksi peran akun Anda dari database dan mengarahkan langsung ke dashboard yang sesuai.
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
              <span>Kembali ke <strong>Beranda</strong></span>
            </Link>
          </div>
        </div>

        {/* Right Side: Single Unified Login Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-500 tracking-tight">
                Masuk ke Sistem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                Gunakan alamat email dan kata sandi yang telah terdaftar
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Field Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Alamat E-Mail
                </label>
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Field Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-medium text-sky-600 hover:underline cursor-pointer"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Submit Button */}
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
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <span>Masuk ke Sistem</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Registration Note */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Belum memiliki akun? </span>
            <Link href="/register" className="font-bold text-sky-600 hover:underline">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
