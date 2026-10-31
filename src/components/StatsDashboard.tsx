import RevealOnScroll from "@/components/animations/RevealOnScroll";
import CountUpNumber from "@/components/animations/CountUpNumber";

export default function StatsDashboard() {
  return (
    <section id="statistik" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
                Statistik Organisasi Kemasyarakatan
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
              Data terintegrasi secara langsung dan real-time dari basis data pelayanan Badan Kesatuan Bangsa dan Politik Kabupaten Mimika.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Total Organisasi */}
          <RevealOnScroll animation="fade-up" delay={80} duration={600}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-600">Jumlah Organisasi</p>
                  <p className="text-5xl sm:text-6xl font-black text-slate-900 mt-3 font-heading group-hover:text-blue-900 transition-colors">
                    <CountUpNumber end={121} />
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span>Total akumulasi terdaftar</span>
                <span className="font-bold text-blue-900">Semua Kategori</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 2: Jumlah Dalam Proses */}
          <RevealOnScroll animation="fade-up" delay={180} duration={600}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-amber-800">Dalam Proses Verifikasi</p>
                  <p className="text-5xl sm:text-6xl font-black text-amber-600 mt-3 font-heading">
                    <CountUpNumber end={14} />
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span>Sedang tahap validasi berkas</span>
                <span className="font-bold text-amber-800">Proses Berkas</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 3: Jumlah Resmi / Terverifikasi */}
          <RevealOnScroll animation="fade-up" delay={280} duration={600} className="sm:col-span-2 lg:col-span-1">
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-800">Organisasi Resmi Aktif</p>
                  <p className="text-5xl sm:text-6xl font-black text-emerald-600 mt-3 font-heading">
                    <CountUpNumber end={107} />
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span>Memiliki SKT / Berbadan Hukum</span>
                <span className="font-bold text-emerald-800">Terverifikasi SKT</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
