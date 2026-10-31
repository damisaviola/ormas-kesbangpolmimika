import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="beranda" className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Background Image Pemda - Clean Matte Finish */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src="/assets/pic/pemda.jpeg"
          alt="Gedung Pemda Mimika"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center opacity-40"
        />
        {/* Solid matte overlay (non-glossy) */}
        <div className="absolute inset-0 bg-slate-950/75"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in-up">
        {/* Main Hero Title - Solid Clean Matte White */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[76px] font-extrabold text-white tracking-tight leading-[1.1] font-heading">
          Sistem Pelayanan &amp; Legalitas <br />
          <span className="text-white">
            Organisasi Kemasyarakatan
          </span>
        </h1>

        {/* Action Buttons - Solid Matte Style (Non-Glossy) */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <a
            href="#daftar-ormas"
            className="inline-flex items-center gap-3 px-8 sm:px-9 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg border border-blue-500 shadow-sm transition-colors duration-150 active:scale-98"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Cari Data Ormas</span>
          </a>
          <a
            href="#alur-syarat"
            className="inline-flex items-center gap-3 px-8 sm:px-9 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base sm:text-lg border border-slate-700 shadow-sm transition-colors duration-150 active:scale-98"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Alur &amp; Syarat SKT</span>
          </a>
        </div>
      </div>
    </section>
  );
}
