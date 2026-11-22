const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');

const content = require('../lib/content');
const { cleanText, toInt } = require('../lib/validate');
const { parseGuestFile } = require('../lib/importer');
const { uniqueSlug } = require('../lib/slug');
const { tx, db } = require('../db');
const {
  checkPassword,
  setSession,
  clearSession,
  isLoggedIn,
  sameOrigin,
  hasAdminPassword
} = require('../lib/security');

// Services
const guestService = require('../services/guestService');
const rsvpService = require('../services/rsvpService');
const exportService = require('../services/exportService');
const settingsService = require('../services/settingsService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB max
});

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (!hasAdminPassword()) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).send('Admin panel is disabled because ADMIN_PASSWORD is not configured in environment variables.');
    }
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

  const guests = guestService.getGuests({ q, grp, status, event_type });
  const groups = guestService.getDistinctGroups();
  const stats = guestService.getStats();
  const showStory = settingsService.getGlobalShowStory();

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
    storySettingValue: showStory ? '1' : '0'
  });
});

// Toggle Global Kisah Kami Setting (Code 0 or 1)
router.post('/settings/story', sameOrigin, (req, res) => {
  const isShow = settingsService.setGlobalShowStory(req.body ? req.body.value : undefined);
  res.json({ ok: true, showStory: isShow, value: isShow ? '1' : '0' });
});

// Add Single Guest POST
router.post('/guests/add', sameOrigin, (req, res) => {
  try {
    guestService.createGuest(req.body);
    res.redirect('/admin/guests?success=added');
  } catch (err) {
    res.redirect('/admin/guests?error=' + (err.message || 'unknown'));
  }
});

// Edit Guest POST
router.post('/guests/:id/edit', sameOrigin, (req, res) => {
  try {
    guestService.updateGuest(req.params.id, req.body);
    res.redirect('/admin/guests?success=updated');
  } catch (err) {
    res.redirect('/admin/guests?error=' + (err.message || 'unknown'));
  }
});

// Delete Single Guest POST
router.post('/guests/:id/delete', sameOrigin, (req, res) => {
  guestService.deleteGuest(req.params.id);
  res.redirect('/admin/guests?success=deleted');
});

// Bulk Delete Guests POST
router.post('/guests/bulk-delete', sameOrigin, (req, res) => {
  const count = guestService.bulkDeleteGuests(req.body.ids);
  res.redirect('/admin/guests?success=bulk_deleted&count=' + count);
});

// Manual RSVP Entry / Override POST
router.post('/guests/:id/rsvp', sameOrigin, (req, res) => {
  try {
    rsvpService.manualRsvp({
      guestId: req.params.id,
      attending: req.body.attending,
      pax: req.body.pax,
      wish: req.body.wish
    });
    const returnTo = req.body.return_to === 'rsvps' ? '/admin/rsvps' : '/admin/guests';
    res.redirect(`${returnTo}?success=rsvp_saved`);
  } catch (err) {
    res.redirect('/admin/guests?error=' + (err.message || 'unknown'));
  }
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
  const buf = exportService.generateTemplate(format);
  res.setHeader(
    'Content-Type',
    format === 'csv'
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
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
    return res.render('admin/import', {
      preview: null,
      error: 'Silakan pilih file spreadsheet (.xlsx atau .csv)'
    });
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
    return res.redirect(
      '/admin/import?error=' +
        encodeURIComponent('Tidak ada data baru yang dapat disimpan (semua data terdeteksi duplikat).')
    );
  }

  const takenSlugs = new Set();
  tx(() => {
    const stmt = db.prepare(`
      INSERT INTO guests (slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    rowsToInsert.forEach((r) => {
      const slug = uniqueSlug(r.name, takenSlugs);
      stmt.run(
        slug,
        r.title,
        r.name,
        r.with_partner,
        r.partner_name,
        r.max_pax,
        r.phone,
        r.grp,
        r.event_type || 'both',
        r.show_story !== undefined ? r.show_story : null
      );
    });
  });

  importPreviews.delete(token);
  res.redirect('/admin/guests?imported=' + rowsToInsert.length);
});

// Export XLSX or CSV of guests + personalized URLs + WhatsApp text
router.get('/export', (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
  const q = cleanText(req.query.q, 100);
  const grp = cleanText(req.query.grp, 60);

  const guests = guestService.getGuests({ q, grp, sort: 'id_asc' });
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  if (format === 'csv') {
    const buf = exportService.exportGuestsToCsv(guests, baseUrl);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="daftar_undangan.csv"');
    return res.send(buf);
  }

  const buf = exportService.exportGuestsToExcel(guests, baseUrl);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="daftar_undangan.xlsx"');
  res.send(buf);
});

// RSVP Dashboard
router.get('/rsvps', (req, res) => {
  const rsvps = rsvpService.getRsvps();
  const summary = rsvpService.getRsvpSummary();
  res.render('admin/rsvps', { rsvps, summary });
});

// Delete / Reset RSVP POST
router.post('/rsvps/:id/delete', sameOrigin, (req, res) => {
  rsvpService.deleteRsvp(req.params.id);
  res.redirect('/admin/rsvps?success=rsvp_deleted');
});

// Wishes Moderation
router.get('/wishes', (req, res) => {
  const wishes = rsvpService.getAllWishesForModeration();
  res.render('admin/wishes', { wishes });
});

router.post('/wishes/:id/toggle', sameOrigin, (req, res) => {
  rsvpService.toggleWishVisibility(req.params.id);
  res.redirect('/admin/wishes');
});

// Guest Voice Notes / Recordings Dashboard
router.get('/recordings', (req, res) => {
  const { recordings, stats } = rsvpService.getRecordings();
  res.render('admin/recordings', {
    recordings,
    stats,
    couple: content.couple,
    error: req.query.error || null
  });
});

// Stream audio file
router.get('/recordings/:id/stream', (req, res) => {
  const row = rsvpService.getRecordingById(req.params.id);
  if (!row || !row.voice_file) {
    return res.status(404).send('Rekaman suara tidak ditemukan.');
  }

  const filePath = path.join(rsvpService.VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio fisik tidak ditemukan di server.');
  }

  res.setHeader('Content-Type', row.voice_mime || 'audio/webm');
  res.sendFile(path.resolve(filePath));
});

// Single audio file download
router.get('/recordings/:id/download', (req, res) => {
  const row = rsvpService.getRecordingById(req.params.id);
  if (!row || !row.voice_file) {
    return res.status(404).send('Rekaman suara tidak ditemukan.');
  }

  const filePath = path.join(rsvpService.VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio fisik tidak ditemukan di server.');
  }

  const ext = row.voice_mime && row.voice_mime.includes('mp4') ? 'mp4' : 'webm';
  const safeName = (row.name || 'tamu').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `Rekaman_${safeName}.${ext}`;

  res.download(path.resolve(filePath), filename);
});

// Download all recordings in a ZIP
router.get('/recordings/download-all', (req, res) => {
  const rows = rsvpService.getAllRecordings();
  if (rows.length === 0) {
    return res.redirect('/admin/recordings?error=no_recordings');
  }
  exportService.serveRecordingsZip(
    res,
    rows,
    'Semua_Rekaman_Tamu_Farabi_Syifa.zip',
    rsvpService.VOICE_DIR
  );
});

// Bulk download selected recordings in a ZIP
router.post('/recordings/bulk-download', (req, res) => {
  let ids = [];
  if (Array.isArray(req.body.ids)) {
    ids = req.body.ids.map((id) => toInt(id, 0)).filter((id) => id > 0);
  } else if (typeof req.body.ids === 'string') {
    ids = req.body.ids
      .split(',')
      .map((id) => toInt(id.trim(), 0))
      .filter((id) => id > 0);
  }

  if (ids.length === 0) {
    return res.redirect('/admin/recordings?error=no_selection');
  }

  const rows = rsvpService.getRecordingsByIds(ids);
  if (rows.length === 0) {
    return res.redirect('/admin/recordings?error=no_recordings');
  }

  exportService.serveRecordingsZip(
    res,
    rows,
    `Rekaman_Terpilih_${rows.length}_Tamu.zip`,
    rsvpService.VOICE_DIR
  );
});

module.exports = router;
