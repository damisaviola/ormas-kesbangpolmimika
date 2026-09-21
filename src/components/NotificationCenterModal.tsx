'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  SystemNotification,
  NotificationRole,
  NotificationCategory,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToNotifications,
  resolveNotificationLink,
} from '@/services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: NotificationRole;
  namaOrmas?: string;
  title?: string;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  role,
  namaOrmas,
  title = 'Notifikasi',
}: NotificationCenterModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(role, namaOrmas);
      setNotifications(data);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadData();
    const unsubscribe = subscribeToNotifications(() => {
      loadData();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, role, namaOrmas]);

  // Hitung jumlah belum dibaca
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Hitung per kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      unread: unreadCount,
      pengajuan: 0,
      dokumen: 0,
      anggota: 0,
      sistem: 0,
    };
    notifications.forEach((n) => {
      if (counts[n.category] !== undefined) {
        counts[n.category]++;
      } else {
        counts[n.category] = 1;
      }
    });
    return counts;
  }, [notifications, unreadCount]);

  // Filter notifikasi berdasarkan Tab & Pencarian
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'unread' && item.isRead) return false;
      if (
        activeTab !== 'all' &&
        activeTab !== 'unread' &&
        item.category !== activeTab
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q) || false;
        const matchesMsg = item.message?.toLowerCase().includes(q) || false;
        const matchesSender = item.sender?.toLowerCase().includes(q) || false;
        return matchesTitle || matchesMsg || matchesSender;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(role, namaOrmas);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = async (notif: SystemNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    onClose();
    const targetRole = role === 'admin' ? 'admin' : 'ormas';
    const targetUrl = resolveNotificationLink(notif, targetRole);
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Kosongkan seluruh riwayat notifikasi?')) {
      await clearAllNotifications(role, namaOrmas);
      setNotifications([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[calc(100dvh-1rem)] sm:max-h-[85vh] flex flex-col shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 modal-card">
        {/* Header Modal */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">
                {title}
              </h2>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pemberitahuan sistem dan aktivitas berkas
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors text-sm shrink-0"
            title="Tutup (Esc)"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Toolbar: Search & Actions */}
        <div className="px-4 sm:px-5 py-2 sm:py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="relative flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder:text-slate-400 outline-none focus:border-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Tandai dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Bersihkan
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'unread'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Belum dibaca ({unreadCount})
          </button>
          {categoryCounts.pengajuan > 0 && (
            <button
              onClick={() => setActiveTab('pengajuan')}
              className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'pengajuan'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pengajuan ({categoryCounts.pengajuan})
            </button>
          )}
          {categoryCounts.dokumen > 0 && (
            <button
              onClick={() => setActiveTab('dokumen')}
              className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'dokumen'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dokumen ({categoryCounts.dokumen})
            </button>
          )}
          {categoryCounts.anggota > 0 && (
            <button
              onClick={() => setActiveTab('anggota')}
              className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'anggota'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Keanggotaan ({categoryCounts.anggota})
            </button>
          )}
          {categoryCounts.sistem > 0 && (
            <button
              onClick={() => setActiveTab('sistem')}
              className={`py-2.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'sistem'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sistem ({categoryCounts.sistem})
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Memuat notifikasi...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="font-medium text-slate-600 dark:text-slate-300 text-xs">
                Tidak ada notifikasi
              </p>
              <p className="text-[11px] text-slate-400">
                {searchQuery
                  ? 'Tidak ditemukan hasil pencarian yang cocok.'
                  : 'Semua pemberitahuan telah diperiksa.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start gap-3.5 group ${
                    isUnread ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                  }`}
                >
                  {/* Minimal Icon */}
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className={`text-xs truncate ${isUnread ? 'font-semibold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.timeAgo || 'Baru saja'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          {notif.category || 'Sistem'}
                        </span>
                        <span>Dari: {notif.sender}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:underline">
                          Buka →
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 text-xs"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredNotifications.length} notifikasi</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
