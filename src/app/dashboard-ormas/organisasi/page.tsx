'use client';

import React, { useState } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import OrmasSubmissionModal from '@/components/dashboard/OrmasSubmissionModal';

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

export default function OrmasOrganisasiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Active Tab state for submitted view (6 tabs matching admin page)
  const [activeTab, setActiveTab] = useState<'status' | 'metadata' | 'dokumen' | 'surat' | 'pengurus' | 'anggota'>('status');

  // Toast Notification
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

  // Tab 1 & Metadata Form State
  const [currentStatus, setCurrentStatus] = useState<string>('diajukan');
  const [metadata, setMetadata] = useState({
    namaOrmas: 'IWAPI DPC MIMIKA',
    namaSingkat: 'IWAPI',
    jenisOrganisasi: 'ORMAS',
    alamat: 'JL. SERUI MEKAR',
    kodePos: '99910',
    telepon: '082233928988',
  });

  // Tab 5 Pengurus State
  const [ketuaNama, setKetuaNama] = useState('Maria Magdalena Maparey');
  const [sekretarisNama, setSekretarisNama] = useState('Theresia Natika');
  const [bendaharaNama, setBendaharaNama] = useState('Yuliana Kogoya');

  // Tab 6 Member State & Form
  const [members, setMembers] = useState<MemberItem[]>([
    {
      id: 1,
      nama: 'Maria Magdalena Maparey',
      jk: 'Perempuan',
      tanggalLahir: '1985-08-14',
      jabatan: 'Ketua',
    },
    {
      id: 2,
      nama: 'Theresia Natika',
      jk: 'Perempuan',
      tanggalLahir: '1990-03-22',
      jabatan: 'Sekretaris',
    },
    {
      id: 3,
      nama: 'Yuliana Kogoya',
      jk: 'Perempuan',
      tanggalLahir: '1992-11-05',
      jabatan: 'Bendahara',
    },
  ]);

  // Document Uploads State (8 items)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    logo: true,
    foto: true,
    akta: true,
    npwp: true,
    adart: true,
    program: false,
    kepemilikan: false,
    susunan: true,
  });

  // Surat Items State (7 items)
  const [uploadedSurat, setUploadedSurat] = useState<Record<string, boolean>>({
    permohonan: true,
    domisili: true,
    formulir: true,
    pernyataan: false,
    keabsahan: false,
    pengantar: false,
    kemenkumham: false,
  });

  // Calculate completeness percentage dynamically
  const calculateCompleteness = () => {
    let completed = 0;
    let total = 0;

    // 1. Metadata fields (6 items)
    const metaKeys = ['namaOrmas', 'namaSingkat', 'jenisOrganisasi', 'alamat', 'kodePos', 'telepon'] as const;
    metaKeys.forEach((key) => {
      total += 1;
      if (metadata[key] && metadata[key].trim() !== '') completed += 1;
    });

    // 2. Dokumen items (8 items)
    const docKeys = Object.keys(uploadedDocs);
    total += docKeys.length;
    docKeys.forEach((key) => {
      if (uploadedDocs[key]) completed += 1;
    });

    // 3. Surat items (7 items)
    const suratKeys = Object.keys(uploadedSurat);
    total += suratKeys.length;
    suratKeys.forEach((key) => {
      if (uploadedSurat[key]) completed += 1;
    });

    // 4. Pengurus (3 items)
    total += 3;
    if (ketuaNama.trim() !== '') completed += 1;
    if (sekretarisNama.trim() !== '') completed += 1;
    if (bendaharaNama.trim() !== '') completed += 1;

    // 5. Anggota (1 item)
    total += 1;
    if (members.length > 0) completed += 1;

    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total,
      remaining: total - completed,
    };
  };

  const completeness = calculateCompleteness();
  const currentCompleteness = completeness.percentage;

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Metadata organisasi berhasil diperbarui!');
  };

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

  // Anggota sorting state
  const [memberSortField, setMemberSortField] = useState<keyof MemberItem>('nama');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleMemberSort = (field: keyof MemberItem) => {
    if (memberSortField === field) {
      setMemberSortOrder(memberSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMemberSortField(field);
      setMemberSortOrder('asc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let valA = (a[memberSortField] || '') as string;
    let valB = (b[memberSortField] || '') as string;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return memberSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return memberSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleModalSubmitSuccess = (newSub: any) => {
    setMetadata({
      namaOrmas: newSub.namaOrganisasi || 'IWAPI DPC MIMIKA',
      namaSingkat: newSub.namaSingkat || 'IWAPI',
      jenisOrganisasi: newSub.jenisOrganisasi || 'ORMAS',
      alamat: newSub.alamatKantor || 'JL. SERUI MEKAR',
      kodePos: newSub.kodePos || '99910',
      telepon: newSub.noTelepon || '082233928988',
    });
    setCurrentStatus('diajukan');
    setHasSubmitted(true);
    showToast('Organisasi berhasil diajukan!');
  };

  const handleResetToEmpty = () => {
    setHasSubmitted(false);
    showToast('Tampilan kembali ke status kosong awal.');
  };

  // =========================================================================
  // VIEW 1: INITIAL EMPTY STATE (Belum Diajukan)
  // =========================================================================
  if (!hasSubmitted) {
    return (
      <div className="space-y-6 w-full pb-10 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMessage}
          </div>
        )}

        {/* Header Title matching Admin Dashboard style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Pendaftaran Organisasi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola status pendaftaran dan pantau riwayat log aktivitas pengajuan Ormas Anda di Kesbangpol Mimika.
            </p>
          </div>
        </div>

        {/* Section 1: Log Aktivitas (Empty State) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Log Aktivitas</span>
            </div>

            <button
              onClick={() => showToast('Belum ada riwayat aktivitas untuk ditampilkan.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Semua</span>
            </button>
          </div>

          <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Belum ada riwayat aktivitas.
          </div>
        </div>

        {/* Section 2: Organisasi (Empty State) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-4 transition-colors">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Organisasi</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Anda belum mengajukan organisasi anda.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Silakan klik tombol Ajukan untuk mengisi formulir pendaftaran legalitas Ormas di Kesbangpol Mimika.
              </p>
            </div>

            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                <span>Ajukan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Buat Organisasi */}
        <OrmasSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSubmitSuccess}
          initialData={metadata}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUBMITTED STATE ("Diajukan" - Identik dengan Halaman Admin)
  // =========================================================================
  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Top Header Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Formulir Pendaftaran Ormas Terdaftar
          </span>

          <button
            onClick={handleResetToEmpty}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset ke Tampilan Awal (Kosong)
          </button>
        </div>

        {/* Title & Header Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded border border-blue-200/80 dark:border-blue-800">
                  Pendaftaran Organisasi
                </span>
                <TableBadge status={currentStatus} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {metadata.namaOrmas}{' '}
                {metadata.namaSingkat ? (
                  <span className="text-slate-400 text-base font-bold">({metadata.namaSingkat})</span>
                ) : null}
              </h1>
            </div>

            {/* Kelengkapan Berkas Progress Pill */}
            <div className="bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0 self-start sm:self-auto w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Kelengkapan Berkas
                  </p>
                  <p
                    className={`text-sm font-black transition-colors ${
                      currentCompleteness >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : currentCompleteness >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {currentCompleteness}% Selesai ({completeness.completed}/{completeness.total})
                  </p>
                </div>
                <div className="w-20 sm:w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentCompleteness >= 80
                        ? 'bg-emerald-500'
                        : currentCompleteness >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${currentCompleteness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: Log Aktivitas Table                                             */}
      {/* ========================================================================= */}
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
              <p className="text-[11px] text-slate-400">Riwayat jejak permohonan pendaftaran organisasi</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Semua ({logs.length})
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[500px]">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 w-40">Timestamp</th>
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

      {/* ========================================================================= */}
      {/* SECTION: 6 Tabs Controller                                                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-2xs transition-colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {[
            {
              id: 'status',
              label: '1. Status',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              id: 'metadata',
              label: '2. Metadata',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              id: 'dokumen',
              label: '3. Dokumen',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              id: 'surat',
              label: '4. Surat',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              id: 'pengurus',
              label: '5. Pengurus',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              id: 'anggota',
              label: '6. Anggota',
              icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg text-xs font-bold transition-all text-center min-w-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STATUS & APPROVAL                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Status Organisasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Status Organisasi
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Terdaftar di Sistem
              </span>
            </div>

            <div className="text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Organisasi</span>
                <span className="font-black text-slate-900 dark:text-white sm:text-right">{metadata.namaOrmas || '-'}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Singkat</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 sm:text-right">{metadata.namaSingkat || '-'}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Alamat Kantor / Sekretariat</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 sm:text-right">{metadata.alamat || '-'}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kode Pos</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 sm:text-right">{metadata.kodePos || '-'}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">No. Telepon</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 sm:text-right">{metadata.telepon || '-'}</span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">Status</span>
                <div>
                  <TableBadge status={currentStatus} />
                </div>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kelengkapan Data</span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="font-black text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">
                    {currentCompleteness}% ({completeness.completed}/{completeness.total})
                  </span>
                  <div className="flex-1 sm:w-28 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        currentCompleteness >= 80
                          ? 'bg-emerald-500'
                          : currentCompleteness >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${currentCompleteness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() =>
                  showToast(
                    `📋 Kelengkapan Data ${currentCompleteness}%: (${completeness.completed} dari ${completeness.total} item berkas/identitas terisi)`
                  )
                }
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all text-center"
              >
                Periksa
              </button>
            </div>
          </div>

          {/* Card Approval / Status Verifikasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Approval
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kesbangpol Mimika</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Pengajuan Saat Ini</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <TableBadge status={currentStatus} />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan / Catatan</label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Berkas permohonan pendaftaran organisasi Anda telah berhasil diajukan dan sedang dalam antrean pemeriksaan oleh verifikator Badan Kesbangpol Kabupaten Mimika.
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-blue-700 dark:text-sky-300">💡 Tahap Selanjutnya:</p>
                <p>Silakan lengkapi tab Dokumen, Surat, Pengurus, dan Anggota untuk mempercepat proses penerbitan Surat Keterangan Terdaftar (SKT).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: METADATA                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'metadata' && (
        <form onSubmit={handleSaveMetadata} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
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
              <select
                value={metadata.jenisOrganisasi}
                onChange={(e) => setMetadata({ ...metadata, jenisOrganisasi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="ORMAS">ORMAS</option>
                <option value="FKUB">FKUB</option>
              </select>
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dokumen')}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all text-center"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOKUMEN KELENGKAPAN (Rapi dengan Footer Card)                      */}
      {/* ========================================================================= */}
      {activeTab === 'dokumen' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Dokumen Kelengkapan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Unggah dokumen kelengkapan administrasi format PDF (Max 1 Mb)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              { id: 'logo', title: 'Logo Organisasi', desc: 'Logo dalam bentuk dokumen dengan ekstensi PDF Max 1 Mb' },
              { id: 'foto', title: 'Foto Kantor', desc: 'Scan foto kantor atau sekretariat tampak depan yang memuat papan nama, PDF Max 1 Mb' },
              { id: 'akta', title: 'Akta Notaris', desc: 'Scan akta notaris, dengan ekstensi PDF Max 1 Mb' },
              { id: 'npwp', title: 'NPWP', desc: 'Scan NPWP, dengan ekstensi PDF Max 1 Mb' },
              { id: 'adart', title: 'AD / ART', desc: 'Anggaran Dasar - Anggaran Rumah Tangga, dengan ekstensi PDF Max 1 Mb' },
              { id: 'program', title: 'Dokumen Program Kerja', desc: 'Scan dokumen program kerja organisasi, dengan ekstensi PDF Max 1 Mb' },
              { id: 'kepemilikan', title: 'Dokumen Bukti Kepemilikan', desc: 'Scan dokumen Bukti Kepemilikan atau Surat Perjanjian Kontrak / Ijin Pakai, PDF Max 1 Mb' },
              { id: 'susunan', title: 'Dokumen Susunan Pengurus', desc: 'Scan dokumen Surat Keputusan Susunan Pengurus sesuai AD dan ART, PDF Max 1 Mb' },
            ].map((doc) => {
              const isUploaded = uploadedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {doc.title}
                      </h3>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                        PDF (1MB)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {doc.desc}
                    </p>

                    {/* File Input Selector */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all group">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                          {isUploaded ? `${doc.title}.pdf` : 'Pilih file PDF...'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={() => {
                          setUploadedDocs((prev) => ({ ...prev, [doc.id]: true }));
                          showToast(`Dokumen ${doc.title} berhasil diunggah!`);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Card Bottom Footer: Status & Tombol Simpan didalam card */}
                  <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Terunggah</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium truncate">Belum diunggah</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isUploaded;
                        setUploadedDocs((prev) => ({ ...prev, [doc.id]: nextState }));
                        showToast(nextState ? `Dokumen ${doc.title} disimpan ✓` : `Dokumen ${doc.title} dibatalkan`);
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        isUploaded
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                      }`}
                    >
                      {isUploaded ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Disimpan ✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Simpan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-center"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('surat')}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm text-center"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SURAT KELENGKAPAN (Rapi dengan Footer Card)                        */}
      {/* ========================================================================= */}
      {activeTab === 'surat' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Surat Kelengkapan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Surat permohonan, rekomendasi, dan pengesahan resmi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Surat Permohonan Card */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden col-span-1 md:col-span-2 flex flex-col justify-between shadow-2xs">
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Surat Permohonan Pendaftaran
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded shrink-0">
                    Dokumen Utama
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Scan Surat Permohonan resmi ditandatangani pengurus dengan ekstensi PDF Max 1 Mb
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nomor Surat</label>
                    <input
                      type="text"
                      defaultValue="01/IWAPI/MMK/X/2022"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tanggal Surat</label>
                    <input
                      type="date"
                      defaultValue="2022-10-15"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-400 transition-colors group">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                        {uploadedSurat.permohonan ? 'Surat_Permohonan.pdf' : 'Pilih file PDF...'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={() => {
                          setUploadedSurat((prev) => ({ ...prev, permohonan: true }));
                          showToast('Surat Permohonan berhasil diunggah!');
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Surat Permohonan */}
              <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {uploadedSurat.permohonan ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Surat Terunggah</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Belum diunggah</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUploadedSurat((prev) => ({ ...prev, permohonan: true }));
                    showToast('Surat Permohonan berhasil disimpan ✓');
                  }}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Simpan Surat Permohonan
                </button>
              </div>
            </div>

            {[
              { id: 'domisili', title: 'Surat Keterangan Domisili', desc: 'Surat Keterangan Domisili Sekretariat organisasi dari Lurah/Kepala Desa, PDF Max 1 Mb' },
              { id: 'formulir', title: 'Scan Formulir', desc: 'Scan Formulir Isian Data Organisasi ditandatangani Ketua & Sekretaris, PDF Max 1 Mb' },
              { id: 'pernyataan', title: 'Surat Pernyataan', desc: 'Scan Surat Pernyataan sesuai Permendagri 57 Tahun 2017, PDF Max 1 Mb' },
              { id: 'keabsahan', title: 'Surat Keabsahan', desc: 'File keabsahan organisasi, dalam format PDF Max 1 Mb' },
              { id: 'pengantar', title: 'Surat Pengantar Keabsahan', desc: 'Surat Pengantar Keabsahan dari Kesbangpol Prov / Kab / Kota, PDF Max 1 Mb' },
              { id: 'kemenkumham', title: 'Surat Pengesahan Kemenkumham / Kemendagri', desc: 'Surat Pengesahan / Terdaftar Ormas di Kemendkumham / Kemendagri, PDF Max 1 Mb' },
            ].map((surat) => {
              const isUploaded = uploadedSurat[surat.id];
              return (
                <div
                  key={surat.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {surat.title}
                      </h3>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                        PDF (1MB)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{surat.desc}</p>

                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-400 transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {isUploaded ? `${surat.title}.pdf` : 'Pilih file PDF...'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={() => {
                          setUploadedSurat((prev) => ({ ...prev, [surat.id]: true }));
                          showToast(`${surat.title} berhasil diunggah!`);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Card Bottom Footer: Status & Tombol Simpan */}
                  <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Terunggah</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium truncate">Belum diunggah</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isUploaded;
                        setUploadedSurat((prev) => ({ ...prev, [surat.id]: nextState }));
                        showToast(nextState ? `Surat ${surat.title} disimpan ✓` : `Surat ${surat.title} dibatalkan`);
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        isUploaded
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                      }`}
                    >
                      {isUploaded ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Disimpan ✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Simpan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('dokumen')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-center"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pengurus')}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm text-center"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATA PENGURUS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'pengurus' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Data Pengurus Inti
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Penanggung jawab utama (Ketua, Sekretaris, Bendahara)</p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Ketua Section Card */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 space-y-4">
                <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-lg">
                  Jabatan: Ketua Umum
                </span>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Ketua</label>
                  <input
                    type="text"
                    value={ketuaNama}
                    onChange={(e) => setKetuaNama(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { label: 'Foto Ketua (4x6 PDF Max 1Mb)' },
                    { label: 'Scan KTP Ketua (PDF Max 1Mb)' },
                    { label: 'File Biodata Ketua (PDF Max 1Mb)' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.label}</label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="truncate">Pilih File...</span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Data Ketua disimpan ✓')}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs text-center"
                >
                  Simpan Data Ketua
                </button>
              </div>
            </div>

            {/* Sekretaris Section Card */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 space-y-4">
                <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-lg">
                  Jabatan: Sekretaris
                </span>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Sekretaris</label>
                  <input
                    type="text"
                    value={sekretarisNama}
                    onChange={(e) => setSekretarisNama(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { label: 'Foto Sekretaris (4x6 PDF Max 1Mb)' },
                    { label: 'Scan KTP Sekretaris (PDF Max 1Mb)' },
                    { label: 'Biodata Sekretaris (PDF Max 1Mb)' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.label}</label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="truncate">Pilih File...</span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Data Sekretaris disimpan ✓')}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs text-center"
                >
                  Simpan Data Sekretaris
                </button>
              </div>
            </div>

            {/* Bendahara Section Card */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 space-y-4">
                <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
                  Jabatan: Bendahara
                </span>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Bendahara</label>
                  <input
                    type="text"
                    value={bendaharaNama}
                    onChange={(e) => setBendaharaNama(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { label: 'Foto Bendahara (4x6 PDF Max 1Mb)' },
                    { label: 'Scan KTP Bendahara (PDF Max 1Mb)' },
                    { label: 'Biodata Bendahara (PDF Max 1Mb)' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.label}</label>
                      <label className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="truncate">Pilih File...</span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Data Bendahara disimpan ✓')}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs text-center"
                >
                  Simpan Data Bendahara
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('surat')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-center"
            >
              &larr; Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('anggota')}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm text-center"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ANGGOTA                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'anggota' && (
        <div className="space-y-6">
          {/* Form Tambah Anggota */}
          <form onSubmit={handleAddMember} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
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

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm text-center"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => showToast('Seluruh data anggota selesai diproses')}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-center"
              >
                Selesai
              </button>
            </div>
          </form>

          {/* Table Daftar Anggota */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
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

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[550px]">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th
                      onClick={() => handleMemberSort('nama')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'nama' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleMemberSort('jk')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>JK</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'jk' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleMemberSort('tanggalLahir')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>Tanggal Lahir</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'tanggalLahir' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleMemberSort('jabatan')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>Jabatan</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'jabatan' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedMembers.map((m, idx) => (
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
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Pertama
                </button>
                <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 rounded-lg">
                  1 / 1
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
