const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');
const XLSX = require('xlsx');
const archiver = require('archiver');
const { db, getSetting, setSetting, tx } = require('../db');
const content = require('../lib/content');
const { uniqueSlug, isValidSlug, slugify, RESERVED } = require('../lib/slug');
const { cleanText, toInt, normalizePhone, yes, clamp } = require('../lib/validate');
const { parseGuestFile, templateWorkbook } = require('../lib/importer');
const {
  checkPassword,
  setSession,
  clearSession,
  isLoggedIn,
  sameOrigin,
  hasAdminPassword
} = require('../lib/security');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const VOICE_DIR = path.join(DATA_DIR, 'voice-notes');

function getZipArchive(options) {
  if (typeof archiver === 'function') return archiver('zip', options);
  if (archiver && archiver.ZipArchive) return new archiver.ZipArchive(options);
  if (archiver && archiver.default && typeof archiver.default === 'function') return archiver.default('zip', options);
  throw new Error('Archiver module format not recognized');
}

function serveRecordingsZip(res, rows, zipFilename) {
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

  let manifestText = `=======================================================\n` +
    `DAFTAR REKAMAN PESAN SUARA TAMU — FARABI & SYIFA\n` +
    `Waktu Ekspor: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n` +
    `Total Rekaman: ${rows.length}\n` +
    `=======================================================\n\n`;

  let index = 1;
  for (const r of rows) {
    const filePath = path.join(VOICE_DIR, r.voice_file);
    if (fs.existsSync(filePath)) {
      const ext = (r.voice_mime && r.voice_mime.includes('mp4')) ? 'mp4' : 'webm';
      const safeName = (r.name || 'tamu').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
      const padIdx = String(index).padStart(2, '0');
      const inZipFilename = `${padIdx}_${safeName}_${r.slug || 'guest'}.${ext}`;

      archive.file(filePath, { name: inZipFilename });

      manifestText += `[${padIdx}] ${r.name}\n` +
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB max
});

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (!hasAdminPassword()) {
    // If no password set in env, allow access with warning banner or direct setup
    return next();
  }
  if (!isLoggedIn(req)) {
    return res.redirect('/admin/login');
  }
  next();
}

// Login GET
router.get('/login', (req, res) => {
  if (isLoggedIn(req)) return res.redirect('/admin');
  res.render('admin/login', { error: null, hasPassword: hasAdminPassword() });
});

// Login POST
router.post('/login', sameOrigin, (req, res) => {
  const password = req.body.password || '';
  if (!hasAdminPassword() || checkPassword(password)) {
    setSession(req, res);
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: 'Password salah / Incorrect password', hasPassword: true });
});

// Logout
router.get('/logout', (req, res) => {
  clearSession(res);
  res.redirect('/admin/login');
});

// All routes below require auth
router.use(requireAuth);

// Admin Dashboard & Guests list
router.get('/', (req, res) => {
  res.redirect('/admin/guests');
});

router.get('/guests', (req, res) => {
  const q = cleanText(req.query.q, 100);
  const grp = cleanText(req.query.grp, 60);
  const status = cleanText(req.query.status, 30);
  const event_type = cleanText(req.query.event_type, 30);

  let query = `
    SELECT g.*, r.attending, r.pax, r.wish, r.created_at AS rsvp_at
    FROM guests g
    LEFT JOIN rsvps r ON g.id = r.guest_id
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    query += ` AND (g.name LIKE ? OR g.slug LIKE ? OR g.phone LIKE ?)`;
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (grp) {
    query += ` AND g.grp = ?`;
    params.push(grp);
  }
  if (status === 'attending') {
    query += ` AND r.attending = 1`;
  } else if (status === 'absent') {
    query += ` AND r.attending = 0`;
  } else if (status === 'unconfirmed') {
    query += ` AND r.attending IS NULL`;
  } else if (status === 'opened') {
    query += ` AND g.open_count > 0`;
  } else if (status === 'unopened') {
    query += ` AND g.open_count = 0`;
  }

  if (event_type === 'both' || event_type === 'reception' || event_type === 'akad') {
    query += ` AND g.event_type = ?`;
    params.push(event_type);
  }

  query += ` ORDER BY g.id DESC`;
  const guests = db.prepare(query).all(...params);

  // Distinct groups for filtering
  const groups = db.prepare("SELECT DISTINCT grp FROM guests WHERE grp != '' ORDER BY grp ASC").all().map((r) => r.grp);

  // Metrics (unfiltered totals)
  const stats = db.prepare(`
    SELECT
      COUNT(g.id) AS totalGuests,
      SUM(CASE WHEN g.open_count > 0 THEN 1 ELSE 0 END) AS totalOpened,
      SUM(CASE WHEN r.attending = 1 THEN 1 ELSE 0 END) AS totalAttending,
      SUM(CASE WHEN r.attending = 0 THEN 1 ELSE 0 END) AS totalAbsent,
      COALESCE(SUM(r.pax), 0) AS totalPax
    FROM guests g
    LEFT JOIN rsvps r ON g.id = r.guest_id
  `).get();

  const currentStoryVal = getSetting('show_story', content.showStory ? '1' : '0');
  const showStory = currentStoryVal === '1';

  res.render('admin/guests', {
    guests,
    groups,
    stats,
    q,
    grp,
    status,
    event_type,
    success: req.query.success || null,
    error: req.query.error || null,
    host: req.get('host'),
    protocol: req.protocol,
    couple: content.couple,
    showStory,
    storySettingValue: currentStoryVal
  });
});

// Toggle Global Kisah Kami Setting (Code 0 or 1)
router.post('/settings/story', sameOrigin, (req, res) => {
  let newVal;
  if (req.body && req.body.value !== undefined) {
    newVal = (req.body.value === '1' || req.body.value === 1 || req.body.value === true || req.body.value === 'true') ? '1' : '0';
  } else {
    const cur = getSetting('show_story', content.showStory ? '1' : '0');
    newVal = cur === '1' ? '0' : '1';
  }
  setSetting('show_story', newVal);
  res.json({ ok: true, showStory: newVal === '1', value: newVal });
});

// Add Single Guest POST
router.post('/guests/add', sameOrigin, (req, res) => {
  const title = cleanText(req.body.title, 30);
  const name = cleanText(req.body.name, 120);
  const partner_name = cleanText(req.body.partner_name, 120);
  const with_partner = partner_name || yes(req.body.with_partner) ? 1 : 0;
  const max_pax = clamp(toInt(req.body.max_pax, content.maxPaxDefault), 1, 10);
  const phone = normalizePhone(req.body.phone);
  const grp = cleanText(req.body.grp, 60);
  const event_type = req.body.event_type === 'reception' ? 'reception' : req.body.event_type === 'akad' ? 'akad' : 'both';
  let show_story = null;
  if (req.body.show_story === '0' || req.body.show_story === 0) {
    show_story = 0;
  } else if (req.body.show_story === '1' || req.body.show_story === 1) {
    show_story = 1;
  }

  if (!name) {
    return res.redirect('/admin/guests?error=nama_wajib');
  }

  let slug = '';
  const customSlugInput = cleanText(req.body.slug, 70);
  if (customSlugInput) {
    slug = slugify(customSlugInput);
    if (RESERVED.has(slug)) {
      return res.redirect('/admin/guests?error=slug_reserved');
    }
    const conflict = db.prepare('SELECT id FROM guests WHERE slug = ?').get(slug);
    if (conflict) {
      return res.redirect('/admin/guests?error=slug_terpakai');
    }
  } else {
    slug = uniqueSlug(name);
  }

  db.prepare(`
    INSERT INTO guests (slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story);

  res.redirect('/admin/guests?success=added');
});

// Edit Guest POST
router.post('/guests/:id/edit', sameOrigin, (req, res) => {
  const id = toInt(req.params.id, 0);
  const title = cleanText(req.body.title, 30);
  const name = cleanText(req.body.name, 120);
  const partner_name = cleanText(req.body.partner_name, 120);
  const with_partner = partner_name || yes(req.body.with_partner) ? 1 : 0;
  const max_pax = clamp(toInt(req.body.max_pax, content.maxPaxDefault), 1, 10);
  const phone = normalizePhone(req.body.phone);
  const grp = cleanText(req.body.grp, 60);
  const event_type = req.body.event_type === 'reception' ? 'reception' : req.body.event_type === 'akad' ? 'akad' : 'both';
  let show_story = null;
  if (req.body.show_story === '0' || req.body.show_story === 0) {
    show_story = 0;
  } else if (req.body.show_story === '1' || req.body.show_story === 1) {
    show_story = 1;
  }

  if (!name) {
    return res.redirect('/admin/guests?error=nama_wajib');
  }

  const currentGuest = db.prepare('SELECT id, slug FROM guests WHERE id = ?').get(id);
  if (!currentGuest) {
    return res.redirect('/admin/guests?error=tamu_tidak_ada');
  }

  const customSlugInput = cleanText(req.body.slug, 70);
  let targetSlug = customSlugInput ? slugify(customSlugInput) : currentGuest.slug;
  if (!targetSlug) {
    targetSlug = slugify(name);
  }

  if (RESERVED.has(targetSlug)) {
    return res.redirect('/admin/guests?error=slug_reserved');
  }

  const conflict = db.prepare('SELECT id FROM guests WHERE slug = ? AND id != ?').get(targetSlug, id);
  if (conflict) {
    return res.redirect('/admin/guests?error=slug_terpakai');
  }

  db.prepare(`
    UPDATE guests
    SET slug = ?, title = ?, name = ?, with_partner = ?, partner_name = ?, max_pax = ?, phone = ?, grp = ?, event_type = ?, show_story = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(targetSlug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story, id);

  res.redirect('/admin/guests?success=updated');
});

// Delete Single Guest POST
router.post('/guests/:id/delete', sameOrigin, (req, res) => {
  const id = toInt(req.params.id, 0);
  db.prepare('DELETE FROM guests WHERE id = ?').run(id);
  res.redirect('/admin/guests?success=deleted');
});

// Bulk Delete Guests POST
router.post('/guests/bulk-delete', sameOrigin, (req, res) => {
  let ids = req.body.ids;
  if (typeof ids === 'string') {
    ids = ids.split(',').map((s) => toInt(s.trim(), 0)).filter((n) => n > 0);
  } else if (Array.isArray(ids)) {
    ids = ids.map((s) => toInt(s, 0)).filter((n) => n > 0);
  } else {
    ids = [];
  }

  if (ids.length > 0) {
    tx(() => {
      const stmt = db.prepare('DELETE FROM guests WHERE id = ?');
      for (const id of ids) {
        stmt.run(id);
      }
    });
  }

  res.redirect('/admin/guests?success=bulk_deleted&count=' + ids.length);
});

// Manual RSVP Entry / Override POST
router.post('/guests/:id/rsvp', sameOrigin, (req, res) => {
  const guestId = toInt(req.params.id, 0);
  const guest = db.prepare('SELECT id, max_pax FROM guests WHERE id = ?').get(guestId);
  if (!guest) return res.redirect('/admin/guests?error=tamu_tidak_ada');

  const isAttending = req.body.attending === '1' ? 1 : 0;
  const pax = isAttending ? clamp(toInt(req.body.pax, 1), 1, guest.max_pax) : 0;
  const wish = cleanText(req.body.wish, 1000);

  db.prepare(`
    INSERT INTO rsvps (guest_id, attending, pax, wish, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(guest_id) DO UPDATE SET
      attending = excluded.attending,
      pax = excluded.pax,
      wish = excluded.wish,
      created_at = datetime('now')
  `).run(guestId, isAttending, pax, wish);

  const returnTo = req.body.return_to === 'rsvps' ? '/admin/rsvps' : '/admin/guests';
  res.redirect(`${returnTo}?success=rsvp_saved`);
});

// QR Code for guest
router.get('/guests/:slug/qr', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/${req.params.slug}`;
  try {
    const png = await QRCode.toBuffer(url, { width: 300, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).send('Error generating QR');
  }
});

// Template Download (XLSX or CSV)
router.get('/import/template', (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
  const buf = templateWorkbook(format);
  res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="template_tamu.${format}"`);
  res.send(buf);
});

// Import Page GET
router.get('/import', (req, res) => {
  const error = req.query.error || null;
  res.render('admin/import', { preview: null, error });
});

// Temporary in-memory cache for preview rows prior to confirmation
const importPreviews = new Map();

// Import Preview POST
router.post('/import/preview', upload.single('file'), (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.render('admin/import', { preview: null, error: 'Silakan pilih file spreadsheet (.xlsx atau .csv)' });
  }

  try {
    const preview = parseGuestFile(req.file.buffer, content.maxPaxDefault);
    const token = Math.random().toString(36).slice(2);
    importPreviews.set(token, {
      rows: preview.rows.filter((r) => !r.errors.length),
      createdAt: Date.now()
    });

    // Cleanup old preview tokens
    const now = Date.now();
    for (const [k, v] of importPreviews) {
      if (now - v.createdAt > 30 * 60 * 1000) importPreviews.delete(k);
    }

    res.render('admin/import', { preview, token, error: null });
  } catch (err) {
    res.render('admin/import', { preview: null, error: err.message || 'Gagal memproses file' });
  }
});

// Import Confirm POST
router.post('/import/confirm', sameOrigin, (req, res) => {
  const token = req.body.token;
  const includeDuplicates = req.body.include_duplicates === '1';
  const data = importPreviews.get(token);

  if (!data || !data.rows || !data.rows.length) {
    return res.redirect('/admin/import');
  }

  const rowsToInsert = data.rows.filter((r) => includeDuplicates || !r.duplicate);
  if (!rowsToInsert.length) {
    return res.redirect('/admin/import?error=' + encodeURIComponent('Tidak ada data baru yang dapat disimpan (semua data terdeteksi duplikat).'));
  }

  const takenSlugs = new Set();
  tx(() => {
    const stmt = db.prepare(`
      INSERT INTO guests (slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    rowsToInsert.forEach((r) => {
      const slug = uniqueSlug(r.name, takenSlugs);
      stmt.run(slug, r.title, r.name, r.with_partner, r.partner_name, r.max_pax, r.phone, r.grp, r.event_type || 'both', r.show_story !== undefined ? r.show_story : null);
    });
  });

  importPreviews.delete(token);
  res.redirect('/admin/guests?imported=' + rowsToInsert.length);
});

// Export XLSX or CSV of all guests + personalized URLs + WhatsApp text
router.get('/export', (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
  const q = cleanText(req.query.q, 100);
  const grp = cleanText(req.query.grp, 60);

  let query = `
    SELECT g.*, r.attending, r.pax, r.wish, r.created_at AS rsvp_at
    FROM guests g
    LEFT JOIN rsvps r ON g.id = r.guest_id
    WHERE 1=1
  `;
  const params = [];
  if (q) {
    query += ` AND (g.name LIKE ? OR g.slug LIKE ? OR g.phone LIKE ?)`;
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (grp) {
    query += ` AND g.grp = ?`;
    params.push(grp);
  }
  query += ` ORDER BY g.id ASC`;

  const guests = db.prepare(query).all(...params);
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const header = ['ID', 'Gelar', 'Nama Tamu', 'Acara', 'Pasangan?', 'Nama Pasangan', 'Maks Pax', 'No. HP', 'Kategori', 'Tautan Undangan', 'Status RSVP', 'Jumlah Hadir', 'Doa/Ucapan', 'Pesan WhatsApp'];
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

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Set column widths for clean readability in Excel
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

  if (format === 'csv') {
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="daftar_undangan.csv"');
    return res.send(buf);
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="daftar_undangan.xlsx"');
  res.send(buf);
});

// RSVP Dashboard
router.get('/rsvps', (req, res) => {
  const rsvps = db.prepare(`
    SELECT r.*, g.title, g.name, g.phone, g.grp, g.slug
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    ORDER BY r.id DESC
  `).all();

  const summary = db.prepare(`
    SELECT
      COUNT(id) AS total,
      SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END) AS attendingCount,
      SUM(CASE WHEN attending = 0 THEN 1 ELSE 0 END) AS absentCount,
      COALESCE(SUM(pax), 0) AS totalPax
    FROM rsvps
  `).get();

  res.render('admin/rsvps', { rsvps, summary });
});

// Delete / Reset RSVP POST
router.post('/rsvps/:id/delete', sameOrigin, (req, res) => {
  const id = toInt(req.params.id, 0);
  db.prepare('DELETE FROM rsvps WHERE id = ?').run(id);
  res.redirect('/admin/rsvps?success=rsvp_deleted');
});

// Wishes Moderation
router.get('/wishes', (req, res) => {
  const wishes = db.prepare(`
    SELECT r.id, r.wish, r.attending, r.is_hidden, r.created_at, g.name, g.grp
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.wish != ''
    ORDER BY r.id DESC
  `).all();

  res.render('admin/wishes', { wishes });
});

router.post('/wishes/:id/toggle', sameOrigin, (req, res) => {
  const id = toInt(req.params.id, 0);
  db.prepare('UPDATE rsvps SET is_hidden = CASE WHEN is_hidden = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
  res.redirect('/admin/wishes');
});

// Guest Voice Notes / Recordings Dashboard
router.get('/recordings', (req, res) => {
  const rows = db.prepare(`
    SELECT 
      r.id AS rsvp_id,
      r.guest_id,
      r.attending,
      r.pax,
      r.wish,
      r.voice_file,
      r.voice_mime,
      r.voice_duration,
      r.created_at AS recorded_at,
      g.slug,
      g.title,
      g.name,
      g.with_partner,
      g.partner_name,
      g.phone,
      g.grp,
      g.event_type
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.voice_file IS NOT NULL AND r.voice_file != ''
    ORDER BY r.created_at DESC
  `).all();

  let totalDurationSeconds = 0;
  let totalSizeBytes = 0;
  let attendingCount = 0;
  let declinedCount = 0;

  const recordings = rows.map((r) => {
    const filePath = path.join(VOICE_DIR, r.voice_file);
    const fileExists = fs.existsSync(filePath);
    let sizeBytes = 0;
    if (fileExists) {
      try {
        sizeBytes = fs.statSync(filePath).size;
      } catch (e) {
        sizeBytes = 0;
      }
    }

    const durSec = r.voice_duration || 0;
    totalDurationSeconds += durSec;
    totalSizeBytes += sizeBytes;
    if (r.attending === 1) attendingCount++;
    else declinedCount++;

    const mins = Math.floor(durSec / 60);
    const secs = durSec % 60;
    const durationFormatted = durSec > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : '0:00';

    let sizeFormatted = '0 KB';
    if (sizeBytes >= 1024 * 1024) {
      sizeFormatted = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (sizeBytes > 0) {
      sizeFormatted = Math.round(sizeBytes / 1024) + ' KB';
    }

    return {
      ...r,
      fileExists,
      sizeBytes,
      sizeFormatted,
      durationFormatted
    };
  });

  let totalDurationFormatted = '0 detik';
  if (totalDurationSeconds >= 60) {
    const tm = Math.floor(totalDurationSeconds / 60);
    const ts = totalDurationSeconds % 60;
    totalDurationFormatted = `${tm}m ${ts}s`;
  } else if (totalDurationSeconds > 0) {
    totalDurationFormatted = `${totalDurationSeconds} detik`;
  }

  let totalSizeFormatted = '0 KB';
  if (totalSizeBytes >= 1024 * 1024) {
    totalSizeFormatted = (totalSizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else if (totalSizeBytes > 0) {
    totalSizeFormatted = Math.round(totalSizeBytes / 1024) + ' KB';
  }

  const couple = content.couple;

  res.render('admin/recordings', {
    recordings,
    stats: {
      totalCount: recordings.length,
      totalDurationFormatted,
      totalSizeFormatted,
      attendingCount,
      declinedCount
    },
    couple,
    error: req.query.error || null
  });
});

// Stream audio file with Range support for seeking
router.get('/recordings/:id/stream', (req, res) => {
  const rsvpId = toInt(req.params.id, 0);
  const row = db.prepare(`
    SELECT r.voice_file, r.voice_mime
    FROM rsvps r
    WHERE r.id = ? AND r.voice_file IS NOT NULL AND r.voice_file != ''
  `).get(rsvpId);

  if (!row || !row.voice_file) {
    return res.status(404).send('Rekaman suara tidak ditemukan.');
  }

  const filePath = path.join(VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio fisik tidak ditemukan di server.');
  }

  res.setHeader('Content-Type', row.voice_mime || 'audio/webm');
  res.sendFile(path.resolve(filePath));
});

// Single audio file download
router.get('/recordings/:id/download', (req, res) => {
  const rsvpId = toInt(req.params.id, 0);
  const row = db.prepare(`
    SELECT r.voice_file, r.voice_mime, g.name, g.slug
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.id = ? AND r.voice_file IS NOT NULL AND r.voice_file != ''
  `).get(rsvpId);

  if (!row || !row.voice_file) {
    return res.status(404).send('Rekaman suara tidak ditemukan.');
  }

  const filePath = path.join(VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio fisik tidak ditemukan di server.');
  }

  const ext = (row.voice_mime && row.voice_mime.includes('mp4')) ? 'mp4' : 'webm';
  const safeName = (row.name || 'tamu').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `Rekaman_${safeName}.${ext}`;

  res.download(path.resolve(filePath), filename);
});

// Download all recordings in a ZIP
router.get('/recordings/download-all', (req, res) => {
  const rows = db.prepare(`
    SELECT 
      r.id AS rsvp_id,
      r.voice_file,
      r.voice_mime,
      r.voice_duration,
      r.attending,
      r.wish,
      r.created_at,
      g.name,
      g.grp,
      g.slug
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.voice_file IS NOT NULL AND r.voice_file != ''
    ORDER BY r.created_at ASC
  `).all();

  if (rows.length === 0) {
    return res.redirect('/admin/recordings?error=no_recordings');
  }

  serveRecordingsZip(res, rows, 'Semua_Rekaman_Tamu_Farabi_Syifa.zip');
});

// Bulk download selected recordings in a ZIP
router.post('/recordings/bulk-download', (req, res) => {
  let ids = [];
  if (Array.isArray(req.body.ids)) {
    ids = req.body.ids.map(id => toInt(id, 0)).filter(id => id > 0);
  } else if (typeof req.body.ids === 'string') {
    ids = req.body.ids.split(',').map(id => toInt(id.trim(), 0)).filter(id => id > 0);
  }

  if (ids.length === 0) {
    return res.redirect('/admin/recordings?error=no_selection');
  }

  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT 
      r.id AS rsvp_id,
      r.voice_file,
      r.voice_mime,
      r.voice_duration,
      r.attending,
      r.wish,
      r.created_at,
      g.name,
      g.grp,
      g.slug
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.id IN (${placeholders}) AND r.voice_file IS NOT NULL AND r.voice_file != ''
    ORDER BY r.created_at ASC
  `).all(...ids);

  if (rows.length === 0) {
    return res.redirect('/admin/recordings?error=no_recordings');
  }

  serveRecordingsZip(res, rows, `Rekaman_Terpilih_${rows.length}_Tamu.zip`);
});

module.exports = router;
