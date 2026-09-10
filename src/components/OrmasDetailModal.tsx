"use client";

import React, { useState, useEffect } from "react";
import { OrmasItem } from "@/types/ormas";

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
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 overflow-y-auto modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative my-auto modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        {/* Institution Watermark / Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-700"></div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              BAKESBANGPOL KABUPATEN MIMIKA • PROVINSI PAPUA TENGAH
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">ID #{String(ormas.id).padStart(3, '0')}</span>
        </div>

        {/* Header Status & Type */}
        <div className="flex flex-wrap items-center gap-2.5">
          {ormas.status === "Resmi" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              RESMI TERDAFTAR
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              DALAM PROSES VERIFIKASI
            </span>
          )}

          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {ormas.jenis}
          </span>

          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Kategori: {ormas.kategori}
          </span>
        </div>

        {/* Ormas Title & Subtitle */}
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {ormas.nama}
          </h3>
          {ormas.singkatan && (
            <p className="text-sm font-bold text-blue-800 mt-1">
              Singkatan Resmi: <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">{ormas.singkatan}</span>
            </p>
          )}
        </div>

        {/* Detailed Information Grid */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
          {/* SKT Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Nomor Surat Keterangan Terdaftar (SKT)
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block select-all">
                {ormas.noSkt}
              </span>
            </div>
            <button
              onClick={handleCopyNoSkt}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                copied
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersalin!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Salin SKT
                </>
              )}
            </button>
          </div>

          {/* Key-Value Details */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-500">Ketua Umum / Penanggung Jawab:</span>
              <span className="sm:col-span-2 font-bold text-slate-900 text-sm">{ormas.ketua}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-500">Wilayah / Distrik:</span>
              <span className="sm:col-span-2 font-semibold text-slate-800">Distrik {ormas.distrik}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-500">Alamat Sekretariat:</span>
              <span className="sm:col-span-2 text-slate-800 leading-relaxed font-medium">{ormas.alamat}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-500">Kontak Resmi:</span>
              <span className="sm:col-span-2 text-slate-800 font-mono font-medium">
                {ormas.telepon ? (
                  <a href={`tel:${ormas.telepon}`} className="text-blue-800 hover:underline">
                    {ormas.telepon}
                  </a>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-500">Tanggal Terdaftar:</span>
              <span className="sm:col-span-2 text-slate-800 font-semibold">{ormas.tanggalDaftar}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5">
              <span className="font-bold text-slate-500">Masa Berlaku Izin:</span>
              <span className="sm:col-span-2 text-slate-800">
                <strong className="text-slate-900">5 Tahun</strong> terhitung sejak tanggal penerbitan SKT
              </span>
            </div>
          </div>
        </div>

        {/* Legal Regulatory Note */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="leading-relaxed">
            Data ini bersumber dari register resmi Badan Kesatuan Bangsa dan Politik Kabupaten Mimika berdasarkan <strong>Undang-Undang No. 17 Tahun 2013</strong> dan <strong>Permendagri No. 57 Tahun 2017</strong>.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Profil
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
