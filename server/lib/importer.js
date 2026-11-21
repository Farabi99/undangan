// Parses an uploaded guest list (.xlsx / .xls / .csv) into validated rows for the preview step.
const XLSX = require('xlsx');
const { db } = require('../db');
const { slugify } = require('./slug');
const { cleanText, toInt, normalizePhone, yes } = require('./validate');

// Accept English and Indonesian header names with extensive real-world aliases.
const HEADER_ALIASES = {
  title: ['title', 'gelar', 'sapaan', 'panggilan', 'sebutan', 'honorific'],
  name: ['name', 'nama', 'nama tamu', 'nama lengkap', 'guest', 'guest name', 'full name', 'fullname'],
  with_partner: ['with partner', 'with_partner', 'dengan pasangan', 'pasangan?', 'plus partner', 'partner?', 'bawa pasangan', 'plus one', 'plus_one', 'bawa pendamping'],
  partner_name: ['partner name', 'partner_name', 'partner', 'pasangan', 'nama pasangan', 'nama pendamping', 'pendamping'],
  max_pax: ['max pax', 'max_pax', 'maks pax', 'maksimal pax', 'maksimum pax', 'maks tamu', 'jumlah pax', 'pax', 'jumlah', 'jumlah tamu', 'maks', 'max', 'kuota', 'quota', 'alokasi'],
  phone: ['phone', 'hp', 'no hp', 'no. hp', 'nomor hp', 'whatsapp', 'wa', 'no wa', 'no. wa', 'nomor wa', 'telepon', 'telp', 'mobile', 'kontak'],
  grp: ['group', 'grup', 'kelompok', 'kategori', 'category', 'relasi', 'hubungan', 'instansi'],
  event_type: ['event type', 'event_type', 'acara', 'jenis acara', 'tipe acara', 'event', 'tipe', 'tema', 'design', 'sesi', 'sesi acara'],
  show_story: ['show story', 'show_story', 'kisah kami', 'kisah_kami', 'story', 'cerita', 'love story']
};

function parseShowStory(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const s = String(raw).trim().toLowerCase();
  if (/^0$|^no$|^false$|^hide$|^sembunyi$|^tidak$/.test(s)) return 0;
  if (/^1$|^yes$|^true$|^show$|^tampil$|^ya$/.test(s)) return 1;
  return null;
}

function mapHeader(h) {
  const key = String(h || '')
    .replace(/^\uFEFF/, '') // Strip UTF-8 BOM
    .trim()
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ');
  for (const field of Object.keys(HEADER_ALIASES)) {
    if (HEADER_ALIASES[field].includes(key)) return field;
  }
  return null;
}

function parseEventType(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'both';
  // Check for combined/both first
  if (/both|keduanya|semua|all|\+|dan|&/.test(s) || (/akad/.test(s) && /syukuran|resepsi|reception/.test(s))) {
    return 'both';
  }
  if (/syukuran|resepsi|reception/.test(s)) {
    return 'reception';
  }
  if (/akad/.test(s)) {
    return 'akad';
  }
  return 'both';
}

const dupKey = (name, phone) => slugify(name) + '|' + (phone || '');

function parseGuestFile(buffer, maxPaxDefault) {
  const wb = XLSX.read(buffer, { type: 'buffer', raw: false, codepage: 65001 });
  const sheetName = wb.SheetNames[0];
  const sheet = sheetName ? wb.Sheets[sheetName] : null;
  if (!sheet) throw new Error('File kosong / spreadsheet has no sheets');

  const table = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
  if (table.length < 2) throw new Error('Tidak ada baris tamu / no guest rows found in sheet');

  const headers = table[0].map(mapHeader);
  if (!headers.includes('name')) {
    throw new Error('Kolom nama tamu tidak ditemukan. Pastikan ada kolom dengan judul "name", "nama", atau "nama tamu".');
  }

  const existing = new Set(db.prepare('SELECT name, phone FROM guests').all().map((g) => dupKey(g.name, g.phone)));
  const seen = new Set();
  const rows = [];

  table.slice(1).forEach((cells, i) => {
    const r = {};
    headers.forEach((field, col) => { if (field) r[field] = cells[col]; });
    const name = cleanText(r.name, 120);
    if (!name && !cleanText(r.phone, 30)) return; // fully blank line

    const eventType = parseEventType(r.event_type);

    const row = {
      line: i + 2, // spreadsheet row number (header is row 1)
      title: cleanText(r.title, 30),
      name,
      partner_name: cleanText(r.partner_name, 120),
      with_partner: 0,
      max_pax: toInt(r.max_pax, maxPaxDefault),
      phone: normalizePhone(r.phone),
      grp: cleanText(r.grp, 60),
      event_type: eventType,
      show_story: parseShowStory(r.show_story),
      errors: [],
      warnings: [],
      duplicate: false
    };
    row.with_partner = row.partner_name || yes(r.with_partner) ? 1 : 0;

    if (!row.name) row.errors.push('Nama kosong');
    if (row.max_pax < 1 || row.max_pax > 10) row.errors.push('max_pax harus 1–10');
    if (cleanText(r.phone, 30) && !row.phone) row.warnings.push('No. HP tidak valid (dikosongkan)');

    const key = dupKey(row.name, row.phone);
    if (row.name && (existing.has(key) || seen.has(key))) {
      row.duplicate = true;
      row.warnings.push(existing.has(key) ? 'Sudah ada di daftar tamu' : 'Duplikat di file ini');
    }
    seen.add(key);
    rows.push(row);
  });

  return {
    rows,
    stats: {
      total: rows.length,
      valid: rows.filter((r) => !r.errors.length && !r.duplicate).length,
      errors: rows.filter((r) => r.errors.length).length,
      duplicates: rows.filter((r) => r.duplicate).length
    }
  };
}

function templateWorkbook(format) {
  const data = [
    ['title', 'name', 'with_partner', 'partner_name', 'max_pax', 'phone', 'group', 'event_type', 'show_story'],
    ['Bpk.', 'Farhan Pratama', 'yes', 'Dinda Permata', 2, '081234567890', 'Keluarga', 'syukuran', 'yes'],
    ['Ibu', 'Siti Aminah', 'no', '', 1, '081987654321', 'Kantor', 'akad', 'no'],
    ['', 'Budi Santoso', 'yes', 'Ani Lestari', 2, '081298765432', 'Sahabat', 'both', '']
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set explicit column widths for beautiful readability in Excel
  ws['!cols'] = [
    { wch: 8 },  // title
    { wch: 25 }, // name
    { wch: 14 }, // with_partner
    { wch: 20 }, // partner_name
    { wch: 10 }, // max_pax
    { wch: 16 }, // phone
    { wch: 14 }, // group
    { wch: 14 }, // event_type
    { wch: 12 }  // show_story
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tamu');
  return XLSX.write(wb, { type: 'buffer', bookType: format === 'csv' ? 'csv' : 'xlsx' });
}

module.exports = { parseGuestFile, templateWorkbook, parseEventType, mapHeader };
