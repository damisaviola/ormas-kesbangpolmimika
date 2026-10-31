export default function RegistrationFlow() {
  return (
    <section id="alur-syarat" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Alur &amp; Syarat Penerbitan SKT
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Prosedur resmi penerbitan Surat Keterangan Terdaftar (SKT) Organisasi Kemasyarakatan di Kabupaten Mimika sesuai Permendagri No. 57 Tahun 2017.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-7 relative">
          {/* Step 1 */}
          <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors duration-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base">
              01
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors">Persiapan Berkas</h3>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Menyiapkan Akta Notaris, NPWP, AD/ART, SK Susunan Pengurus, Surat Domisili Kesbangpol, dan Pas Foto Ketua &amp; Sekretaris.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors duration-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base">
              02
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors">Registrasi Online</h3>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Mengisi formulir pendaftaran digital di portal SI-ORMAS Meno Sodak Kanda serta mengunggah seluruh dokumen persyaratan format PDF/JPG.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors duration-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base">
              03
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors">Verifikasi Lapangan</h3>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Tim verifikator Badan Kesbangpol Mimika melakukan validasi keabsahan dokumen dan peninjauan fisik langsung ke kantor sekretariat.
            </p>
          </div>

          {/* Step 4 */}
          <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors duration-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base">
              04
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors">Penerbitan SKT</h3>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              Surat Keterangan Terdaftar (SKT) resmi ditandatangani, dicatat dalam basis data daerah Mimika, dan siap diunduh secara legal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
