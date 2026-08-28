import React from 'react';
import { StatusPengajuan } from '@/types/dashboard';

interface TableBadgeProps {
  status: StatusPengajuan | 'Aktif' | 'Perpanjangan' | 'Kadaluarsa' | 'aktif' | 'nonaktif' | string;
  label?: string;
}

export default function TableBadge({ status, label }: TableBadgeProps) {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'disetujui':
      case 'resmi':
      case 'aktif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80';
      case 'proses':
      case 'diajukan':
      case 'perpanjangan':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80';
      case 'menunggu':
      case 'disiapkan':
        return 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80';
      case 'ditangguhkan':
        return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80';
      case 'ditolak':
      case 'kadaluarsa':
      case 'nonaktif':
      case 'bubar':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getDotStyle = () => {
    switch (status.toLowerCase()) {
      case 'disetujui':
      case 'resmi':
      case 'aktif':
        return 'bg-emerald-500';
      case 'proses':
      case 'diajukan':
      case 'perpanjangan':
        return 'bg-amber-500 animate-pulse';
      case 'menunggu':
      case 'disiapkan':
        return 'bg-blue-500';
      case 'ditangguhkan':
        return 'bg-purple-500';
      case 'ditolak':
      case 'kadaluarsa':
      case 'nonaktif':
      case 'bubar':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border shadow-2xs transition-colors ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      {displayLabel}
    </span>
  );
}
