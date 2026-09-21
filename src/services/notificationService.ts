/**
 * Layanan Notifikasi Terpadu SI-ORMAS Kabupaten Mimika
 * Mengelola notifikasi real-time untuk Admin Kesbangpol dan Pengguna (Ormas)
 */

export type NotificationType = 'success' | 'warning' | 'info' | 'danger';
export type NotificationRole = 'admin' | 'ormas' | 'all';
export type NotificationCategory = 'pengajuan' | 'dokumen' | 'anggota' | 'skt' | 'sistem';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  sender: string;
  recipientRole: NotificationRole;
  targetOrmas?: string | null;
  targetEmail?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string; // ISO String
  timeAgo?: string;
}

const STORAGE_KEY = 'siormas_notifications_cache_v1';
const EVENT_NAME = 'siormas_notif_event';
const isBrowser = typeof window !== 'undefined';

// Deduplikasi request API yang sedang berjalan (in-flight)
const inFlightRequests = new Map<string, Promise<SystemNotification[]>>();

/**
 * Format relative time dalam bahasa Indonesia (misal: "Baru saja", "5 menit lalu", "Hari ini 14:30")
 */
export function formatTimeAgo(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Baru saja';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 30) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} detik yang lalu`;
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) {
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return `Kemarin, ${timeStr}`;
    }
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Baru saja';
  }
}

/**
 * Memainkan suara lonceng lembut menggunakan Web Audio API
 */
export function playNotificationSound() {
  if (!isBrowser) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Tone 1: 659.25 Hz (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880.00 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Fail silently if browser blocks autoplay audio
  }
}

/**
 * Mengambil cache notifikasi dari localStorage
 */
function getCachedNotifications(): SystemNotification[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Menyimpan cache notifikasi ke localStorage.
 * PERHATIAN: Hanya siarkan event (broadcast=true) pada saat MUTASI data (tambah/baca/hapus),
 * JANGAN pernah menyiarkan event pada saat query fetchNotifications() untuk mencegah infinite loop!
 */
function saveCachedNotifications(list: SystemNotification[], shouldBroadcast: boolean = false) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (shouldBroadcast) {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
    }
  } catch (err) {
    console.error('Error caching notifications:', err);
  }
}

/**
 * Mengambil daftar notifikasi dari API dengan fallback cache dan deduplikasi request
 */
export async function fetchNotifications(
  role: NotificationRole,
  ormasName?: string
): Promise<SystemNotification[]> {
  const cacheKey = `${role}_${ormasName || ''}`;

  // Jika ada request yang sama sedang berlangsung, gunakan request yang sama
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const params = new URLSearchParams();
      params.set('role', role);
      if (ormasName) params.set('namaOrmas', ormasName);

      const res = await fetch(`/api/notifikasi?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const withTimeAgo = json.data.map((item: any) => ({
            ...item,
            timeAgo: formatTimeAgo(item.createdAt),
          }));
          // Simpan ke cache lokal TANPA menyiarkan event agar tidak memicu infinite loop
          saveCachedNotifications(withTimeAgo, false);
          return withTimeAgo;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat notifikasi dari API, menggunakan cache lokal:', err);
    } finally {
      inFlightRequests.delete(cacheKey);
    }

    // Fallback cache lokal yang difilter
    const cached = getCachedNotifications();
    return cached
      .filter((n) => {
        if (role === 'all') return true;
        if (n.recipientRole === 'all') return true;
        if (n.recipientRole !== role) return false;
        if (role === 'ormas' && ormasName && n.targetOrmas) {
          return n.targetOrmas.toLowerCase() === ormasName.toLowerCase();
        }
        return true;
      })
      .map((n) => ({ ...n, timeAgo: formatTimeAgo(n.createdAt) }));
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Menambahkan notifikasi baru ke sistem
 */
export async function createNotification(
  input: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead' | 'timeAgo'>
): Promise<SystemNotification> {
  const newNotif: SystemNotification = {
    ...input,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
    timeAgo: 'Baru saja',
  };

  // Simpan ke cache lokal langsung dan siarkan event ke komponen lain
  const current = getCachedNotifications();
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)];
  saveCachedNotifications(updated, true);
  playNotificationSound();

  // Kirim ke backend API secara asinkron
  if (isBrowser) {
    fetch('/api/notifikasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif),
    }).catch((err) => console.error('Gagal mengirim notifikasi ke database:', err));
  }

  return newNotif;
}

/**
 * Menandai notifikasi telah dibaca
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  const current = getCachedNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveCachedNotifications(updated, true);

  if (isBrowser) {
    fetch('/api/notifikasi', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    }).catch((err) => console.error('Gagal update status baca notifikasi di server:', err));
  }

  return true;
}

/**
 * Menandai seluruh notifikasi telah dibaca
 */
export async function markAllNotificationsAsRead(
  role: NotificationRole,
  ormasName?: string
): Promise<boolean> {
  const current = getCachedNotifications();
  const updated = current.map((n) => {
    if (n.recipientRole === role || n.recipientRole === 'all') {
      if (role === 'ormas' && ormasName && n.targetOrmas) {
        if (n.targetOrmas.toLowerCase() === ormasName.toLowerCase()) {
          return { ...n, isRead: true };
        }
        return n;
      }
      return { ...n, isRead: true };
    }
    return n;
  });
  saveCachedNotifications(updated, true);

  if (isBrowser) {
    fetch('/api/notifikasi', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, namaOrmas: ormasName, action: 'read_all' }),
    }).catch((err) => console.error('Gagal menandai semua dibaca di server:', err));
  }

  return true;
}

/**
 * Menghapus satu notifikasi
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const current = getCachedNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveCachedNotifications(updated, true);

  if (isBrowser) {
    fetch(`/api/notifikasi?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Gagal menghapus notifikasi di server:', err));
  }

  return true;
}

/**
 * Membersihkan semua notifikasi
 */
export async function clearAllNotifications(
  role: NotificationRole,
  ormasName?: string
): Promise<boolean> {
  const current = getCachedNotifications();
  const updated = current.filter((n) => {
    if (n.recipientRole === role || n.recipientRole === 'all') {
      if (role === 'ormas' && ormasName && n.targetOrmas) {
        return n.targetOrmas.toLowerCase() !== ormasName.toLowerCase();
      }
      return false;
    }
    return true;
  });
  saveCachedNotifications(updated, true);

  if (isBrowser) {
    const params = new URLSearchParams();
    params.set('role', role);
    if (ormasName) params.set('namaOrmas', ormasName);
    params.set('action', 'clear_all');

    fetch(`/api/notifikasi?${params.toString()}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Gagal membersihkan notifikasi di server:', err));
  }

  return true;
}

/**
 * Berlangganan event perubahan notifikasi secara real-time antar-komponen & antar-tab dengan debouncing
 */
export function subscribeToNotifications(callback: () => void) {
  if (!isBrowser) return () => {};

  let debounceTimer: any = null;
  const triggerDebounced = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      callback();
    }, 250);
  };

  const handleCustom = () => triggerDebounced();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) triggerDebounced();
  };

  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Menentukan tautan tujuan yang valid dan akurat berdasarkan notifikasi & peran pengguna
 */
export function resolveNotificationLink(
  notif: Partial<SystemNotification>,
  currentRole: 'admin' | 'ormas' = 'admin'
): string {
  let link = notif.link?.trim() || '';

  // Normalisasi tautan lama atau ambigu
  if (link) {
    if (link.startsWith('/dashboard-ormas/pengajuan')) {
      link = '/dashboard-ormas';
    }

    // Koreksi silang peran jika admin membuka tautan bertarget ormas atau sebaliknya
    if (currentRole === 'admin' && link.startsWith('/dashboard-ormas')) {
      if (link.includes('organisasi')) {
        link = '/dashboard/organisasi';
      } else {
        link = '/dashboard/pengajuan';
      }
    } else if (currentRole === 'ormas' && link.startsWith('/dashboard') && !link.startsWith('/dashboard-ormas')) {
      if (link.includes('organisasi')) {
        link = '/dashboard-ormas/organisasi';
      } else if (link.includes('kalender')) {
        link = '/dashboard-ormas/kalender';
      } else {
        link = '/dashboard-ormas';
      }
    }

    if (link) return link;
  }

  // Fallback cerdas berdasarkan kategori dan kata kunci judul/pesan
  const titleLower = (notif.title || '').toLowerCase();
  const msgLower = (notif.message || '').toLowerCase();
  const category = notif.category || 'sistem';

  if (currentRole === 'admin') {
    if (
      category === 'pengajuan' ||
      titleLower.includes('pengajuan') ||
      titleLower.includes('skt') ||
      msgLower.includes('permohonan') ||
      msgLower.includes('skt')
    ) {
      return '/dashboard/pengajuan';
    }
    if (
      category === 'dokumen' ||
      titleLower.includes('dokumen') ||
      titleLower.includes('berkas') ||
      msgLower.includes('unggah')
    ) {
      return '/dashboard/pengajuan';
    }
    if (
      category === 'anggota' ||
      titleLower.includes('anggota') ||
      titleLower.includes('pengurus') ||
      msgLower.includes('anggota')
    ) {
      return '/dashboard/organisasi';
    }
    if (
      category === 'skt' ||
      titleLower.includes('masa berlaku') ||
      titleLower.includes('kalender') ||
      msgLower.includes('kedaluwarsa')
    ) {
      return '/dashboard/kalender';
    }
    if (titleLower.includes('pengguna') || titleLower.includes('user') || msgLower.includes('akun')) {
      return '/dashboard/database/pengguna';
    }
    return '/dashboard/pengajuan';
  } else {
    // Role Ormas
    if (
      category === 'dokumen' ||
      titleLower.includes('dokumen') ||
      titleLower.includes('berkas') ||
      msgLower.includes('unggah') ||
      msgLower.includes('persyaratan')
    ) {
      return '/dashboard-ormas/organisasi?tab=dokumen';
    }
    if (
      category === 'anggota' ||
      titleLower.includes('anggota') ||
      titleLower.includes('pengurus') ||
      msgLower.includes('pengurus')
    ) {
      return '/dashboard-ormas/organisasi?tab=pengurus';
    }
    if (
      category === 'skt' ||
      titleLower.includes('masa berlaku') ||
      titleLower.includes('kalender') ||
      msgLower.includes('kedaluwarsa')
    ) {
      return '/dashboard-ormas/kalender';
    }
    if (titleLower.includes('panduan') || msgLower.includes('panduan')) {
      return '/dashboard-ormas/panduan';
    }
    if (titleLower.includes('profil') || category === ('profil' as any)) {
      return '/dashboard-ormas/profil';
    }
    // Default ormas adalah dashboard pengajuan / status permohonan SKT
    return '/dashboard-ormas';
  }
}

