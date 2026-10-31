"use client";

import React, { useState, useEffect } from "react";
import { OrmasItem } from "@/types/ormas";
import { printOrmasDetailPdf, exportToCsv } from "@/utils/exportUtils";

interface OrmasDetailModalProps {
  ormas: OrmasItem | null;
  onClose: () => void;
}

export default function OrmasDetailModal({ ormas, onClose }: OrmasDetailModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (ormas) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [ormas, onClose]);

  if (!ormas) return null;

  const handleCopyNoSkt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ormas.noSkt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (!ormas) return;
    printOrmasDetailPdf({
      namaOrmas: ormas.nama,
      singkatan: ormas.singkatan,
      jenisOrmas: ormas.kategori || ormas.jenis,
      noSkt: ormas.noSkt,
      tanggalBerdiri: ormas.tanggalDaftar,
      ketuaUmum: ormas.ketua,
      alamat: ormas.alamat,
      distrik: ormas.distrik,
      telepon: ormas.telepon,
      statusSkt: ormas.status,
    });
  };

  const handleExportCsv = () => {
    if (!ormas) return;
    const headers = [
      'Nama Organisasi',
      'Singkatan',
      'Kategori/Jenis',
      'Nomor SKT',
      'Tanggal Terdaftar',
      'Ketua Umum',
      'Alamat',
      'Distrik',
      'Telepon',
      'Status',
    ];
    const rows = [
      [
        ormas.nama,
        ormas.singkatan || '',
        ormas.kategori || ormas.jenis,
        ormas.noSkt,
        ormas.tanggalDaftar,
        ormas.ketua,
        ormas.alamat,
        ormas.distrik,
        ormas.telepon,
        ormas.status,
      ],
    ];
    const safeName = ormas.nama.replace(/[^a-zA-Z0-9_-]/g, '_');
    exportToCsv(`Profil_Ormas_${safeName}`, headers, rows);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 md:p-6 overflow-y-auto modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 relative my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm z-10"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 pr-0.5 sm:pr-1 space-y-4 sm:space-y-6">
          {/* Institution Watermark / Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 pr-8">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-700"></div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                BAKESBANGPOL KABUPATEN MIMIKA • PROVINSI PAPUA TENGAH
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono text-slate-400 font-semibold">ID #{String(ormas.id).padStart(3, '0')}</span>
          </div>

          {/* Header Status & Type */}
          <div className="flex flex-wrap items-center gap-2.5">
            {ormas.status === "Resmi" ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                RESMI TERDAFTAR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                DALAM PROSES VERIFIKASI
              </span>
            )}

            <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {ormas.jenis}
            </span>

            <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Kategori: {ormas.kategori}
            </span>
          </div>

          {/* Ormas Title & Subtitle */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug font-heading">
              {ormas.nama}
            </h3>
            {ormas.singkatan && (
              <p className="text-sm font-bold text-blue-800 mt-1">
                Singkatan Resmi: <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">{ormas.singkatan}</span>
              </p>
            )}
          </div>

          {/* Detailed Information Grid */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200 space-y-4 text-sm">
            {/* SKT Card */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Nomor Surat Keterangan Terdaftar (SKT)
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-slate-900 mt-0.5 block select-all break-all">
                  {ormas.noSkt}
                </span>
              </div>
              <button
                onClick={handleCopyNoSkt}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tersalin!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Salin SKT
                  </>
                )}
              </button>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">Ketua Umum / Penanggung Jawab:</span>
                <span className="sm:col-span-2 font-bold text-slate-900 text-sm sm:text-base">{ormas.ketua}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">Wilayah / Distrik:</span>
                <span className="sm:col-span-2 font-semibold text-slate-800">Distrik {ormas.distrik}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">Alamat Sekretariat:</span>
                <span className="sm:col-span-2 text-slate-800 leading-relaxed font-medium">{ormas.alamat}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">Kontak Resmi:</span>
                <span className="sm:col-span-2 text-slate-800 font-mono font-medium">
                  {ormas.telepon ? (
                    <a href={`tel:${ormas.telepon}`} className="text-blue-800 hover:underline font-bold">
                      {ormas.telepon}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-200/60">
                <span className="font-bold text-slate-600">Tanggal Terdaftar:</span>
                <span className="sm:col-span-2 text-slate-800 font-semibold">{ormas.tanggalDaftar}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2">
                <span className="font-bold text-slate-600">Masa Berlaku Izin:</span>
                <span className="sm:col-span-2 text-slate-800">
                  <strong className="text-slate-900">5 Tahun</strong> terhitung sejak tanggal penerbitan SKT
                </span>
              </div>
            </div>
          </div>

          {/* Legal Regulatory Note */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="leading-relaxed">
              Data ini bersumber langsung dari register resmi Badan Kesatuan Bangsa dan Politik Kabupaten Mimika berdasarkan <strong>Undang-Undang No. 17 Tahun 2013</strong> dan <strong>Permendagri No. 57 Tahun 2017</strong>.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0 mt-4">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer w-full sm:w-auto"
            title="Unduh profil ormas ke format CSV"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ekspor CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Profil (PDF)
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer w-full sm:w-auto text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
