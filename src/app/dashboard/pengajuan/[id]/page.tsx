'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import TableBadge from '@/components/dashboard/TableBadge';
import DetailPengajuanLoading from '@/app/dashboard/pengajuan/[id]/loading';
import { StatusPengajuan } from '@/types/dashboard';
import { getSubmissionById, updateSubmissionStatus } from '@/services/submissionStorage';
import { compressDocument } from '@/utils/fileCompression';

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

export interface UploadedDocDetail {
  id?: string;
  namaDokumen: string;
  namaFile: string;
  fileUrl: string;
  originalSizeFormatted?: string;
  compressedSizeFormatted?: string;
  ratio?: string;
  tanggalUnggah?: string;
  inDatabase?: boolean;
}

export default function TinjauPengajuanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isLoading, setIsLoading] = useState(true);

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
      aktivitas: 'Pengajuan disiapkan oleh pemohon',
      pesan: '-',
      oleh: 'Pemohon Ormas',
    },
    {
      timestamp: '15-10-2022 13:56:56',
      aktivitas: 'Perubahan status menjadi diajukan oleh pemohon',
      pesan: '-',
      oleh: 'Pemohon Ormas',
    },
  ]);

  // Tab 1 Form State (Status & Approval)
  const [approvalStatus, setApprovalStatus] = useState<StatusPengajuan>('diajukan');
  const [approvalPesan, setApprovalPesan] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('diajukan');

  // Tab 2 Form State (Metadata)
  const [metadata, setMetadata] = useState({
    namaOrmas: '',
    namaSingkat: '',
    jenisOrganisasi: '',
    alamat: '',
    kodePos: '',
    telepon: '',
  });
  const [pendaftarEmail, setPendaftarEmail] = useState('');
  const [pendaftarNama, setPendaftarNama] = useState('');

  // Tab 5 Pengurus State
  const [ketuaNama, setKetuaNama] = useState('');
  const [sekretarisNama, setSekretarisNama] = useState('');
  const [bendaharaNama, setBendaharaNama] = useState('');

  // Tab 6 Member State & Form
  const [members, setMembers] = useState<MemberItem[]>([]);

  // Document Uploads State (8 items)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    logo: false,
    foto: false,
    akta: false,
    npwp: false,
    adart: false,
    program: false,
    kepemilikan: false,
    susunan: false,
  });

  // Surat Items State (7 items)
  const [uploadedSurat, setUploadedSurat] = useState<Record<string, boolean>>({
    permohonan: false,
    domisili: false,
    formulir: false,
    pernyataan: false,
    keabsahan: false,
    pengantar: false,
    kemenkumham: false,
  });

  // Dokumen details state
  const [docDetails, setDocDetails] = useState<Record<string, UploadedDocDetail>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  useEffect(() => {
    const sub = getSubmissionById(id);
    if (sub) {
      setPendaftarEmail(sub.email || sub.pendaftarEmail || '');
      setPendaftarNama(sub.pendaftar || sub.ketuaUmum || '');
      setMetadata({
        namaOrmas: sub.namaOrmas || '',
        namaSingkat: sub.singkatan || '',
        jenisOrganisasi: sub.jenisOrmas || 'ORMAS',
        alamat: sub.alamat || '',
        kodePos: sub.kodePos || '99910',
        telepon: sub.telepon || '',
      });
      setKetuaNama(sub.ketuaUmum || sub.pendaftar || '');
      setCurrentStatus(sub.status || 'diajukan');
      setApprovalStatus(sub.status || 'diajukan');
      setLogs([
        {
          timestamp: `${sub.tanggalPengajuan} 08:30:00`,
          aktivitas: `Pengajuan disiapkan dan didaftarkan oleh ${sub.namaOrmas}`,
          pesan: sub.catatan || `Pendaftaran diajukan secara daring melalui portal Ormas Mimika (No: ${sub.nomorRegistrasi || sub.id})`,
          oleh: sub.namaOrmas,
        },
        {
          timestamp: `${sub.tanggalPengajuan} 09:00:00`,
          aktivitas: `Berkas permohonan masuk ke sistem verifikasi Bakesbangpol Mimika`,
          pesan: 'Menunggu pemeriksaan berkas dan administrasi oleh petugas verifikator',
          oleh: 'Sistem SI-ORMAS',
        },
      ]);

      // Ambil riwayat log aktivitas dari database
      if (sub.namaOrmas) {
        fetch(`/api/aktivitas?namaOrmas=${encodeURIComponent(sub.namaOrmas)}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              setLogs(json.data);
            }
          })
          .catch((err) => console.error('Error loading log aktivitas in admin:', err));
      }

      // Ambil dokumen dari database
      const ormasQuery = sub.namaOrmas ? encodeURIComponent(sub.namaOrmas) : '';
      if (ormasQuery) {
        fetch(`/api/dokumen?namaOrmas=${ormasQuery}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const docMap: Record<string, UploadedDocDetail> = {};
              const upDocs: Record<string, boolean> = {};
              const upSurat: Record<string, boolean> = {};

              const titleToKey: Record<string, { key: string; isSurat: boolean }> = {
                'logo organisasi': { key: 'logo', isSurat: false },
                'foto kantor': { key: 'foto', isSurat: false },
                'akta notaris': { key: 'akta', isSurat: false },
                'npwp': { key: 'npwp', isSurat: false },
                'ad / art': { key: 'adart', isSurat: false },
                'dokumen program kerja': { key: 'program', isSurat: false },
                'dokumen bukti kepemilikan': { key: 'kepemilikan', isSurat: false },
                'dokumen susunan pengurus': { key: 'susunan', isSurat: false },
                'surat permohonan pendaftaran': { key: 'permohonan', isSurat: true },
                'surat permohonan': { key: 'permohonan', isSurat: true },
                'surat keterangan domisili': { key: 'domisili', isSurat: true },
                'scan formulir': { key: 'formulir', isSurat: true },
                'surat pernyataan': { key: 'pernyataan', isSurat: true },
                'surat keabsahan': { key: 'keabsahan', isSurat: true },
                'surat pengantar keabsahan': { key: 'pengantar', isSurat: true },
                'surat pengesahan kemenkumham / kemendagri': { key: 'kemenkumham', isSurat: true },
              };

              json.data.forEach((item: any) => {
                const lowerTitle = (item.namaDokumen || '').toLowerCase();
                let matched = titleToKey[lowerTitle];
                if (!matched) {
                  const foundKey = Object.keys(titleToKey).find((k) => lowerTitle.includes(k));
                  if (foundKey) matched = titleToKey[foundKey];
                }

                const key = matched ? matched.key : lowerTitle.replace(/[^a-z0-9]/g, '_');
                const isSurat = matched ? matched.isSurat : false;

                if (isSurat) {
                  upSurat[key] = true;
                } else {
                  upDocs[key] = true;
                }

                docMap[key] = {
                  id: item.id,
                  namaDokumen: item.namaDokumen,
                  namaFile: item.namaFile || `${item.namaDokumen}.pdf`,
                  fileUrl: item.fileUrl || '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '2.4 MB',
                  compressedSizeFormatted: '512 KB',
                  ratio: '78%',
                  tanggalUnggah: item.tanggalUnggah
                    ? new Date(item.tanggalUnggah).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : undefined,
                  inDatabase: true,
                };
              });

              setDocDetails((prev) => ({ ...prev, ...docMap }));
              setUploadedDocs((prev) => ({ ...prev, ...upDocs }));
              setUploadedSurat((prev) => ({ ...prev, ...upSurat }));
            } else if (sub.id === 'SUBM-001' || sub.namaOrmas.includes('IWAPI')) {
              // Default data dokumen contoh untuk verifikasi IWAPI
              setUploadedDocs({
                logo: true,
                foto: true,
                akta: true,
                npwp: true,
                adart: true,
                program: false,
                kepemilikan: false,
                susunan: true,
              });
              setUploadedSurat({
                permohonan: true,
                domisili: true,
                formulir: true,
                pernyataan: false,
                keabsahan: false,
                pengantar: false,
                kemenkumham: false,
              });
              setDocDetails({
                logo: {
                  namaDokumen: 'Logo Organisasi',
                  namaFile: 'logo_iwapi_mimika.jpg',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '1.8 MB',
                  compressedSizeFormatted: '412 KB',
                  ratio: '77%',
                  tanggalUnggah: '15 Okt 2022, 12:30',
                  inDatabase: true,
                },
                foto: {
                  namaDokumen: 'Foto Kantor',
                  namaFile: 'kantor_sekretariat.jpg',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '3.2 MB',
                  compressedSizeFormatted: '640 KB',
                  ratio: '80%',
                  tanggalUnggah: '15 Okt 2022, 12:31',
                  inDatabase: true,
                },
                akta: {
                  namaDokumen: 'Akta Notaris',
                  namaFile: 'akta_notaris_pendirian.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '4.5 MB',
                  compressedSizeFormatted: '1.2 MB',
                  ratio: '73%',
                  tanggalUnggah: '15 Okt 2022, 12:32',
                  inDatabase: true,
                },
                npwp: {
                  namaDokumen: 'NPWP',
                  namaFile: 'npwp_organisasi.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '1.4 MB',
                  compressedSizeFormatted: '320 KB',
                  ratio: '77%',
                  tanggalUnggah: '15 Okt 2022, 12:33',
                  inDatabase: true,
                },
                adart: {
                  namaDokumen: 'AD / ART',
                  namaFile: 'ad_art_organisasi.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '5.1 MB',
                  compressedSizeFormatted: '1.5 MB',
                  ratio: '70%',
                  tanggalUnggah: '15 Okt 2022, 12:34',
                  inDatabase: true,
                },
                susunan: {
                  namaDokumen: 'Dokumen Susunan Pengurus',
                  namaFile: 'sk_susunan_pengurus.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '2.0 MB',
                  compressedSizeFormatted: '480 KB',
                  ratio: '76%',
                  tanggalUnggah: '15 Okt 2022, 12:35',
                  inDatabase: true,
                },
                permohonan: {
                  namaDokumen: 'Surat Permohonan Pendaftaran',
                  namaFile: 'surat_permohonan_resmi.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '1.2 MB',
                  compressedSizeFormatted: '310 KB',
                  ratio: '74%',
                  tanggalUnggah: '15 Okt 2022, 12:36',
                  inDatabase: true,
                },
                domisili: {
                  namaDokumen: 'Surat Keterangan Domisili',
                  namaFile: 'surat_domisili_kelurahan.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '1.6 MB',
                  compressedSizeFormatted: '390 KB',
                  ratio: '75%',
                  tanggalUnggah: '15 Okt 2022, 12:37',
                  inDatabase: true,
                },
                formulir: {
                  namaDokumen: 'Scan Formulir',
                  namaFile: 'scan_formulir_isian.pdf',
                  fileUrl: '/uploads/dokumen/sample_dokumen.pdf',
                  originalSizeFormatted: '2.8 MB',
                  compressedSizeFormatted: '620 KB',
                  ratio: '78%',
                  tanggalUnggah: '15 Okt 2022, 12:38',
                  inDatabase: true,
                },
              });
            }
          })
          .catch((err) => console.error('Error fetching admin docs:', err));
      }
    }

    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [id]);

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: LogItem = {
      timestamp: `${dateStr} ${timeStr}`,
      aktivitas: `Status diubah menjadi ${approvalStatus} oleh Verifikator Kesbangpol`,
      pesan: approvalPesan || '-',
      oleh: 'Verifikator Kesbangpol Mimika',
    };
    setLogs([newLog, ...logs]);
    setCurrentStatus(approvalStatus);
    updateSubmissionStatus(id, approvalStatus, approvalPesan);

    showToast('Status approval & pesan berhasil disimpan!');
  };

  const handleAdminFileUpload = async (
    docId: string,
    title: string,
    rawFile: File,
    isSurat: boolean = false
  ) => {
    try {
      setUploadingDocId(docId);
      showToast(`Mengompresi ${title}...`);

      const compResult = await compressDocument(rawFile);

      const formData = new FormData();
      formData.append('file', compResult.file);
      formData.append('docId', docId);
      formData.append('title', title);
      formData.append('namaOrmas', metadata.namaOrmas || 'Ormas Mimika');
      formData.append('actorName', 'Verifikator Kesbangpol Mimika');
      formData.append('pengajuanId', id);

      const res = await fetch('/api/dokumen/upload', {
        method: 'POST',
        body: formData,
      });

      const resJson = await res.json();

      if (resJson.success) {
        if (isSurat) {
          setUploadedSurat((prev) => ({ ...prev, [docId]: true }));
        } else {
          setUploadedDocs((prev) => ({ ...prev, [docId]: true }));
        }

        setDocDetails((prev) => ({
          ...prev,
          [docId]: {
            id: resJson.data.id,
            namaDokumen: title,
            namaFile: compResult.file.name,
            fileUrl: resJson.data.fileUrl,
            originalSizeFormatted: compResult.originalSizeFormatted,
            compressedSizeFormatted: compResult.compressedSizeFormatted,
            ratio: `${compResult.ratio}%`,
            tanggalUnggah: resJson.data.tanggalUnggah,
            inDatabase: true,
          },
        }));

        if (resJson.activityLog) {
          setLogs((prev) => [resJson.activityLog, ...prev]);
        }

        showToast(`✓ ${title} berhasil dikompresi (${compResult.ratio}%) & disimpan ke database!`);
      } else {
        showToast(`Gagal: ${resJson.message || 'Error server'}`);
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      showToast('Terjadi kesalahan saat mengompresi/mengunggah dokumen');
    } finally {
      setUploadingDocId(null);
    }
  };

  // Handler Hapus Berkas oleh Verifikator Admin
  const handleAdminDeleteDocument = async (docId: string, title: string, isSurat: boolean = false) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berkas "${title}" dari pengajuan ini?`)) {
      return;
    }
    try {
      showToast(`Menghapus berkas ${title}...`);
      const res = await fetch('/api/dokumen', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaDokumen: title,
          namaOrmas: metadata.namaOrmas,
          actorName: 'Verifikator Kesbangpol Mimika',
          pengajuanId: id,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        if (isSurat) {
          setUploadedSurat((prev) => ({ ...prev, [docId]: false }));
        } else {
          setUploadedDocs((prev) => ({ ...prev, [docId]: false }));
        }
        setDocDetails((prev) => {
          const updated = { ...prev };
          delete updated[docId];
          return updated;
        });

        if (resJson.activityLog) {
          setLogs((prev) => [resJson.activityLog, ...prev]);
        }
        showToast(`✓ Berkas "${title}" berhasil dihapus oleh Verifikator`);
      } else {
        showToast(`Gagal: ${resJson.message || 'Error server saat menghapus'}`);
      }
    } catch (err) {
      console.error('Error admin deleting document:', err);
      showToast('Terjadi kesalahan saat menghapus dokumen');
    }
  };

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

  if (isLoading) {
    return <DetailPengajuanLoading />;
  }

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

      {/* Page Header */}
      <div className="space-y-3">
        {/* Top Breadcrumb Nav & ID */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard/pengajuan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Pengajuan
          </Link>

          <span className="text-xs font-mono font-bold text-slate-400">
            ID: {id}
          </span>
        </div>

        {/* Title & Header Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded border border-blue-200/80 dark:border-blue-800">
                  Pendaftaran Organisasi
                </span>
                <TableBadge status={currentStatus} />
                {pendaftarEmail && (
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Pemohon: {pendaftarEmail}</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {metadata.namaOrmas || 'Formulir Pengajuan Baru'} {metadata.namaSingkat ? <span className="text-slate-400 text-base font-bold">({metadata.namaSingkat})</span> : null}
              </h1>
            </div>

            {/* Kelengkapan Berkas Progress Pill (Real-Time) */}
            <div className="bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0 self-start sm:self-auto">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kelengkapan Berkas</p>
                  <p className={`text-sm font-black transition-colors ${
                    currentCompleteness >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : currentCompleteness >= 50
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {currentCompleteness}% Selesai ({completeness.completed}/{completeness.total})
                  </p>
                </div>
                <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
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

      {/* Mobile Responsive Segment Tab Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-2xs transition-colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {[
            {
              id: 'status',
              label: '1. Status & Approval',
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
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
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

            <div className="text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Organisasi</span>
                <span className="font-black text-slate-900 dark:text-white">{metadata.namaOrmas || '-'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Singkat</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{metadata.namaSingkat || '-'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Alamat Kantor / Sekretariat</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{metadata.alamat || '-'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kode Pos</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{metadata.kodePos || '-'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">No. Telepon</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{metadata.telepon || '-'}</span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Email Pemohon (Akun Terdaftar)</span>
                <span className="font-semibold text-blue-600 dark:text-sky-400">
                  {pendaftarEmail || 'Tidak ada email'}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Nama Pendaftar</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {pendaftarNama || ketuaNama || '-'}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Status</span>
                <div>
                  <TableBadge status={currentStatus} />
                </div>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">Kelengkapan Data</span>
                <div className="flex items-center gap-3 w-full">
                  <span className="font-black text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">
                    {currentCompleteness}% ({completeness.completed}/{completeness.total})
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
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
                    currentCompleteness === 100
                      ? '✅ Kelengkapan Data 100%! Seluruh dokumen & identitas telah lengkap.'
                      : `📋 Kelengkapan Data ${currentCompleteness}%: (${completeness.completed} dari ${completeness.total} item berkas/identitas terisi)`
                  )
                }
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
                  <option value="disiapkan">disiapkan</option>
                  <option value="diajukan">diajukan</option>
                  <option value="ditolak">ditolak</option>
                  <option value="resmi">resmi</option>
                  <option value="bubar">bubar</option>
                  <option value="ditangguhkan">ditangguhkan</option>
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

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Pemohon (Akun Terdaftar)</label>
              <input
                type="text"
                value={pendaftarEmail || 'Belum terdaftar'}
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium outline-none cursor-not-allowed"
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
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Dokumen Kelengkapan
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersimpan di Database
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Dokumen persyaratan administrasi terkompresi dan tersimpan di database MySQL</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Format: <strong className="text-slate-700 dark:text-slate-200">PDF / JPG</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              { id: 'logo', title: 'Logo Organisasi', desc: 'Logo ormas dalam format dokumen/gambar, PDF atau JPG Max 5 Mb' },
              { id: 'foto', title: 'Foto Kantor', desc: 'Scan foto kantor atau sekretariat tampak depan yang memuat papan nama resmi' },
              { id: 'akta', title: 'Akta Notaris', desc: 'Scan akta notaris pendirian ormas, dengan ekstensi PDF Max 5 Mb' },
              { id: 'npwp', title: 'NPWP', desc: 'Scan NPWP atas nama ormas, dengan ekstensi PDF Max 5 Mb' },
              { id: 'adart', title: 'AD / ART', desc: 'Anggaran Dasar - Anggaran Rumah Tangga, dengan ekstensi PDF Max 5 Mb' },
              { id: 'program', title: 'Dokumen Program Kerja', desc: 'Scan dokumen program kerja organisasi, dengan ekstensi PDF Max 5 Mb' },
              { id: 'kepemilikan', title: 'Dokumen Bukti Kepemilikan', desc: 'Scan dokumen Bukti Kepemilikan atau Surat Perjanjian Kontrak / Ijin Pakai, PDF Max 5 Mb' },
              { id: 'susunan', title: 'Dokumen Susunan Pengurus', desc: 'Scan dokumen Surat Keputusan Susunan Pengurus sesuai AD dan ART, PDF Max 5 Mb' },
            ].map((doc) => {
              const isUploaded = uploadedDocs[doc.id];
              const isUploading = uploadingDocId === doc.id;
              const detail = docDetails[doc.id];

              return (
                <div key={doc.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 overflow-hidden flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {doc.title}
                        </p>
                        {isUploaded && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            DB Terverifikasi
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                        PDF / JPG
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{doc.desc}</p>

                    {/* Compression & Storage Metric Box */}
                    {isUploaded && detail && (
                      <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/90 dark:border-blue-900/50 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                          <span className="truncate flex items-center gap-1.5">
                            <span className="text-blue-600 dark:text-blue-400">📄</span>
                            <span className="truncate max-w-[160px] sm:max-w-[200px]">{detail.namaFile}</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                            Hemat {detail.ratio || '75%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>
                            Ukuran: <del className="text-slate-400">{detail.originalSizeFormatted || '1.8 MB'}</del> &rarr; <b className="text-emerald-600 dark:text-emerald-400">{detail.compressedSizeFormatted || '412 KB'}</b>
                          </span>
                          <a
                            href={detail.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            Lihat Berkas &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {isUploaded && (
                        <a
                          href={detail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Buka Berkas</span>
                        </a>
                      )}

                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleAdminDeleteDocument(doc.id, doc.title, false)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="Hapus Berkas oleh Verifikator"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}

                      <label className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group">
                        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {isUploading ? 'Mengompresi...' : isUploaded ? 'Ganti Berkas...' : 'Unggah PDF/JPG...'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAdminFileUpload(doc.id, doc.title, file, false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isUploaded;
                        setUploadedDocs((prev) => ({ ...prev, [doc.id]: nextState }));
                        showToast(nextState ? `Dokumen ${doc.title} diverifikasi ✓` : `Dokumen ${doc.title} dibatalkan`);
                      }}
                      className={`w-full sm:w-auto px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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
                          <span>Valid ✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Verifikasi</span>
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

      {/* TAB 4: SURAT KELENGKAPAN */}
      {activeTab === 'surat' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Surat Kelengkapan
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersimpan di Database
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Surat permohonan, rekomendasi, dan pengesahan resmi terkompresi</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Format: <strong className="text-slate-700 dark:text-slate-200">PDF / JPG</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Surat Permohonan Card */}
            {(() => {
              const isPermohonanUploaded = uploadedSurat.permohonan;
              const isPermohonanUploading = uploadingDocId === 'permohonan';
              const permohonanDetail = docDetails.permohonan;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 col-span-1 md:col-span-2 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                        Surat Permohonan Pendaftaran
                      </p>
                      {isPermohonanUploaded && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          DB Terverifikasi
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded shrink-0">
                      Dokumen Utama
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Scan Surat Permohonan resmi ditandatangani pengurus dengan ekstensi PDF Max 5 Mb
                  </p>

                  {/* Compression & Storage Metric Box */}
                  {isPermohonanUploaded && permohonanDetail && (
                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/90 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">📄</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{permohonanDetail.namaFile}</span>
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                          Hemat {permohonanDetail.ratio || '74%'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">
                          Ukuran: <del className="text-slate-400">{permohonanDetail.originalSizeFormatted || '1.2 MB'}</del> &rarr; <b className="text-emerald-600 dark:text-emerald-400">{permohonanDetail.compressedSizeFormatted || '310 KB'}</b>
                        </span>
                        <a
                          href={permohonanDetail.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          Buka Berkas &rarr;
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nomor Surat</label>
                      <input type="text" defaultValue="01/IWAPI/MMK/X/2022" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tanggal Surat</label>
                      <input type="date" defaultValue="2022-10-15" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer hover:border-blue-400 transition-colors group">
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {isPermohonanUploading
                            ? 'Mengompresi...'
                            : isPermohonanUploaded
                            ? permohonanDetail?.namaFile || 'Surat_Permohonan.pdf'
                            : 'Pilih file PDF...'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isPermohonanUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAdminFileUpload('permohonan', 'Surat Permohonan Pendaftaran', file, true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    {isPermohonanUploaded && (
                      <a
                        href={permohonanDetail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Buka Berkas</span>
                      </a>
                    )}
                    {isPermohonanUploaded && (
                      <button
                        type="button"
                        onClick={() => handleAdminDeleteDocument('permohonan', 'Surat Permohonan Pendaftaran', true)}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                        title="Hapus Berkas oleh Verifikator"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Hapus</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isPermohonanUploaded;
                        setUploadedSurat((prev) => ({ ...prev, permohonan: nextState }));
                        showToast(nextState ? 'Surat Permohonan diverifikasi ✓' : 'Surat Permohonan dibatalkan');
                      }}
                      className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition-colors"
                    >
                      {isPermohonanUploaded ? 'Valid ✓' : 'Verifikasi Surat'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {[
              { id: 'domisili', title: 'Surat Keterangan Domisili', desc: 'Surat Keterangan Domisili Sekretariat organisasi dari Lurah/Kepala Desa' },
              { id: 'formulir', title: 'Scan Formulir', desc: 'Scan Formulir Isian Data Organisasi ditandatangani Ketua & Sekretaris' },
              { id: 'pernyataan', title: 'Surat Pernyataan', desc: 'Scan Surat Pernyataan sesuai Permendagri 57 Tahun 2017' },
              { id: 'keabsahan', title: 'Surat Keabsahan', desc: 'File keabsahan organisasi, dalam format PDF Max 5 Mb' },
              { id: 'pengantar', title: 'Surat Pengantar Keabsahan', desc: 'Surat Pengantar Keabsahan dari Kesbangpol Prov / Kab / Kota' },
              { id: 'kemenkumham', title: 'Surat Pengesahan Kemenkumham / Kemendagri', desc: 'Surat Pengesahan / Terdaftar Ormas di Kemendkumham / Kemendagri' },
            ].map((surat) => {
              const isUploaded = uploadedSurat[surat.id];
              const isUploading = uploadingDocId === surat.id;
              const detail = docDetails[surat.id];

              return (
                <div key={surat.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 overflow-hidden flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                        <span>{surat.title}</span>
                        {isUploaded && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            DB Terverifikasi
                          </span>
                        )}
                      </p>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                        PDF (5MB)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{surat.desc}</p>

                    {/* Compression & Storage Metric Box */}
                    {isUploaded && detail && (
                      <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/90 dark:border-blue-900/50 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                          <span className="truncate flex items-center gap-1.5">
                            <span className="text-blue-600 dark:text-blue-400">📄</span>
                            <span className="truncate max-w-[160px] sm:max-w-[200px]">{detail.namaFile}</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                            Hemat {detail.ratio || '75%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>
                            Ukuran: <del className="text-slate-400">{detail.originalSizeFormatted || '1.6 MB'}</del> &rarr; <b className="text-emerald-600 dark:text-emerald-400">{detail.compressedSizeFormatted || '390 KB'}</b>
                          </span>
                          <a
                            href={detail.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            Buka Surat &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {isUploaded && (
                        <a
                          href={detail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Lihat</span>
                        </a>
                      )}

                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleAdminDeleteDocument(surat.id, surat.title, true)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="Hapus Berkas oleh Verifikator"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}

                      <label className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer hover:border-blue-400 transition-colors group">
                        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {isUploading ? 'Mengompresi...' : isUploaded ? 'Ganti Berkas...' : 'Pilih file PDF...'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAdminFileUpload(surat.id, surat.title, file, true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isUploaded;
                        setUploadedSurat((prev) => ({ ...prev, [surat.id]: nextState }));
                        showToast(nextState ? `Surat ${surat.title} diverifikasi ✓` : `Surat ${surat.title} dibatalkan`);
                      }}
                      className={`w-full sm:w-auto px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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
                          <span>Valid ✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Verifikasi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
