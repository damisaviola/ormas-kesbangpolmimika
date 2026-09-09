import React from 'react';

export default function ProfilLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64" />
      <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
    </div>
  );
}
