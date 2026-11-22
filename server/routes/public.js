const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const content = require('../lib/content');
const { toInt } = require('../lib/validate');
const { rateLimit } = require('../lib/security');

// Services
const guestService = require('../services/guestService');
const rsvpService = require('../services/rsvpService');
const settingsService = require('../services/settingsService');

// Multer storage for private audio recordings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, rsvpService.VOICE_DIR);
  },
  filename: function (req, file, cb) {
    const origMime = file.mimetype || '';
    const ext = origMime.includes('mp4') ? 'mp4' : origMime.includes('ogg') ? 'ogg' : 'webm';
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
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype.includes('webm') ||
      file.mimetype.includes('mp4') ||
      file.mimetype === 'application/octet-stream'
    ) {
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

// Helper to determine active language (from query ?lang=en or default 'id')
function getLang(req) {
  const q = req.query.lang;
  if (q === 'en' || q === 'id') return q;
  return 'id';
}

function translator(lang) {
  const d = content.dict[lang] || content.dict.id;
  return function (key) {
    return d[key] != null ? d[key] : key;
  };
}

// Helper to determine whether Kisah Kami / Story section is shown
function getShowStory(req, guest = null, forcedStory = undefined) {
  if (forcedStory !== undefined) {
    return forcedStory;
  }
  const q = req.query.story !== undefined ? req.query.story : req.query.s;
  if (q !== undefined) {
    const s = String(q).trim().toLowerCase();
    if (s === '1' || s === 'true') return true;
    if (s === '0' || s === 'false') return false;
  }
  if (req.query.nostory === '1') return false;

  if (guest) {
    if (guest.show_story === 0 || guest.show_story === '0') return false;
    if (guest.show_story === 1 || guest.show_story === '1') return true;
  }

  return settingsService.getGlobalShowStory();
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
  const result = rsvpService.getWishes({ page, limit: 8 });
  res.json(result);
});

// Public API: Get community poll stats
router.get('/api/poll', (req, res) => {
  const result = rsvpService.getPollStats();
  res.json(result);
});

// Public API: Submit vote
router.post('/api/poll', (req, res) => {
  const { guestSlug, side } = req.body || {};
  try {
    const result = rsvpService.submitPollVote({
      guestSlug,
      side,
      ip: req.ip
    });
    res.json(result);
  } catch (err) {
    const status = err.message.includes('tidak valid') ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message || 'Gagal mencatat pilihan.' });
  }
});

// Public API: Submit RSVP
router.post('/api/rsvp', rsvpLimiter, handleRsvpUpload, async (req, res) => {
  let guestSlug = (req.body && req.body.guestSlug) || req.query.guestSlug || '';
  if (!guestSlug && req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      const parts = refUrl.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (
          lastPart !== 'resepsi' &&
          lastPart !== 'syukuran' &&
          lastPart !== 'admin' &&
          lastPart !== '0' &&
          lastPart !== '1'
        ) {
          guestSlug = lastPart;
        }
      }
      if (!guestSlug) {
        const qTo =
          refUrl.searchParams.get('to') ||
          refUrl.searchParams.get('guest') ||
          refUrl.searchParams.get('slug');
        if (qTo) guestSlug = qTo;
      }
    } catch (_) {}
  }

  const { attending, pax, wish } = req.body || {};
  const voiceDuration = toInt(req.body ? req.body.voiceDuration : 0, 0);

  try {
    const result = await rsvpService.submitRsvp({
      guestSlug,
      attending,
      pax,
      wish,
      file: req.file,
      voiceDuration
    });
    res.json(result);
  } catch (err) {
    const msg = err.message || 'Gagal menyimpan konfirmasi kehadiran.';
    const status = msg.includes('tidak valid') || msg.includes('tidak boleh')
      ? 400
      : msg.includes('tidak ditemukan')
      ? 404
      : 500;
    res.status(status).json({ ok: false, error: msg });
  }
});

// Private Streaming for Voice Notes: accessible by the guest on their slug, or admin
router.get('/api/voice-notes/:guestSlug', (req, res) => {
  const slug = req.params.guestSlug;
  if (!slug) return res.status(400).send('Tautan tidak valid.');

  const row = rsvpService.getVoiceNoteByGuestSlug(slug);
  if (!row || !row.voice_file) {
    return res.status(404).send('Pesan suara tidak ditemukan.');
  }

  const filePath = path.join(rsvpService.VOICE_DIR, row.voice_file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File audio tidak ditemukan di server.');
  }

  if (req.query.download === '1') {
    const ext = row.voice_mime && row.voice_mime.includes('mp4') ? 'mp4' : 'webm';
    const safeName = (row.name || 'Tamu').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Voicenote-${safeName}-${slug}.${ext}"`);
  }

  res.setHeader('Content-Type', row.voice_mime || 'audio/webm');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(path.resolve(filePath));
});

// Helper for generic invitation preview
function renderGenericInvitation(req, res, forcedTheme, forcedStory) {
  const lang = getLang(req);
  const theme = forcedTheme || (req.query.theme === 'reception' ? 'reception' : 'akad');
  const cdTarget = theme === 'reception' ? content.receptionCountdownTarget : content.countdownTarget;
  const showStory = getShowStory(req, null, forcedStory);

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

function renderGuestInvitation(req, res, forcedTheme, forcedStory) {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const lang = getLang(req);
  const t = translator(lang);

  const guest = guestService.getGuestBySlug(slug);

  if (!guest) {
    res.status(404);
    return res.render('404', {
      lang,
      t,
      content
    });
  }

  // Update open metrics asynchronously / safely
  guestService.recordGuestOpen(guest.id);

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
  const existingRsvp = rsvpService.getRsvpByGuestId(guest.id);
  const showStory = getShowStory(req, guest, forcedStory);

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
router.get('/0/:slug', (req, res) => renderGuestInvitation(req, res, null, false));
router.get('/1/:slug', (req, res) => renderGuestInvitation(req, res, null, true));

// 4. Backwards compatibility for legacy /syukuran/ paths:
router.get('/syukuran/0/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', false));
router.get('/syukuran/1/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', true));
router.get('/0/syukuran/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', false));
router.get('/1/syukuran/:slug', (req, res) => renderGuestInvitation(req, res, 'reception', true));

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

module.exports = router;
