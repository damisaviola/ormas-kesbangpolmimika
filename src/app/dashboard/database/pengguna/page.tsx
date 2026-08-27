'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import { INITIAL_USERS } from '@/data/dashboard-data';
import { UserAccount } from '@/types/dashboard';

export default function DatabasePenggunaPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    nama: '',
    email: '',
    nik: '',
    role: 'verifikator' as any,
    instansi: 'Badan Kesbangpol Kabupaten Mimika',
  });

  const filtered = users.filter((u) => {
    return (
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nik.includes(searchTerm)
    );
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nama || !newUser.email) return;

    const userObj: UserAccount = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      nama: newUser.nama,
      email: newUser.email,
      nik: newUser.nik || '9109019909990001',
      role: newUser.role,
      status: 'aktif',
      instansi: newUser.instansi,
      terakhirLogin: 'Baru saja',
    };

    setUsers([userObj, ...users]);
    setNewUser({
      nama: '',
      email: '',
      nik: '',
      role: 'verifikator',
      instansi: 'Badan Kesbangpol Kabupaten Mimika',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Database Master
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Pengguna (User Accounts)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar akun pengelola sistem, verifikator Kesbangpol, dan admin Ormas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="w-full md:w-80 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, email, NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Pengguna</th>
                <th className="py-3.5 px-4">NIK</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Instansi / Organisasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Terakhir Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <p className="font-bold text-slate-900">{u.nama}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700">{u.nik}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                        u.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : u.role === 'verifikator'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-800">{u.instansi}</td>
                  <td className="py-4 px-4">
                    <TableBadge status={u.status} />
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500">{u.terakhirLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddUser}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Pengguna Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Yani, S.IP"
                  value={newUser.nama}
                  onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="ahmad@mimikakab.go.id"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none"
                >
                  <option value="verifikator">Verifikator Kesbangpol</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="admin_ormas">Admin Ormas</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instansi / Organisasi</label>
                <input
                  type="text"
                  value={newUser.instansi}
                  onChange={(e) => setNewUser({ ...newUser, instansi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
