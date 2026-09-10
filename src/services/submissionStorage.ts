import { INITIAL_SUBMISSIONS } from '@/data/dashboard-data';
import { OrmasSubmission, StatusPengajuan } from '@/types/dashboard';
import { OrmasSubmissionPayload } from '@/components/dashboard/OrmasSubmissionModal';

const STORAGE_KEY = 'siormas_submissions_list';
const STORAGE_EVENT = 'siormas_submissions_updated';

const isBrowser = typeof window !== 'undefined';

/**
 * Mendapatkan daftar seluruh pengajuan ormas (dari localStorage jika ada, fallback ke INITIAL_SUBMISSIONS)
 */
export function getSubmissions(): OrmasSubmission[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load submissions from localStorage:', err);
    return [];
  }
}

/**
 * Menyimpan daftar pengajuan ke localStorage dan mentrigger event pembaruan
 */
export function saveSubmissions(list: OrmasSubmission[]) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error('Failed to save submissions to localStorage:', err);
  }
}

/**
 * Mengambil data pengajuan terbaru dari database MySQL via API Route
 * dan menyelaraskannya dengan cache lokal browser
 */
export async function syncSubmissionsFromApi(): Promise<OrmasSubmission[]> {
  if (!isBrowser) return [];
  try {
    const res = await fetch('/api/pengajuan', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      saveSubmissions(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('Sync from API failed, using local cache:', err);
  }
  return getSubmissions();
}

/**
 * Menambahkan pengajuan baru dari form pemohon ormas:
 * 1. Simpan ke database MySQL secara langsung via API
 * 2. Simpan ke localStorage untuk respon antarmuka instan
 */
export function addSubmissionFromPayload(payload: OrmasSubmissionPayload): OrmasSubmission {
  const currentList = getSubmissions();

  const cleanDistrik = payload.distrik ? payload.distrik.replace(/^Distrik\s+/i, '') : 'Mimika Baru';
  const fullAddress = payload.alamatKantor
    ? `${payload.alamatKantor}, Distrik ${cleanDistrik}`
    : `Distrik ${cleanDistrik}, Kabupaten Mimika`;

  const newSub: OrmasSubmission = {
    id: payload.id || `SUB-${Date.now().toString().slice(-4)}`,
    nomorRegistrasi: payload.nomorTiket,
    namaOrmas: payload.namaOrganisasi,
    singkatan: payload.namaSingkat || undefined,
    jenisOrmas: payload.jenisOrganisasi,
    ketuaUmum: payload.ketuaUmum || payload.pendaftar || payload.namaOrganisasi,
    pendaftar: payload.pendaftar || payload.ketuaUmum || payload.namaOrganisasi,
    alamat: fullAddress,
    distrik: cleanDistrik,
    kodePos: payload.kodePos || '99910',
    telepon: payload.noTelepon,
    email: payload.email || payload.emailResmi || undefined,
    kategori: payload.kategori,
    tanggalPengajuan:
      payload.tanggalPengajuan ||
      new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'menunggu',
    catatan: payload.catatan || `Pengajuan ${payload.jenisPengajuan || 'Pendaftaran Baru SKT'} diajukan mandiri melalui portal Ormas Mimika`,
    isCustomSubmission: true,
  };

  // 1. Simpan ke localStorage seketika agar UI langsung responsif
  const updatedList = [newSub, ...currentList.filter((item) => item.id !== newSub.id && item.nomorRegistrasi !== newSub.nomorRegistrasi)];
  saveSubmissions(updatedList);

  // 2. Kirim ke database MySQL via API Route secara asinkron
  if (isBrowser) {
    fetch('/api/pengajuan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        email: newSub.email,
        emailResmi: newSub.email,
        userId: payload.userId,
        pendaftar: newSub.pendaftar,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.pengajuan?.id) {
          // Sinkronkan ID riil dari database jika ada
          const dbPengajuan = data.data.pengajuan;
          const freshList = getSubmissions().map((item) => {
            if (item.nomorRegistrasi === payload.nomorTiket || item.id === newSub.id) {
              return { ...item, id: dbPengajuan.id };
            }
            return item;
          });
          saveSubmissions(freshList);
        }
      })
      .catch((err) => {
        console.error('Gagal mengirim pengajuan ke database MySQL:', err);
      });
  }

  return newSub;
}

/**
 * Mencari pengajuan berdasarkan ID atau nomor registrasi / tiket
 */
export function getSubmissionById(id: string): OrmasSubmission | undefined {
  const list = getSubmissions();
  return list.find((sub) => sub.id === id || sub.nomorRegistrasi === id);
}

/**
 * Memperbarui status verifikasi pengajuan (misal: disetujui, dalam proses, ditolak):
 * 1. Simpan perubahan ke localStorage
 * 2. Simpan perubahan ke database MySQL via API Route
 */
export function updateSubmissionStatus(id: string, newStatus: StatusPengajuan, catatan?: string) {
  const currentList = getSubmissions();
  const updatedList = currentList.map((item) => {
    if (item.id === id || item.nomorRegistrasi === id) {
      return {
        ...item,
        status: newStatus,
        catatan: catatan !== undefined ? catatan : item.catatan,
        nomorRegistrasi:
          newStatus === 'disetujui' && (!item.nomorRegistrasi || item.nomorRegistrasi.startsWith('TIKET/'))
            ? `230/SKT/KESBANGPOL/${new Date().getFullYear()}`
            : item.nomorRegistrasi,
      };
    }
    return item;
  });
  saveSubmissions(updatedList);

  // Kirim update ke database MySQL via API Route
  if (isBrowser) {
    fetch('/api/pengajuan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, catatan }),
    }).catch((err) => {
      console.error('Gagal mengupdate status di database MySQL:', err);
    });
  }
}

/**
 * Subscribe untuk mendengarkan perubahan data pengajuan di tab lain / komponen lain
 */
export function subscribeToSubmissions(callback: (submissions: OrmasSubmission[]) => void) {
  if (!isBrowser) return () => {};
  const handler = () => {
    callback(getSubmissions());
  };
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
