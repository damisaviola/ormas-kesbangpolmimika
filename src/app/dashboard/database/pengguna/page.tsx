'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import PenggunaLoading from '@/app/dashboard/database/pengguna/loading';
import { UserAccount, UserRole } from '@/types/dashboard';
import {
  getRegisteredUsers,
  addRegisteredUser,
  updateRegisteredUser,
  deleteRegisteredUser,
  toggleUserStatus,
  resetRegisteredUsersToDefault,
} from '@/utils/userStorage';

export default function DatabasePenggunaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccount | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserAccount | null>(null);

  // Feedback Notification & Form Errors
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New user form state (Nama, E-Mail, Peran: 'admin' | 'pengguna', Password, Ulangi Password)
  const [newUser, setNewUser] = useState<{
    nama: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
  }>({
    nama: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [sortField, setSortField] = useState<keyof UserAccount>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadUsers = useCallback(() => {
    const list = getRegisteredUsers();
    setUsers(list);
  }, []);

  useEffect(() => {
    loadUsers();
    const timer = setTimeout(() => setIsLoading(false), 300);

    const handleStorageUpdate = () => {
      loadUsers();
    };

    window.addEventListener('siormas_users_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('siormas_users_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [loadUsers]);

  if (isLoading) {
    return <PenggunaLoading />;
  }

  const handleSort = (field: keyof UserAccount) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getNormalizedRole = (role: string): 'admin' | 'pengguna' => {
    return role === 'admin' ? 'admin' : 'pengguna';
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.instansi && u.instansi.toLowerCase().includes(searchTerm.toLowerCase()));

    const userNormRole = getNormalizedRole(u.role);
    const matchesRole = roleFilter === 'all' || userNormRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = (a[sortField] || '') as string;
    let valB = (b[sortField] || '') as string;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Action handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUser.nama.trim() || !newUser.email.trim()) {
      setFormError('Nama dan E-Mail wajib diisi.');
      return;
    }

    if (!newUser.role) {
      setFormError('Silakan pilih Peran pengguna.');
      return;
    }

    if (!newUser.password) {
      setFormError('Password wajib diisi.');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setFormError('Password dan Ulangi Password tidak cocok.');
      return;
    }

    if (newUser.password.length < 6) {
      setFormError('Password minimal harus 6 karakter.');
      return;
    }

    const defaultInstansi =
      newUser.role === 'admin'
        ? 'Badan Kesbangpol Kabupaten Mimika'
        : 'Pengguna Sistem SI-ORMAS';

    addRegisteredUser({
      nama: newUser.nama.trim(),
      email: newUser.email.trim().toLowerCase(),
      nip: '-',
      telepon: '-',
      role: newUser.role as UserRole,
      status: 'aktif',
      instansi: defaultInstansi,
      terakhirLogin: 'Belum pernah login',
      password: newUser.password,
    });

    loadUsers();
    setNewUser({
      nama: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
    });
    setFormError(null);
    setShowAddModal(false);
    showToast(`Pengguna "${newUser.nama}" berhasil ditambahkan.`);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    updateRegisteredUser(selectedUserForEdit);
    loadUsers();
    showToast(`Data akun "${selectedUserForEdit.nama}" berhasil diperbarui.`);
    setSelectedUserForEdit(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUserForDelete) return;
    deleteRegisteredUser(selectedUserForDelete.id);
    loadUsers();
    showToast(`Akun "${selectedUserForDelete.nama}" berhasil dihapus dari database.`);
    setSelectedUserForDelete(null);
  };

  const handleToggleStatus = (u: UserAccount) => {
    const updated = toggleUserStatus(u.id);
    loadUsers();
    if (updated) {
      showToast(
        `Status akun "${u.nama}" berhasil diubah menjadi ${
          updated.status === 'aktif' ? 'Aktif' : 'Nonaktif'
        }.`
      );
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin memulihkan database pengguna ke data awal (default)?')) {
      resetRegisteredUsersToDefault();
      loadUsers();
      showToast('Database pengguna telah dipulihkan ke data awal.');
    }
  };

  // Metric stats
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === 'aktif').length;
  const adminCount = users.filter((u) => getNormalizedRole(u.role) === 'admin').length;
  const penggunaCount = users.filter((u) => getNormalizedRole(u.role) === 'pengguna').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Database Master
            </span>
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              Sinkronisasi Real-Time
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Database Pengguna Terdaftar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar seluruh akun pengguna dan administrator yang terdaftar dalam sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs"
            title="Pulihkan ke daftar akun awal"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Default</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Pengguna</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Semua akun terdata</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pengguna Aktif</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Dapat login & beraktivitas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Akun Admin</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{adminCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Pengelola & Verifikator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Akun Pengguna</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{penggunaCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Pengguna & Ormas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Role Filter Tabs (Semua Peran, Admin, Pengguna) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'Semua Peran' },
              { id: 'admin', label: 'Admin' },
              { id: 'pengguna', label: 'Pengguna' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                  roleFilter === tab.id
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, email, instansi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Status Akun:</span>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="text-[11px] text-blue-600 dark:text-amber-400 font-bold hover:underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => handleSort('nama')}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Pengguna Terdaftar</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'nama' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Peran</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('instansi')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Instansi / Organisasi</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'instansi' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tanggalDaftar')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal Terdaftar</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'tanggalDaftar' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.length > 0 ? (
                sorted.map((u) => {
                  const normRole = getNormalizedRole(u.role);
                  const isRoleAdmin = normRole === 'admin';
                  const initials = u.nama
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              isRoleAdmin
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800'
                            }`}
                          >
                            {initials || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {u.nama}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                            isRoleAdmin
                              ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isRoleAdmin ? 'Admin' : 'Pengguna'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {u.instansi}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {u.tanggalDaftar || 'Terdata di sistem'}
                        </p>
                        <p className="text-[10px] text-slate-400">Login: {u.terakhirLogin}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <TableBadge status={u.status} />
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={
                              u.status === 'aktif'
                                ? 'Klik untuk menonaktifkan akun'
                                : 'Klik untuk mengaktifkan akun'
                            }
                            className={`p-1 rounded text-[10px] font-bold border transition-colors ${
                              u.status === 'aktif'
                                ? 'text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800'
                                : 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40'
                            }`}
                          >
                            {u.status === 'aktif' ? 'Matikan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => setSelectedUserForDetail(u)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="Lihat Detail Pengguna"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => setSelectedUserForEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Edit Data Pengguna"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setSelectedUserForDelete(u)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Hapus Akun Pengguna"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data pengguna terdaftar yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Pengguna (Opsi Peran: Admin & Pengguna saja) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Tambah Pengguna
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setFormError(null);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {formError}
              </div>
            )}

            {/* Form: Nama, E-Mail, Peran (-- Pilih Peran --, Admin, Pengguna), Password, Ulangi Password */}
            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              {/* Field 1: Nama */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama pengguna"
                  value={newUser.nama}
                  onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Field 2: E-Mail */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  E-Mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: user@mimikakab.go.id"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Field 3: Peran (Hanya Admin dan Pengguna) */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Peran
                </label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="" disabled>
                    -- Pilih Peran --
                  </option>
                  <option value="admin">Admin</option>
                  <option value="pengguna">Pengguna</option>
                </select>
              </div>

              {/* Field 4: Password */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Field 5: Ulangi Password */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Ulangi Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons: Simpan & Batal */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-[0.99]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Pengguna (Opsi Peran: Admin & Pengguna saja) */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleEditUser}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit Data Pengguna
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={selectedUserForEdit.nama}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={selectedUserForEdit.email}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    value={selectedUserForEdit.telepon || ''}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, telepon: e.target.value })
                    }
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran (Role)
                </label>
                <select
                  value={getNormalizedRole(selectedUserForEdit.role)}
                  onChange={(e) =>
                    setSelectedUserForEdit({
                      ...selectedUserForEdit,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="pengguna">Pengguna</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instansi / Organisasi
                </label>
                <input
                  type="text"
                  value={selectedUserForEdit.instansi}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, instansi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Akun
                </label>
                <select
                  value={selectedUserForEdit.status}
                  onChange={(e) =>
                    setSelectedUserForEdit({
                      ...selectedUserForEdit,
                      status: e.target.value as 'aktif' | 'nonaktif',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Detail Profil Pengguna */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-sm text-white ${
                    getNormalizedRole(selectedUserForDetail.role) === 'admin'
                      ? 'bg-purple-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {selectedUserForDetail.nama
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedUserForDetail.nama}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedUserForDetail.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Instansi / Organisasi</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedUserForDetail.instansi}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Peran Akun</p>
                <div className="mt-1">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                      getNormalizedRole(selectedUserForDetail.role) === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {getNormalizedRole(selectedUserForDetail.role) === 'admin' ? 'Admin' : 'Pengguna'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Status Akun</p>
                <div className="mt-1">
                  <TableBadge status={selectedUserForDetail.status} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Nomor Kontak / WA</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedUserForDetail.telepon || '-'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Tanggal Terdaftar</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedUserForDetail.tanggalDaftar || 'Data default'}
                </p>
              </div>

              <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-semibold">Aktivitas Terakhir Login</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedUserForDetail.terakhirLogin || '-'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  const toEdit = selectedUserForDetail;
                  setSelectedUserForDetail(null);
                  setSelectedUserForEdit(toEdit);
                }}
                className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-amber-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
              >
                Edit Akun Ini
              </button>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Pengguna */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedUserForDelete.nama}
                </strong>{' '}
                ({selectedUserForDelete.email}) dari database? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="w-full py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
