'use client';

import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex font-sans antialiased transition-colors duration-200">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar */}
        <DashboardHeader />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
