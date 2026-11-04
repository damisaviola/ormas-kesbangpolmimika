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

export interface ExcelColumnConfig {
  header: string;
  width?: number;
  align?: 'Left' | 'Center' | 'Right';
  wrapText?: boolean;
}

export interface ExcelSheetData {
  sheetName: string;
  kopInstansi?: boolean;
  title?: string;
  subtitle?: string;
  metaInfo?: string;
  headers: string[];
  columnsConfig?: ExcelColumnConfig[];
  rows: (string | number | null | undefined)[][];
  headerTheme?: 'blue' | 'amber' | 'emerald' | 'slate' | 'teal';
  summaryStats?: { label: string; value: string | number }[];
  showSignatureBlock?: boolean;
}

/**
 * Ekspor file Excel Multi-Sheet (.xls / XML Spreadsheet) kompatibel dengan Microsoft Excel, Google Sheets, & WPS Office
 * Dilengkapi styling profesional: KOP Resmi Pemerintah Daerah, Frozen Header Panes, Zebra Striping, Badges, dan Lembar Pengesahan.
 */
export function exportMultiSheetExcel(filename: string, sheets: ExcelSheetData[]) {
  if (typeof window === 'undefined') return;

  const escapeXml = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xmlSheets = sheets
    .map((sheet) => {
      const colCount = Math.max(sheet.headers.length, 1);
      const theme = sheet.headerTheme || 'blue';
      const hasKop = sheet.kopInstansi !== false;

      // 1. Column Definitions (Widths & Formatting)
      let colXml = '';
      if (sheet.columnsConfig && sheet.columnsConfig.length > 0) {
        colXml = sheet.columnsConfig
          .map((col, idx) => `   <Column ss:Index="${idx + 1}" ss:Width="${col.width || 130}" ss:AutoFitWidth="0"/>`)
          .join('\n');
      } else {
        colXml = sheet.headers
          .map((_, idx) => `   <Column ss:Index="${idx + 1}" ss:Width="130" ss:AutoFitWidth="1"/>`)
          .join('\n');
      }

      // 2. Official Header Rows (KOP & Banners)
      let headerRowsXml = '';
      let headerRowIndex = 1; // 1-based index of the table header row

      if (hasKop) {
        headerRowsXml += `
   <!-- KOP Resmi Bakesbangpol Mimika -->
   <Row ss:Height="20">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="KopSuper">
     <Data ss:Type="String">PEMERINTAH KABUPATEN MIMIKA</Data>
    </Cell>
   </Row>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="KopTitle">
     <Data ss:Type="String">BADAN KESATUAN BANGSA DAN POLITIK (BAKESBANGPOL)</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="KopSub">
     <Data ss:Type="String">SISTEM INFORMASI PELAYANAN &amp; PENDAFTARAN ORGANISASI KEMASYARAKATAN (SI-ORMAS)</Data>
    </Cell>
   </Row>
   <Row ss:Height="16">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="KopAddress">
     <Data ss:Type="String">Kompleks Perkantoran Pemerintah Daerah SP 3, Kuala Kencana, Timika - Papua Tengah 99910 | Website: kesbangpol.mimikakab.go.id</Data>
    </Cell>
   </Row>
   <Row ss:Height="5">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="KopDivider"/>
   </Row>
   <Row ss:Height="8"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="TitleBanner_${theme}">
     <Data ss:Type="String">${escapeXml(sheet.title || 'LAPORAN DATA ORGANISASI KEMASYARAKATAN')}</Data>
    </Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="MetaBar">
     <Data ss:Type="String">${escapeXml(sheet.metaInfo || sheet.subtitle || '')}</Data>
    </Cell>
   </Row>
   <Row ss:Height="10"/>`;
        headerRowIndex = 10;
      } else {
        if (sheet.title) {
          headerRowsXml += `
   <Row ss:Height="26">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="TitleBanner_${theme}">
     <Data ss:Type="String">${escapeXml(sheet.title)}</Data>
    </Cell>
   </Row>`;
          headerRowIndex++;
        }
        if (sheet.subtitle) {
          headerRowsXml += `
   <Row ss:Height="18">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="MetaBar">
     <Data ss:Type="String">${escapeXml(sheet.subtitle)}</Data>
    </Cell>
   </Row>`;
          headerRowIndex++;
        }
        headerRowsXml += `\n   <Row ss:Height="8"/>`;
        headerRowIndex++;
      }

      // 3. Table Column Header Row
      const tableHeaderCells = sheet.headers
        .map(
          (h) => `
    <Cell ss:StyleID="Header_${theme}">
     <Data ss:Type="String">${escapeXml(h)}</Data>
    </Cell>`
        )
        .join('');

      const tableHeaderRowXml = `
   <Row ss:Height="28">${tableHeaderCells}
   </Row>`;

      // 4. Data Rows with Zebra Striping (Even/Odd) & Custom Cell Badges
      const dataRowsXml = sheet.rows
        .map((row, rIdx) => {
          const isAlt = rIdx % 2 === 1;

          const cells = row
            .map((cell, cIdx) => {
              const val = escapeXml(cell);
              const isNum = typeof cell === 'number';
              const type = isNum ? 'Number' : 'String';
              const rawStr = cell !== null && cell !== undefined ? String(cell).trim() : '';
              const colConf = sheet.columnsConfig?.[cIdx];

              let styleId = isAlt ? 'CellAlt' : 'Cell';

              // Badges for legal status & skt status
              if (rawStr === 'Resmi' || rawStr === 'Aktif') {
                styleId = 'BadgeResmi';
              } else if (
                rawStr === 'Dalam Proses' ||
                rawStr === 'Proses' ||
                rawStr === 'Menunggu Verifikasi'
              ) {
                styleId = 'BadgeProses';
              } else if (rawStr === 'Kadaluarsa' || rawStr === 'Ditolak') {
                styleId = 'BadgeKadaluarsa';
              } else if (rawStr === 'Perpanjangan' || rawStr === 'Proses Perpanjangan') {
                styleId = 'BadgePerpanjangan';
              } else if (cIdx === 1) {
                // Organization Name (Bold accent)
                styleId = isAlt ? 'CellBoldAlt' : 'CellBold';
              } else if (cIdx === 0 || colConf?.align === 'Center') {
                styleId = isAlt ? 'CellCenterAlt' : 'CellCenter';
              } else if (colConf?.wrapText) {
                styleId = isAlt ? 'CellWrapAlt' : 'CellWrap';
              }

              return `
    <Cell ss:StyleID="${styleId}">
     <Data ss:Type="${type}">${val}</Data>
    </Cell>`;
            })
            .join('');

          return `
   <Row ss:Height="22">${cells}
   </Row>`;
        })
        .join('');

      // 5. Summary Statistics Card (if any)
      let summaryXml = '';
      if (sheet.summaryStats && sheet.summaryStats.length > 0) {
        summaryXml += `
   <Row ss:Height="12"/>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="StatHeader">
     <Data ss:Type="String">REKAPITULASI &amp; RINGKASAN DATA</Data>
    </Cell>
   </Row>`;

        sheet.summaryStats.forEach((st) => {
          summaryXml += `
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2" ss:StyleID="StatLabel">
     <Data ss:Type="String">${escapeXml(st.label)}</Data>
    </Cell>
    <Cell ss:StyleID="StatVal">
     <Data ss:Type="String">${escapeXml(st.value)}</Data>
    </Cell>
   </Row>`;
        });
      }

      // 6. Official Disclaimer & Sign-off Block (if enabled)
      let footerXml = '';
      if (sheet.showSignatureBlock !== false) {
        const dateFormatted = new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const signColStart = Math.min(17, colCount - 6 > 1 ? colCount - 6 : 1);
        const signMerge = colCount - signColStart;

        footerXml += `
   <Row ss:Height="16"/>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="12" ss:StyleID="NoteTitle">
     <Data ss:Type="String">LEGALITAS &amp; CATATAN RESMI:</Data>
    </Cell>
    <Cell ss:Index="${signColStart}" ss:MergeAcross="${signMerge}" ss:StyleID="SignCity">
     <Data ss:Type="String">Timika, ${dateFormatted}</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="12" ss:StyleID="NoteText">
     <Data ss:Type="String">1. Lembar data ini diterbitkan secara elektronik melalui Sistem Informasi Pelayanan Organisasi Kemasyarakatan (SI-ORMAS).</Data>
    </Cell>
    <Cell ss:Index="${signColStart}" ss:MergeAcross="${signMerge}" ss:StyleID="SignRole">
     <Data ss:Type="String">Kepala Badan Kesatuan Bangsa dan Politik</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="12" ss:StyleID="NoteText">
     <Data ss:Type="String">2. Data tersinkronisasi otomatis dengan basis data Pemerintah Kabupaten Mimika, Provinsi Papua Tengah.</Data>
    </Cell>
    <Cell ss:Index="${signColStart}" ss:MergeAcross="${signMerge}" ss:StyleID="SignSubRole">
     <Data ss:Type="String">Kabupaten Mimika</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="12" ss:StyleID="NoteText">
     <Data ss:Type="String">3. Keabsahan status terdaftar mengacu pada Surat Keterangan Terdaftar (SKT) resmi yang masih berlaku.</Data>
    </Cell>
   </Row>
   <Row ss:Height="30"/>
   <Row ss:Height="22">
    <Cell ss:Index="${signColStart}" ss:MergeAcross="${signMerge}" ss:StyleID="SignName">
     <Data ss:Type="String">( YAN SLAMET PURBA, S.E., M.Si. )</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:Index="${signColStart}" ss:MergeAcross="${signMerge}" ss:StyleID="SignNip">
     <Data ss:Type="String">Pembina Utama Muda | NIP. 19740815 199803 1 004</Data>
    </Cell>
   </Row>`;
      }

      return `
 <Worksheet ss:Name="${escapeXml(sheet.sheetName)}">
  <Table ss:DefaultRowHeight="20">
${colXml}
${headerRowsXml}${tableHeaderRowXml}${dataRowsXml}${summaryXml}${footerXml}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Unsynced/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>${headerRowIndex}</SplitHorizontal>
   <TopRowBottomPane>${headerRowIndex}</TopRowBottomPane>
   <ActivePane>2</ActivePane>
   <Panes>
    <Pane>
     <Number>3</Number>
    </Pane>
    <Pane>
     <Number>2</Number>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>`;
    })
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Badan Kesatuan Bangsa dan Politik Kabupaten Mimika</Author>
  <LastAuthor>SI-ORMAS Kesbangpol Mimika</LastAuthor>
  <Company>Pemerintah Daerah Kabupaten Mimika</Company>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
  </Style>

  <!-- KOP Instansi Resmi -->
  <Style ss:ID="KopSuper">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="KopTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="KopSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="KopAddress">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="8.5" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="KopDivider">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
  </Style>

  <!-- Title Banners per Kategori Theme -->
  <Style ss:ID="TitleBanner_emerald">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#065F46" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleBanner_amber">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#B45309" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleBanner_blue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E3A8A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleBanner_slate">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#334155" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleBanner_teal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F766E" ss:Pattern="Solid"/>
  </Style>

  <!-- Meta Info Bar -->
  <Style ss:ID="MetaBar">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Italic="1" ss:Color="#475569"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <!-- Table Column Headers -->
  <Style ss:ID="Header_emerald">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#065F46"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Header_amber">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#D97706" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Header_blue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Header_slate">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#475569" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Header_teal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0D9488" ss:Pattern="Solid"/>
  </Style>

  <!-- Zebra Striped Data Cells (White & Light Slate-50) -->
  <Style ss:ID="Cell">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellAlt">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="CellBold">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellBoldAlt">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellCenterAlt">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="CellWrap">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#334155"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellWrapAlt">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#334155"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <!-- Legal Status & Category Badges -->
  <Style ss:ID="BadgeResmi">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#15803D"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BadgeProses">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCD34D"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCD34D"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCD34D"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCD34D"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BadgeKadaluarsa">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BadgePerpanjangan">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#7DD3FC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#7DD3FC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#7DD3FC"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#7DD3FC"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0369A1"/>
   <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
  </Style>

  <!-- Summary Statistics & Signatures -->
  <Style ss:ID="StatHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#334155"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="NoteTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="NoteText">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="8.5" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="SignCity">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="SignRole">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="SignSubRole">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="SignName">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Underline="Single" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="SignNip">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#475569"/>
  </Style>
 </Styles>
${xmlSheets}
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;

  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ekspor Data Full Organisasi ke File Excel dengan Pembagian 2 Kategori Sesuai Kategori yang Ada:
 * 1. Kategori 1: Organisasi Resmi (Aktif / Memiliki SKT Sah)
 * 2. Kategori 2: Organisasi Dalam Proses (Tahap Verifikasi & Pengajuan)
 * 3. Sheet Master: Rekapitulasi Lengkap Seluruh Organisasi
 * 
 * Dilengkapi Desain Eksekutif Pemerintah Daerah:
 * - KOP Resmi Bakesbangpol Kabupaten Mimika
 * - Freeze Panes (Header tetap terkunci saat di-scroll ke bawah)
 * - Auto column widths & wrap text untuk 25 atribut lengkap
 * - Status Badges & Zebra Striping
 * - Ringkasan KPI Data & Blok Lembar Pengesahan Pejabat
 */
export function exportFullOrmasToExcel(
  ormasList: any[],
  customFilename?: string
) {
  const FULL_COLUMNS_CONFIG: ExcelColumnConfig[] = [
    { header: 'No', width: 42, align: 'Center' },
    { header: 'Nama Organisasi Kemasyarakatan', width: 260, align: 'Left' },
    { header: 'Singkatan', width: 85, align: 'Center' },
    { header: 'Kategori Legalitas', width: 130, align: 'Center' },
    { header: 'Jenis Organisasi', width: 115, align: 'Center' },
    { header: 'Bidang / Kategori', width: 165, align: 'Left' },
    { header: 'Nomor SKT', width: 195, align: 'Center' },
    { header: 'Tanggal Terbit SKT', width: 125, align: 'Center' },
    { header: 'Masa Berlaku SKT', width: 120, align: 'Center' },
    { header: 'Status SKT', width: 130, align: 'Center' },
    { header: 'Ketua Umum', width: 175, align: 'Left' },
    { header: 'Telepon / WhatsApp', width: 135, align: 'Center' },
    { header: 'Email Resmi', width: 195, align: 'Left' },
    { header: 'Alamat Sekretariat', width: 280, align: 'Left', wrapText: true },
    { header: 'Kelurahan / Desa', width: 130, align: 'Left' },
    { header: 'Distrik', width: 130, align: 'Left' },
    { header: 'Kabupaten', width: 130, align: 'Left' },
    { header: 'Provinsi', width: 110, align: 'Left' },
    { header: 'Kode Pos', width: 75, align: 'Center' },
    { header: 'Nomor Akta Notaris', width: 180, align: 'Center' },
    { header: 'Nama Notaris', width: 160, align: 'Left' },
    { header: 'NPWP Organisasi', width: 155, align: 'Center' },
    { header: 'Tanggal Pendirian / Terdaftar', width: 140, align: 'Center' },
    { header: 'Tujuan Organisasi', width: 280, align: 'Left', wrapText: true },
    { header: 'Visi & Misi', width: 300, align: 'Left', wrapText: true },
  ];

  const headers = FULL_COLUMNS_CONFIG.map((c) => c.header);

  const mapOrmasToRow = (item: any, idx: number) => {
    const isResmi =
      item.status === 'Resmi' ||
      item.statusSk === 'Aktif' ||
      item.statusSkt === 'Aktif' ||
      (item.nomorSkt && !item.nomorSkt.includes('Dalam Verifikasi'));

    const statusLabel = isResmi ? 'Resmi' : 'Dalam Proses';
    const noSktVal = item.noSkt || item.nomorSk || item.nomorSkt || (isResmi ? '-' : 'Dalam Verifikasi');

    return [
      idx + 1,
      item.nama || item.namaOrmas || '-',
      item.singkatan || '-',
      statusLabel,
      item.jenis || item.jenisOrmas || 'ORMAS',
      item.kategori || 'Sosial Kemasyarakatan',
      noSktVal,
      item.tanggalTerbitSkt || (isResmi ? item.tanggalDaftar || '-' : '-'),
      item.masaBerlakuSkt || item.tanggalBerlaku || (isResmi ? '5 Tahun' : '-'),
      item.statusSkt || (isResmi ? 'Aktif' : 'Menunggu Verifikasi'),
      item.ketua || item.ketuaUmum || '-',
      item.telepon || '-',
      item.email || '-',
      item.alamatSekretariat || item.alamat || '-',
      item.kelurahanDesa || '-',
      item.distrik || 'Mimika Baru',
      item.kabupaten || 'Kabupaten Mimika',
      item.provinsi || 'Papua Tengah',
      item.kodePos || '99910',
      item.nomorAktaNotaris || '-',
      item.namaNotaris || '-',
      item.npwpOrmas || '-',
      item.tanggalPendirian || item.tanggalDaftar || '-',
      item.tujuanOrganisasi || '-',
      item.visiMisi || '-',
    ];
  };

  // Pembagian 2 Kategori Utama sesuai sistem Kesbangpol
  const ormasResmi = ormasList.filter(
    (i) => i.status === 'Resmi' || i.statusSk === 'Aktif' || i.statusSkt === 'Aktif'
  );
  const ormasProses = ormasList.filter(
    (i) => !(i.status === 'Resmi' || i.statusSk === 'Aktif' || i.statusSkt === 'Aktif')
  );

  const timestamp = new Date().toISOString().slice(0, 10);
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sheets: ExcelSheetData[] = [];

  // Sheet Kategori 1: Ormas Resmi
  if (ormasResmi.length > 0) {
    sheets.push({
      sheetName: '1. Ormas Resmi (Ber-SKT)',
      kopInstansi: true,
      title: 'DATA LENGKAP ORGANISASI KEMASYARAKATAN RESMI (MEMILIKI SKT AKTIF)',
      metaInfo: `Status: Terverifikasi Sah & Memiliki SKT | Wilayah: Kabupaten Mimika, Papua Tengah | Tanggal Ekspor: ${dateFormatted} | Total: ${ormasResmi.length} Organisasi`,
      headerTheme: 'emerald',
      headers,
      columnsConfig: FULL_COLUMNS_CONFIG,
      rows: ormasResmi.map((item, idx) => mapOrmasToRow(item, idx)),
      summaryStats: [
        { label: 'Total Ormas Resmi Terdaftar', value: `${ormasResmi.length} Organisasi` },
        { label: 'SKT Berstatus Aktif', value: `${ormasResmi.filter((i) => i.statusSk === 'Aktif' || i.statusSkt === 'Aktif').length} Organisasi` },
        { label: 'Memiliki Nomor NPWP', value: `${ormasResmi.filter((i) => i.npwpOrmas && i.npwpOrmas !== '-').length} Organisasi` },
        { label: 'Memiliki Akta Notaris', value: `${ormasResmi.filter((i) => i.nomorAktaNotaris && i.nomorAktaNotaris !== '-').length} Organisasi` },
      ],
      showSignatureBlock: true,
    });
  }

  // Sheet Kategori 2: Ormas Dalam Proses
  if (ormasProses.length > 0) {
    sheets.push({
      sheetName: '2. Ormas Dalam Proses',
      kopInstansi: true,
      title: 'DATA LENGKAP ORGANISASI KEMASYARAKATAN TAHAP VERIFIKASI & PENGAJUAN',
      metaInfo: `Status: Tahap Verifikasi Administrasi & Lapangan | Wilayah: Kabupaten Mimika, Papua Tengah | Tanggal Ekspor: ${dateFormatted} | Total: ${ormasProses.length} Organisasi`,
      headerTheme: 'amber',
      headers,
      columnsConfig: FULL_COLUMNS_CONFIG,
      rows: ormasProses.map((item, idx) => mapOrmasToRow(item, idx)),
      summaryStats: [
        { label: 'Total Ormas Dalam Pengajuan', value: `${ormasProses.length} Organisasi` },
        { label: 'Status Verifikasi Dokumen', value: 'Menunggu Pemeriksaan Tim Kesbangpol' },
        { label: 'Unit Pelaksana', value: 'Subbidang Ormas Bakesbangpol Kab. Mimika' },
      ],
      showSignatureBlock: true,
    });
  }

  // Sheet Master: Rekapitulasi Lengkap Seluruh Ormas (disertakan saat mengekspor kedua kategori)
  if (ormasList.length > 0 && (ormasResmi.length > 0 && ormasProses.length > 0)) {
    sheets.push({
      sheetName: 'Rekap Semua Organisasi',
      kopInstansi: true,
      title: 'REKAPITULASI MASTER SELURUH DATA ORGANISASI KEMASYARAKATAN KABUPATEN MIMIKA',
      metaInfo: `Basis Data Terpadu SI-ORMAS Meno Sodak Kanda | Tanggal Ekspor: ${dateFormatted} | Total Master: ${ormasList.length} Organisasi`,
      headerTheme: 'blue',
      headers,
      columnsConfig: FULL_COLUMNS_CONFIG,
      rows: ormasList.map((item, idx) => mapOrmasToRow(item, idx)),
      summaryStats: [
        { label: 'Total Keseluruhan Organisasi', value: `${ormasList.length} Organisasi` },
        { label: 'Kategori 1: Ormas Resmi (Ber-SKT)', value: `${ormasResmi.length} Organisasi` },
        { label: 'Kategori 2: Ormas Dalam Proses', value: `${ormasProses.length} Organisasi` },
        { label: 'Cakupan Wilayah Layanan', value: 'Kabupaten Mimika, Papua Tengah' },
      ],
      showSignatureBlock: true,
    });
  } else if (sheets.length === 0) {
    // Fallback jika tidak ada data sama sekali
    sheets.push({
      sheetName: 'Data Organisasi',
      kopInstansi: true,
      title: 'DATA ORGANISASI KEMASYARAKATAN',
      metaInfo: `Tanggal Ekspor: ${dateFormatted} | Total: 0 Organisasi`,
      headerTheme: 'blue',
      headers,
      columnsConfig: FULL_COLUMNS_CONFIG,
      rows: [],
      showSignatureBlock: true,
    });
  }

  const filename = customFilename || `Data_Full_Organisasi_Mimika_2_Kategori_${timestamp}`;
  exportMultiSheetExcel(filename, sheets);
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
