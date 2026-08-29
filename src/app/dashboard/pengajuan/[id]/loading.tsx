import React from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function DetailPengajuanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Title Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-72" />
            </div>
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>

      {/* Form Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-96" />
        <CardSkeleton className="h-96" />
      </div>
    </div>
  );
}
