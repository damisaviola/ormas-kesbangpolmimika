import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function OrganisasiLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
