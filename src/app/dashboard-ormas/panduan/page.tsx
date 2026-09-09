'use client';

import React from 'react';
import Link from 'next/link';

export default function OrmasPanduanPage() {
  const steps = [
    {
      stepNumber: 1,
      title: 'Pengisian Identitas Organisasi (Metadata)',
      category: 'Tahap 1 • Identitas Pokok',
      badge: 'Langkah Awal',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      description:
        'Buka menu Organisasi dan klik tombol "Ajukan" untuk mengisi formulir pendaftaran awal identitas organisasi Anda.',
      items: [
        'Nama Lengkap Organisasi Kemasyarakatan',
        'Nama Singkat / Singkatan Resmi Organisasi',
        'Jenis Organisasi (Pilihan: ORMAS atau FKUB)',
        'Alamat Lengkap Kantor / Sekretariat di wilayah Kabupaten Mimika',
        'Kode Pos wilayah sekretariat (contoh: 99910)',
        'Nomor Telepon / WhatsApp aktif penanggung jawab untuk koordinasi verifikasi',
      ],
    },
    {
      stepNumber: 2,
      title: 'Unggah 8 Dokumen Persyaratan Administrasi',
      category: 'Tahap 2 • Berkas Legalitas',
      badge: 'Format PDF (Max 1MB)',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      description:
        'Masuk ke Tab Dokumen pada halaman Organisasi, lalu unggah 8 dokumen legalitas format PDF dengan resolusi jelas dan ukuran maksimal 1 MB:',
      items: [
        '1. Logo Organisasi (Dokumen PDF lambang resmi)',
        '2. Scan Foto Kantor / Sekretariat Tampak Depan (Memuat papan nama)',
        '3. Scan Akta Notaris Pendirian Ormas',
        '4. Scan NPWP Badan Organisasi atas nama Ormas',
        '5. Anggaran Dasar dan Anggaran Rumah Tangga (AD / ART)',
        '6. Scan Dokumen Program Kerja Organisasi',
        '7. Scan Bukti Kepemilikan atau Surat Perjanjian Kontrak / Ijin Pakai Kantor',
        '8. Scan Surat Keputusan (SK) Susunan Pengurus sesuai AD/ART',
      ],
    },
    {
      stepNumber: 3,
      title: 'Pengisian Surat Permohonan & Berkas Kelengkapan Surat',
      category: 'Tahap 3 • Dokumen Surat',
      badge: 'Surat Resmi & Materai',
      badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      description:
        'Masuk ke Tab Surat pada halaman Organisasi untuk menginput nomor/tanggal surat dan mengunggah dokumen surat kelengkapan resmi:',
      items: [
        'Surat Permohonan Pendaftaran resmi (Diinput Nomor & Tanggal Surat serta file PDF)',
        'Surat Keterangan Domisili Sekretariat dari Lurah / Kepala Kampung setempat',
        'Scan Formulir Isian Data Organisasi (Ditandatangani Ketua & Sekretaris)',
        'Scan Surat Pernyataan Kesetiaan NKRI sesuai Permendagri No. 57 Tahun 2017 (Bermaterai 10.000)',
        'Scan Surat Keabsahan Kepengurusan Organisasi',
        'Surat Pengantar Keabsahan dari Kesbangpol Provinsi / Kab / Kota',
        'Surat Pengesahan / Terdaftar di Kemenkumham / Kemendagri (Bila Ada)',
      ],
    },
    {
      stepNumber: 4,
      title: 'Input Data Pengurus Inti & Daftar Anggota',
      category: 'Tahap 4 • Struktur Organisasi',
      badge: 'Ketua, Sekretaris, Bendahara',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      description:
        'Lengkapi penanggung jawab dan struktur kepengurusan ormas pada Tab Pengurus dan Tab Anggota:',
      items: [
        'Tab Pengurus: Masukkan nama lengkap Ketua Umum, Sekretaris, dan Bendahara',
        'Unggah Pas Foto Berwarna 4x6 (Format PDF Max 1Mb)',
        'Unggah Scan KTP Elektronik Pengurus Inti (Format PDF Max 1Mb)',
        'Unggah Dokumen Biodata / Riwayat Hidup Pengurus Inti',
        'Tab Anggota: Tambahkan daftar nama anggota, jenis kelamin, tanggal lahir, dan jabatan',
      ],
    },
    {
      stepNumber: 5,
      title: 'Pemeriksaan Verifikator & Peninjauan Faktual Lapangan',
      category: 'Tahap 5 • Proses Kesbangpol',
      badge: 'Verifikasi Lapangan',
      badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      description:
        'Setelah seluruh berkas tersimpan dan berstatus Diajukan, tim Badan Kesbangpol Mimika akan memproses verifikasi:',
      items: [
        'Verifikasi Administrasi Daring: Petugas memeriksa keabsahan notaris, kesesuaian AD/ART, dan surat resmi (1-3 hari kerja)',
        'Catatan Perbaikan (Jika ada): Pemohon dapat memperbaiki berkas sesuai arahan di sistem',
        'Penjadwalan Peninjauan Lapangan: Petugas mengonfirmasi jadwal peninjauan kantor sekretariat',
        'Verifikasi Faktual Lapangan: Tim Kesbangpol meninjau fisik kantor sekretariat, papan nama, dan susunan pengurus',
      ],
    },
    {
      stepNumber: 6,
      title: 'Pengesahan & Penerbitan Surat Keterangan Terdaftar (SKT)',
      category: 'Tahap 6 • Selesai & Terdaftar',
      badge: 'SKT Terbit Resmi',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      description:
        'Tahap akhir dari alur pendaftaran Ormas di Badan Kesbangpol Kabupaten Mimika:',
      items: [
        'Penandatanganan Surat Keterangan Terdaftar (SKT) resmi oleh Kepala Badan Kesbangpol Kabupaten Mimika',
        'Organisasi resmi terdaftar dan terdata dalam database direktori Ormas Kabupaten Mimika',
        'Pemohon menerima dokumen fisik SKT dan dapat mengunduh bukti tanda terima pendaftaran resmi secara online',
        'Masa berlaku SKT selama 5 (lima) tahun dan dapat diperpanjang sesuai ketentuan perundang-undangan',
      ],
    },
  ];

  return (
    <div className="space-y-8 w-full pb-16 font-sans">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded border border-blue-200/80 dark:border-blue-800">
              Panduan Resmi Ormas
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
              100% Bebas Biaya
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Alur & Tahapan Pengajuan SKT Ormas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Ikuti 6 langkah alur resmi pengurusan Surat Keterangan Terdaftar (SKT) di Badan Kesatuan Bangsa dan Politik Kabupaten Mimika.
          </p>
        </div>

        <Link
          href="/dashboard-ormas/organisasi"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 shrink-0 self-start sm:self-auto"
        >
          <span>Mulai Isi Pengajuan</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Main Responsive Timeline Container */}
      <div className="relative">
        {/* Continuous Connecting Line (Responsive Left on Mobile, Aligned on Desktop) */}
        <div className="absolute top-8 bottom-8 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-blue-600 via-purple-500 via-amber-500 to-emerald-500 z-0" />

        <div className="space-y-8 relative z-10">
          {steps.map((step) => (
            <div key={step.stepNumber} className="relative flex items-start gap-4 sm:gap-6 group">
              {/* Step Number Circle / Node */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base sm:text-xl shrink-0 shadow-lg shadow-blue-500/10 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {step.stepNumber}
              </div>

              {/* Step Card Content (100% Mobile Responsive) */}
              <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {step.category}
                    </span>
                    <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {step.title}
                    </h2>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border self-start sm:self-auto shrink-0 ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Checklist / Requirement Items */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Rincian & Dokumen yang Diperlukan:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {step.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-snug">{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black tracking-tight">
            Sudah Mempersiapkan Seluruh Berkas Pendaftaran?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Langsung akses formulir pengajuan legalitas organisasi Anda di menu Organisasi untuk diverifikasi oleh Badan Kesbangpol Kabupaten Mimika.
          </p>
        </div>

        <Link
          href="/dashboard-ormas/organisasi"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 shrink-0 text-center"
        >
          <span>Mulai Isi Pengajuan Sekarang</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
