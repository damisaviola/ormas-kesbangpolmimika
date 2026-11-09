import React from 'react';
import { StatusPengajuan } from '@/types/dashboard';

interface TableBadgeProps {
  status: StatusPengajuan | 'Aktif' | 'Perpanjangan' | 'Kadaluarsa' | 'aktif' | 'nonaktif' | string;
  label?: string;
}

export default function TableBadge({ status, label }: TableBadgeProps) {
  const s = (status || '').toLowerCase();

  const getBadgeColors = () => {
    switch (s) {
      case 'disetujui':
      case 'resmi':
      case 'aktif':
        return {
          pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        };
      case 'proses':
      case 'diajukan':
      case 'perpanjangan':
        return {
          pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
          dot: 'bg-amber-500',
        };
      case 'menunggu':
      case 'disiapkan':
        return {
          pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
          dot: 'bg-blue-500',
        };
      case 'ditolak':
      case 'kadaluarsa':
      case 'nonaktif':
      case 'bubar':
        return {
          pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
          dot: 'bg-rose-500',
        };
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const { pill, dot } = getBadgeColors();
  const displayLabel = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '-');

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
