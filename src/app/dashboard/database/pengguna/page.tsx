'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import PenggunaLoading from '@/app/dashboard/database/pengguna/loading';
import { UserAccount } from '@/types/dashboard';
import { exportToCsv, printReportPdf } from '@/utils/exportUtils';

export default function DatabasePenggunaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'ormas' | 'semua'>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAccountType, setAddAccountType] = useState<'admin' | 'ormas'>('admin');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccount | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserAccount | null>(null);

  // Feedback Notification & Form Errors
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState<{
    nama: string;
    email: string;
    nip: string;
    role: string;
    instansi: string;
    namaOrmas: string;
    singkatan: string;
    telepon: string;
    password: string;
    confirmPassword: string;
  }>({
    nama: '',
    email: '',
    nip: '',
    role: 'superadmin',
    instansi: 'Badan Kesbangpol Kabupaten Mimika',
    namaOrmas: '',
    singkatan: '',
    telepon: '',
    password: '',
    confirmPassword: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/pengguna', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (err) {
      console.warn('Gagal memuat pengguna dari database:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialUsers() {
      try {
        const res = await fetch('/api/pengguna', { cache: 'no-store' });
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setUsers(json.data);
        }
      } catch (err) {
        console.warn('Gagal memuat pengguna dari database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchInitialUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <PenggunaLoading />;
  }

  // Helper untuk menentukan apakah akun adalah Admin Kesbangpol
  const isAdminAccount = (u: UserAccount) => {
    return (
      u.userType === 'admin' ||
      u.role === 'admin' ||
      u.rawRole === 'superadmin' ||
      u.rawRole === 'verifikator' ||
      u.email.toLowerCase().includes('kesbangpol')
    );
  };

  // Filter lists based on role type
  const adminUsers = users.filter((u) => isAdminAccount(u));
  const ormasUsers = users.filter((u) => !isAdminAccount(u));

  // Filter function by search term and status
  const filterList = (list: UserAccount[]) => {
    return list.filter((u) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        u.nama.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.nip && u.nip.toLowerCase().includes(search)) ||
        (u.ormasNama && u.ormasNama.toLowerCase().includes(search)) ||
        (u.singkatan && u.singkatan.toLowerCase().includes(search)) ||
        (u.nomorTiket && u.nomorTiket.toLowerCase().includes(search)) ||
        (u.instansi && u.instansi.toLowerCase().includes(search));

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredAdminUsers = filterList(adminUsers);
  const filteredOrmasUsers = filterList(ormasUsers);

  // Metrics
  const totalCount = users.length;
  const adminCount = adminUsers.length;
  const ormasCount = ormasUsers.length;
  const activeCount = users.filter((u) => u.status === 'aktif').length;

  // Handle Export CSV
  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'admin') {
      const headers = ['No', 'ID', 'Nama Petugas', 'NIP', 'Email Kedinasan', 'Peran Otoritas', 'Instansi', 'Status Akun', 'Terakhir Login'];
      const rows = filteredAdminUsers.map((u, i) => [
        i + 1,
        u.id,
        u.nama,
        u.nip || '-',
        u.email,
        u.rawRole === 'verifikator' ? 'Verifikator Berkas' : 'Superadmin Kesbangpol',
        u.instansi || 'Badan Kesbangpol Kabupaten Mimika',
        u.status,
        u.terakhirLogin || '-',
      ]);
      exportToCsv(`Data_Admin_Kesbangpol_Mimika_${timestamp}`, headers, rows);
    } else if (activeTab === 'ormas') {
      const headers = ['No', 'ID', 'Penanggung Jawab', 'Nama Ormas', 'Singkatan', 'Email Ormas', 'Telepon / WA', 'Status SKT', 'Nomor Tiket', 'Status Akun', 'Terakhir Login'];
      const rows = filteredOrmasUsers.map((u, i) => [
        i + 1,
        u.id,
        u.nama,
        u.ormasNama || u.instansi || '-',
        u.singkatan || '-',
        u.email,
        u.telepon || '-',
        u.statusSkt || 'Belum Mengajukan',
        u.nomorTiket || '-',
        u.status,
        u.terakhirLogin || '-',
      ]);
      exportToCsv(`Data_User_Pengajuan_Ormas_Mimika_${timestamp}`, headers, rows);
    } else {
      const headers = ['No', 'ID', 'Kategori Akun', 'Nama Akun / Kontak', 'NIP / Nama Ormas', 'Email', 'Telepon', 'Status Akun', 'Terakhir Login'];
      const rows = [...filteredAdminUsers.map((u, i) => [
        i + 1,
        u.id,
        'Admin Kesbangpol',
        u.nama,
        u.nip ? `NIP. ${u.nip}` : 'Aparatur Kesbangpol',
        u.email,
        u.telepon || '-',
        u.status,
        u.terakhirLogin || '-',
      ]), ...filteredOrmasUsers.map((u, i) => [
        filteredAdminUsers.length + i + 1,
        u.id,
        'User Pengajuan Ormas',
        u.nama,
        u.ormasNama || u.instansi || '-',
        u.email,
        u.telepon || '-',
        u.status,
        u.terakhirLogin || '-',
      ])];
      exportToCsv(`Data_Semua_Pengguna_Kesbangpol_Mimika_${timestamp}`, headers, rows);
    }
  };

  // Handle Print PDF
  const handlePrintPdf = () => {
    if (activeTab === 'admin') {
      const headers = ['Nama Petugas', 'NIP', 'Email Kedinasan', 'Peran Otoritas', 'Status', 'Terakhir Login'];
      const rows = filteredAdminUsers.map((u) => [
        u.nama,
        u.nip || '-',
        u.email,
        u.rawRole === 'verifikator' ? 'Verifikator' : 'Superadmin',
        u.status,
        u.terakhirLogin || '-',
      ]);
      printReportPdf({
        title: 'LAPORAN DATA ADMINISTRATOR & PETUGAS KESBANGPOL',
        subtitle: 'Daftar Aparatur Sipil & Petugas Verifikator Portal SI-ORMAS Kab. Mimika',
        headers,
        rows,
        keteranganFilter: `Total: ${filteredAdminUsers.length} Petugas Terdata`,
      });
    } else if (activeTab === 'ormas') {
      const headers = ['Penanggung Jawab', 'Organisasi / Ormas', 'Email Pengajuan', 'Status SKT', 'Nomor Tiket', 'Status Akun'];
      const rows = filteredOrmasUsers.map((u) => [
        u.nama,
        u.ormasNama || u.instansi || '-',
        u.email,
        u.statusSkt || 'Belum Mengajukan',
        u.nomorTiket || '-',
        u.status,
      ]);
      printReportPdf({
        title: 'LAPORAN DATA USER PENGAJUAN ORMAS (PEMOHON SKT)',
        subtitle: 'Daftar Akun Pemohon dan Organisasi Kemasyarakatan Terdaftar di Mimika',
        headers,
        rows,
        keteranganFilter: `Total: ${filteredOrmasUsers.length} Akun Ormas Terdata`,
      });
    } else {
      const headers = ['Kategori Akun', 'Nama Lengkap / Kontak', 'NIP / Organisasi', 'Email', 'Status Akun', 'Terakhir Login'];
      const rows = [
        ...filteredAdminUsers.map((u) => [
          'Admin Kesbangpol',
          u.nama,
          u.nip ? `NIP. ${u.nip}` : 'Aparatur Kesbangpol',
          u.email,
          u.status,
          u.terakhirLogin || '-',
        ]),
        ...filteredOrmasUsers.map((u) => [
          'User Pengajuan Ormas',
          u.nama,
          u.ormasNama || u.instansi || '-',
          u.email,
          u.status,
          u.terakhirLogin || '-',
        ]),
      ];
      printReportPdf({
        title: 'LAPORAN DATABASE PENGGUNA TERPADU (SI-ORMAS MIMIKA)',
        subtitle: 'Tabel Pemisahan Administrator Kesbangpol & User Pengajuan Ormas',
        headers,
        rows,
        keteranganFilter: `Total: ${users.length} Akun (${adminCount} Admin Kesbangpol, ${ormasCount} User Ormas)`,
      });
    }
  };

  // Submit Handler: Tambah Pengguna Baru
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUser.nama.trim() || !newUser.email.trim()) {
      setFormError('Nama dan Alamat Email wajib diisi.');
      return;
    }

    if (addAccountType === 'ormas' && !newUser.namaOrmas.trim()) {
      setFormError('Nama Organisasi Kemasyarakatan (Ormas) wajib diisi.');
      return;
    }

    if (!newUser.password) {
      setFormError('Kata sandi wajib diisi.');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setFormError('Kata sandi dan Konfirmasi Kata Sandi tidak cocok.');
      return;
    }

    if (newUser.password.length < 6) {
      setFormError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    try {
      const payload = {
        nama: newUser.nama.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: addAccountType === 'admin' ? newUser.role : 'pengguna',
        nip: addAccountType === 'admin' ? newUser.nip.trim() : null,
        instansi:
          addAccountType === 'admin'
            ? newUser.instansi.trim() || 'Badan Kesbangpol Kabupaten Mimika'
            : newUser.namaOrmas.trim(),
        namaOrmas: addAccountType === 'ormas' ? newUser.namaOrmas.trim() : null,
        telepon: newUser.telepon.trim() || null,
      };

      const res = await fetch('/api/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setFormError(json.message || 'Gagal menyimpan akun ke database.');
        return;
      }

      await loadUsers();
      setNewUser({
        nama: '',
        email: '',
        nip: '',
        role: 'superadmin',
        instansi: 'Badan Kesbangpol Kabupaten Mimika',
        namaOrmas: '',
        singkatan: '',
        telepon: '',
        password: '',
        confirmPassword: '',
      });
      setShowAddModal(false);
      showToast(json.message || `Akun "${newUser.nama}" berhasil disimpan ke database.`);
    } catch {
      setFormError('Gagal menghubungkan ke server database MySQL.');
    }
  };

  // Submit Handler: Edit Pengguna
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      const res = await fetch('/api/pengguna', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUserForEdit.id,
          nama: selectedUserForEdit.nama,
          email: selectedUserForEdit.email,
          instansi: selectedUserForEdit.instansi,
          telepon: selectedUserForEdit.telepon,
          nip: selectedUserForEdit.nip,
          status: selectedUserForEdit.status,
          role: selectedUserForEdit.role,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Data akun "${selectedUserForEdit.nama}" berhasil diperbarui di database.`);
      } else {
        showToast(json.message || 'Gagal memperbarui pengguna.');
      }
    } catch {
      showToast('Gagal memperbarui pengguna di database.');
    }

    await loadUsers();
    setSelectedUserForEdit(null);
  };

  // Submit Handler: Toggle Status
  const handleToggleStatus = async (u: UserAccount) => {
    const nextStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await fetch('/api/pengguna', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, status: nextStatus }),
      });
      showToast(
        `Status akun "${u.nama}" berhasil diubah menjadi ${
          nextStatus === 'aktif' ? 'Aktif' : 'Nonaktif'
        }.`
      );
    } catch {
      showToast('Gagal memperbarui status pengguna di database.');
    }
    await loadUsers();
  };

  // Submit Handler: Hapus Pengguna
  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;

    try {
      const res = await fetch(`/api/pengguna?id=${encodeURIComponent(selectedUserForDelete.id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) {
        showToast(json.message || 'Gagal menghapus pengguna.');
        setSelectedUserForDelete(null);
        return;
      }
      showToast(`Akun "${selectedUserForDelete.nama}" berhasil dihapus dari database.`);
    } catch {
      showToast('Gagal menghapus pengguna dari database.');
    }

    await loadUsers();
    setSelectedUserForDelete(null);
  };

  const handleResetToDefault = async () => {
    await loadUsers();
    showToast('Data database pengguna telah disinkronkan kembali.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Database Akun Pengguna & Administrator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen terpisah antara Akun Petugas Kesbangpol dan Akun User Pengajuan Ormas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-2xs cursor-pointer"
            title="Ekspor daftar ke format CSV"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all shadow-2xs cursor-pointer"
            title="Cetak atau simpan sebagai dokumen PDF"
          >
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs cursor-pointer"
            title="Sinkronisasi ulang dari database"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
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
        {/* Metric 1: Petugas Kesbangpol */}
        <div
          onClick={() => setActiveTab('admin')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Admin Kesbangpol
              </p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{adminCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Petugas & Verifikator SKT</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metric 2: User Pengajuan Ormas */}
        <div
          onClick={() => setActiveTab('ormas')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ormas'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User Pengajuan Ormas
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{ormasCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Pemohon Layanan Mandiri</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metric 3: Akun Aktif */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status Akun Aktif
            </p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{activeCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dapat login & beraktivitas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Metric 4: Total Semua Pengguna */}
        <div
          onClick={() => setActiveTab('semua')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'semua'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Seluruh Akun
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Admin + Ormas Terdaftar</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Distinct Tab Buttons: Admin Kesbangpol vs User Pengajuan Ormas vs Semua */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Kesbangpol</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'admin'
                    ? 'bg-blue-800 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {adminCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ormas')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'ormas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>User Pengajuan Ormas</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'ormas'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {ormasCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('semua')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'semua'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Semua Akun (Tabel Terpisah)</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'semua'
                    ? 'bg-slate-900 text-slate-200 dark:bg-slate-400 dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {totalCount}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, NIP, ormas, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Secondary Filter: Status */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Filter Status Akun:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          TABEL 1: ADMINISTRATOR & PETUGAS KESBANGPOL
          Ditampilkan jika activeTab === 'admin' atau 'semua'
      ======================================================== */}
      {(activeTab === 'admin' || activeTab === 'semua') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Tabel Administrator & Tim Verifikator Kesbangpol
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {filteredAdminUsers.length} Akun
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Aparatur Sipil Negara & Pengelola Sistem SI-ORMAS
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold uppercase tracking-wider text-[11px] border-b border-blue-100 dark:border-blue-900/60 select-none">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Petugas & NIP</th>
                    <th className="py-3.5 px-4">Email Kedinasan</th>
                    <th className="py-3.5 px-4">Kewenangan / Peran</th>
                    <th className="py-3.5 px-4">Satuan Kerja / Instansi</th>
                    <th className="py-3.5 px-4">Terakhir Aktif</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAdminUsers.length > 0 ? (
                    filteredAdminUsers.map((u, idx) => {
                      const isSuper = u.rawRole === 'superadmin' || u.role === 'admin';
                      const initials = u.nama
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={u.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
                          <td className="py-4 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-200 flex items-center justify-center font-black text-xs shrink-0 ring-2 ring-blue-300/60 dark:ring-blue-700">
                                {initials || 'AD'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                  {u.nama}
                                </p>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5 font-semibold">
                                  {u.nip ? `NIP. ${u.nip}` : 'NIP. Aparatur Dinas'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                isSuper
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {isSuper ? 'Superadmin Kesbangpol' : 'Verifikator Berkas'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            {u.instansi || 'Badan Kesbangpol Kabupaten Mimika'}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{u.terakhirLogin || '-'}</p>
                            <p className="text-[10px] text-slate-400">Daftar: {u.tanggalDaftar || '-'}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <TableBadge status={u.status} />
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                className={`text-[10px] font-bold underline cursor-pointer ${
                                  u.status === 'aktif'
                                    ? 'text-rose-500 hover:text-rose-700'
                                    : 'text-emerald-600 hover:text-emerald-800'
                                }`}
                              >
                                {u.status === 'aktif' ? 'Matikan' : 'Aktifkan'}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Detail */}
                              <button
                                onClick={() => setSelectedUserForDetail(u)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Lihat Detail Profil Petugas"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => setSelectedUserForEdit(u)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Edit Akun Petugas"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setSelectedUserForDelete(u)}
                                disabled={u.email === 'admin.kesbangpol@mimikakab.go.id'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  u.email === 'admin.kesbangpol@mimikakab.go.id'
                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                }`}
                                title={
                                  u.email === 'admin.kesbangpol@mimikakab.go.id'
                                    ? 'Akun Superadmin Utama dilindungi dari penghapusan'
                                    : 'Hapus Akun Petugas'
                                }
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
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        Tidak ada data petugas administrator yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TABEL 2: USER PENGAJUAN (ORMAS / PEMOHON SKT)
          Ditampilkan jika activeTab === 'ormas' atau 'semua'
      ======================================================== */}
      {(activeTab === 'ormas' || activeTab === 'semua') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Tabel User Pengajuan Ormas (Pemohon SKT)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {filteredOrmasUsers.length} Akun
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Akun Pengurus Organisasi Kemasyarakatan Pemohon Surat Keterangan Terdaftar
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px] border-b border-emerald-100 dark:border-emerald-900/60 select-none">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Penanggung Jawab / Pemohon</th>
                    <th className="py-3.5 px-4">Organisasi Kemasyarakatan</th>
                    <th className="py-3.5 px-4">Email & Kontak Akun</th>
                    <th className="py-3.5 px-4">Status SKT & No. Tiket</th>
                    <th className="py-3.5 px-4">Terakhir Login</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrmasUsers.length > 0 ? (
                    filteredOrmasUsers.map((u, idx) => {
                      const ormasTitle = u.ormasNama || u.instansi || 'Organisasi Baru';
                      const initials = u.nama
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={u.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="py-4 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 ring-2 ring-emerald-300/60 dark:ring-emerald-700">
                                {initials || 'OR'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                  {u.nama}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  Penanggung Jawab Ormas
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {ormasTitle}
                              </p>
                              {u.singkatan && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {u.singkatan}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{u.email}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              📞 {u.telepon || 'Belum diisi'}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider inline-block ${
                                  u.statusSkt === 'resmi' || u.statusSkt === 'Aktif'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                    : u.statusSkt === 'menunggu' || u.statusSkt === 'diajukan'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {u.statusSkt === 'resmi' || u.statusSkt === 'Aktif'
                                  ? 'SKT Resmi Terbit'
                                  : u.statusSkt === 'menunggu' || u.statusSkt === 'diajukan'
                                  ? 'Menunggu Verifikasi'
                                  : u.statusSkt || 'Belum Mengajukan'}
                              </span>
                              {u.nomorTiket && (
                                <p className="font-mono text-[10px] text-slate-500 font-semibold">
                                  {u.nomorTiket}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{u.terakhirLogin || '-'}</p>
                            <p className="text-[10px] text-slate-400">Daftar: {u.tanggalDaftar || '-'}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <TableBadge status={u.status} />
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === 'aktif' ? 'Nonaktifkan Akun Ormas' : 'Aktifkan Akun Ormas'}
                                className={`text-[10px] font-bold underline cursor-pointer ${
                                  u.status === 'aktif'
                                    ? 'text-rose-500 hover:text-rose-700'
                                    : 'text-emerald-600 hover:text-emerald-800'
                                }`}
                              >
                                {u.status === 'aktif' ? 'Matikan' : 'Aktifkan'}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Detail */}
                              <button
                                onClick={() => setSelectedUserForDetail(u)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Lihat Profil Ormas & Akun"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => setSelectedUserForEdit(u)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Edit Akun Ormas"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setSelectedUserForDelete(u)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Akun Ormas"
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
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        Tidak ada data akun user pengajuan ormas yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TAMBAH PENGGUNA BARU (DENGAN TABS ADMIN & ORMAS)
      ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 overflow-y-auto modal-backdrop">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Tambah Akun Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih tipe akun untuk menyimpan ke database sistem
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                {formError}
              </div>
            )}

            {/* Type Switcher: Admin Kesbangpol VS User Pengajuan Ormas */}
            <div className="mt-3 grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setAddAccountType('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addAccountType === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin Kesbangpol</span>
              </button>

              <button
                type="button"
                onClick={() => setAddAccountType('ormas')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addAccountType === 'ormas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>User Pengajuan Ormas</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser} className="space-y-3 text-xs overflow-y-auto flex-1 pr-1 pt-3">
              {addAccountType === 'admin' ? (
                <>
                  {/* Field: Nama Petugas */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Petugas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bpk. Yohanes Maturbongs, S.STP"
                      value={newUser.nama}
                      onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                    />
                  </div>

                  {/* Field: NIP & Email Kedinasan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        NIP Petugas
                      </label>
                      <input
                        type="text"
                        placeholder="19850423 201001 1 002"
                        value={newUser.nip}
                        onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Kedinasan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="petugas@mimikakab.go.id"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Field: Role & Satuan Kerja */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kewenangan Akun
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="superadmin">Superadmin Kesbangpol</option>
                        <option value="verifikator">Petugas Verifikator Berkas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Satuan Kerja
                      </label>
                      <input
                        type="text"
                        value={newUser.instansi}
                        onChange={(e) => setNewUser({ ...newUser, instansi: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Field: Nama Ormas */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Organisasi Kemasyarakatan (Ormas) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Yayasan Peduli Mimika Sejahtera"
                      value={newUser.namaOrmas}
                      onChange={(e) => setNewUser({ ...newUser, namaOrmas: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                    />
                  </div>

                  {/* Field: Nama Penanggung Jawab & Singkatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Penanggung Jawab <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Ketua Umum / Pengurus"
                        value={newUser.nama}
                        onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Singkatan Ormas
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: YPMS"
                        value={newUser.singkatan}
                        onChange={(e) => setNewUser({ ...newUser, singkatan: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Field: Email & Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Akun Ormas <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ormas@gmail.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        No. HP / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx"
                        value={newUser.telepon}
                        onChange={(e) => setNewUser({ ...newUser, telepon: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Konfirmasi Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi sandi"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all active:scale-[0.99] cursor-pointer ${
                    addAccountType === 'admin'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Simpan Akun ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PENGGUNA
      ======================================================== */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 overflow-y-auto modal-backdrop">
          <form
            onSubmit={handleEditUser}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit Akun {isAdminAccount(selectedUserForEdit) ? 'Admin Kesbangpol' : 'User Ormas'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto flex-1 pr-1 pt-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap / Penanggung Jawab
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

              {isAdminAccount(selectedUserForEdit) && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP Petugas
                  </label>
                  <input
                    type="text"
                    value={selectedUserForEdit.nip || ''}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, nip: e.target.value })
                    }
                    placeholder="19850423 201001 1 002"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email
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
                  {isAdminAccount(selectedUserForEdit) ? 'Satuan Kerja / Instansi' : 'Nama Organisasi Kemasyarakatan'}
                </label>
                <input
                  type="text"
                  value={selectedUserForEdit.instansi || ''}
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
                  <option value="aktif">Aktif (Dapat Login)</option>
                  <option value="nonaktif">Nonaktif (Diblokir Sementara)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: DETAIL PROFIL LENGKAP
      ======================================================== */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 overflow-y-auto modal-backdrop">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                    isAdminAccount(selectedUserForDetail) ? 'bg-blue-600' : 'bg-emerald-600'
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedUserForDetail.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs overflow-y-auto flex-1 pr-1 pt-3">
              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {isAdminAccount(selectedUserForDetail) ? 'Satuan Kerja' : 'Organisasi Kemasyarakatan'}
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                  {selectedUserForDetail.ormasNama || selectedUserForDetail.instansi || '-'}
                </p>
              </div>

              {isAdminAccount(selectedUserForDetail) ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">NIP Pegawai</p>
                  <p className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {selectedUserForDetail.nip ? `NIP. ${selectedUserForDetail.nip}` : 'Aparatur Sipil Negara'}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Nomor Tiket Pengajuan</p>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {selectedUserForDetail.nomorTiket || 'Belum Ada Pengajuan'}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Peran Akun</p>
                <div className="mt-1">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                      isAdminAccount(selectedUserForDetail)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {isAdminAccount(selectedUserForDetail)
                      ? selectedUserForDetail.rawRole === 'verifikator'
                        ? 'Verifikator Berkas'
                        : 'Superadmin Kesbangpol'
                      : 'User Pengajuan Ormas'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Nomor Telepon / WA</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {selectedUserForDetail.telepon || '-'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Akun</p>
                <div className="mt-1">
                  <TableBadge status={selectedUserForDetail.status} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tanggal Terdaftar</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {selectedUserForDetail.tanggalDaftar || '-'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Terakhir Login</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {selectedUserForDetail.terakhirLogin || '-'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  const toEdit = selectedUserForDetail;
                  setSelectedUserForDetail(null);
                  setSelectedUserForEdit(toEdit);
                }}
                className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg cursor-pointer"
              >
                Edit Akun Ini
              </button>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: HAPUS PENGGUNA
      ======================================================== */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 overflow-y-auto modal-backdrop">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/60 shrink-0">
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
                ({selectedUserForDelete.email}) dari database MySQL? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="w-full py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm cursor-pointer"
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
