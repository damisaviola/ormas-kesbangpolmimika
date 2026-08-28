'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import TableBadge from '@/components/dashboard/TableBadge';
import { StatusPengajuan } from '@/types/dashboard';

interface LogItem {
  timestamp: string;
  aktivitas: string;
  pesan: string;
  oleh: string;
}

interface MemberItem {
  id: number;
  nama: string;
  jk: 'Laki-laki' | 'Perempuan';
  tanggalLahir: string;
  jabatan: string;
}

export default function TinjauPengajuanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'status' | 'metadata' | 'dokumen' | 'surat' | 'pengurus' | 'anggota'>('status');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Activity Log State
  const [logs, setLogs] = useState<LogItem[]>([
    {
      timestamp: '15-10-2022 12:32:24',
      aktivitas: 'Pengajuan disiapkan oleh IWAPI DPC MIMIKA',
      pesan: '-',
      oleh: 'IWAPI DPC MIMIKA',
    },
    {
      timestamp: '15-10-2022 13:56:56',
      aktivitas: 'Perubahan status menjadi diajukan oleh IWAPI DPC MIMIKA',
      pesan: '-',
      oleh: 'IWAPI DPC MIMIKA',
    },
  ]);

  // Tab 1 Form State (Status & Approval)
  const [approvalStatus, setApprovalStatus] = useState<StatusPengajuan>('proses');
  const [approvalPesan, setApprovalPesan] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('diajukan');

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: LogItem = {
      timestamp: new Date().toLocaleString('id-ID'),
      aktivitas: `Status diubah menjadi ${approvalStatus} oleh Verifikator Kesbangpol`,
      pesan: approvalPesan || '-',
      oleh: 'Verifikator Kesbangpol Mimika',
    };
    setLogs([newLog, ...logs]);
    setCurrentStatus(approvalStatus);
    showToast('Status approval & pesan berhasil disimpan!');
  };

  // Tab 2 Form State (Metadata)
  const [metadata, setMetadata] = useState({
    namaOrmas: 'IWAPI DPC MIMIKA',
    namaSingkat: 'IWAPI',
    jenisOrganisasi: 'ORMAS',
    alamat: 'JL. SERUI MEKAR',
    kodePos: '99910',
    telepon: '082233928988',
  });

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Metadata organisasi berhasil diperbarui!');
  };

  // Tab 5 Pengurus State
  const [ketuaNama, setKetuaNama] = useState('dr. PUTTRI SULTAN');
  const [sekretarisNama, setSekretarisNama] = useState('Dessy Putrika');
  const [bendaharaNama, setBendaharaNama] = useState('Maria Goreti');

  // Tab 6 Member State & Form
  const [members, setMembers] = useState<MemberItem[]>([
    { id: 1, nama: 'dr. PUTTRI SULTAN', jk: 'Perempuan', tanggalLahir: '1983-02-14', jabatan: 'Ketua' },
    { id: 2, nama: 'Dessy Putrika', jk: 'Perempuan', tanggalLahir: '1980-12-10', jabatan: 'Sekretaris' },
    { id: 3, nama: 'Maria Goreti', jk: 'Perempuan', tanggalLahir: '1978-08-10', jabatan: 'Bendahara' },
  ]);

  const [newMember, setNewMember] = useState({
    nama: '',
    jk: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    tempatLahir: '',
    tanggalLahir: '',
    alamatDomisili: '',
    golDarah: 'A',
    nomorHp: '',
    pekerjaan: '',
    jabatan: 'Anggota',
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.nama) return;

    const mObj: MemberItem = {
      id: members.length + 1,
      nama: newMember.nama,
      jk: newMember.jk,
      tanggalLahir: newMember.tanggalLahir || '1995-01-01',
      jabatan: newMember.jabatan,
    };
    setMembers([...members, mObj]);
    setNewMember({
      nama: '',
      jk: 'Laki-laki',
      tempatLahir: '',
      tanggalLahir: '',
      alamatDomisili: '',
      golDarah: 'A',
      nomorHp: '',
      pekerjaan: '',
      jabatan: 'Anggota',
    });
    showToast('Data anggota baru berhasil ditambahkan!');
  };

  const handleDeleteMember = (memberId: number) => {
    setMembers(members.filter((m) => m.id !== memberId));
    showToast('Data anggota dihapus!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <Link
            href="/dashboard/pengajuan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-amber-400 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Pengajuan
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200/80 dark:border-blue-800">
                Pendaftaran Organisasi
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">ID: {id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {metadata.namaOrmas} <span className="text-slate-400 text-lg font-bold">({metadata.namaSingkat})</span>
            </h1>
          </div>
        </div>

        {/* Status Indicator & Completion Meter */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-5 shrink-0">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status Pengajuan</p>
            <div className="mt-1">
              <TableBadge status={currentStatus} />
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />

          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kelengkapan Data</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-black text-amber-600 dark:text-amber-400">58%</span>
              <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[58%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Aktivitas Accordion Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-amber-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Log Aktivitas
              </h2>
              <p className="text-[11px] text-slate-400">Riwayat jejak audit & permohonan pendaftaran</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Semua ({logs.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 w-44">Timestamp</th>
                <th className="py-2.5 px-4">Aktivitas</th>
                <th className="py-2.5 px-4">Pesan</th>
                <th className="py-2.5 px-4">Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{log.aktivitas}</td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{log.pesan}</td>
                  <td className="py-2.5 px-4 font-medium">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.oleh}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Segment Tab Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'status', label: '1. Status & Approval', icon: '📊' },
          { id: 'metadata', label: '2. Metadata', icon: 'ℹ️' },
          { id: 'dokumen', label: '3. Dokumen', icon: '📄' },
          { id: 'surat', label: '4. Surat', icon: '✉️' },
          { id: 'pengurus', label: '5. Pengurus', icon: '👤' },
          { id: 'anggota', label: '6. Anggota', icon: '👥' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: STATUS & APPROVAL */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Status Organisasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Status Organisasi
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Terverifikasi Sistem
              </span>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="pt-2 grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Organisasi</span>
                <span className="col-span-2 font-black text-slate-900 dark:text-white">{metadata.namaOrmas}</span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Singkat</span>
                <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{metadata.namaSingkat}</span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Alamat Kantor / Sekretariat</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200">{metadata.alamat}</span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kode Pos</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 font-mono">{metadata.kodePos}</span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">No. Telepon</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 font-semibold">{metadata.telepon}</span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2 items-center">
                <span className="font-bold text-slate-500 dark:text-slate-400">Status</span>
                <span className="col-span-2">
                  <TableBadge status={currentStatus} />
                </span>
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2 items-center">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kelengkapan Data</span>
                <div className="col-span-2 flex items-center gap-3">
                  <span className="font-black text-amber-600 dark:text-amber-400">58 %</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[58%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => showToast('Pemeriksaan kelengkapan berkas berhasil dilakukan')}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all"
              >
                Periksa Kelengkapan
              </button>
            </div>
          </div>

          {/* Card Approval */}
          <form onSubmit={handleSaveApproval} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Approval Verifikator
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aksi Verifikator</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keputusan Status Approval</label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value as StatusPengajuan)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="menunggu">Diajukan (Belum Diproses)</option>
                  <option value="proses">Dalam Proses Verifikasi Lapangan</option>
                  <option value="disetujui">Disetujui (Terbitkan SKT)</option>
                  <option value="ditolak">Ditolak / Perlu Revisi Berkas</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan / Catatan Verifikator</label>
                <textarea
                  rows={5}
                  placeholder="Tuliskan catatan hasil pemeriksaan berkas atau instruksi perbaikan..."
                  value={approvalPesan}
                  onChange={(e) => setApprovalPesan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all active:scale-98"
              >
                Simpan Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: METADATA */}
      {activeTab === 'metadata' && (
        <form onSubmit={handleSaveMetadata} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tentang Organisasi
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Identitas dasar dan domisili kantor sekretariat</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Organisasi</label>
              <input
                type="text"
                value={metadata.namaOrmas}
                onChange={(e) => setMetadata({ ...metadata, namaOrmas: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Singkat</label>
              <input
                type="text"
                value={metadata.namaSingkat}
                onChange={(e) => setMetadata({ ...metadata, namaSingkat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Organisasi</label>
              <input
                type="text"
                value={metadata.jenisOrganisasi}
                onChange={(e) => setMetadata({ ...metadata, jenisOrganisasi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor</label>
              <input
                type="text"
                value={metadata.alamat}
                onChange={(e) => setMetadata({ ...metadata, alamat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Pos</label>
              <input
                type="text"
                value={metadata.kodePos}
                onChange={(e) => setMetadata({ ...metadata, kodePos: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Telepon</label>
              <input
                type="text"
                value={metadata.telepon}
                onChange={(e) => setMetadata({ ...metadata, telepon: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dokumen')}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: DOKUMEN KELENGKAPAN */}
      {activeTab === 'dokumen' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Dokumen Kelengkapan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Unggah dokumen kelengkapan administrasi format PDF (Max 1 Mb)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              { title: 'Logo Organisasi', desc: 'Logo dalam bentuk dokumen dengan ekstensi PDF Max 1 Mb' },
              { title: 'Foto Kantor', desc: 'Scan foto kantor atau sekretariat tampak depan yang memuat papan nama, PDF Max 1 Mb' },
              { title: 'Akta Notaris', desc: 'Scan akta notaris, dengan ekstensi PDF Max 1 Mb' },
              { title: 'NPWP', desc: 'Scan NPWP, dengan ekstensi PDF Max 1 Mb' },
              { title: 'AD / ART', desc: 'Anggaran Dasar - Anggaran Rumah Tangga, dengan ekstensi PDF Max 1 Mb' },
              { title: 'Dokumen Program Kerja', desc: 'Scan dokumen program kerja organisasi, dengan ekstensi PDF Max 1 Mb' },
              { title: 'Dokumen Bukti Kepemilikan', desc: 'Scan dokumen Bukti Kepemilikan atau Surat Perjanjian Kontrak / Ijin Pakai, PDF Max 1 Mb' },
              { title: 'Dokumen Susunan Pengurus', desc: 'Scan dokumen Surat Keputusan Susunan Pengurus sesuai AD dan ART, PDF Max 1 Mb' },
            ].map((doc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-slate-900 dark:text-white text-xs">{doc.title}</p>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                    PDF (1MB)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.desc}</p>
                <div className="flex items-center gap-2 pt-1">
                  <input type="file" className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-slate-800 dark:file:text-slate-300" />
                  <button
                    type="button"
                    onClick={() => showToast(`Dokumen ${doc.title} disimpan`)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shrink-0 shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('surat')}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SURAT KELENGKAPAN */}
      {activeTab === 'surat' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Surat Kelengkapan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Surat permohonan, rekomendasi, dan pengesahan resmi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Surat Permohonan Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Surat Permohonan Pendaftaran</p>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded">
                  Dokumen Utama
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan Surat Permohonan resmi ditandatangani pengurus dengan ekstensi PDF Max 1 Mb</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nomor Surat</label>
                  <input type="text" placeholder="Nomor Surat..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tanggal Surat</label>
                  <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" />
                </div>
                <div className="flex items-end">
                  <input type="file" className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => showToast('Surat Permohonan berhasil disimpan')} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl">
                  Simpan Surat Permohonan
                </button>
              </div>
            </div>

            {[
              { title: 'Surat Keterangan Domisili', desc: 'Surat Keterangan Domisili Sekretariat organisasi dari Lurah/Kepala Desa, PDF Max 1 Mb' },
              { title: 'Scan Formulir', desc: 'Scan Formulir Isian Data Organisasi ditandatangani Ketua & Sekretaris, PDF Max 1 Mb' },
              { title: 'Surat Pernyataan', desc: 'Scan Surat Pernyataan sesuai Permendagri 57 Tahun 2017, PDF Max 1 Mb' },
              { title: 'Surat Keabsahan', desc: 'File keabsahan organisasi, dalam format PDF Max 1 Mb' },
              { title: 'Surat Pengantar Keabsahan', desc: 'Surat Pengantar Keabsahan dari Kesbangpol Prov / Kab / Kota, PDF Max 1 Mb' },
              { title: 'Surat Pengesahan Kemenkumham / Kemendagri', desc: 'Surat Pengesahan / Terdaftar Ormas di Kemendkumham / Kemendagri, PDF Max 1 Mb' },
            ].map((surat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">{surat.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{surat.desc}</p>
                <div className="flex items-center gap-2 pt-1">
                  <input type="file" className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-slate-800 dark:file:text-slate-300" />
                  <button
                    type="button"
                    onClick={() => showToast(`Surat ${surat.title} disimpan`)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shrink-0 shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('dokumen')}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pengurus')}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: DATA PENGURUS */}
      {activeTab === 'pengurus' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Data Pengurus Inti
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Penanggung jawab utama (Ketua, Sekretaris, Bendahara)</p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Ketua Section Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-lg">
                Jabatan: Ketua Umum
              </span>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Ketua</label>
                <input
                  type="text"
                  value={ketuaNama}
                  onChange={(e) => setKetuaNama(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Foto Ketua (4x6 PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Scan KTP Ketua (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">File Biodata Ketua (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => showToast('Data Ketua disimpan')} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs">
                  Simpan Data Ketua
                </button>
              </div>
            </div>

            {/* Sekretaris Section Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-lg">
                Jabatan: Sekretaris
              </span>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Sekretaris</label>
                <input
                  type="text"
                  value={sekretarisNama}
                  onChange={(e) => setSekretarisNama(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Foto Sekretaris (4x6 PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Scan KTP Sekretaris (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Biodata Sekretaris (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => showToast('Data Sekretaris disimpan')} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs">
                  Simpan Data Sekretaris
                </button>
              </div>
            </div>

            {/* Bendahara Section Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
                Jabatan: Bendahara
              </span>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Bendahara</label>
                <input
                  type="text"
                  value={bendaharaNama}
                  onChange={(e) => setBendaharaNama(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Foto Bendahara (4x6 PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Scan KTP Bendahara (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Biodata Bendahara (PDF Max 1Mb)</label>
                  <input type="file" className="text-[11px] text-slate-500" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => showToast('Data Bendahara disimpan')} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs">
                  Simpan Data Bendahara
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('surat')}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('anggota')}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: ANGGOTA */}
      {activeTab === 'anggota' && (
        <div className="space-y-6">
          {/* Form Tambah Anggota */}
          <form onSubmit={handleAddMember} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Tambah Anggota Baru
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Input data keanggotaan Ormas untuk verifikasi</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap..."
                  value={newMember.nama}
                  onChange={(e) => setNewMember({ ...newMember, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                <select
                  value={newMember.jk}
                  onChange={(e) => setNewMember({ ...newMember, jk: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Timika, Jayapura..."
                  value={newMember.tempatLahir}
                  onChange={(e) => setNewMember({ ...newMember, tempatLahir: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={newMember.tanggalLahir}
                  onChange={(e) => setNewMember({ ...newMember, tanggalLahir: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  placeholder="Jl. Serui Mekar..."
                  value={newMember.alamatDomisili}
                  onChange={(e) => setNewMember({ ...newMember, alamatDomisili: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Golongan Darah</label>
                <select
                  value={newMember.golDarah}
                  onChange={(e) => setNewMember({ ...newMember, golDarah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor HP</label>
                <input
                  type="text"
                  placeholder="0822..."
                  value={newMember.nomorHp}
                  onChange={(e) => setNewMember({ ...newMember, nomorHp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Wiraswasta, PNS..."
                  value={newMember.pekerjaan}
                  onChange={(e) => setNewMember({ ...newMember, pekerjaan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan Dalam Ormas</label>
                <select
                  value={newMember.jabatan}
                  onChange={(e) => setNewMember({ ...newMember, jabatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ketua">Ketua</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Anggota">Anggota</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => showToast('Seluruh data anggota selesai diproses')}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Selesai
              </button>
            </div>
          </form>

          {/* Table Daftar Anggota */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Daftar Anggota ({members.length})
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Tampilkan</span>
                <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">JK</th>
                    <th className="py-3 px-4">Tanggal Lahir</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{m.nama}</td>
                      <td className="py-3.5 px-4 font-medium">{m.jk}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{m.tanggalLahir}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-700 dark:text-amber-400">{m.jabatan}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id)}
                          className="px-3 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Menampilkan {members.length} dari {members.length} anggota</span>
              <div className="flex items-center gap-1.5">
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Pertama
                </button>
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 rounded-lg">
                  1 / 1 halaman
                </span>
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Selanjutnya
                </button>
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Terakhir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
