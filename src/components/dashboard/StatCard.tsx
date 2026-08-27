import React from 'react';
import { DashboardMetric } from '@/types/dashboard';

export default function StatCard({ metric }: { metric: DashboardMetric }) {
  const isUp = metric.trend === 'up';
  const isDown = metric.trend === 'down';

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {metric.title}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${
            isUp
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
              : isDown
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {isUp && (
            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
          {isDown && (
            <svg className="w-3 h-3 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {metric.change}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {metric.value}
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
        {metric.description}
      </p>
    </div>
  );
}
