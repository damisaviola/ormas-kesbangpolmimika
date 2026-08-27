import { OrmasItem } from "@/types/ormas";

interface OrmasDetailModalProps {
  ormas: OrmasItem | null;
  onClose: () => void;
}

export default function OrmasDetailModal({ ormas, onClose }: OrmasDetailModalProps) {
  if (!ormas) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        {/* Header Status */}
        <div className="flex items-center gap-3">
          {ormas.status === "Resmi" ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              Status: RESMI TERDAFTAR
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Status: DALAM VERIFIKASI
            </span>
          )}
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {ormas.jenis}
          </span>
        </div>

        {/* Ormas Title */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            {ormas.nama}
          </h3>
          {ormas.singkatan && (
            <p className="text-sm font-semibold text-blue-900 mt-1">
              Singkatan / Acronym: ({ormas.singkatan})
            </p>
          )}
        </div>

        {/* Details Table */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
            <span className="font-semibold text-slate-500">Nomor Legalitas/SKT</span>
            <span className="col-span-2 font-mono font-bold text-slate-900">{ormas.noSkt}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
            <span className="font-semibold text-slate-500">Ketua Umum / Penanggungjawab</span>
            <span className="col-span-2 font-bold text-slate-900">{ormas.ketua}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
            <span className="font-semibold text-slate-500">Kategori Bidang</span>
            <span className="col-span-2 text-slate-800 font-medium">{ormas.kategori}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
            <span className="font-semibold text-slate-500">Wilayah Distrik</span>
            <span className="col-span-2 text-slate-800 font-medium">{ormas.distrik}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
            <span className="font-semibold text-slate-500">Alamat Sekretariat</span>
            <span className="col-span-2 text-slate-800 leading-relaxed">{ormas.alamat}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1.5">
            <span className="font-semibold text-slate-500">Tanggal Terdaftar</span>
            <span className="col-span-2 text-slate-800">{ormas.tanggalDaftar}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
