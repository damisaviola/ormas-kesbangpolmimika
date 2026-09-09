import { UserAccount } from '@/types/dashboard';
import { INITIAL_USERS } from '@/data/dashboard-data';

const STORAGE_KEY = 'siormas_registered_users_v2';

export function getRegisteredUsers(): UserAccount[] {
  if (typeof window === 'undefined') {
    return INITIAL_USERS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_USERS;
  } catch (err) {
    console.error('Error reading registered users from localStorage:', err);
    return INITIAL_USERS;
  }
}

export function saveRegisteredUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    // Trigger custom event so other open tabs/components can listen
    window.dispatchEvent(new Event('siormas_users_updated'));
  } catch (err) {
    console.error('Error saving registered users to localStorage:', err);
  }
}

export function registerAccountFromForm(
  fullName: string,
  email: string,
  password?: string,
  instansi?: string,
  telepon?: string
): { success: boolean; message: string; user?: UserAccount } {
  const currentUsers = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = currentUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (existing) {
    return {
      success: false,
      message: 'Alamat email ini sudah terdaftar dalam database sistem.',
    };
  }

  const now = new Date();
  const formattedDate =
    now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) +
    ' WIT';

  const newUser: UserAccount = {
    id: `USR-REG-${Date.now().toString().slice(-4)}`,
    nama: fullName.trim(),
    email: normalizedEmail,
    nip: '-',
    role: 'pengguna',
    status: 'aktif',
    instansi: instansi?.trim() || 'Pemohon Pendaftaran Ormas',
    terakhirLogin: 'Baru Mendaftar',
    tanggalDaftar: formattedDate,
    telepon: telepon || '-',
    password: password,
  };

  const updatedList = [newUser, ...currentUsers];
  saveRegisteredUsers(updatedList);

  return {
    success: true,
    message: 'Pendaftaran akun berhasil disimpan ke dalam database!',
    user: newUser,
  };
}

export function addRegisteredUser(
  data: Omit<UserAccount, 'id'>
): UserAccount {
  const currentUsers = getRegisteredUsers();
  const now = new Date();
  const formattedDate =
    now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) +
    ' WIT';

  const newUser: UserAccount = {
    ...data,
    id: `USR-${String(currentUsers.length + 1).padStart(3, '0')}`,
    tanggalDaftar: data.tanggalDaftar || formattedDate,
  };

  const updatedList = [newUser, ...currentUsers];
  saveRegisteredUsers(updatedList);
  return newUser;
}

export function updateRegisteredUser(updatedUser: UserAccount): void {
  const currentUsers = getRegisteredUsers();
  const index = currentUsers.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    currentUsers[index] = updatedUser;
    saveRegisteredUsers(currentUsers);
  }
}

export function deleteRegisteredUser(userId: string): void {
  const currentUsers = getRegisteredUsers();
  const filtered = currentUsers.filter((u) => u.id !== userId);
  saveRegisteredUsers(filtered);
}

export function toggleUserStatus(userId: string): UserAccount | null {
  const currentUsers = getRegisteredUsers();
  const user = currentUsers.find((u) => u.id === userId);
  if (user) {
    user.status = user.status === 'aktif' ? 'nonaktif' : 'aktif';
    saveRegisteredUsers(currentUsers);
    return user;
  }
  return null;
}

export function resetRegisteredUsersToDefault(): UserAccount[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    window.dispatchEvent(new Event('siormas_users_updated'));
  }
  return INITIAL_USERS;
}
