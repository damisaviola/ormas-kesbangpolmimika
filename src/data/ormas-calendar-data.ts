export interface OrmasCalendarItem {
  id: string;
  namaOrmas: string;
  singkatan?: string;
  jenisOrmas: string;
  nomorSk: string;
  ketuaUmum: string;
  alamat: string;
  distrik: string;
  telepon: string;
  email: string;
  tanggalMulai: string;       // Format: YYYY-MM-DD
  tanggalKadaluarsa: string;  // Format: YYYY-MM-DD
  masaBerlakuTahun: number;   // default 3 atau 5 tahun
}

export const ORMAS_CALENDAR_DATA: OrmasCalendarItem[] = [];

// Helper functions for expiry status detection
export type ExpiryStatus = 'aktif' | 'segera_berakhir' | 'kadaluarsa';

export interface ExpiryCalculation {
  status: ExpiryStatus;
  statusLabel: string;
  diffDays: number;
  message: string;
}

export function calculateExpiryStatus(expiryDateStr: string, referenceDate: Date = new Date(2026, 8, 9)): ExpiryCalculation {
  const expiry = new Date(expiryDateStr);
  const now = new Date(referenceDate);
  // Strip hours
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'kadaluarsa',
      statusLabel: 'Sudah Kadaluarsa',
      diffDays,
      message: `Kadaluarsa ${Math.abs(diffDays)} hari yang lalu`,
    };
  } else if (diffDays <= 90) {
    return {
      status: 'segera_berakhir',
      statusLabel: 'Segera Berakhir',
      diffDays,
      message: diffDays === 0 ? 'Jatuh tempo hari ini' : `Tersisa ${diffDays} hari lagi`,
    };
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    let timeStr = `${diffDays} hari lagi`;
    if (years > 0) {
      timeStr = `${years} thn ${months} bln lagi`;
    } else if (months > 0) {
      timeStr = `${months} bulan lagi`;
    }
    return {
      status: 'aktif',
      statusLabel: 'Masih Aktif',
      diffDays,
      message: `Aktif (${timeStr})`,
    };
  }
}
