import RevealOnScroll from "@/components/animations/RevealOnScroll";

export default function RegistrationFlow() {
  return (
    <section id="alur-syarat" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll animation="fade-up" duration={500}>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
              Alur &amp; Syarat Penerbitan SKT
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Prosedur resmi penerbitan Surat Keterangan Terdaftar (SKT) Organisasi Kemasyarakatan di Kabupaten Mimika sesuai Permendagri No. 57 Tahun 2017.
            </p>
          </div>
        </RevealOnScroll>

        {/* Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-7 relative">
          {/* Step 1 */}
          <RevealOnScroll animation="fade-up" delay={80} duration={550}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  01
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors mt-4">
                  Persiapan Berkas
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mt-2">
                  Menyiapkan Akta Notaris, NPWP, AD/ART, SK Susunan Pengurus, Surat Domisili Kesbangpol, dan Pas Foto Ketua &amp; Sekretaris.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Step 2 */}
          <RevealOnScroll animation="fade-up" delay={180} duration={550}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  02
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors mt-4">
                  Registrasi Online
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mt-2">
                  Mengisi formulir pendaftaran digital di portal SI-ORMAS Meno Sodak Kanda serta mengunggah seluruh dokumen persyaratan format PDF/JPG.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Step 3 */}
          <RevealOnScroll animation="fade-up" delay={280} duration={550}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  03
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors mt-4">
                  Verifikasi Lapangan
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mt-2">
                  Tim verifikator Badan Kesbangpol Mimika melakukan validasi keabsahan dokumen dan peninjauan fisik langsung ke kantor sekretariat.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Step 4 */}
          <RevealOnScroll animation="fade-up" delay={380} duration={550}>
            <div className="group bg-slate-50 hover:bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  04
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading group-hover:text-emerald-700 transition-colors mt-4">
                  Penerbitan SKT
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mt-2">
                  Surat Keterangan Terdaftar (SKT) resmi ditandatangani, dicatat dalam basis data daerah Mimika, dan siap diunduh secara legal.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
