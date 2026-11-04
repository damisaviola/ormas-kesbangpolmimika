import Image from "next/image";
import Link from "next/link";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-28 sm:pt-32 pb-20 sm:pb-24 overflow-hidden border-b border-slate-800 bg-slate-950"
    >
      {/* Background Image Pemda dengan Ambient Glow & Matte Overlay */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src="/assets/pic/pemda.jpeg"
          alt="Gedung Pemda Mimika"
          fill
          priority
          sizes="100vw"
          quality={75}
          className="object-cover object-center opacity-30 transform-gpu scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradient Overlay untuk Kedalaman Visual yang Elegan */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950"></div>
        {/* Radial Soft Ambient Light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] sm:h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Main Hero Title - Proporsi Pas & Estetik */}
        <RevealOnScroll animation="fade-up" duration={600} delay={100}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold text-white tracking-tight leading-[1.22] font-heading max-w-3xl mx-auto">
            Sistem Pelayanan &amp; Legalitas <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent inline-block mt-1">
              Organisasi Kemasyarakatan
            </span>
          </h1>
        </RevealOnScroll>

        {/* Action Buttons - Desain Bersih & Ergonomis */}
        <RevealOnScroll animation="fade-up" duration={600} delay={200}>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#daftar-ormas"
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm border border-blue-500/80 shadow-md transition-all duration-150 hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Cari Direktori Ormas</span>
            </a>

            <a
              href="#alur-syarat"
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700/90 shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Alur &amp; Syarat SKT</span>
            </a>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all duration-150 active:scale-[0.98]"
            >
              <span>Daftar Akun Ormas</span>
              <span className="text-sky-300">&rarr;</span>
            </Link>
          </div>
        </RevealOnScroll>

        {/* Feature Badges Row - Mini Highlights di Bawah Tombol */}
        <RevealOnScroll animation="fade-up" duration={600} delay={280}>
          <div className="pt-6 sm:pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Pengajuan Mandiri &amp; Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Legalitas Terdata Resmi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>SOP Layanan 5–7 Hari Kerja</span>
            </div>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
}
