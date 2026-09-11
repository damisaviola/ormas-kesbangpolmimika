import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="kontak" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Institutional Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/pic/logo_kabupatenmimika_removebg.png"
                alt="Lambang Kabupaten Mimika"
                width={48}
                height={48}
                className="h-12 w-auto object-contain"
              />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Pemerintah Kabupaten Mimika
                </p>
                <h3 className="text-sm font-black text-white uppercase tracking-wider leading-tight">
                  Badan Kesatuan Bangsa dan Politik
                </h3>
                <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
                  Provinsi Papua Tengah
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Informasi Pelayanan &amp; Pendaftaran Organisasi Kemasyarakatan (SI-ORMAS) merupakan portal keterbukaan informasi dan legalitas ormas di wilayah Kabupaten Mimika.
            </p>
          </div>

          {/* Column 2: Navigasi Layanan (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Layanan &amp; Informasi
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#beranda" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">›</span> Beranda Utama
                </a>
              </li>
              <li>
                <a href="#statistik" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">›</span> Statistik Ormas Terdaftar
                </a>
              </li>
              <li>
                <a href="#daftar-ormas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">›</span> Direktori &amp; Pencarian Ormas
                </a>
              </li>
              <li>
                <a href="#alur-syarat" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">›</span> Syarat &amp; Alur Pendaftaran SKT
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span className="text-blue-500">›</span> Portal Login Pengurus / Petugas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Jam Pelayanan & Kontak (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Lokasi &amp; Jam Pelayanan
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div>
                <p className="font-semibold text-slate-300">Kantor Bakesbangpol Kab. Mimika</p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Pusat Pemerintahan Kabupaten Mimika, Jl. Cenderawasih SP3 - Kuala Kencana, Timika, Papua Tengah 99910.
                </p>
              </div>

              <div className="pt-1">
                <p className="font-semibold text-slate-300">Jam Operasional (WIT):</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Senin – Kamis: 08.00 – 15.30 WIT</p>
                <p className="text-[11px] text-slate-400">Jumat: 08.00 – 14.30 WIT</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Sabtu, Minggu &amp; Libur Nasional Tutup)</p>
              </div>
            </div>
          </div>

          {/* Column 4: Kontak & Tautan Luar (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Hubungi Kami
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Telepon Kantor</span>
                <a href="tel:076621057" className="text-slate-200 font-semibold hover:text-blue-400 transition-colors">
                  (0766) 21057
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Resmi</span>
                <a href="mailto:kesbangpol@mimikakab.go.id" className="text-slate-200 font-semibold hover:text-blue-400 transition-colors break-all">
                  kesbangpol@mimikakab.go.id
                </a>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Portal Daerah</span>
                <a
                  href="https://mimikakab.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors block"
                >
                  mimikakab.go.id ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Badan Kesatuan Bangsa dan Politik Kabupaten Mimika. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-2 font-medium text-slate-400 text-[11px]">
            <span>SI-ORMAS MIMIKA</span>
            <span>•</span>
            <span className="text-slate-300">MENO SODAK KANDA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
