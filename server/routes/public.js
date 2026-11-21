const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { db, getSetting } = require('../db');
const content = require('../lib/content');
const { hasLinkOrCode, cleanText, toInt, clamp } = require('../lib/validate');
const { rateLimit } = require('../lib/security');
const { sendVoiceNoteNotification } = require('../lib/mailer');

// Private voice notes directory (inherits DATA_DIR if configured for persistent cloud volumes)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const VOICE_DIR = path.join(DATA_DIR, 'voice-notes');
fs.mkdirSync(VOICE_DIR, { recursive: true });

// Multer storage for private audio recordings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, VOICE_DIR);
  },
  filename: function (req, file, cb) {
    const origMime = file.mimetype || '';
    const ext = origMime.includes('mp4') ? 'mp4' : (origMime.includes('ogg') ? 'ogg' : 'webm');
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `voice-${Date.now()}-${randomSuffix}.${ext}`);
  }
});

const uploadVoice = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype.includes('webm') || file.mimetype.includes('mp4') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Format file harus berupa audio rekaman.'));
    }
  }
});

function handleRsvpUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }
  uploadVoice.single('voiceNote')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ ok: false, error: 'Ukuran rekaman suara maksimal 10 MB.' });
      }
      return res.status(400).json({ ok: false, error: 'Gagal mengunggah rekaman suara: ' + err.message });
    } else if (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }
    next();
  });
}

// Rate limit POST /api/rsvp to prevent spam
const rsvpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Terlalu banyak permintaan. Mohon tunggu sebentar.'
});

// Helper to determine active language (from query ?lang=en or cookie/default 'id')
function getLang(req) {
  const q = req.query.lang;
  if (q === 'en' || q === 'id') return q;
  return 'id';
}

// Helper to check global Kisah Kami setting from SQLite database (with fallback to content.json)
function getGlobalShowStory() {
  const val = getSetting('show_story', null);
  if (val !== null && val !== undefined) {
    return String(val) === '1' || String(val) === 'true';
  }
  return content.showStory !== undefined ? content.showStory : false;
}

// Helper to determine whether Kisah Kami / Story section is shown (supports number codes 0 and 1 via ?story= or ?s=)
function getShowStory(req) {
  const q = req.query.story !== undefined ? req.query.story : req.query.s;
  if (q !== undefined) {
    const s = String(q).trim().toLowerCase();
    if (s === '1' || s === 'true') return true;
    if (s === '0' || s === 'false') return false;
  }
  if (req.query.nostory === '1') return false;
  return getGlobalShowStory();
}

function translator(lang) {
  const d = content.dict[lang] || content.dict.id;
  return function (key) {
    return d[key] != null ? d[key] : key;
  };
}

// Download calendar .ics
router.get('/calendar.ics', (req, res) => {
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="wedding-invitation.ics"');
  if (req.query.theme === 'reception') {
    res.send(content.receptionIcs || content.ics);
  } else if (req.query.theme === 'akad') {
    res.send(content.akadIcs || content.ics);
  } else {
    res.send(content.ics);
  }
});

// Public API: Get paginated wishes
router.get('/api/wishes', (req, res) => {
  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = 8;
  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT r.id, r.wish, r.attending, r.created_at, g.name
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE r.is_hidden = 0 AND r.wish != ''
    ORDER BY r.id DESC
    LIMIT ? OFFSET ?
  `).all(limit + 1, offset);

  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map((r) => ({
    id: r.id,
    name: r.name,
    attending: r.attending === 1,
    wish: r.wish,
    createdAt: r.created_at
  }));

  res.json({ ok: true, items, hasMore });
});

// Public API: Get community poll stats
router.get('/api/poll', (req, res) => {
  const brideCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'bride'").get().count;
  const groomCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'groom'").get().count;
  const total = brideCount + groomCount;
  const bridePct = total > 0 ? Math.round((brideCount / total) * 100) : 50;
  const groomPct = total > 0 ? (100 - bridePct) : 50;
  res.json({
    ok: true,
    total,
    bride: { count: brideCount, percentage: bridePct },
    groom: { count: groomCount, percentage: groomPct }
  });
});

// Public API: Submit vote
router.post('/api/poll', (req, res) => {
  const { guestSlug, side } = req.body || {};
  if (!side || (side !== 'bride' && side !== 'groom')) {
    return res.status(400).json({ ok: false, error: 'Pilihan tidak valid.' });
  }
  const voterKey = guestSlug || ('anon_' + (req.ip || 'ip').replace(/[^a-zA-Z0-9]/g, ''));
  try {
    db.prepare(`
      INSERT INTO votes (guest_slug, side, created_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(guest_slug) DO UPDATE SET
        side = excluded.side,
        created_at = datetime('now')
    `).run(voterKey, side);

    const brideCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'bride'").get().count;
    const groomCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'groom'").get().count;
    const total = brideCount + groomCount;
    const bridePct = total > 0 ? Math.round((brideCount / total) * 100) : 50;
    const groomPct = total > 0 ? (100 - bridePct) : 50;
    res.json({
      ok: true,
      total,
      bride: { count: brideCount, percentage: bridePct },
      groom: { count: groomCount, percentage: groomPct }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Gagal mencatat pilihan.' });
  }
});

// Public API: Submit RSVP (supports JSON and multipart voice note recording)
router.post('/api/rsvp', rsvpLimiter, handleRsvpUpload, (req, res) => {
  let guestSlug = (req.body && req.body.guestSlug) || req.query.guestSlug || '';
  if (!guestSlug && req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      const parts = refUrl.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (lastPart !== 'resepsi' && lastPart !== 'syukuran' && lastPart !== 'admin' && lastPart !== '0' && lastPart !== '1') {
          guestSlug = lastPart;
        }
      }
      if (!guestSlug) {
        const qTo = refUrl.searchParams.get('to') || refUrl.searchParams.get('guest') || refUrl.searchParams.get('slug');
        if (qTo) guestSlug = qTo;
      }
    } catch (_) {}
  }

  guestSlug = String(guestSlug || '').trim().toLowerCase();
  const { attending, pax, wish } = req.body || {};
  const voiceDuration = toInt(req.body ? req.body.voiceDuration : 0, 0);

  if (!guestSlug) {
    return res.status(400).json({ ok: false, error: 'Tautan undangan tidak valid.' });
  }

  const guest = db.prepare('SELECT id, name, slug, max_pax FROM guests WHERE LOWER(slug) = ?').get(guestSlug);
  if (!guest) {
    return res.status(404).json({ ok: false, error: 'Tamu tidak ditemukan.' });
  }

  const isAttending = attending === 1 || attending === '1' ? 1 : 0;
  const safePax = isAttending ? clamp(toInt(pax, 1), 1, guest.max_pax) : 0;
  const cleanWish = cleanText(wish, 1000);

  if (hasLinkOrCode(cleanWish)) {
    return res.status(400).json({
      ok: false,
      error: 'Doa & ucapan tidak boleh mengandung tautan atau kode.'
    });
  }

  let voiceFile = req.file ? req.file.filename : null;
  const voiceMime = req.file ? req.file.mimetype : null;

  // Give the recording a clean, human-readable filename on disk
  if (req.file) {
    const origExt = req.file.filename.split('.').pop() || 'webm';
    const safeSlug = (guest.slug || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = (guest.name || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
    const properFilename = `voicenote_${safeSlug}_${safeName}_${Date.now()}.${origExt}`;
    const oldPath = path.join(VOICE_DIR, req.file.filename);
    const newPath = path.join(VOICE_DIR, properFilename);
    try {
      fs.renameSync(oldPath, newPath);
      voiceFile = properFilename;
    } catch (renameErr) {
      console.warn('[RSVP] Failed to rename audio file:', renameErr.message);
    }
  }

  try {
    // Insert or update existing RSVP for this guest
    db.prepare(`
      INSERT INTO rsvps (guest_id, attending, pax, wish, voice_file, voice_mime, voice_duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guest_id) DO UPDATE SET
        attending = excluded.attending,
        pax = excluded.pax,
        wish = excluded.wish,
        voice_file = COALESCE(excluded.voice_file, rsvps.voice_file),
        voice_mime = COALESCE(excluded.voice_mime, rsvps.voice_mime),
        voice_duration = CASE WHEN excluded.voice_file IS NOT NULL THEN excluded.voice_duration ELSE rsvps.voice_duration END,
        created_at = datetime('now')
    `).run(guest.id, isAttending, safePax, cleanWish, voiceFile, voiceMime, voiceDuration);

    // Asynchronously dispatch email notification if voice note was included
    if (voiceFile) {
      const fullPath = path.join(VOICE_DIR, voiceFile);
      sendVoiceNoteNotification({
        guestName: guest.name,
        guestSlug: guest.slug,
        attending: isAttending,
        pax: safePax,
        wish: cleanWish,
        voiceFilePath: fullPath,
        voiceMime: voiceMime,
        voiceDuration: voiceDuration
      }).catch((mailErr) => {
        console.error('[RSVP] Async mail error:', mailErr);
      });
    }

    res.json({ ok: true, hasVoice: !!voiceFile });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ ok: false, error: 'Gagal menyimpan konfirmasi kehadiran.' });
  }
});

// Private Streaming for Voice Notes: accessible by the guest on their slug, or admin
router.get('/api/voice-notes/:guestSlug', (req, res) => {
  const slug = req.params.guestSlug;
  if (!slug) return res.status(400).send('Tautan tidak valid.');

  const row = db.prepare(`
    SELECT r.voice_file, r.voice_mime, g.name
    FROM rsvps r
    JOIN guests g ON r.guest_id = g.id
    WHERE g.slug = ?
  `).get(slug);

  if (!row || !row.voice_file) {
    return res.status(404).send('Pesan suara tidak ditemukan.');
  }

  const filePath = path.join(VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio tidak ditemukan di server.');
  }

  if (req.query.download === '1') {
    const ext = (row.voice_mime && row.voice_mime.includes('mp4')) ? 'mp4' : 'webm';
    const safeName = (row.name || 'Tamu').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Voicenote-${safeName}-${slug}.${ext}"`);
  }

  res.setHeader('Content-Type', row.voice_mime || 'audio/webm');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(filePath);
});

// Helper for generic invitation preview
function renderGenericInvitation(req, res, forcedTheme, forcedStory) {
  const lang = getLang(req);
  const theme = forcedTheme || (req.query.theme === 'reception' ? 'reception' : 'akad');
  const cdTarget = theme === 'reception' ? content.receptionCountdownTarget : content.countdownTarget;
  const showStory = forcedStory !== undefined ? forcedStory : getShowStory(req);

  res.render('invitation', {
    lang,
    theme,
    t: translator(lang),
    content,
    dict: content.dict,
    countdownTarget: cdTarget,
    guest: null,
    existingRsvp: null,
    showStory
  });
}

// Explicit path routes for Kisah Kami toggle:
// 1. Generic Akad: /0 (no story) and /1 (with story)
router.get('/0', (req, res) => renderGenericInvitation(req, res, null, false));
router.get('/1', (req, res) => renderGenericInvitation(req, res, null, true));

// 2. Generic Syukuran: /0/syukuran, /1/syukuran, /syukuran/0, /syukuran/1
router.get('/0/syukuran', (req, res) => renderGenericInvitation(req, res, 'reception', false));
router.get('/1/syukuran', (req, res) => renderGenericInvitation(req, res, 'reception', true));
router.get('/syukuran/0', (req, res) => renderGenericInvitation(req, res, 'reception', false));
router.get('/syukuran/1', (req, res) => renderGenericInvitation(req, res, 'reception', true));

// 3. Guest routes with Kisah Kami toggle: /0/:slug (no story) and /1/:slug (with story)
// (Works uniformly for Akad, Syukuran, or both based on guest's event_type)
router.get('/0/:slug', (req, res) => renderGuestInvitation(req, res, null, false));
router.get('/1/:slug', (req, res) => renderGuestInvitation(req, res, null, true));

// 4. Backwards compatibility for legacy /syukuran/ paths:
router.get('/syukuran/0/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', false));
router.get('/syukuran/1/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', true));

// 5. Root: Standard generic preview or query-based guest link
router.get('/', (req, res) => {
  const querySlug = req.query.to || req.query.guest || req.query.slug;
  if (querySlug) {
    req.params.slug = querySlug;
    return renderGuestInvitation(req, res, null);
  }
  return renderGenericInvitation(req, res, null);
});

// 6. Dedicated Syukuran Generic Preview: /syukuran
router.get('/syukuran', (req, res) => {
  const querySlug = req.query.to || req.query.guest || req.query.slug;
  if (querySlug) {
    req.params.slug = querySlug;
    return renderGuestInvitation(req, res, 'reception');
  }
  return renderGenericInvitation(req, res, 'reception');
});

// 7. Dedicated Syukuran Guest URL: /syukuran/:slug
router.get('/syukuran/:slug', (req, res) => {
  renderGuestInvitation(req, res, 'reception');
});

// 8. Legacy /resepsi backwards compatibility redirects: /resepsi -> /syukuran
router.get('/resepsi', (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, '/syukuran' + query);
});

router.get('/resepsi/:slug', (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, '/syukuran/' + encodeURIComponent(req.params.slug) + query);
});

// 9. Standard Guest specific link: /:slug
router.get('/:slug', (req, res) => {
  renderGuestInvitation(req, res, null);
});

function renderGuestInvitation(req, res, forcedTheme, forcedStory) {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const lang = getLang(req);
  const t = translator(lang);

  const guest = db.prepare('SELECT * FROM guests WHERE LOWER(slug) = ?').get(slug);

  if (!guest) {
    res.status(404);
    return res.render('404', {
      lang,
      t,
      content
    });
  }

  // Update open metrics
  try {
    db.prepare(`
      UPDATE guests
      SET open_count = open_count + 1,
          first_opened_at = COALESCE(first_opened_at, datetime('now'))
      WHERE id = ?
    `).run(guest.id);
  } catch (e) {
    // Non-fatal metric update
  }

  // Determine theme
  let theme = forcedTheme;
  if (!theme) {
    if (req.query.theme === 'reception' || req.query.theme === 'akad') {
      theme = req.query.theme;
    } else if (guest.event_type === 'reception') {
      theme = 'reception';
    } else {
      theme = 'akad';
    }
  }

  const cdTarget = theme === 'reception' ? content.receptionCountdownTarget : content.countdownTarget;
  const existingRsvp = db.prepare('SELECT * FROM rsvps WHERE guest_id = ?').get(guest.id);

  // Determine whether Kisah Kami (story timeline) is shown for this guest:
  // 1. Explicit forced route (/0/:slug or /1/:slug) takes priority
  // 2. Explicit query parameter (?story=0 or ?story=1) for debugging/override
  // 3. Per-guest setting: 0 = always hide (even on standard/correct URL), 1 = always show
  // 4. Default: fallback to global admin setting (show_story)
  let showStory;
  if (forcedStory !== undefined) {
    showStory = forcedStory;
  } else if (req.query.story !== undefined || req.query.s !== undefined) {
    showStory = getShowStory(req);
  } else if (guest.show_story === 0 || guest.show_story === '0') {
    showStory = false;
  } else if (guest.show_story === 1 || guest.show_story === '1') {
    showStory = true;
  } else {
    showStory = getShowStory(req);
  }

  res.render('invitation', {
    lang,
    theme,
    t,
    content,
    dict: content.dict,
    countdownTarget: cdTarget,
    guest,
    existingRsvp,
    showStory
  });
}

module.exports = router;
