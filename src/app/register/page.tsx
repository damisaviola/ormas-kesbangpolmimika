"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [telepon, setTelepon] = useState("");
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

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap penanggung jawab wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Alamat email wajib diisi.");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Silakan masukkan kata sandi dan konfirmasi kata sandi.");
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
      // Menyimpan langsung ke tabel user_pengajuan di MySQL via Prisma Server Action
      const result = await registerUserAction({
        fullName: fullName.trim(),
        telepon: telepon.trim() || undefined,
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Pendaftaran gagal diproses.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        "Pendaftaran akun berhasil! Akun Anda telah resmi tersimpan di database. Silakan login untuk melengkapi profil organisasi kemasyarakatan Anda..."
      );
      setFullName("");
      setTelepon("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Alihkan ke halaman login setelah 1.5 detik
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Kesalahan saat registrasi ke database:", err);
      setErrorMessage("Gagal menghubungkan ke database MySQL. Pastikan koneksi server aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-slate-100 font-sans text-slate-900">
      {/* Responsive Centered Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-5">
        
        {/* Left Side: Branding Panel */}
        <div className="md:col-span-2 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-4 flex flex-col items-center pt-2">
            {/* Logo Badge */}
            <div className="bg-white p-3 rounded-2xl shadow-xs inline-block">
              <Image
                src="/assets/pic/Lambang_Kabupaten_Mimika.jpg"
                alt="Lambang Kabupaten Mimika"
                width={64}
                height={64}
                priority
                className="h-16 w-auto object-contain"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-black tracking-tight leading-snug">
                Pendaftaran Akun Pemohon
              </h1>
              <p className="text-xs text-sky-100 font-medium leading-relaxed">
                Portal Pelayanan Mandiri Ormas <br />
                Badan Kesbangpol Kabupaten Mimika
              </p>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Kembali ke <strong>Beranda</strong></span>
            </Link>
          </div>
        </div>

        {/* Right Side: Form Registrasi */}
        <div className="md:col-span-3 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Buat Akun Pemohon Baru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi data pemohon di bawah ini. Profil nama ormas dan berkas legalitas dapat Anda lengkapi setelah berhasil login.
              </p>
            </div>

            {/* Notifikasi Pesan Error */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Notifikasi Pesan Sukses */}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Nama Lengkap Penanggung Jawab */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Lengkap Pemohon / Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Yohanes Maturbongs"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              {/* Field 2: Kontak WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="Contoh: 0812-4099-8877"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Alamat E-Mail Resmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 3: Password & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Ulangi Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Mendaftarkan Akun ke Database...</span>
                    </>
                  ) : (
                    <span>Daftarkan Akun Pemohon</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Login Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Sudah memiliki akun? </span>
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Login ke Sistem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
