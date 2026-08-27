import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="beranda" className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden border-b border-slate-200/60 bg-slate-900">
      {/* Background Image Pemda - Lightweight Optimized */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src="/assets/pic/pemda.jpeg"
          alt="Gedung Pemda Mimika"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center opacity-85"
        />
        {/* Static gradient overlay for crisp white text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in-up">
        {/* Main Hero Title - Pure Solid White */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
          Sistem Layanan <br />
          <span className="text-white">
            Organisasi Kemasyarakatan
          </span>
        </h1>

        {/* Action Buttons - Fast Snappy Hover */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#daftar-ormas"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Cari Data Ormas</span>
          </a>
          <a
            href="#alur-syarat"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white font-semibold text-sm border border-white/30 hover:border-white/60 transition-all duration-200 active:scale-95 shadow-md"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Syarat &amp; Alur Pendaftaran</span>
          </a>
        </div>
      </div>
    </section>
  );
}
