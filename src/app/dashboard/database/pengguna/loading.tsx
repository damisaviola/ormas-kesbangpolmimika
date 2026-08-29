import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function PenggunaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
