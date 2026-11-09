"use client";

import { useState, useMemo, useEffect } from "react";
import { OrmasItem } from "@/types/ormas";
import OrmasDetailModal from "@/components/OrmasDetailModal";
import { exportToCsv, printReportPdf, exportFullOrmasToExcel } from "@/utils/exportUtils";

interface OrmasDirectoryProps {
  initialData?: OrmasItem[];
  onSelectOrmas?: (ormas: OrmasItem) => void;
}

type SortField = "nama" | "kategori" | "distrik" | "status" | "noSkt";
type SortDirection = "asc" | "desc";

export default function OrmasDirectory({ initialData = [], onSelectOrmas }: OrmasDirectoryProps) {
  const [internalSelectedOrmas, setInternalSelectedOrmas] = useState<OrmasItem | null>(null);
  const [ormasData, setOrmasData] = useState<OrmasItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [sortField, setSortField] = useState<SortField>("nama");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Update jika initialData dari Server Component berubah
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setOrmasData(initialData);
    }
  }, [initialData]);

  // Sinkronisasi data realtime langsung dari Database MySQL via /api/ormas
  useEffect(() => {
    let isMounted = true;
    async function loadOrmasFromDatabase() {
      try {
        const res = await fetch("/api/ormas", { cache: "no-store" });
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: OrmasItem[] = json.data.map((item: any) => ({
            id: item.id,
            nama: item.nama || item.namaOrmas || "-",
            singkatan: item.singkatan || "",
            jenis: item.jenis || item.jenisOrmas || "ORMAS",
            kategori: item.kategori || "Sosial & Kemasyarakatan",
            status: item.status === "Resmi" || item.statusSk === "Aktif" ? "Resmi" : "Dalam Proses",
            noSkt: item.noSkt || item.nomorSk || "Dalam Proses",
            ketua: item.ketua || item.ketuaUmum || "-",
            alamat: item.alamatSekretariat || item.alamat || "-",
            distrik: item.distrik || "Mimika Baru",
            tanggalDaftar: item.tanggalDaftar || item.tanggalBerlaku || "-",
            telepon: item.telepon || "-",
            // Full data fields
            email: item.email || "-",
            kodePos: item.kodePos || "99910",
            alamatSekretariat: item.alamatSekretariat,
            kelurahanDesa: item.kelurahanDesa || "-",
            kabupaten: item.kabupaten || "Kabupaten Mimika",
            provinsi: item.provinsi || "Papua Tengah",
            nomorAktaNotaris: item.nomorAktaNotaris || "-",
            namaNotaris: item.namaNotaris || "-",
            npwpOrmas: item.npwpOrmas || "-",
            tanggalTerbitSkt: item.tanggalTerbitSkt || "-",
            masaBerlakuSkt: item.masaBerlakuSkt || "-",
            statusSkt: item.statusSkt,
            websiteSosmed: item.websiteSosmed || "-",
            visiMisi: item.visiMisi || "-",
            tujuanOrganisasi: item.tujuanOrganisasi || "-",
            tanggalPendirian: item.tanggalPendirian || item.tanggalDaftar || "-",
          }));
          setOrmasData(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat ormas dari database:", err);
      }
    }

    loadOrmasFromDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Kategori unik dari data database
  const availableCategories = useMemo(() => {
    const defaultCategories = [
      "Adat & Kesukuan",
      "Kepemudaan",
      "Keagamaan",
      "Sosial & Kemasyarakatan",
      "Seni & Budaya",
    ];
    const fromData = Array.from(new Set(ormasData.map((item) => item.kategori).filter(Boolean)));
    const merged = Array.from(new Set([...defaultCategories, ...fromData]));
    return merged.sort();
  }, [ormasData]);

  // Filtered & Sorted Ormas
  const filteredAndSortedOrmas = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = ormasData.filter((item) => {
      const matchSearch =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        (item.singkatan && item.singkatan.toLowerCase().includes(query)) ||
        item.noSkt.toLowerCase().includes(query) ||
        item.ketua.toLowerCase().includes(query) ||
        item.distrik.toLowerCase().includes(query);

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

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "nama") comparison = a.nama.localeCompare(b.nama, "id");
      else if (sortField === "kategori") comparison = a.kategori.localeCompare(b.kategori, "id");
      else if (sortField === "distrik") comparison = a.distrik.localeCompare(b.distrik, "id");
      else if (sortField === "status") comparison = a.status.localeCompare(b.status, "id");
      else if (sortField === "noSkt") comparison = a.noSkt.localeCompare(b.noSkt, "id");
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [ormasData, searchQuery, selectedStatus, selectedCategory, sortField, sortDirection]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCategory, itemsPerPage, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = filteredAndSortedOrmas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrmas = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedOrmas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedOrmas, safeCurrentPage, itemsPerPage]);

  const handleSelectOrmas = (item: OrmasItem) => {
    if (onSelectOrmas) {
      onSelectOrmas(item);
    } else {
      setInternalSelectedOrmas(item);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopyNoSkt = (e: React.MouseEvent, id: number | string, noSkt: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(noSkt);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
    }
  };

  // Ekspor Full Data Organisasi ke Excel dengan Pembagian 2 Kategori
  const handleExportExcel = (type: "all-categories" | "resmi-only" | "proses-only" = "all-categories") => {
    setShowExportMenu(false);
    const timestamp = new Date().toISOString().slice(0, 10);

    if (type === "resmi-only") {
      const resmiList = ormasData.filter((i) => i.status === "Resmi");
      exportFullOrmasToExcel(resmiList, `Data_Full_Ormas_Resmi_Mimika_${timestamp}`);
    } else if (type === "proses-only") {
      const prosesList = ormasData.filter((i) => i.status !== "Resmi");
      exportFullOrmasToExcel(prosesList, `Data_Full_Ormas_Dalam_Proses_Mimika_${timestamp}`);
    } else {
      // 2 Kategori Lengkap (Resmi & Dalam Proses) + Master Data
      exportFullOrmasToExcel(ormasData, `Data_Full_Organisasi_Mimika_2_Kategori_${timestamp}`);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "No",
      "Nama Organisasi",
      "Singkatan",
      "Kategori Legalitas",
      "Jenis Organisasi",
      "Bidang / Kategori",
      "Nomor SKT",
      "Ketua Umum",
      "Telepon",
      "Email",
      "Distrik",
      "Alamat",
    ];

    const rows = filteredAndSortedOrmas.map((item, idx) => [
      idx + 1,
      item.nama,
      item.singkatan || "-",
      item.status,
      item.jenis,
      item.kategori,
      item.noSkt,
      item.ketua,
      item.telepon || "-",
      item.email || "-",
      item.distrik,
      item.alamat,
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`Data_Ormas_Mimika_${dateStr}`, headers, rows);
  };

  const handlePrintPdf = () => {
    const headers = ["No", "Nama Organisasi", "Kategori", "No. SKT", "Distrik", "Status"];
    const rows = filteredAndSortedOrmas.map((item, idx) => [
      idx + 1,
      item.singkatan ? `${item.nama} (${item.singkatan})` : item.nama,
      item.kategori,
      item.noSkt,
      item.distrik,
      item.status,
    ]);

    printReportPdf({
      title: "DIREKTORI ORGANISASI KEMASYARAKATAN RESMI KABUPATEN MIMIKA",
      subtitle: "Basis Data Pelayanan Surat Keterangan Terdaftar (SKT) Bakesbangpol",
      keteranganFilter: `Filter: [${selectedStatus.toUpperCase()}] | Kategori: [${selectedCategory.toUpperCase()}] | Data: Database MySQL Terverifikasi`,
      headers,
      rows,
      orientation: "landscape",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("semua");
    setSelectedCategory("semua");
    setSortField("nama");
    setSortDirection("asc");
  };

  return (
    <section id="daftar-ormas" className="py-16 sm:py-20 bg-slate-50 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Bersih & Ringkas */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Direktori Organisasi Kemasyarakatan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Data terintegrasi langsung dari basis data resmi Badan Kesbangpol Kabupaten Mimika.
            </p>
          </div>

          {/* Action Buttons: Cetak & Ekspor Excel 2 Kategori */}
          <div className="flex items-center gap-2 self-start md:self-auto relative">
            {/* Tombol Cetak PDF */}
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 shadow-2xs cursor-pointer"
              title="Cetak Dokumen PDF"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Cetak PDF</span>
            </button>

            {/* Tombol Ekspor Excel Full Data (Dibagi 2 Kategori) */}
            <div className="relative inline-block text-left">
              <div className="inline-flex rounded-xl shadow-2xs overflow-hidden border border-emerald-300">
                <button
                  onClick={() => handleExportExcel("all-categories")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  title="Ekspor Data Full ke Excel (Dibagi 2 Kategori: Resmi & Proses)"
                >
                  <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    <path d="M8.5 12h2.2l1.3 2.5 1.3-2.5h2.2l-2.4 4 2.5 4h-2.2l-1.4-2.6-1.4 2.6H8.5l2.5-4-2.5-4z" />
                  </svg>
                  <span>Ekspor Excel</span>
                </button>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-2 py-2 bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border-l border-emerald-300/80 transition-colors cursor-pointer"
                  title="Pilihan Format Ekspor"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu Pilihan Ekspor */}
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-68 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Opsi Ekspor Excel &amp; Data
                    </div>
                    
                    {/* Opsi 1: Rekap 2 Kategori Lengkap (Rekomendasi) */}
                    <button
                      onClick={() => handleExportExcel("all-categories")}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 flex items-center justify-between text-emerald-950 font-bold cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>📗 Ekspor Full Data (2 Kategori)</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-normal mt-0.5">
                          Sheet Resmi &amp; Sheet Proses terpisah
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                        XLS
                      </span>
                    </button>

                    {/* Opsi 2: Kategori Resmi Saja */}
                    <button
                      onClick={() => handleExportExcel("resmi-only")}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                    >
                      <span>✓ Kategori Resmi Saja</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        XLS
                      </span>
                    </button>

                    {/* Opsi 3: Kategori Proses Saja */}
                    <button
                      onClick={() => handleExportExcel("proses-only")}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                    >
                      <span>⏳ Kategori Dalam Proses Saja</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        XLS
                      </span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    {/* Opsi 4: CSV Sederhana */}
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        handleExportCsv();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-600 cursor-pointer"
                    >
                      <span>📄 Format CSV Sederhana</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        CSV
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar Ramping & Minimalis */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
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
                placeholder="Cari nama ormas, singkatan, no. SKT, atau ketua..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-800 focus:border-blue-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Filter Status: Segmented Control Bersih */}
            <div className="sm:col-span-3 flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedStatus("semua")}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer ${
                  selectedStatus === "semua"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedStatus("resmi")}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer ${
                  selectedStatus === "resmi"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resmi
              </button>
              <button
                onClick={() => setSelectedStatus("proses")}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer ${
                  selectedStatus === "proses"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Proses
              </button>
            </div>

            {/* Filter Kategori */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800 cursor-pointer"
              >
                <option value="semua">Semua Kategori</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Hasil & Reset Filter */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span>
              Menampilkan <strong className="text-slate-800 font-bold">{filteredAndSortedOrmas.length}</strong> organisasi terdaftar
            </span>
            {(searchQuery || selectedStatus !== "semua" || selectedCategory !== "semua") && (
              <button
                onClick={handleResetFilters}
                className="text-blue-800 font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Tabel Rapi, Sederhana, dan Bersih (Tidak Ramai) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider select-none border-b border-slate-800">
                  <th className="py-3.5 px-4 text-center w-12 text-slate-400">#</th>
                  <th
                    onClick={() => handleSort("nama")}
                    className="py-3.5 px-5 cursor-pointer hover:text-amber-300"
                  >
                    Nama Organisasi {sortField === "nama" && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("kategori")}
                    className="py-3.5 px-4 cursor-pointer hover:text-amber-300"
                  >
                    Kategori {sortField === "kategori" && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3.5 px-4">Nomor SKT</th>
                  <th
                    onClick={() => handleSort("distrik")}
                    className="py-3.5 px-4 cursor-pointer hover:text-amber-300"
                  >
                    Wilayah {sortField === "distrik" && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-amber-300"
                  >
                    Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3.5 px-4 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrmas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-slate-600">Tidak ada organisasi yang sesuai dengan pencarian.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-blue-800 hover:underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedOrmas.map((item, idx) => {
                    const rowNumber = (safeCurrentPage - 1) * itemsPerPage + idx + 1;
                    const isCopied = copiedId === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectOrmas(item)}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        {/* 1. Nomor */}
                        <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                          {rowNumber}
                        </td>

                        {/* 2. Nama Organisasi (Bersih, Sederhana) */}
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900 hover:text-blue-900">
                            {item.nama}
                          </span>
                          {item.singkatan && (
                            <span className="text-xs text-blue-800 font-semibold ml-2">
                              ({item.singkatan})
                            </span>
                          )}
                        </td>

                        {/* 3. Kategori */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {item.kategori}
                        </td>

                        {/* 4. Nomor SKT */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={(e) => handleCopyNoSkt(e, item.id, item.noSkt)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 hover:text-blue-900 hover:bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
                            title="Klik untuk salin no SKT"
                          >
                            <span>{item.noSkt}</span>
                            {isCopied && (
                              <span className="text-[10px] text-emerald-600 font-bold font-sans">
                                ✓
                              </span>
                            )}
                          </button>
                        </td>

                        {/* 5. Wilayah */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {item.distrik}
                        </td>

                        {/* 6. Status Legalitas */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.status === "Resmi" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Resmi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Proses
                            </span>
                          )}
                        </td>

                        {/* 7. Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrmas(item);
                            }}
                            className="text-xs font-bold text-blue-900 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Sederhana & Bersih */}
          {totalItems > 0 && (
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
              <div>
                Halaman <strong>{safeCurrentPage}</strong> dari <strong>{totalPages}</strong> ({totalItems} total)
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${
                      pageNum === safeCurrentPage
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Detail Ormas */}
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
