"use client";

import { useState, useMemo } from "react";
import { OrmasItem } from "@/types/ormas";
import { INITIAL_ORMAS_DATA } from "@/data/ormas-data";

interface OrmasDirectoryProps {
  onSelectOrmas: (ormas: OrmasItem) => void;
}

export default function OrmasDirectory({ onSelectOrmas }: OrmasDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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
    <section id="daftar-ormas" className="py-12 bg-slate-50 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Controls Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Daftar Organisasi Kemasyarakatan (ORMAS)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pencarian publik dan direktori legalitas ORMAS terdaftar di Kabupaten Mimika.
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-white text-blue-900 shadow-2xs"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-900 shadow-2xs"
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
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-slate-100">
            {/* Live Search Bar */}
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama organisasi, alamat, atau nomor SKT..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="sm:col-span-3 flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedStatus("semua")}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === "semua" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedStatus("resmi")}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === "resmi" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resmi
              </button>
              <button
                onClick={() => setSelectedStatus("proses")}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                  selectedStatus === "proses" ? "bg-amber-500 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
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
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800"
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

        {/* Results Summary Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
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
              className="text-blue-800 font-semibold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Table View Component */}
        {viewMode === "table" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <th className="py-3.5 px-4 text-center w-12">No</th>
                    <th className="py-3.5 px-4">Nama Organisasi</th>
                    <th className="py-3.5 px-4">Jenis / Kategori</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Alamat Domisili</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrmas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold text-slate-600">Tidak ada organisasi yang cocok dengan pencarian.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Coba ubah kata kunci atau reset filter pencarian Anda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrmas.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onSelectOrmas(item)}
                      >
                        <td className="py-4 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                            {item.nama}
                          </div>
                          {item.singkatan && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                              {item.singkatan}
                            </span>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1">
                            No. SKT: <span className="font-mono text-slate-600">{item.noSkt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-700">{item.jenis}</span>
                          <div className="text-[11px] text-slate-400">{item.kategori}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.status === "Resmi" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Resmi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Dalam Proses
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                          {item.alamat}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrmas(item);
                            }}
                            className="text-xs font-semibold text-blue-800 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-all"
                          >
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrmas.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectOrmas(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {item.jenis}
                    </span>
                    {item.status === "Resmi" ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Resmi
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Proses
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.nama}
                    </h3>
                    {item.singkatan && (
                      <span className="text-xs font-semibold text-blue-800">({item.singkatan})</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <p><strong className="text-slate-700">Kategori:</strong> {item.kategori}</p>
                    <p className="line-clamp-2"><strong className="text-slate-700">Alamat:</strong> {item.alamat}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">{item.noSkt}</span>
                  <span className="text-blue-800 font-bold hover:underline">Lihat Profile &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
