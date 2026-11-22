const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const archiver = require('archiver');
const { templateWorkbook } = require('../lib/importer');

function getZipArchive(options) {
  if (typeof archiver === 'function') return archiver('zip', options);
  if (archiver && archiver.ZipArchive) return new archiver.ZipArchive(options);
  if (archiver && archiver.default && typeof archiver.default === 'function') return archiver.default('zip', options);
  throw new Error('Archiver module format not recognized');
}

/**
 * Service managing data exports (Excel XLSX, CSV, and ZIP archives).
 */
const exportService = {
  /**
   * Format guest list rows for export.
   */
  buildGuestExportData(guests, baseUrl) {
    const header = [
      'ID',
      'Gelar',
      'Nama Tamu',
      'Acara',
      'Pasangan?',
      'Nama Pasangan',
      'Maks Pax',
      'No. HP',
      'Kategori',
      'Tautan Undangan',
      'Status RSVP',
      'Jumlah Hadir',
      'Doa/Ucapan',
      'Pesan WhatsApp'
    ];

    const rows = guests.map((g) => {
      const isReception = g.event_type === 'reception';
      const url = `${baseUrl}/${g.slug}`;
      const rsvpStatus = g.attending === 1 ? 'Hadir' : g.attending === 0 ? 'Tidak Hadir' : 'Belum Konfirmasi';
      const eventLabel = isReception ? 'Syukuran (Navy & Silver)' : g.event_type === 'akad' ? 'Akad (Dusty Rose)' : 'Keduanya';
      const recipientName = `${g.title ? g.title + ' ' : ''}${g.name}${g.with_partner ? ' & Pasangan' : ''}`;
      const eventName = isReception ? 'Syukuran Pernikahan' : g.event_type === 'akad' ? 'Akad Nikah' : 'Pernikahan';
      const waText = `Assalamu’alaikum Wr. Wb. Kepada Yth. ${recipientName}, tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara ${eventName} Farabi & Syifa: ${url}`;

      return [
        g.id,
        g.title || '',
        g.name,
        eventLabel,
        g.with_partner ? 'Ya' : 'Tidak',
        g.partner_name || '',
        g.max_pax,
        g.phone || '',
        g.grp || '',
        url,
        rsvpStatus,
        g.pax || 0,
        g.wish || '',
        waText
      ];
    });

    return { header, rows };
  },

  /**
   * Export guests to styled Excel workbook buffer.
   */
  exportGuestsToExcel(guests, baseUrl) {
    const { header, rows } = this.buildGuestExportData(guests, baseUrl);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Set readable column widths
    ws['!cols'] = [
      { wch: 6 },  // ID
      { wch: 10 }, // Gelar
      { wch: 28 }, // Nama Tamu
      { wch: 22 }, // Acara
      { wch: 12 }, // Pasangan
      { wch: 20 }, // Nama Pasangan
      { wch: 10 }, // Maks Pax
      { wch: 16 }, // Phone
      { wch: 16 }, // Kategori
      { wch: 38 }, // URL
      { wch: 18 }, // Status
      { wch: 12 }, // Hadir Pax
      { wch: 35 }, // Doa
      { wch: 50 }  // WhatsApp text
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Undangan');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  },

  /**
   * Export guests to CSV buffer.
   */
  exportGuestsToCsv(guests, baseUrl) {
    const { header, rows } = this.buildGuestExportData(guests, baseUrl);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Undangan');
    return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
  },

  /**
   * Generate guest template file buffer (CSV or XLSX).
   */
  generateTemplate(format = 'xlsx') {
    return templateWorkbook(format);
  },

  /**
   * Stream a ZIP archive of voice recordings directly to HTTP response.
   */
  serveRecordingsZip(res, rows, zipFilename, voiceDir) {
    const archive = getZipArchive({ zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    archive.on('error', (err) => {
      console.error('[Recordings ZIP] Archive error:', err);
      if (!res.headersSent) {
        res.status(500).send('Gagal membuat file ZIP rekaman.');
      }
    });

    archive.pipe(res);

    let manifestText =
      `=======================================================\n` +
      `DAFTAR REKAMAN PESAN SUARA TAMU — FARABI & SYIFA\n` +
      `Waktu Ekspor: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n` +
      `Total Rekaman: ${rows.length}\n` +
      `=======================================================\n\n`;

    let index = 1;
    for (const r of rows) {
      const filePath = path.join(voiceDir, r.voice_file);
      if (fs.existsSync(filePath)) {
        const ext = r.voice_mime && r.voice_mime.includes('mp4') ? 'mp4' : 'webm';
        const safeName = (r.name || 'tamu').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
        const padIdx = String(index).padStart(2, '0');
        const inZipFilename = `${padIdx}_${safeName}_${r.slug || 'guest'}.${ext}`;

        archive.file(filePath, { name: inZipFilename });

        manifestText +=
          `[${padIdx}] ${r.name}\n` +
          `  - File: ${inZipFilename}\n` +
          `  - Kehadiran: ${r.attending === 1 ? 'Hadir' : 'Tidak Hadir'}\n` +
          `  - Durasi: ${r.voice_duration || 0} detik\n` +
          `  - Kategori / Grup: ${r.grp || '-'}\n` +
          `  - Waktu Rekam: ${r.created_at || '-'}\n` +
          (r.wish ? `  - Pesan Tertulis: "${r.wish}"\n` : '') +
          `\n`;

        index++;
      }
    }

    archive.append(manifestText, { name: 'DAFTAR_REKAMAN.txt' });
    archive.finalize();
  }
};

module.exports = exportService;
