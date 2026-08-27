export default function StatsDashboard() {
  return (
    <section id="statistik" className="py-14 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded border border-blue-200/60">
              Ringkasan Data
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Statistik Organisasi Kemasyarakatan
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Data terintegrasi secara langsung dari basis data Badan Kesatuan Bangsa dan Politik Kabupaten Mimika.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Total Organisasi */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Organisasi</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-2 group-hover:text-blue-900 transition-colors">
                  121
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs transition-colors duration-200">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Total akumulasi terdaftar</span>
              <span className="font-semibold text-blue-800">Semua Kategori</span>
            </div>
          </div>

          {/* Card 2: Jumlah Dalam Proses */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Dalam Proses Didaftarkan</p>
                <p className="text-4xl font-extrabold text-amber-600 mt-2">
                  14
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs transition-colors duration-200">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Sedang tahap verifikasi</span>
              <span className="font-semibold text-amber-700">Proses Berkas</span>
            </div>
          </div>

          {/* Card 3: Jumlah Resmi / Terverifikasi */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Jumlah Organisasi Resmi</p>
                <p className="text-4xl font-extrabold text-emerald-600 mt-2">
                  107
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs transition-colors duration-200">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Memiliki SKT / Legalitas Aktif</span>
              <span className="font-semibold text-emerald-700">Terverifikasi SKT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
