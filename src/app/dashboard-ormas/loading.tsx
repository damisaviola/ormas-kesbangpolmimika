import React from 'react';

export default function OrmasDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Stepper Skeleton */}
      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />

      {/* Table Skeleton */}
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
    </div>
  );
}
