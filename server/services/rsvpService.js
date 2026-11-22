const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { cleanText, toInt, clamp, hasLinkOrCode } = require('../lib/validate');
const { sendVoiceNoteNotification } = require('../lib/mailer');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const VOICE_DIR = path.join(DATA_DIR, 'voice-notes');
fs.mkdirSync(VOICE_DIR, { recursive: true });

// High-concurrency in-memory burst cache (5s TTL)
const cache = {
  poll: { data: null, expiresAt: 0 },
  wishesPage1: { data: null, expiresAt: 0 }
};

function invalidatePollCache() {
  cache.poll.data = null;
  cache.poll.expiresAt = 0;
}

function invalidateWishesCache() {
  cache.wishesPage1.data = null;
  cache.wishesPage1.expiresAt = 0;
}

/**
 * Service managing RSVP entries, wishes, community polls, and guest voice notes.
 */
const rsvpService = {
  VOICE_DIR,

  /**
   * List all RSVPs joined with guest details for admin dashboard.
   */
  getRsvps() {
    return db
      .prepare(`
        SELECT r.*, g.title, g.name, g.phone, g.grp, g.slug
        FROM rsvps r
        JOIN guests g ON r.guest_id = g.id
        ORDER BY r.id DESC
      `)
      .all();
  },

  /**
   * Aggregate RSVP response summary (total submitted, attending, absent, totalPax).
   */
  getRsvpSummary() {
    return db
      .prepare(`
        SELECT
          COUNT(id) AS total,
          SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END) AS attendingCount,
          SUM(CASE WHEN attending = 0 THEN 1 ELSE 0 END) AS absentCount,
          COALESCE(SUM(pax), 0) AS totalPax
        FROM rsvps
      `)
      .get();
  },

  /**
   * Retrieve RSVP record for a specific guest ID.
   */
  getRsvpByGuestId(guestId) {
    const numId = toInt(guestId, 0);
    if (!numId) return null;
    return db.prepare('SELECT * FROM rsvps WHERE guest_id = ?').get(numId) || null;
  },

  /**
   * Admin manual RSVP entry / override.
   */
  manualRsvp({ guestId, attending, pax, wish }) {
    const numGuestId = toInt(guestId, 0);
    const guest = db.prepare('SELECT id, max_pax FROM guests WHERE id = ?').get(numGuestId);
    if (!guest) {
      throw new Error('tamu_tidak_ada');
    }

    const isAttending = attending === '1' || attending === 1 ? 1 : 0;
    const safePax = isAttending ? clamp(toInt(pax, 1), 1, guest.max_pax) : 0;
    const cleanWish = cleanText(wish, 1000);

    db.prepare(`
      INSERT INTO rsvps (guest_id, attending, pax, wish, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guest_id) DO UPDATE SET
        attending = excluded.attending,
        pax = excluded.pax,
        wish = excluded.wish,
        created_at = datetime('now')
    `).run(numGuestId, isAttending, safePax, cleanWish);

    invalidateWishesCache();
    return { ok: true };
  },

  /**
   * Delete an RSVP record by ID.
   */
  deleteRsvp(id) {
    const numId = toInt(id, 0);
    if (!numId) return false;
    db.prepare('DELETE FROM rsvps WHERE id = ?').run(numId);
    invalidateWishesCache();
    return true;
  },

  /**
   * Public API: Paginated public wishes with in-memory burst caching on page 1.
   */
  getWishes({ page = 1, limit = 8 } = {}) {
    const safePage = Math.max(1, toInt(page, 1));
    const now = Date.now();

    if (safePage === 1 && cache.wishesPage1.data && cache.wishesPage1.expiresAt > now) {
      return cache.wishesPage1.data;
    }

    const offset = (safePage - 1) * limit;
    const rows = db
      .prepare(`
        SELECT r.id, r.wish, r.attending, r.created_at, g.name
        FROM rsvps r
        JOIN guests g ON r.guest_id = g.id
        WHERE r.is_hidden = 0 AND r.wish != ''
        ORDER BY r.id DESC
        LIMIT ? OFFSET ?
      `)
      .all(limit + 1, offset);

    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).map((r) => ({
      id: r.id,
      name: r.name,
      attending: r.attending === 1,
      wish: r.wish,
      createdAt: r.created_at
    }));

    const result = { ok: true, items, hasMore };
    if (safePage === 1) {
      cache.wishesPage1.data = result;
      cache.wishesPage1.expiresAt = now + 5000;
    }

    return result;
  },

  /**
   * Admin: List all wishes including hidden ones for moderation.
   */
  getAllWishesForModeration() {
    return db
      .prepare(`
        SELECT r.id, r.wish, r.attending, r.is_hidden, r.created_at, g.name, g.grp
        FROM rsvps r
        JOIN guests g ON r.guest_id = g.id
        WHERE r.wish != ''
        ORDER BY r.id DESC
      `)
      .all();
  },

  /**
   * Admin: Toggle public visibility of a wish.
   */
  toggleWishVisibility(id) {
    const numId = toInt(id, 0);
    if (!numId) return false;
    db.prepare('UPDATE rsvps SET is_hidden = CASE WHEN is_hidden = 1 THEN 0 ELSE 1 END WHERE id = ?').run(numId);
    invalidateWishesCache();
    return true;
  },

  /**
   * Public API: Community poll statistics with burst caching.
   */
  getPollStats() {
    const now = Date.now();
    if (cache.poll.data && cache.poll.expiresAt > now) {
      return cache.poll.data;
    }

    const brideCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'bride'").get().count;
    const groomCount = db.prepare("SELECT COUNT(*) AS count FROM votes WHERE side = 'groom'").get().count;
    const total = brideCount + groomCount;
    const bridePct = total > 0 ? Math.round((brideCount / total) * 100) : 50;
    const groomPct = total > 0 ? 100 - bridePct : 50;

    const result = {
      ok: true,
      total,
      bride: { count: brideCount, percentage: bridePct },
      groom: { count: groomCount, percentage: groomPct }
    };

    cache.poll.data = result;
    cache.poll.expiresAt = now + 5000;
    return result;
  },

  /**
   * Public API: Submit vote for community poll.
   */
  submitPollVote({ guestSlug, side, ip }) {
    if (!side || (side !== 'bride' && side !== 'groom')) {
      throw new Error('Pilihan tidak valid.');
    }

    const voterKey = guestSlug || 'anon_' + (ip || 'ip').replace(/[^a-zA-Z0-9]/g, '');

    db.prepare(`
      INSERT INTO votes (guest_slug, side, created_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(guest_slug) DO UPDATE SET
        side = excluded.side,
        created_at = datetime('now')
    `).run(voterKey, side);

    invalidatePollCache();
    return this.getPollStats();
  },

  /**
   * Public API: Submit guest RSVP with optional voice note file.
   */
  async submitRsvp({ guestSlug, attending, pax, wish, file, voiceDuration = 0 }) {
    const cleanSlug = String(guestSlug || '').trim().toLowerCase();
    if (!cleanSlug) {
      throw new Error('Tautan undangan tidak valid.');
    }

    const guest = db.prepare('SELECT id, name, slug, max_pax FROM guests WHERE LOWER(slug) = ?').get(cleanSlug);
    if (!guest) {
      throw new Error('Tamu tidak ditemukan.');
    }

    const isAttending = attending === 1 || attending === '1' ? 1 : 0;
    const safePax = isAttending ? clamp(toInt(pax, 1), 1, guest.max_pax) : 0;
    const cleanWish = cleanText(wish, 1000);

    if (hasLinkOrCode(cleanWish)) {
      throw new Error('Doa & ucapan tidak boleh mengandung tautan atau kode.');
    }

    let voiceFile = file ? file.filename : null;
    const voiceMime = file ? file.mimetype : null;
    const durSec = toInt(voiceDuration, 0);

    // Give recording a clean filename on disk
    if (file) {
      const origExt = file.filename.split('.').pop() || 'webm';
      const safeSlug = (guest.slug || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = (guest.name || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
      const properFilename = `voicenote_${safeSlug}_${safeName}_${Date.now()}.${origExt}`;
      const oldPath = path.join(VOICE_DIR, file.filename);
      const newPath = path.join(VOICE_DIR, properFilename);
      try {
        fs.renameSync(oldPath, newPath);
        voiceFile = properFilename;
      } catch (renameErr) {
        console.warn('[RSVP] Failed to rename audio file:', renameErr.message);
      }
    }

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
    `).run(guest.id, isAttending, safePax, cleanWish, voiceFile, voiceMime, durSec);

    invalidateWishesCache();

    // Async email notification if voice note was provided
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
        voiceDuration: durSec
      }).catch((mailErr) => {
        console.error('[RSVP] Async mail error:', mailErr);
      });
    }

    return { ok: true, hasVoice: !!voiceFile };
  },

  /**
   * Retrieve and format all guest voice notes for admin recordings dashboard.
   */
  getRecordings() {
    const rows = db
      .prepare(`
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
      `)
      .all();

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
        } catch (_) {
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

    return {
      recordings,
      stats: {
        totalCount: recordings.length,
        totalDurationFormatted,
        totalSizeFormatted,
        attendingCount,
        declinedCount
      }
    };
  },

  /**
   * Retrieve single recording row by rsvpId.
   */
  getRecordingById(rsvpId) {
    const numId = toInt(rsvpId, 0);
    if (!numId) return null;
    return (
      db
        .prepare(`
          SELECT r.id AS rsvp_id, r.voice_file, r.voice_mime, g.name, g.slug
          FROM rsvps r
          JOIN guests g ON r.guest_id = g.id
          WHERE r.id = ? AND r.voice_file IS NOT NULL AND r.voice_file != ''
        `)
        .get(numId) || null
    );
  },

  /**
   * Retrieve all recordings for ZIP download.
   */
  getAllRecordings() {
    return db
      .prepare(`
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
      `)
      .all();
  },

  /**
   * Retrieve specific recordings by RSVP IDs for bulk ZIP download.
   */
  getRecordingsByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db
      .prepare(`
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
      `)
      .all(...ids);
  },

  /**
   * Retrieve voice note by guest slug (for guest-facing audio player).
   */
  getVoiceNoteByGuestSlug(slug) {
    const cleanSlug = String(slug || '').trim().toLowerCase();
    if (!cleanSlug) return null;
    return (
      db
        .prepare(`
          SELECT r.voice_file, r.voice_mime, g.name
          FROM rsvps r
          JOIN guests g ON r.guest_id = g.id
          WHERE LOWER(g.slug) = ?
        `)
        .get(cleanSlug) || null
    );
  }
};

module.exports = rsvpService;
