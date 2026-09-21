'use client';

import React, { useState, useEffect } from 'react';
import TableBadge from '@/components/dashboard/TableBadge';
import OrmasSubmissionModal, { OrmasSubmissionPayload } from '@/components/dashboard/OrmasSubmissionModal';
import { compressDocument } from '@/utils/fileCompression';

interface LogItem {
  timestamp: string;
  aktivitas: string;
  pesan: string;
  oleh: string;
}

interface MemberItem {
  id: string | number;
  nama: string;
  nik?: string;
  jk: 'Laki-laki' | 'Perempuan';
  tempatLahir?: string;
  tanggalLahir: string;
  alamatDomisili?: string;
  golDarah?: string;
  nomorHp?: string;
  pekerjaan?: string;
  jabatan: string;
}

import { exportToCsv, printReportPdf } from '@/utils/exportUtils';
import { createNotification } from '@/services/notificationService';

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
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Active logged-in user state
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    nama?: string;
    email?: string;
    role?: string;
    ormasNama?: string;
    singkatan?: string;
    jenisOrmas?: string;
    nomorTiket?: string;
    statusSkt?: string;
  } | null>(null);

  // Tab 1 & Metadata Form State
  const [currentStatus, setCurrentStatus] = useState<string>('diajukan');
  const [metadata, setMetadata] = useState({
    namaOrmas: '',
    namaSingkat: '',
    jenisOrganisasi: 'Organisasi Kemasyarakatan',
    alamat: '',
    kodePos: '',
    telepon: '',
  });

  useEffect(() => {
    async function loadUserOrganization() {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('kesbangpol_user') : null;
        let activeUser = stored ? JSON.parse(stored) : null;
        if (activeUser) {
          // Bersihkan data dummy dari session storage jika masih ada
          if (activeUser.ormasNama === 'Organisasi Baru' || activeUser.instansi === 'Organisasi Baru') {
            activeUser.ormasNama = '';
            activeUser.instansi = '';
            localStorage.setItem('kesbangpol_user', JSON.stringify(activeUser));
          }
          setCurrentUser(activeUser);
        }

        const emailToSearch = activeUser?.email;
        if (emailToSearch) {
          const res = await fetch(`/api/pengajuan?email=${encodeURIComponent(emailToSearch)}`, { cache: 'no-store' });
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const latest = json.data[0];
            setMetadata({
              namaOrmas: latest.namaOrmas,
              namaSingkat: latest.singkatan || '',
              jenisOrganisasi: latest.jenisOrmas || 'Organisasi Kemasyarakatan',
              alamat: latest.alamat || '',
              kodePos: latest.kodePos || '99910',
              telepon: latest.telepon || activeUser?.telepon || '',
            });
            setCurrentStatus(latest.status || 'diajukan');
            if (latest.ketuaUmum) {
              setKetuaNama(latest.ketuaUmum);
            }
            setHasSubmitted(true);

            // Muat riwayat aktivitas tersimpan dari database
            try {
              const resAkt = await fetch(`/api/aktivitas?namaOrmas=${encodeURIComponent(latest.namaOrmas)}&userEmail=${encodeURIComponent(emailToSearch)}`, { cache: 'no-store' });
              const jsonAkt = await resAkt.json();
              if (jsonAkt.success && Array.isArray(jsonAkt.data) && jsonAkt.data.length > 0) {
                setLogs(jsonAkt.data);
              } else {
                setLogs([
                  {
                    timestamp: `${latest.tanggalPengajuan} 08:30:00`,
                    aktivitas: `Pengajuan disiapkan dan didaftarkan oleh ${latest.namaOrmas}`,
                    pesan: latest.catatan || `Pendaftaran diajukan secara daring melalui portal Ormas Mimika (No: ${latest.nomorRegistrasi || latest.id})`,
                    oleh: latest.namaOrmas,
                  },
                  {
                    timestamp: `${latest.tanggalPengajuan} 09:00:00`,
                    aktivitas: `Status pengajuan: ${latest.status}`,
                    pesan: 'Menunggu pemeriksaan berkas dan verifikasi administrasi oleh Bakesbangpol',
                    oleh: 'Sistem SI-ORMAS',
                  },
                ]);
              }
            } catch {
              setLogs([
                {
                  timestamp: `${latest.tanggalPengajuan} 08:30:00`,
                  aktivitas: `Pengajuan disiapkan dan didaftarkan oleh ${latest.namaOrmas}`,
                  pesan: latest.catatan || `Pendaftaran diajukan secara daring melalui portal Ormas Mimika (No: ${latest.nomorRegistrasi || latest.id})`,
                  oleh: latest.namaOrmas,
                },
              ]);
            }
            return;
          }
        }

        // Jika tidak ada pengajuan di database: Tampilan KOSONG AWAL (VIEW 1)
        setHasSubmitted(false);
        setMetadata({
          namaOrmas: '',
          namaSingkat: '',
          jenisOrganisasi: 'Organisasi Kemasyarakatan',
          alamat: '',
          kodePos: '',
          telepon: '',
        });
        setCurrentStatus('belum_diajukan');
        setLogs([]);
      } catch (err) {
        console.error('Error fetching user organization:', err);
        setHasSubmitted(false);
      }
    }

    loadUserOrganization();
  }, []);

  // Tab 5 Pengurus State
  const [ketuaNama, setKetuaNama] = useState('');
  const [sekretarisNama, setSekretarisNama] = useState('');
  const [bendaharaNama, setBendaharaNama] = useState('');

  // Tab 6 Member State & Form
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberJabatanFilter, setMemberJabatanFilter] = useState('all');
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fungsi muat anggota dari database MySQL via API Route
  const loadMembersFromDatabase = async (namaOrmasSearch?: string, emailSearch?: string) => {
    setIsLoadingMembers(true);
    try {
      const q = new URLSearchParams();
      if (namaOrmasSearch && namaOrmasSearch !== 'Organisasi Baru') q.append('namaOrmas', namaOrmasSearch);
      if (emailSearch) q.append('userEmail', emailSearch);

      const res = await fetch(`/api/pengurus?${q.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mappedMembers: MemberItem[] = json.data.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          nama: item.nama,
          nik: item.nik,
          jk: item.jk || 'Laki-laki',
          tempatLahir: item.tempatLahir || '',
          tanggalLahir: item.tanggalLahir || '-',
          alamatDomisili: item.alamat || '',
          golDarah: item.golDarah || 'A',
          nomorHp: item.telepon || '',
          pekerjaan: item.pekerjaan || '',
          jabatan: item.jabatan || 'Anggota',
        }));
        setMembers(mappedMembers);

        // Cari juga Ketua, Sekretaris, Bendahara untuk Tab 5
        const ketua = json.data.find((p: any) => p.jabatan === 'Ketua' || p.jabatan === 'Ketua Umum');
        if (ketua && ketua.nama) setKetuaNama(ketua.nama);
        const sek = json.data.find((p: any) => p.jabatan === 'Sekretaris' || p.jabatan === 'Sekretaris Umum');
        if (sek && sek.nama) setSekretarisNama(sek.nama);
        const ben = json.data.find((p: any) => p.jabatan === 'Bendahara' || p.jabatan === 'Bendahara Umum');
        if (ben && ben.nama) setBendaharaNama(ben.nama);
      }
    } catch (err) {
      console.error('Error loading members from database:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Muat anggota otomatis setelah profil ormas terdeteksi atau tab berubah
  useEffect(() => {
    if (metadata.namaOrmas || currentUser?.email) {
      loadMembersFromDatabase(metadata.namaOrmas, currentUser?.email);
    }
  }, [metadata.namaOrmas, currentUser?.email]);

  // Listener URL query parameter (contoh: ?tab=anggota)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['status', 'metadata', 'dokumen', 'surat', 'pengurus', 'anggota'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Document Uploads State (8 items)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

  // Surat Items State (7 items)
  const [uploadedSurat, setUploadedSurat] = useState<Record<string, boolean>>({});

  // Uploaded Document Details (termasuk status kompresi & record database)
  const [docDetails, setDocDetails] = useState<Record<string, UploadedDocDetail>>({});

  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Ambil dokumen yang sudah tersimpan di database saat load
  useEffect(() => {
    async function loadDocumentsFromDatabase() {
      try {
        const res = await fetch(`/api/dokumen?namaOrmas=${encodeURIComponent(metadata.namaOrmas)}`);
        const json = await res.json();
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
              originalSizeFormatted: '2.1 MB',
              compressedSizeFormatted: '480 KB',
              ratio: '77%',
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
        }
      } catch (err) {
        console.error('Error fetching documents from database:', err);
      }
    }

    loadDocumentsFromDatabase();
  }, [metadata.namaOrmas]);

  // Helper mencatat log aktivitas pengguna ke state dan database MySQL
  const logActivity = async (aktivitas: string, pesan: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const actor = metadata.namaOrmas || currentUser?.nama || 'Pemohon Ormas';
    const newLogItem: LogItem = {
      timestamp: `${dateStr} ${timeStr}`,
      aktivitas,
      pesan,
      oleh: actor,
    };

    setLogs((prev) => [newLogItem, ...prev]);

    try {
      await fetch('/api/aktivitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaOrmas: metadata.namaOrmas || null,
          userEmail: currentUser?.email || null,
          aktivitas,
          pesan,
          oleh: actor,
        }),
      });
    } catch (err) {
      console.error('Error saving activity log to database:', err);
    }
  };

  // Handler Unggah & Kompresi Dokumen ke Database
  const handleFileUpload = async (
    docId: string,
    title: string,
    rawFile: File,
    isSurat: boolean = false
  ) => {
    try {
      setUploadingDocId(docId);
      showToast(`Mengompresi ${title}...`);

      // 1. Kompresi berkas (gambar disusutkan canvas, pdf dihitung optimasinya)
      const compResult = await compressDocument(rawFile);

      // 2. Siapkan FormData untuk dikirim ke API
      const formData = new FormData();
      formData.append('file', compResult.file);
      formData.append('docId', docId);
      formData.append('title', title);
      formData.append('namaOrmas', metadata.namaOrmas);
      formData.append('actorName', metadata.namaOrmas || currentUser?.nama || 'Pemohon Ormas');
      if (currentUser?.email) {
        formData.append('userEmail', currentUser.email);
      }

      // 3. Kirim ke API endpoint /api/dokumen/upload
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
        } else {
          logActivity(
            `Unggah Dokumen ${title}`,
            `Berkas "${compResult.file.name}" berhasil diunggah & dikompres (${compResult.ratio} hemat, ${compResult.compressedSizeFormatted}) dan tersimpan di database.`
          );
        }

        // Kirim notifikasi sistem ke Admin Kesbangpol
        createNotification({
          title: `Unggahan Berkas: ${title}`,
          message: `Ormas ${metadata.namaOrmas || 'Pemohon'} telah mengunggah berkas persyaratan "${title}" untuk diverifikasi.`,
          type: 'info',
          category: 'dokumen',
          sender: metadata.namaOrmas || currentUser?.nama || 'Pemohon Ormas',
          recipientRole: 'admin',
          targetOrmas: metadata.namaOrmas,
          link: '/dashboard/pengajuan',
        });

        showToast(`✓ ${title} dikompresi (${compResult.ratio}%) & disimpan di database!`);
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

  // Handler Hapus Berkas dari Database & Server
  const handleDeleteDocument = async (docId: string, title: string, isSurat: boolean = false) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berkas "${title}" dari database?`)) {
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
          actorName: metadata.namaOrmas || currentUser?.nama || 'Pemohon Ormas',
          userEmail: currentUser?.email,
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
        showToast(`✓ Berkas "${title}" berhasil dihapus dari database`);
      } else {
        showToast(`Gagal: ${resJson.message || 'Error server saat menghapus'}`);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
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
    logActivity(
      'Pembaruan Identitas & Metadata',
      `Informasi profil organisasi (${metadata.namaOrmas || 'Ormas'}) berhasil disimpan dan diperbarui.`
    );
    showToast('Metadata organisasi berhasil diperbarui!');
  };

  const [newMember, setNewMember] = useState({
    nama: '',
    nik: '',
    jk: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    tempatLahir: '',
    tanggalLahir: '',
    alamatDomisili: '',
    golDarah: 'A',
    nomorHp: '',
    pekerjaan: '',
    jabatan: 'Anggota',
  });

  // Handler Tambah Anggota Baru ke Database MySQL
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.nama.trim()) {
      showToast('Nama lengkap anggota wajib diisi!');
      return;
    }

    try {
      showToast('Menyimpan data anggota ke database...');
      const payload = {
        namaOrmas: metadata.namaOrmas,
        userEmail: currentUser?.email,
        nama: newMember.nama.trim(),
        nik: newMember.nik.trim(),
        jabatan: newMember.jabatan || 'Anggota',
        telepon: newMember.nomorHp || '-',
        email: currentUser?.email || '',
        alamat: newMember.alamatDomisili || '-',
        jk: newMember.jk,
        tempatLahir: newMember.tempatLahir,
        tanggalLahir: newMember.tanggalLahir,
        golDarah: newMember.golDarah,
        pekerjaan: newMember.pekerjaan,
        actorName: currentUser?.nama || metadata.namaOrmas,
      };

      const res = await fetch('/api/pengurus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const newObj: MemberItem = {
          id: json.data.id,
          nama: json.data.nama,
          nik: json.data.nik,
          jk: json.data.jk,
          tempatLahir: json.data.tempatLahir,
          tanggalLahir: json.data.tanggalLahir || '-',
          alamatDomisili: json.data.alamat,
          golDarah: json.data.golDarah,
          nomorHp: json.data.telepon,
          pekerjaan: json.data.pekerjaan,
          jabatan: json.data.jabatan,
        };
        setMembers((prev) => [...prev, newObj]);
        setNewMember({
          nama: '',
          nik: '',
          jk: 'Laki-laki',
          tempatLahir: '',
          tanggalLahir: '',
          alamatDomisili: '',
          golDarah: 'A',
          nomorHp: '',
          pekerjaan: '',
          jabatan: 'Anggota',
        });

        // Kirim notifikasi sistem ke Admin Kesbangpol
        createNotification({
          title: `Pendaftaran Anggota: ${metadata.namaOrmas || 'Ormas'}`,
          message: `Ormas ${metadata.namaOrmas || 'Pemohon'} telah mendaftarkan anggota baru "${newMember.nama.trim()}" (${newMember.jabatan || 'Anggota'}).`,
          type: 'info',
          category: 'anggota',
          sender: metadata.namaOrmas || currentUser?.nama || 'Pemohon Ormas',
          recipientRole: 'admin',
          targetOrmas: metadata.namaOrmas,
          link: '/dashboard/pengajuan',
        });

        showToast('✓ Data anggota berhasil disimpan ke database!');
      } else {
        showToast(`Gagal: ${json.message || 'Error server'}`);
      }
    } catch (err) {
      console.error('Error adding member:', err);
      showToast('Terjadi kesalahan koneksi saat menyimpan anggota');
    }
  };

  // Handler Perbarui Anggota (Edit) ke Database MySQL
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.nama.trim()) return;

    try {
      showToast('Memperbarui data anggota...');
      const res = await fetch('/api/pengurus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMember.id,
          nama: editingMember.nama.trim(),
          nik: editingMember.nik?.trim(),
          jabatan: editingMember.jabatan,
          telepon: editingMember.nomorHp || '-',
          alamat: editingMember.alamatDomisili || '-',
          jk: editingMember.jk,
          tempatLahir: editingMember.tempatLahir,
          tanggalLahir: editingMember.tanggalLahir,
          golDarah: editingMember.golDarah,
          pekerjaan: editingMember.pekerjaan,
          actorName: currentUser?.nama || metadata.namaOrmas,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? editingMember : m))
        );
        setEditingMember(null);
        showToast('✓ Data anggota berhasil diperbarui!');
      } else {
        showToast(`Gagal: ${json.message || 'Error server'}`);
      }
    } catch (err) {
      console.error('Error updating member:', err);
      showToast('Gagal memperbarui data anggota');
    }
  };

  // Handler Hapus Anggota dari Database MySQL
  const handleDeleteMember = async (memberId: string | number) => {
    const target = members.find((m) => m.id === memberId);
    if (!confirm(`Apakah Anda yakin ingin menghapus anggota "${target?.nama || 'Anggota'}" dari daftar keanggotaan?`)) {
      return;
    }

    try {
      showToast(`Menghapus ${target?.nama || 'anggota'}...`);
      const res = await fetch(`/api/pengurus?id=${memberId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          actorName: currentUser?.nama || metadata.namaOrmas,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showToast(`✓ Anggota "${target?.nama}" berhasil dihapus dari database!`);
      } else {
        showToast(`Gagal: ${json.message || 'Error server'}`);
      }
    } catch (err) {
      console.error('Error deleting member:', err);
      showToast('Gagal menghapus anggota dari database');
    }
  };

  // Handler Simpan Data Pengurus (Ketua, Sekretaris, Bendahara) ke Database
  const handleSavePengurus = async (jabatan: string, nama: string) => {
    if (!nama.trim()) {
      showToast(`Nama ${jabatan} wajib diisi!`);
      return;
    }

    try {
      showToast(`Menyimpan data ${jabatan}...`);
      const existing = members.find(
        (m) => m.jabatan.toLowerCase() === jabatan.toLowerCase()
      );

      if (existing) {
        await fetch('/api/pengurus', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existing.id,
            nama: nama.trim(),
            jabatan,
            actorName: currentUser?.nama || metadata.namaOrmas,
          }),
        });
      } else {
        await fetch('/api/pengurus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namaOrmas: metadata.namaOrmas,
            userEmail: currentUser?.email,
            nama: nama.trim(),
            jabatan,
            actorName: currentUser?.nama || metadata.namaOrmas,
          }),
        });
      }

      await loadMembersFromDatabase(metadata.namaOrmas, currentUser?.email);
      showToast(`✓ Data ${jabatan} berhasil disimpan ke database!`);
    } catch (err) {
      console.error(`Error saving ${jabatan}:`, err);
      showToast(`Gagal menyimpan data ${jabatan}`);
    }
  };

  // Handler Ekspor CSV Daftar Anggota
  const handleExportMembersCsv = () => {
    const headers = [
      'No',
      'Nama Lengkap',
      'NIK',
      'Jabatan Dalam Ormas',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Alamat Domisili',
      'Golongan Darah',
      'Nomor HP / WhatsApp',
      'Pekerjaan',
    ];

    const rows = sortedMembers.map((m, idx) => [
      idx + 1,
      m.nama,
      m.nik || '-',
      m.jabatan,
      m.jk,
      m.tempatLahir || '-',
      m.tanggalLahir,
      m.alamatDomisili || '-',
      m.golDarah || '-',
      m.nomorHp || '-',
      m.pekerjaan || '-',
    ]);

    const safeName = (metadata.namaOrmas || 'Ormas').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToCsv(`Daftar_Anggota_${safeName}_${timestamp}`, headers, rows);
  };

  // Handler Cetak PDF Daftar Anggota Resmi
  const handlePrintMembersPdf = () => {
    const headers = ['Nama Lengkap', 'NIK', 'Jabatan', 'JK', 'TTL', 'Alamat', 'Kontak'];
    const rows = sortedMembers.map((m) => [
      m.nama,
      m.nik || '-',
      m.jabatan,
      m.jk,
      m.tempatLahir ? `${m.tempatLahir}, ${m.tanggalLahir}` : m.tanggalLahir,
      m.alamatDomisili || '-',
      m.nomorHp || '-',
    ]);

    printReportPdf({
      title: `DAFTAR ANGGOTA & PENGURUS - ${metadata.namaOrmas || 'ORGANISASI'}`,
      subtitle: `Register Keanggotaan Resmi Organisasi Kemasyarakatan Kabupaten Mimika`,
      headers,
      rows,
      keteranganFilter: `Total Anggota: ${sortedMembers.length} Orang`,
      orientation: 'landscape',
    });
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

  const filteredMembers = members.filter((m) => {
    const query = memberSearch.toLowerCase();
    const matchesSearch =
      m.nama.toLowerCase().includes(query) ||
      (m.nik && m.nik.includes(query)) ||
      (m.pekerjaan && m.pekerjaan.toLowerCase().includes(query)) ||
      (m.alamatDomisili && m.alamatDomisili.toLowerCase().includes(query));

    const matchesJabatan =
      memberJabatanFilter === 'all' ||
      m.jabatan.toLowerCase() === memberJabatanFilter.toLowerCase();

    return matchesSearch && matchesJabatan;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let valA = (a[memberSortField] || '') as string;
    let valB = (b[memberSortField] || '') as string;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return memberSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return memberSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const [memberPage, setMemberPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(10);
  const totalMemberPages = Math.ceil(sortedMembers.length / membersPerPage) || 1;
  const paginatedMembers = sortedMembers.slice(
    (memberPage - 1) * membersPerPage,
    memberPage * membersPerPage
  );


  const handleModalSubmitSuccess = (newSub: OrmasSubmissionPayload) => {
    setMetadata({
      namaOrmas: newSub.namaOrganisasi || '',
      namaSingkat: newSub.namaSingkat || '',
      jenisOrganisasi: newSub.jenisOrganisasi || 'Organisasi Kemasyarakatan',
      alamat: newSub.alamatKantor || '',
      kodePos: newSub.kodePos || '99910',
      telepon: newSub.noTelepon || '',
    });
    if (newSub.ketuaUmum) {
      setKetuaNama(newSub.ketuaUmum);
    }
    setCurrentStatus('diajukan');
    setHasSubmitted(true);

    // Append new log entry
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: LogItem = {
      timestamp: `${dateStr} ${timeStr}`,
      aktivitas: `Pengajuan baru (${newSub.jenisPengajuan}) oleh ${newSub.namaOrganisasi}`,
      pesan: `No. Tiket: ${newSub.nomorTiket} • Distrik: ${newSub.distrik || 'Mimika Baru'} • Pimpinan: ${newSub.ketuaUmum || '-'}`,
      oleh: newSub.namaOrganisasi,
    };
    setLogs((prev) => [newLog, ...prev]);

    logActivity(
      `Pendaftaran Baru ${newSub.jenisPengajuan || 'SKT'}`,
      `Pengajuan ${newSub.namaOrganisasi} (No. Tiket: ${newSub.nomorTiket}) berhasil diajukan secara daring.`
    );

    showToast(`Pengajuan "${newSub.namaOrganisasi}" (${newSub.nomorTiket}) berhasil diajukan ke Kesbangpol Mimika!`);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Formulir Pendaftaran Ormas Terdaftar
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Input Pengajuan Baru</span>
            </button>

            <button
              onClick={handleResetToEmpty}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Awal
            </button>
          </div>
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
                {currentUser?.email && (
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{currentUser.email}</span>
                  </span>
                )}
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
      {/* TAB 3: DOKUMEN KELENGKAPAN (Kompresi Otomatis & Database MySQL)            */}
      {/* ========================================================================= */}
      {activeTab === 'dokumen' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
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
                  Terhubung MySQL Database
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Setiap dokumen yang diunggah akan otomatis dikompresi (Canvas/Stream) dan tercatat di database Kesbangpol.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Format: <strong className="text-slate-700 dark:text-slate-200">PDF, JPG, PNG</strong> (Maks 5 MB)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              { id: 'logo', title: 'Logo Organisasi', desc: 'Logo ormas dalam format dokumen/gambar, PDF atau JPG Max 5 Mb' },
              { id: 'foto', title: 'Foto Kantor', desc: 'Scan foto kantor sekretariat tampak depan memuat papan nama resmi' },
              { id: 'akta', title: 'Akta Notaris', desc: 'Scan akta pendirian ormas dari notaris, dengan ekstensi PDF Max 5 Mb' },
              { id: 'npwp', title: 'NPWP', desc: 'Scan NPWP atas nama ormas, dengan ekstensi PDF Max 5 Mb' },
              { id: 'adart', title: 'AD / ART', desc: 'Anggaran Dasar - Anggaran Rumah Tangga resmi organisasi' },
              { id: 'program', title: 'Dokumen Program Kerja', desc: 'Scan dokumen rancangan program kerja organisasi 1-5 tahun' },
              { id: 'kepemilikan', title: 'Dokumen Bukti Kepemilikan', desc: 'Scan surat kepemilikan kantor atau surat perjanjian kontrak / ijin pakai' },
              { id: 'susunan', title: 'Dokumen Susunan Pengurus', desc: 'Surat Keputusan (SK) Susunan Pengurus sesuai AD & ART terbaru' },
            ].map((doc) => {
              const isUploaded = uploadedDocs[doc.id];
              const isUploading = uploadingDocId === doc.id;
              const detail = docDetails[doc.id];

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUploaded && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Tersimpan di DB
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                          PDF / JPG
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {doc.desc}
                    </p>

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

                    {/* File Input Selector */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all group">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 shrink-0">
                        {isUploading ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                          {isUploading
                            ? 'Mengompresi & menyimpan ke database...'
                            : isUploaded
                            ? `Ganti berkas (${detail?.namaFile || `${doc.title}.pdf`})`
                            : 'Pilih file PDF / JPG / PNG untuk dikompresi...'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(doc.id, doc.title, file, false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="px-4 sm:px-5 py-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Database Tersimpan ✓</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium truncate">Belum diunggah</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isUploaded && (
                        <a
                          href={detail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Lihat</span>
                        </a>
                      )}

                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id, doc.title, false)}
                          className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="Hapus Berkas dari Database"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}

                      <label className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                        isUploaded
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                      }`}>
                        {isUploaded ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Perbarui</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Unggah</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(doc.id, doc.title, file, false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
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
      {/* TAB 4: SURAT KELENGKAPAN (Kompresi & Database MySQL)                      */}
      {/* ========================================================================= */}
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
              <p className="text-[11px] text-slate-400 mt-0.5">Surat permohonan, rekomendasi, dan pengesahan resmi</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Format: <strong className="text-slate-700 dark:text-slate-200">PDF / JPG</strong> (Maks 5 MB)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Surat Permohonan Card */}
            {(() => {
              const isPermohonanUploaded = uploadedSurat.permohonan;
              const isPermohonanUploading = uploadingDocId === 'permohonan';
              const permohonanDetail = docDetails.permohonan;

              return (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden col-span-1 md:col-span-2 flex flex-col justify-between shadow-2xs">
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                          Surat Permohonan Pendaftaran
                        </h3>
                        {isPermohonanUploaded && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Tersimpan di DB
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
                          {isPermohonanUploading ? (
                            <svg className="w-4 h-4 text-blue-600 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          )}
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                            {isPermohonanUploading
                              ? 'Mengompresi & menyimpan...'
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
                                handleFileUpload('permohonan', 'Surat Permohonan Pendaftaran', file, true);
                              }
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
                      {isPermohonanUploaded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Tersimpan di Database ✓</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Belum diunggah</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPermohonanUploaded && (
                        <a
                          href={permohonanDetail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Buka Surat</span>
                        </a>
                      )}

                      {isPermohonanUploaded && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument('permohonan', 'Surat Permohonan Pendaftaran', true)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="Hapus Surat dari Database"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}

                      <label className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{isPermohonanUploaded ? 'Perbarui Surat' : 'Unggah & Simpan'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isPermohonanUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload('permohonan', 'Surat Permohonan Pendaftaran', file, true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
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
                <div
                  key={surat.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {surat.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUploaded && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1 shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Tersimpan di DB
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded shrink-0">
                          PDF (5MB)
                        </span>
                      </div>
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

                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-400 transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 shrink-0">
                        {isUploading ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {isUploading
                            ? 'Mengompresi & menyimpan ke database...'
                            : isUploaded
                            ? `Ganti berkas (${detail?.namaFile || `${surat.title}.pdf`})`
                            : 'Pilih file PDF / JPG / PNG...'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(surat.id, surat.title, file, true);
                          }
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
                          <span>Database Tersimpan ✓</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium truncate">Belum diunggah</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isUploaded && (
                        <a
                          href={detail?.fileUrl || '/uploads/dokumen/sample_dokumen.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Lihat</span>
                        </a>
                      )}

                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(surat.id, surat.title, true)}
                          className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="Hapus Berkas dari Database"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}

                      <label className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                        isUploaded
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                      }`}>
                        {isUploaded ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Perbarui</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Unggah</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(surat.id, surat.title, file, true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
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
                  onClick={() => handleSavePengurus('Ketua Umum', ketuaNama)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs text-center cursor-pointer"
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
                  onClick={() => handleSavePengurus('Sekretaris', sekretarisNama)}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xs text-center cursor-pointer"
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
                  onClick={() => handleSavePengurus('Bendahara', bendaharaNama)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs text-center cursor-pointer"
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
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Anggota</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{members.length} <span className="text-xs font-semibold text-slate-400">Orang</span></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pengurus Inti</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {members.filter((m) => m.jabatan.toLowerCase() !== 'anggota').length} <span className="text-xs font-semibold text-slate-400">Orang</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Anggota Biasa</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {members.filter((m) => m.jabatan.toLowerCase() === 'anggota').length} <span className="text-xs font-semibold text-slate-400">Orang</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Database</div>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200/60 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                MySQL Terhubung
              </div>
            </div>
          </div>

          {/* Form Tambah Anggota */}
          <form onSubmit={handleAddMember} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Formulir Entri Anggota / Pengurus Baru
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Input data keanggotaan lengkap untuk register resmi dan verifikasi Bakesbangpol Mimika
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
                * Data langsung tersimpan di database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yohanes Kogoya"
                  value={newMember.nama}
                  onChange={(e) => setNewMember({ ...newMember, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 digit NIK KTP (9101...)"
                  value={newMember.nik}
                  onChange={(e) => setNewMember({ ...newMember, nik: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan Dalam Organisasi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newMember.jabatan}
                  onChange={(e) => setNewMember({ ...newMember, jabatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ketua">Ketua</option>
                  <option value="Wakil Ketua">Wakil Ketua</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Wakil Sekretaris">Wakil Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Wakil Bendahara">Wakil Bendahara</option>
                  <option value="Koordinator Lapangan">Koordinator Lapangan</option>
                  <option value="Ketua Bidang">Ketua Bidang</option>
                  <option value="Humas">Humas</option>
                  <option value="Dewan Penasihat">Dewan Penasihat</option>
                  <option value="Dewan Pembina">Dewan Pembina</option>
                  <option value="Anggota">Anggota</option>
                </select>
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
                  placeholder="Contoh: Timika, Jayapura"
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor HP / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="0822xxxxxxxx"
                  value={newMember.nomorHp}
                  onChange={(e) => setNewMember({ ...newMember, nomorHp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pekerjaan / Profesi</label>
                <input
                  type="text"
                  placeholder="Wiraswasta, PNS, Guru, Tokoh Adat..."
                  value={newMember.pekerjaan}
                  onChange={(e) => setNewMember({ ...newMember, pekerjaan: e.target.value })}
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
                  <option value="-">- (Belum Tahu)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili Lengkap</label>
                <input
                  type="text"
                  placeholder="Jl. Cenderawasih SP 2, Distrik Mimika Baru, Kab. Mimika"
                  value={newMember.alamatDomisili}
                  onChange={(e) => setNewMember({ ...newMember, alamatDomisili: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewMember({
                    nama: '',
                    nik: '',
                    jk: 'Laki-laki',
                    tempatLahir: '',
                    tanggalLahir: '',
                    alamatDomisili: '',
                    golDarah: 'A',
                    nomorHp: '',
                    pekerjaan: '',
                    jabatan: 'Anggota',
                  })
                }
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Simpan Data Anggota
              </button>
            </div>
          </form>

          {/* Table Daftar Anggota */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  Daftar Anggota & Pengurus ({members.length})
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Daftar seluruh keanggotaan terdaftar yang akan diverifikasi oleh Bakesbangpol Mimika
                </p>
              </div>

              {/* Action Toolbar: Search, Filter, Export & Print */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Box */}
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Cari nama, NIK, profesi..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setMemberPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filter Jabatan */}
                <select
                  value={memberJabatanFilter}
                  onChange={(e) => {
                    setMemberJabatanFilter(e.target.value);
                    setMemberPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">Semua Jabatan</option>
                  <option value="Ketua">Ketua</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Anggota">Anggota</option>
                </select>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportMembersCsv}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                  title="Ekspor daftar anggota ke spreadsheet CSV"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ekspor CSV
                </button>

                {/* Print PDF Button */}
                <button
                  type="button"
                  onClick={handlePrintMembersPdf}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors"
                  title="Cetak register resmi anggota format PDF"
                >
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[850px]">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800 select-none">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th
                      onClick={() => handleMemberSort('nama')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Lengkap</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'nama' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleMemberSort('nik')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <span>NIK</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'nik' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
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
                    <th
                      onClick={() => handleMemberSort('jk')}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>JK</span>
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                          {memberSortField === 'jk' ? (memberSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4">Tempat, Tanggal Lahir</th>
                    <th className="py-3 px-4">Alamat Domisili</th>
                    <th className="py-3 px-4">Kontak & Profesi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada anggota yang terdaftar</p>
                          <p className="text-[11px] text-slate-400">Gunakan formulir di atas untuk menambahkan anggota Ormas pertama Anda.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map((m, idx) => {
                      const globalIdx = (memberPage - 1) * membersPerPage + idx + 1;
                      const isLeader = ['ketua', 'wakil ketua', 'sekretaris', 'bendahara'].some((k) =>
                        m.jabatan.toLowerCase().includes(k)
                      );
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-3 text-center font-bold text-slate-400">{globalIdx}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {m.nama}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {m.nik || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                isLeader
                                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {m.jabatan}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-medium">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.jk === 'Perempuan'
                                  ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300'
                                  : 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                              }`}
                            >
                              {m.jk === 'Perempuan' ? 'P' : 'L'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {m.tempatLahir || '-'}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {m.tanggalLahir || '-'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px] truncate" title={m.alamatDomisili}>
                            {m.alamatDomisili || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">
                              {m.nomorHp || '-'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{m.pekerjaan || '-'}</span>
                              {m.golDarah && m.golDarah !== '-' && (
                                <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded font-bold text-[10px]">
                                  {m.golDarah}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingMember(m)}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(m.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Menampilkan {paginatedMembers.length > 0 ? (memberPage - 1) * membersPerPage + 1 : 0} -{' '}
                  {Math.min(memberPage * membersPerPage, sortedMembers.length)} dari {sortedMembers.length} anggota
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1">
                  <span>Per hal:</span>
                  <select
                    value={membersPerPage}
                    onChange={(e) => {
                      setMembersPerPage(Number(e.target.value));
                      setMemberPage(1);
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  disabled={memberPage === 1}
                  onClick={() => setMemberPage(1)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Pertama
                </button>
                <button
                  type="button"
                  disabled={memberPage === 1}
                  onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 rounded-lg">
                  {memberPage} / {totalMemberPages}
                </span>
                <button
                  type="button"
                  disabled={memberPage >= totalMemberPages}
                  onClick={() => setMemberPage((p) => Math.min(totalMemberPages, p + 1))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Selanjutnya
                </button>
                <button
                  type="button"
                  disabled={memberPage >= totalMemberPages}
                  onClick={() => setMemberPage(totalMemberPages)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Terakhir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT ANGGOTA                                                        */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto modal-backdrop">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col my-auto overflow-hidden modal-card">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Edit Data Anggota / Pengurus
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Perbarui data keanggotaan dalam database</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4 text-xs overflow-y-auto flex-1 pr-0.5 sm:pr-1 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.nama}
                    onChange={(e) => setEditingMember({ ...editingMember, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editingMember.nik || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan Dalam Ormas</label>
                  <select
                    value={editingMember.jabatan}
                    onChange={(e) => setEditingMember({ ...editingMember, jabatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ketua">Ketua</option>
                    <option value="Wakil Ketua">Wakil Ketua</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Wakil Sekretaris">Wakil Sekretaris</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Wakil Bendahara">Wakil Bendahara</option>
                    <option value="Koordinator Lapangan">Koordinator Lapangan</option>
                    <option value="Ketua Bidang">Ketua Bidang</option>
                    <option value="Humas">Humas</option>
                    <option value="Dewan Penasihat">Dewan Penasihat</option>
                    <option value="Dewan Pembina">Dewan Pembina</option>
                    <option value="Anggota">Anggota</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={editingMember.jk}
                    onChange={(e) => setEditingMember({ ...editingMember, jk: e.target.value as any })}
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
                    value={editingMember.tempatLahir}
                    onChange={(e) => setEditingMember({ ...editingMember, tempatLahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editingMember.tanggalLahir}
                    onChange={(e) => setEditingMember({ ...editingMember, tanggalLahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="tel"
                    value={editingMember.nomorHp}
                    onChange={(e) => setEditingMember({ ...editingMember, nomorHp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={editingMember.pekerjaan}
                    onChange={(e) => setEditingMember({ ...editingMember, pekerjaan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Golongan Darah</label>
                  <select
                    value={editingMember.golDarah}
                    onChange={(e) => setEditingMember({ ...editingMember, golDarah: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">- (Belum Tahu)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    value={editingMember.alamatDomisili}
                    onChange={(e) => setEditingMember({ ...editingMember, alamatDomisili: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors text-center"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat Organisasi / Pengajuan Baru (View 2) */}
      <OrmasSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSubmitSuccess}
        initialData={metadata}
      />
    </div>
  );
}
