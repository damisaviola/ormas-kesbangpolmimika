export default function RegistrationFlow() {
  return (
    <section id="alur-syarat" className="py-16 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Panduan Layanan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Alur &amp; Syarat Pendaftaran Surat Keterangan Terdaftar (SKT)
          </h2>
          <p className="text-sm text-slate-600">
            Prosedur resmi penerbitan tanda terdaftar Organisasi Kemasyarakatan di Kabupaten Mimika sesuai Permendagri &amp; Peraturan Perundang-undangan.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs transition-colors duration-200">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Persiapan Berkas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menyiapkan Akta Notaris, NPWP, AD/ART, SK Pengurus, Surat Keterangan Domisili Kesbangpol, dan Pas Foto Ketua.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs transition-colors duration-200">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Registrasi Online</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengisi formulir pendaftaran digital di SI-ORMAS Meno Sodak Kanda &amp; mengunggah kelengkapan dokumen persyaratan.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs transition-colors duration-200">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Verifikasi Lapangan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tim verifikasi Kesbangpol Kabupaten Mimika melakukan peninjauan administrasi dan pengecekan fisik sekretariat Ormas.
            </p>
          </div>

          {/* Step 4 */}
          <div className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors duration-200">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Penerbitan SKT</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surat Keterangan Terdaftar (SKT) resmi diterbitkan dan dicatat dalam database nasional Kesbangpol Mimika.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
