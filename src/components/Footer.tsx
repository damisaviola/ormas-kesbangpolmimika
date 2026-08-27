import Image from "next/image";

export default function Footer() {
  return (
    <footer id="kontak" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Office Info */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/pic/logo_kabupatenmimika_removebg.png"
                alt="Lambang Kabupaten Mimika"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  KESBANGPOL
                </h3>
                <p className="text-xs text-slate-300 font-medium">Kabupaten Mimika</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kantor Pusat Pemerintahan Kabupaten Mimika, <br />
              Jln. Cendrawasih SP3 - Kuala Kencana, Mimika, Papua Tengah <br />
              Telepon: (0766) 21057 | Email: kesbangpol@mimikakab.go.id
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Link Eksternal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://mimikakab.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                  Website Resmi Pemkab Mimika
                </a>
              </li>
              <li>
                <a href="https://kesbangpolmimika.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                  Website Kesbangpol Mimika
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center md:flex md:items-center md:justify-between text-xs text-slate-500">
          <p>© 2026 Badan Kesatuan Bangsa dan Politik Kabupaten Mimika. All rights reserved.</p>
          <p className="mt-2 md:mt-0 font-medium">SI-ORMAS • MENO SODAK KANDA</p>
        </div>
      </div>
    </footer>
  );
}
