"use client";

import { useState, useMemo } from "react";
import { OrmasItem } from "@/types/ormas";
import { INITIAL_ORMAS_DATA } from "@/data/ormas-data";
import OrmasDetailModal from "@/components/OrmasDetailModal";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

interface OrmasDirectoryProps {
  onSelectOrmas?: (ormas: OrmasItem) => void;
}

export default function OrmasDirectory({ onSelectOrmas }: OrmasDirectoryProps) {
  const [internalSelectedOrmas, setInternalSelectedOrmas] = useState<OrmasItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const handleSelectOrmas = (item: OrmasItem) => {
    if (onSelectOrmas) {
      onSelectOrmas(item);
    } else {
      setInternalSelectedOrmas(item);
    }
  };

  // Filtered Ormas List
  const filteredOrmas = useMemo(() => {
    return INITIAL_ORMAS_DATA.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.singkatan && item.singkatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.noSkt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === "semua"
          ? true
          : selectedStatus === "resmi"
            ? item.status === "Resmi"
            : item.status === "Dalam Proses";

      const matchCategory =
        selectedCategory === "semua" ? true : item.kategori === selectedCategory;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [searchQuery, selectedStatus, selectedCategory]);

  return (
    <section id="daftar-ormas" className="py-16 bg-slate-50 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Controls Bar */}
        <RevealOnScroll animation="fade-up" duration={500}>
          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                Direktori Organisasi Kemasyarakatan
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1.5">
                Pencarian publik dan basis data legalitas ORMAS terdaftar resmi di Kabupaten Mimika.
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${viewMode === "table"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Tabel
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${viewMode === "grid"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Kartu
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t border-slate-100">
            {/* Live Search Bar */}
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama organisasi, singkatan, alamat, atau nomor SKT..."
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="sm:col-span-3 flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setSelectedStatus("semua")}
                className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedStatus === "semua" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedStatus("resmi")}
                className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedStatus === "resmi" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Resmi
              </button>
              <button
                onClick={() => setSelectedStatus("proses")}
                className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedStatus === "proses" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Proses
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800"
              >
                <option value="semua">Semua Kategori</option>
                <option value="Adat & Kesukuan">Adat &amp; Kesukuan</option>
                <option value="Kepemudaan">Kepemudaan (OKP)</option>
                <option value="Keagamaan">Keagamaan</option>
                <option value="Sosial & Kemasyarakatan">Sosial &amp; Kemasyarakatan</option>
                <option value="Seni & Budaya">Seni &amp; Budaya</option>
              </select>
            </div>
          </div>
        </div>
      </RevealOnScroll>

        {/* Results Summary Counter */}
        <div className="flex items-center justify-between text-sm text-slate-600 px-2 font-medium">
          <span>
            Menampilkan <strong className="text-slate-900 font-bold">{filteredOrmas.length}</strong> organisasi terdaftar
          </span>
          {(searchQuery || selectedStatus !== "semua" || selectedCategory !== "semua") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("semua");
                setSelectedCategory("semua");
              }}
              className="text-blue-800 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Table / Grid View Component */}
        <RevealOnScroll animation="fade-up" delay={120} duration={550}>
          {viewMode === "table" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-xs border-b border-slate-800">
                    <th className="py-4 px-5 text-center w-14">No</th>
                    <th className="py-4 px-5">Nama Organisasi</th>
                    <th className="py-4 px-5">Jenis / Kategori</th>
                    <th className="py-4 px-5 text-center">Status Legalitas</th>
                    <th className="py-4 px-5">Alamat Domisili</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrmas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <svg className="w-14 h-14 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-base font-bold text-slate-700">Tidak ada organisasi yang cocok dengan pencarian.</p>
                        <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci atau klik reset filter pencarian Anda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrmas.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => handleSelectOrmas(item)}
                      >
                        <td className="py-4.5 px-5 text-center font-bold text-slate-400 text-sm">{idx + 1}</td>
                        <td className="py-4.5 px-5">
                          <div className="text-base font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors">
                            {item.nama}
                          </div>
                          {item.singkatan && (
                            <span className="inline-block mt-1 text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {item.singkatan}
                            </span>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            No. SKT: <span className="font-mono font-medium text-slate-700">{item.noSkt}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-5">
                          <span className="font-semibold text-slate-800 text-sm">{item.jenis}</span>
                          <div className="text-xs text-slate-500 mt-0.5">{item.kategori}</div>
                        </td>
                        <td className="py-4.5 px-5 text-center">
                          {item.status === "Resmi" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Resmi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Dalam Proses
                            </span>
                          )}
                        </td>
                        <td className="py-4.5 px-5 text-slate-600 max-w-xs truncate text-sm">
                          {item.alamat}
                        </td>
                        <td className="py-4.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrmas(item);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 px-3.5 py-2 rounded-lg border border-blue-200 hover:border-blue-900 transition-colors"
                            title="Lihat Detail Organisasi"
                          >
                            <svg className="w-4 h-4 text-blue-600 group-hover:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredOrmas.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectOrmas(item)}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.jenis}
                    </span>
                    {item.status === "Resmi" ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Resmi
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Proses
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading group-hover:text-blue-900 transition-colors leading-snug line-clamp-2">
                      {item.nama}
                    </h3>
                    {item.singkatan && (
                      <span className="text-xs font-bold text-blue-800 mt-0.5 inline-block">({item.singkatan})</span>
                    )}
                  </div>

                  <div className="text-sm text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                    <p><strong className="text-slate-800 font-semibold">Kategori:</strong> {item.kategori}</p>
                    <p className="line-clamp-2"><strong className="text-slate-800 font-semibold">Alamat:</strong> {item.alamat}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-xs text-slate-700 font-bold">{item.noSkt}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOrmas(item);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Lihat Detail</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </RevealOnScroll>

        {/* Fallback Internal Modal if onSelectOrmas was not provided externally */}
        {!onSelectOrmas && (
          <OrmasDetailModal
            ormas={internalSelectedOrmas}
            onClose={() => setInternalSelectedOrmas(null)}
          />
        )}
      </div>
    </section>
  );
}
