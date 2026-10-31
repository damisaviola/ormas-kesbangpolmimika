'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import {
  SystemNotification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  resolveNotificationLink,
} from '@/services/notificationService';
import NotificationCenterModal from '@/components/NotificationCenterModal';

export default function OrmasHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, setIsDarkMode, isCollapsed, setIsCollapsed, setMobileOpen } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState<{
    nama: string;
    email: string;
    role: string;
    ormasNama?: string;
    instansi?: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('kesbangpol_user') : null;
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse kesbangpol_user:', e);
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  // Load and subscribe to notifications
  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      try {
        const ormasName = currentUser?.ormasNama || currentUser?.instansi || 'Ormas';
        const data = await fetchNotifications('ormas', ormasName);
        if (isMounted) setNotifications(data);
      } catch (err) {
        console.error('Error loading ormas notifications:', err);
      }
    };

    loadNotifs();
    const unsubscribe = subscribeToNotifications(() => {
      loadNotifs();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser?.ormasNama]);

  // Tutup dropdown dan modal notifikasi otomatis setiap kali rute/halaman berpindah
  useEffect(() => {
    setShowNotifications(false);
    setIsNotifModalOpen(false);
    setShowProfileMenu(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ormasName = currentUser?.ormasNama || 'ORMS 1';
    await markAllNotificationsAsRead('ormas', ormasName);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleItemClick = async (notif: SystemNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setShowNotifications(false);
    setIsNotifModalOpen(false);
    const targetUrl = resolveNotificationLink(notif, 'ormas');
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const displayedNotifications = (
    notifTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications
  ).slice(0, 5);

  const displayName = currentUser?.nama || 'Pemohon Ormas';
  const displayEmail = currentUser?.email || 'pemohon@kesbangpol.go.id';
  const displayRole = currentUser?.ormasNama || 'Pemohon Ormas';
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'PO';

  // Generate breadcrumb titles
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return [{ label: 'Beranda', href: '/dashboard-ormas' }];

    const crumbs = [{ label: 'Beranda', href: '/dashboard-ormas' }];
    let currentPath = '/dashboard-ormas';

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      currentPath += `/${seg}`;

      let label = seg;
      if (seg === 'organisasi') label = 'Organisasi';
      if (seg === 'panduan') label = 'Panduan';
      if (seg === 'profil') label = 'Profil';

      crumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: currentPath,
      });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-2xs transition-colors">
      {/* Left: Mobile Toggle, Desktop Collapse & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Mobile Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Collapse Sidebar Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && (
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 dark:text-white font-bold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Dark Mode Toggle, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Input */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700/80 transition-colors w-44 lg:w-60">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari pengajuan, berkas..."
            className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs"
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
            ⌘K
          </kbd>
        </div>

        {/* Dark / Light Mode Switcher Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
          title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center relative active:scale-95"
            aria-label="Notifications"
            title="Notifikasi"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-semibold flex items-center justify-center border border-white dark:border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Header Dropdown */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {unreadCount} baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              {/* Minimalist Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setNotifTab('all')}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                    notifTab === 'all'
                      ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifTab('unread')}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                    notifTab === 'unread'
                      ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Belum dibaca ({unreadCount})
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-xs">Tidak ada notifikasi</p>
                    <p className="text-[11px] text-slate-400">Semua pemberitahuan telah diperiksa.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const isUnread = !n.isRead;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleItemClick(n)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                          isUnread ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`truncate text-xs ${isUnread ? 'font-semibold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                              {n.title}
                            </p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span>{n.sender}</span>
                            <span>•</span>
                            <span>{n.timeAgo || 'Baru saja'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Dropdown */}
              <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    setIsNotifModalOpen(true);
                  }}
                  className="w-full py-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight capitalize">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">{displayRole}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-slate-100 dark:ring-slate-800">
              {displayInitials}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white capitalize">{displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
              </div>
              <Link
                href="/dashboard-ormas/profil"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-amber-300 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Pengaturan Profil</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                <svg className="w-4 h-4 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Beralih ke Dashboard Admin</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-800"
              >
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar (Logout)</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        role="ormas"
        namaOrmas={currentUser?.ormasNama}
        title={`Pusat Notifikasi - ${currentUser?.ormasNama || 'Ormas'}`}
      />
    </header>
  );
}
