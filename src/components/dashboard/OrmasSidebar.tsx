'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';

export default function OrmasSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen } = useDashboard();

  // Helper check for active links
  const isActive = (path: string) => {
    if (path === '/dashboard-ormas') {
      return pathname === '/dashboard-ormas';
    }
    return pathname.startsWith(path);
  };

  // Exactly 3 menu items as requested: Beranda, Organisasi, Profil
  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard-ormas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'Organisasi',
      href: '/dashboard-ormas/organisasi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Kalender SKT',
      href: '/dashboard-ormas/kalender',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Panduan',
      href: '/dashboard-ormas/panduan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: 'Profil',
      href: '/dashboard-ormas/profil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 select-none border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 px-4 flex items-center border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 ${
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
            <span className="text-[10px] text-blue-700 dark:text-amber-400 font-extrabold tracking-widest uppercase">
              SI-ORMAS PEMOHON
            </span>
          </div>
        )}
      </div>

      {/* Navigation List - Only 3 Items */}
      <div className="flex-1 px-3 py-5 overflow-y-auto space-y-2 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                isCollapsed ? 'justify-center py-2' : 'justify-between px-3.5 py-2.5'
              } rounded-xl text-xs font-bold transition-all group ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 dark:shadow-blue-900/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <span
                  className={`flex items-center justify-center shrink-0 ${
                    isCollapsed ? 'w-10 h-10 rounded-xl' : ''
                  } ${
                    active
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}

        {/* Info Card in Expanded Sidebar */}
        {!isCollapsed && (
          <div className="mt-8 mx-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-amber-400">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-bold">Layanan Helpdesk</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Butuh panduan pengajuan berkas SKT Ormas? Hubungi Kesbangpol Mimika.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/6281240998877"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-amber-400 hover:underline"
              >
                <span>WhatsApp: 0812-4099-8877</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation / Return */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80">
        <Link
          href="/"
          title={isCollapsed ? 'Kembali ke Portal Web' : undefined}
          className={`flex items-center ${
            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2 px-3 py-2.5'
          } text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors`}
        >
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <aside className="hidden lg:flex shrink-0 h-full z-30 relative">
        {sidebarContent}

        {/* Floating Expand/Collapse Button on Sidebar Border */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-5 z-40 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 hover:scale-110 active:scale-95 transition-all"
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
            className="fixed inset-0 bg-slate-950/70 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
