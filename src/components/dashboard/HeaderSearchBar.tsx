'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { OrmasSubmission } from '@/types/dashboard';
import { getSubmissions, syncSubmissionsFromApi } from '@/services/submissionStorage';
import { INITIAL_ORMAS_DATA } from '@/data/ormas-data';

interface HeaderSearchBarProps {
  mode?: 'admin' | 'ormas';
}

interface DropdownItem {
  id: string;
  category: 'Pengajuan' | 'Ormas' | 'Pengguna' | 'Menu';
  title: string;
  subtitle: string;
  badge?: string;
  badgeStyle?: string;
  url: string;
}

interface SearchOrmasItem {
  id: string | number;
  namaOrmas?: string;
  nama?: string;
  singkatan?: string;
  ketuaUmum?: string;
  distrik?: string;
  nomorSk?: string;
  statusSk?: string;
}

interface SearchUserItem {
  id: string | number;
  nama: string;
  email: string;
  role?: string;
  rawRole?: string;
  instansi?: string;
  ormasNama?: string;
  nip?: string;
  nomorTiket?: string;
}

export default function HeaderSearchBar({ mode = 'admin' }: HeaderSearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Data states
  const [submissions, setSubmissions] = useState<OrmasSubmission[]>(() =>
    typeof window !== 'undefined' ? getSubmissions() : []
  );
  const [ormasList, setOrmasList] = useState<SearchOrmasItem[]>([]);
  const [userList, setUserList] = useState<SearchUserItem[]>([]);

  // Load searchable data on mount
  useEffect(() => {
    let isMounted = true;

    // Submissions
    syncSubmissionsFromApi().then((fresh) => {
      if (isMounted && fresh && fresh.length > 0) setSubmissions(fresh);
    });

    // Ormas
    fetch('/api/ormas', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setOrmasList(json.data);
        } else if (isMounted) {
          setOrmasList(
            INITIAL_ORMAS_DATA.map((o) => ({
              id: String(o.id),
              namaOrmas: o.nama,
              singkatan: o.singkatan || '',
              ketuaUmum: o.ketua,
              distrik: o.distrik,
              nomorSk: o.noSkt,
              statusSk: o.status === 'Resmi' ? 'Aktif' : 'Proses',
            }))
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrmasList(
            INITIAL_ORMAS_DATA.map((o) => ({
              id: String(o.id),
              namaOrmas: o.nama,
              singkatan: o.singkatan || '',
              ketuaUmum: o.ketua,
              distrik: o.distrik,
              nomorSk: o.noSkt,
              statusSk: o.status === 'Resmi' ? 'Aktif' : 'Proses',
            }))
          );
        }
      });

    // Users (admin mode only)
    if (mode === 'admin') {
      fetch('/api/pengguna?type=semua', { cache: 'no-store' })
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && Array.isArray(json.data)) {
            setUserList(json.data);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // Global keyboard shortcut: ⌘K or Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation menu shortcuts
  const menuLinks: DropdownItem[] = useMemo(() => {
    if (mode === 'ormas') {
      return [
        {
          id: 'm-beranda',
          category: 'Menu',
          title: 'Beranda Dashboard Ormas',
          subtitle: 'Ringkasan status pengajuan dan legalitas',
          url: '/dashboard-ormas',
        },
        {
          id: 'm-org',
          category: 'Menu',
          title: 'Profil Organisasi & Kepengurusan',
          subtitle: 'Kelola identitas dan susunan pengurus',
          url: '/dashboard-ormas/organisasi',
        },
        {
          id: 'm-panduan',
          category: 'Menu',
          title: 'Panduan & Persyaratan SKT',
          subtitle: 'SOP dan format berkas pendaftaran',
          url: '/dashboard-ormas/panduan',
        },
      ];
    }
    return [
      {
        id: 'm-beranda',
        category: 'Menu',
        title: 'Beranda Dashboard Admin',
        subtitle: 'Ringkasan pengajuan terbaru & metrik',
        url: '/dashboard',
      },
      {
        id: 'm-pengajuan',
        category: 'Menu',
        title: 'Verifikasi Pengajuan Ormas',
        subtitle: 'Pemeriksaan berkas pendaftaran SKT',
        url: '/dashboard/pengajuan',
      },
      {
        id: 'm-organisasi',
        category: 'Menu',
        title: 'Direktori Ormas Terdaftar',
        subtitle: 'Basis data organisasi resmi ber-SKT',
        url: '/dashboard/organisasi',
      },
      {
        id: 'm-pengguna',
        category: 'Menu',
        title: 'Basis Data Pengguna',
        subtitle: 'Manajemen akun admin & ormas',
        url: '/dashboard/database/pengguna',
      },
      {
        id: 'm-kalender',
        category: 'Menu',
        title: 'Kalender & Agenda Kegiatan',
        subtitle: 'Jadwal verifikasi lapangan & acara',
        url: '/dashboard/kalender',
      },
    ];
  }, [mode]);

  // Filtered dropdown results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      // Empty query: Show quick navigation + 2 recent submissions
      const recentSubs: DropdownItem[] = submissions.slice(0, 2).map((s) => ({
        id: `recent-${s.id}`,
        category: 'Pengajuan',
        title: s.namaOrmas || 'Pengajuan Baru',
        subtitle: `${s.id} • Ketua: ${s.ketuaUmum || '-'}`,
        badge: (s.status || 'menunggu').toUpperCase(),
        badgeStyle:
          s.status === 'disetujui'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : s.status === 'ditolak'
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        url: mode === 'admin' ? `/dashboard/pengajuan/${s.id}` : `/dashboard-ormas/organisasi`,
      }));

      return {
        groups: [
          { title: 'Tautan Menu Pintas', items: menuLinks.slice(0, 3) },
          ...(recentSubs.length > 0 ? [{ title: 'Pengajuan Terbaru', items: recentSubs }] : []),
        ],
        totalCount: menuLinks.slice(0, 3).length + recentSubs.length,
      };
    }

    // Filter Pengajuan (max 3)
    const matchedPengajuan: DropdownItem[] = submissions
      .filter((s) => {
        return (
          (s.namaOrmas && s.namaOrmas.toLowerCase().includes(q)) ||
          (s.singkatan && s.singkatan.toLowerCase().includes(q)) ||
          (s.id && s.id.toLowerCase().includes(q)) ||
          (s.nomorRegistrasi && s.nomorRegistrasi.toLowerCase().includes(q)) ||
          (s.ketuaUmum && s.ketuaUmum.toLowerCase().includes(q)) ||
          (s.jenisOrmas && s.jenisOrmas.toLowerCase().includes(q))
        );
      })
      .slice(0, 3)
      .map((s) => ({
        id: `sub-${s.id}`,
        category: 'Pengajuan',
        title: s.namaOrmas,
        subtitle: `${s.id} • Ketua: ${s.ketuaUmum || '-'} • ${s.jenisOrmas || 'Ormas'}`,
        badge: (s.status || 'menunggu').toUpperCase(),
        badgeStyle:
          s.status === 'disetujui'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : s.status === 'ditolak'
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        url: mode === 'admin' ? `/dashboard/pengajuan/${s.id}` : `/dashboard-ormas/organisasi`,
      }));

    // Filter Ormas (max 3)
    const matchedOrmas: DropdownItem[] = ormasList
      .filter((o) => {
        return (
          (o.namaOrmas && o.namaOrmas.toLowerCase().includes(q)) ||
          (o.singkatan && o.singkatan.toLowerCase().includes(q)) ||
          (o.ketuaUmum && o.ketuaUmum.toLowerCase().includes(q)) ||
          (o.nomorSk && o.nomorSk.toLowerCase().includes(q)) ||
          (o.distrik && o.distrik.toLowerCase().includes(q))
        );
      })
      .slice(0, 3)
      .map((o, idx) => {
        const ormasName = o.namaOrmas || o.nama || 'Organisasi';
        return {
          id: `ormas-${o.id || idx}`,
          category: 'Ormas' as const,
          title: ormasName,
          subtitle: `${o.singkatan ? `(${o.singkatan}) ` : ''}SKT: ${o.nomorSk || '-'} • Distrik ${o.distrik || 'Mimika Baru'}`,
          badge: o.statusSk === 'Aktif' ? 'SKT AKTIF' : 'TERDAFTAR',
          badgeStyle:
            o.statusSk === 'Aktif'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          url: mode === 'admin' ? `/dashboard/organisasi?search=${encodeURIComponent(ormasName)}` : `/dashboard-ormas/organisasi`,
        };
      });

    // Filter Users (max 2, admin mode only)
    const matchedUsers: DropdownItem[] =
      mode === 'admin'
        ? userList
            .filter((u) => {
              return (
                (u.nama && u.nama.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.nip && u.nip.toLowerCase().includes(q)) ||
                (u.ormasNama && u.ormasNama.toLowerCase().includes(q))
              );
            })
            .slice(0, 2)
            .map((u, idx) => ({
              id: `usr-${u.id || idx}`,
              category: 'Pengguna',
              title: u.nama || u.email,
              subtitle: `${u.email} • ${u.ormasNama ? `Ormas: ${u.ormasNama}` : u.instansi || 'Kesbangpol'}`,
              badge: u.role === 'admin' ? 'ADMIN' : 'ORMAS',
              badgeStyle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
              url: `/dashboard/database/pengguna?search=${encodeURIComponent(u.nama || u.email)}`,
            }))
        : [];

    // Filter Menu Links (max 2)
    const matchedMenu: DropdownItem[] = menuLinks
      .filter((m) => m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q))
      .slice(0, 2);

    const groups: { title: string; items: DropdownItem[] }[] = [];
    if (matchedPengajuan.length > 0) groups.push({ title: 'Pengajuan Pendaftaran', items: matchedPengajuan });
    if (matchedOrmas.length > 0) groups.push({ title: 'Direktori Ormas', items: matchedOrmas });
    if (matchedUsers.length > 0) groups.push({ title: 'Akun Pengguna', items: matchedUsers });
    if (matchedMenu.length > 0) groups.push({ title: 'Halaman Menu', items: matchedMenu });

    const totalCount =
      matchedPengajuan.length + matchedOrmas.length + matchedUsers.length + matchedMenu.length;

    return { groups, totalCount };
  }, [query, submissions, ormasList, userList, menuLinks, mode]);

  // Flatten items for keyboard navigation
  const allFlattenedItems = useMemo(() => {
    return results.groups.flatMap((g) => g.items);
  }, [results]);

  const handleSelect = (item: DropdownItem) => {
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    router.push(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsMobileSearchOpen(false);
      inputRef.current?.blur();
      mobileInputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allFlattenedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allFlattenedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allFlattenedItems[selectedIndex]) {
        handleSelect(allFlattenedItems[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
        router.push(
          mode === 'admin'
            ? `/dashboard/pengajuan?search=${encodeURIComponent(query.trim())}`
            : `/dashboard-ormas/organisasi`
        );
      }
    }
  };

  let globalItemIndex = -1;

  return (
    <div className="relative" ref={containerRef}>
      {/* Mobile Search Icon Toggle */}
      <button
        type="button"
        onClick={() => {
          setIsMobileSearchOpen(!isMobileSearchOpen);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        }}
        className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
        title="Pencarian"
        aria-label="Buka Pencarian"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Desktop Inline Search Bar */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700/80 transition-all w-48 lg:w-64 focus-within:w-60 lg:focus-within:w-72 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={mode === 'admin' ? 'Cari Ormas, Pengguna...' : 'Cari pengajuan, berkas...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold leading-none p-0.5"
            title="Hapus pencarian"
          >
            &times;
          </button>
        ) : (
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Mobile Search Popover Overlay */}
      {isMobileSearchOpen && (
        <div className="sm:hidden fixed inset-x-0 top-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 shadow-lg z-50 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Cari pengajuan, ormas, tiket..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
                setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 text-xs font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none p-1"
              >
                &times;
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-1 shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Clean Floating Results Dropdown Card */}
      {(isOpen || (isMobileSearchOpen && query.trim())) && (
        <div className="absolute right-0 sm:right-0 mt-2 w-80 sm:w-96 max-w-[90vw] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-800 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Dropdown Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              {query ? 'Hasil Pencarian' : 'Navigasi Cepat'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {results.totalCount} item
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {results.groups.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
                </p>
                {mode === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileSearchOpen(false);
                      router.push(`/dashboard/pengajuan?search=${encodeURIComponent(query)}`);
                    }}
                    className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Cari di Semua Data Pengajuan →
                  </button>
                )}
              </div>
            ) : (
              results.groups.map((group) => (
                <div key={group.title} className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    globalItemIndex++;
                    const isSelected = selectedIndex === globalItemIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`px-3.5 py-2 cursor-pointer flex items-center justify-between gap-2.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                  item.badgeStyle || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          {query.trim() && mode === 'admin' && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMobileSearchOpen(false);
                  router.push(`/dashboard/pengajuan?search=${encodeURIComponent(query)}`);
                }}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat Semua Hasil di Pengajuan →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
