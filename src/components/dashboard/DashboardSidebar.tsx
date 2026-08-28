'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen } = useDashboard();
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(true);

  // Helper check for active links
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'Pengajuan',
      href: '/dashboard/pengajuan',
      badge: '18',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Organisasi',
      href: '/dashboard/organisasi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Profil',
      href: '/dashboard/profil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  const databaseSubItems = [
    {
      label: 'Pengguna',
      href: '/dashboard/database/pengguna',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Jenis Ormas',
      href: '/dashboard/database/jenis-ormas',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 11h.01M7 15h.01M11 7h8M11 11h8M11 15h8M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
      ),
    },
    {
      label: 'Jabatan',
      href: '/dashboard/database/jabatan',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 select-none border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 px-4 flex items-center border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 ${
          isCollapsed ? 'justify-center' : 'justify-start gap-3'
        }`}
      >
        <Image
          src="/assets/pic/logo_kabupatenmimika_removebg.png"
          alt="Logo Mimika"
          width={36}
          height={36}
          className="h-9 w-auto object-contain shrink-0"
        />
        {!isCollapsed && (
          <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-200">
            <span className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
              KESBANGPOL
            </span>
            <span className="text-[10px] text-blue-700 dark:text-amber-400 font-bold tracking-widest uppercase">
              SI-ORMAS ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1.5 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Navigasi Utama
          </div>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center ${
                isCollapsed ? 'justify-center py-3' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-bold transition-all group ${
                active
                  ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <span className={active ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                    active
                      ? 'bg-white text-blue-900'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Database Group Header */}
        <div className="pt-3">
          {!isCollapsed ? (
            <button
              onClick={() => setIsDatabaseOpen(!isDatabaseOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-blue-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s-8-1.79-8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>Database</span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
                  isDatabaseOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex justify-center py-2">
              <div
                title="Database Master"
                className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-amber-950/60 text-blue-600 dark:text-amber-400 flex items-center justify-center border border-blue-200/60 dark:border-amber-800/60 shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s-8-1.79-8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
          )}

          {(isDatabaseOpen || isCollapsed) && (
            <div className={isCollapsed ? 'space-y-1 mt-1' : 'mt-1 ml-3 pl-3 space-y-1 border-l border-slate-200 dark:border-slate-800'}>
              {databaseSubItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? sub.label : undefined}
                    className={`flex items-center ${
                      isCollapsed ? 'justify-center py-2.5' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-xs font-semibold transition-all ${
                      subActive
                        ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className={subActive ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-400'}>{sub.icon}</span>
                    {!isCollapsed && <span>{sub.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile / Return */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
        <Link
          href="/"
          title={isCollapsed ? 'Kembali ke Portal Web' : undefined}
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
          } text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/50 transition-colors`}
        >
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {!isCollapsed && <span>Portal Web</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex shrink-0 h-screen sticky top-0 z-30 relative">
        {sidebarContent}

        {/* Floating Expand/Collapse Button on Sidebar Border */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-5 z-40 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-md items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 hover:scale-110 active:scale-95 transition-all"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          aria-label="Toggle Sidebar"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
