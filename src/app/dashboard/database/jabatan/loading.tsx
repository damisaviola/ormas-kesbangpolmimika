import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function JabatanLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
