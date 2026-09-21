/**
 * Utilitas Terpusat Ekspor CSV & Cetak Dokumen / PDF
 * Badan Kesatuan Bangsa dan Politik (Kesbangpol) Kabupaten Mimika
 */

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  nomorDokumen?: string;
  tanggalCetak?: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  keteranganFilter?: string;
  petugas?: string;
  nipPetugas?: string;
  jabatanPetugas?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Ekspor data tabular ke file format CSV (dengan UTF-8 BOM untuk Microsoft Excel & Google Sheets)
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  if (typeof window === 'undefined') return;

  const escapeCell = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(';');
  const rowLines = rows.map((r) => r.map(escapeCell).join(';'));
  // Gunakan \uFEFF agar Microsoft Excel membaca encoding UTF-8 dengan benar
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper internal untuk memicu cetak / save as PDF via iframe tersembunyi
 */
function printHtmlContent(htmlContent: string) {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Error saat mencetak:', err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    };

    // Tunggu gambar & aset selesai dimuat sebelum cetak
    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint;
      setTimeout(triggerPrint, 400);
    }
  }
}

/**
 * KOP Surat Resmi Standar Pemerintah Kabupaten Mimika
 */
function getOfficialKopHtml(): string {
  return `
    <div class="kop-surat">
      <div class="kop-logo">
        <img src="/assets/pic/Lambang_Kabupaten_Mimika.jpg" alt="Logo Mimika" onerror="this.style.display='none'" />
      </div>
      <div class="kop-text">
        <div class="kop-line-1">PEMERINTAH KABUPATEN MIMIKA</div>
        <div class="kop-line-2">BADAN KESATUAN BANGSA DAN POLITIK</div>
        <div class="kop-address">Jl. Cenderawasih SP 2, Timika - Provinsi Papua Tengah 99910</div>
        <div class="kop-contact">Laman: kesbangpol.mimikakab.go.id &nbsp;|&nbsp; Surel: kesbangpol@mimikakab.go.id</div>
      </div>
    </div>
    <div class="kop-divider"></div>
  `;
}

/**
 * Style CSS dasar cetak resmi
 */
function getBasePrintCss(orientation: 'portrait' | 'landscape' = 'portrait'): string {
  return `
    @page {
      size: A4 ${orientation};
      margin: 15mm 15mm 20mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      color: #111827;
      background: #fff;
      margin: 0;
      padding: 0;
      line-height: 1.4;
    }
    .kop-surat {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding-bottom: 8px;
    }
    .kop-logo {
      position: absolute;
      left: 0;
      top: 0;
      width: 70px;
      text-align: center;
    }
    .kop-logo img {
      width: 65px;
      height: auto;
      object-fit: contain;
    }
    .kop-text {
      text-align: center;
      width: 100%;
      padding-left: 75px;
      padding-right: 20px;
    }
    .kop-line-1 {
      font-size: 13pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #000;
    }
    .kop-line-2 {
      font-size: 15pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 2px 0;
      color: #000;
    }
    .kop-address {
      font-size: 9pt;
      color: #333;
    }
    .kop-contact {
      font-size: 8.5pt;
      color: #444;
      font-style: italic;
    }
    .kop-divider {
      border-top: 3px solid #000;
      border-bottom: 1px solid #000;
      height: 2px;
      margin-top: 4px;
      margin-bottom: 16px;
    }
    .doc-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .doc-title {
      font-size: 13pt;
      font-weight: 800;
      text-decoration: underline;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .doc-subtitle {
      font-size: 10pt;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 9.5pt;
      color: #374151;
      border-bottom: 1px dashed #d1d5db;
      padding-bottom: 6px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 16px;
      font-size: 9pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #4b5563;
      padding: 6px 8px;
      text-align: left;
      vertical-align: middle;
    }
    table.data-table th {
      background-color: #f3f4f6;
      font-weight: 700;
      text-align: center;
      color: #111827;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #fafafa;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-align: center;
    }
    .badge-success {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .badge-info {
      background-color: #e0f2fe;
      color: #075985;
      border: 1px solid #7dd3fc;
    }
    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .signature-section {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 250px;
      text-align: center;
      font-size: 10pt;
    }
    .signature-date {
      margin-bottom: 6px;
    }
    .signature-role {
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 50px;
    }
    .signature-name {
      font-weight: 700;
      text-decoration: underline;
    }
    .signature-nip {
      font-size: 9pt;
      color: #374151;
    }
    .footer-note {
      margin-top: 30px;
      font-size: 8pt;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
    }
  `;
}

/**
 * Cetak Laporan Tabular Resmi Kesbangpol (PDF / Cetak)
 */
export function printReportPdf(options: PrintReportOptions) {
  const {
    title,
    subtitle = 'Laporan Resmi Sistem Informasi Ormas (SI-ORMAS)',
    nomorDokumen,
    tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    headers,
    rows,
    keteranganFilter,
    petugas = 'Administrator Utama',
    nipPetugas = '19850423 201001 1 002',
    jabatanPetugas = 'Kepala Badan Kesbangpol Kabupaten Mimika',
    orientation = headers.length >= 7 ? 'landscape' : 'portrait',
  } = options;

  const theadHtml = `
    <thead>
      <tr>
        <th style="width: 35px;">No.</th>
        ${headers.map((h) => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
  `;

  const tbodyHtml = `
    <tbody>
      ${
        rows.length === 0
          ? `<tr><td colspan="${headers.length + 1}" style="text-align: center; padding: 20px; color: #6b7280;">Tidak ada data yang tersedia untuk dicetak.</td></tr>`
          : rows
              .map(
                (row, idx) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            ${row
              .map((cell) => {
                const cellStr = cell !== null && cell !== undefined ? String(cell) : '-';
                // Render badge sederhana jika status
                let renderedCell = cellStr;
                if (['aktif', 'disetujui', 'resmi', 'sah'].includes(cellStr.toLowerCase())) {
                  renderedCell = `<span class="badge badge-success">${cellStr}</span>`;
                } else if (['proses', 'verifikasi'].includes(cellStr.toLowerCase())) {
                  renderedCell = `<span class="badge badge-info">${cellStr}</span>`;
                } else if (['menunggu', 'draft', 'pending'].includes(cellStr.toLowerCase())) {
                  renderedCell = `<span class="badge badge-warning">${cellStr}</span>`;
                } else if (['ditolak', 'nonaktif', 'kadaluarsa'].includes(cellStr.toLowerCase())) {
                  renderedCell = `<span class="badge badge-danger">${cellStr}</span>`;
                }
                return `<td>${renderedCell}</td>`;
              })
              .join('')}
          </tr>
        `
              )
              .join('')
      }
    </tbody>
  `;

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>${getBasePrintCss(orientation)}</style>
      </head>
      <body>
        ${getOfficialKopHtml()}
        
        <div class="doc-header">
          <div class="doc-title">${title}</div>
          <div class="doc-subtitle">${subtitle}</div>
          ${nomorDokumen ? `<div style="font-size: 9pt; margin-top: 3px;">Nomor: ${nomorDokumen}</div>` : ''}
        </div>

        <div class="doc-meta">
          <div>
            ${keteranganFilter ? `<strong>Kategori/Filter:</strong> ${keteranganFilter} &nbsp;|&nbsp; ` : ''}
            <strong>Total Data:</strong> ${rows.length} Baris
          </div>
          <div>
            <strong>Tanggal Cetak:</strong> ${tanggalCetak}
          </div>
        </div>

        <table class="data-table">
          ${theadHtml}
          ${tbodyHtml}
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-date">Timika, ${tanggalCetak}</div>
            <div class="signature-role">
              Mengetahui,<br />
              ${jabatanPetugas}
            </div>
            <div class="signature-name">${petugas}</div>
            <div class="signature-nip">NIP. ${nipPetugas}</div>
          </div>
        </div>

        <div class="footer-note">
          <div>Dokumen ini dicetak otomatis dari SI-ORMAS Badan Kesbangpol Kabupaten Mimika</div>
          <div>Halaman 1 dari 1</div>
        </div>
      </body>
    </html>
  `;

  printHtmlContent(fullHtml);
}

/**
 * Cetak Lembar Profil Lengkap Ormas Resmi (PDF / Cetak)
 */
export function printOrmasDetailPdf(ormas: {
  namaOrmas: string;
  singkatan?: string;
  jenisOrmas?: string;
  nomorSk?: string;
  noSkt?: string;
  tanggalBerdiri?: string;
  masaBerlaku?: string;
  ketuaUmum?: string;
  sekretaris?: string;
  bendahara?: string;
  alamat?: string;
  distrik?: string;
  telepon?: string;
  email?: string;
  statusSkt?: string;
  visiMisi?: string;
  kategori?: string;
}) {
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const noSkt = ormas.nomorSk || ormas.noSkt || '220/042/BKP/2024';
  const status = ormas.statusSkt || 'Aktif / Terdaftar Sah';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Profil Ormas - ${ormas.namaOrmas}</title>
        <style>
          ${getBasePrintCss()}
          .profile-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 10pt;
          }
          .profile-grid td {
            padding: 7px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          .profile-grid td.label {
            width: 32%;
            font-weight: 700;
            color: #374151;
            background-color: #f9fafb;
            border-right: 1px solid #e5e7eb;
          }
          .profile-grid td.value {
            width: 68%;
            color: #111827;
          }
          .section-title {
            background-color: #e5e7eb;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10pt;
            padding: 6px 10px;
            margin-top: 14px;
            border-left: 4px solid #0284c7;
          }
        </style>
      </head>
      <body>
        ${getOfficialKopHtml()}

        <div class="doc-header">
          <div class="doc-title">LEMBAR PROFIL &amp; LEGALITAS ORGANISASI</div>
          <div class="doc-subtitle">Nomor Register SKT: <strong>${noSkt}</strong></div>
        </div>

        <div class="doc-meta">
          <div>
            <strong>Status Organisasi:</strong>
            <span class="badge badge-success">${status}</span>
          </div>
          <div>
            <strong>Tanggal Cetak:</strong> ${tanggalCetak}
          </div>
        </div>

        <div class="section-title">1. Identitas Organisasi Kemasyarakatan</div>
        <table class="profile-grid">
          <tr>
            <td class="label">Nama Lengkap Ormas</td>
            <td class="value"><strong>${ormas.namaOrmas}</strong> ${ormas.singkatan ? `(${ormas.singkatan})` : ''}</td>
          </tr>
          <tr>
            <td class="label">Bidang / Jenis Ormas</td>
            <td class="value">${ormas.jenisOrmas || 'Sosial Kemasyarakatan'}</td>
          </tr>
          <tr>
            <td class="label">Nomor Surat Keterangan Terdaftar (SKT)</td>
            <td class="value"><strong>${noSkt}</strong></td>
          </tr>
          <tr>
            <td class="label">Masa Berlaku SKT</td>
            <td class="value">${ormas.masaBerlaku || '5 (Lima) Tahun sejak diterbitkan'}</td>
          </tr>
          <tr>
            <td class="label">Tanggal Berdiri Organisasi</td>
            <td class="value">${ormas.tanggalBerdiri || '14 Agustus 2021'}</td>
          </tr>
        </table>

        <div class="section-title">2. Kepengurusan &amp; Penanggung Jawab</div>
        <table class="profile-grid">
          <tr>
            <td class="label">Ketua Umum / Pimpinan</td>
            <td class="value"><strong>${ormas.ketuaUmum || '-'}</strong></td>
          </tr>
          <tr>
            <td class="label">Sekretaris Umum</td>
            <td class="value">${ormas.sekretaris || '-'}</td>
          </tr>
          <tr>
            <td class="label">Bendahara Umum</td>
            <td class="value">${ormas.bendahara || '-'}</td>
          </tr>
        </table>

        <div class="section-title">3. Sekretariat &amp; Kontak Resmi</div>
        <table class="profile-grid">
          <tr>
            <td class="label">Alamat Sekretariat</td>
            <td class="value">${ormas.alamat || '-'}, Distrik ${ormas.distrik || 'Mimika Baru'}, Kab. Mimika, Papua Tengah</td>
          </tr>
          <tr>
            <td class="label">Nomor Telepon / WhatsApp</td>
            <td class="value">${ormas.telepon || '-'}</td>
          </tr>
          <tr>
            <td class="label">Alamat Pos-el (E-Mail)</td>
            <td class="value">${ormas.email || '-'}</td>
          </tr>
        </table>

        ${
          ormas.visiMisi
            ? `
          <div class="section-title">4. Visi &amp; Misi Organisasi</div>
          <div style="padding: 8px 10px; font-size: 9.5pt; color: #374151; background: #fafafa; border: 1px solid #e5e7eb;">
            ${ormas.visiMisi}
          </div>
        `
            : ''
        }

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-date">Timika, ${tanggalCetak}</div>
            <div class="signature-role">
              Kepala Badan Kesatuan Bangsa dan Politik<br />
              Kabupaten Mimika
            </div>
            <div class="signature-name">Administrator Utama</div>
            <div class="signature-nip">NIP. 19850423 201001 1 002</div>
          </div>
        </div>

        <div class="footer-note">
          <div>Dokumen ini sah dan diterbitkan secara elektronik oleh Bakesbangpol Kabupaten Mimika</div>
          <div>Lembar Profil Resmi Ormas</div>
        </div>
      </body>
    </html>
  `;

  printHtmlContent(fullHtml);
}

/**
 * Cetak Bukti Tanda Terima Pengajuan SKT untuk Pemohon / Ormas (PDF / Cetak)
 */
export function printBuktiTandaTerimaPdf(submission: {
  nomorTiket: string;
  namaOrmas: string;
  singkatan?: string;
  jenisOrmas?: string;
  tanggalPengajuan: string;
  status: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  petugasVerifikator?: string;
  estimasiTerbit?: string;
  catatan?: string;
}) {
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Tanda Terima Pendaftaran - ${submission.nomorTiket}</title>
        <style>
          ${getBasePrintCss()}
          .ticket-box {
            border: 2px solid #0284c7;
            background-color: #f0f9ff;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .ticket-num {
            font-size: 14pt;
            font-weight: 800;
            color: #0369a1;
            letter-spacing: 1px;
          }
          .ticket-label {
            font-size: 9pt;
            text-transform: uppercase;
            font-weight: 700;
            color: #0284c7;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 9.5pt;
          }
          .receipt-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          .receipt-table td.label {
            width: 35%;
            font-weight: 700;
            color: #374151;
            background-color: #f9fafb;
          }
          .checklist-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9pt;
          }
          .checklist-table th, .checklist-table td {
            border: 1px solid #d1d5db;
            padding: 5px 8px;
          }
          .checklist-table th {
            background-color: #f3f4f6;
            text-align: left;
            font-weight: 700;
          }
          .check-icon {
            text-align: center;
            font-weight: bold;
            color: #166534;
          }
        </style>
      </head>
      <body>
        ${getOfficialKopHtml()}

        <div class="doc-header">
          <div class="doc-title">BUKTI TANDA TERIMA PENDAFTARAN ORMAS</div>
          <div class="doc-subtitle">Pelayanan Pendaftaran &amp; Penerbitan Surat Keterangan Terdaftar (SKT)</div>
        </div>

        <div class="ticket-box">
          <div>
            <div class="ticket-label">Nomor Registrasi / Tiket Pengajuan:</div>
            <div class="ticket-num">${submission.nomorTiket}</div>
          </div>
          <div style="text-align: right;">
            <div class="ticket-label">Status Saat Ini:</div>
            <span class="badge badge-info" style="font-size: 10pt; padding: 4px 8px;">${submission.status}</span>
          </div>
        </div>

        <table class="receipt-table">
          <tr>
            <td class="label">Nama Organisasi Pemohon</td>
            <td><strong>${submission.namaOrmas}</strong> ${submission.singkatan ? `(${submission.singkatan})` : ''}</td>
          </tr>
          <tr>
            <td class="label">Bidang / Jenis Organisasi</td>
            <td>${submission.jenisOrmas || 'Sosial Kemasyarakatan'}</td>
          </tr>
          <tr>
            <td class="label">Tanggal Pengajuan Berkas</td>
            <td>${submission.tanggalPengajuan || tanggalCetak}</td>
          </tr>
          <tr>
            <td class="label">Alamat Sekretariat</td>
            <td>${submission.alamat || 'Kabupaten Mimika, Papua Tengah'}</td>
          </tr>
          <tr>
            <td class="label">Estimasi Penyelesaian</td>
            <td><strong>${submission.estimasiTerbit || '± 5-7 Hari Kerja'}</strong> (Sesuai SOP Kesbangpol)</td>
          </tr>
          <tr>
            <td class="label">Petugas Verifikator Berkas</td>
            <td>${submission.petugasVerifikator || 'Tim Verifikasi Badan Kesbangpol Mimika'}</td>
          </tr>
          ${
            submission.catatan
              ? `
            <tr>
              <td class="label">Catatan Pemeriksaan</td>
              <td style="color: #b45309;">${submission.catatan}</td>
            </tr>
          `
              : ''
          }
        </table>

        <div style="margin-top: 14px; font-weight: 700; font-size: 9.5pt; color: #1f2937;">
          Daftar Kelengkapan Dokumen Persyaratan:
        </div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">No</th>
              <th>Nama Dokumen Persyaratan</th>
              <th style="width: 120px; text-align: center;">Status Berkas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td>Surat Permohonan Pendaftaran / Pelaporan Ormas</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
            <tr>
              <td style="text-align: center;">2</td>
              <td>Akta Pendirian Notaris / SK Kemenkumham</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
            <tr>
              <td style="text-align: center;">3</td>
              <td>Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART)</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
            <tr>
              <td style="text-align: center;">4</td>
              <td>Susunan Kepengurusan Lengkap (SK Kepengurusan)</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
            <tr>
              <td style="text-align: center;">5</td>
              <td>Surat Keterangan Domisili Sekretariat dari Kelurahan/Distrik</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
            <tr>
              <td style="text-align: center;">6</td>
              <td>Nomor Pokok Wajib Pajak (NPWP) atas nama Organisasi</td>
              <td class="check-icon">✓ Lengkap</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 12px; padding: 8px 10px; background-color: #fefce8; border: 1px solid #fef08a; font-size: 8.5pt; color: #713f12; border-radius: 4px;">
          <strong>Perhatian:</strong> Simpan lembar tanda terima ini sebagai bukti sah pengajuan berkas pendaftaran Ormas ke Badan Kesbangpol Kabupaten Mimika. Pantau terus status proses verifikasi melalui Portal Resmi SI-ORMAS menggunakan Nomor Tiket Anda.
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-date">Timika, ${tanggalCetak}</div>
            <div class="signature-role">
              Petugas Pelayanan Pendaftaran Ormas<br />
              Badan Kesbangpol Kabupaten Mimika
            </div>
            <div class="signature-name">${submission.petugasVerifikator || 'Administrator Utama'}</div>
            <div class="signature-nip">NIP. 19850423 201001 1 002</div>
          </div>
        </div>

        <div class="footer-note">
          <div>Bukti Tanda Terima Elektronik Resmi SI-ORMAS Kesbangpol Mimika</div>
          <div>Dicetak pada: ${tanggalCetak}</div>
        </div>
      </body>
    </html>
  `;

  printHtmlContent(fullHtml);
}
