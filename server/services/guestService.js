const { db, tx } = require('../db');
const { uniqueSlug, slugify, isValidSlug, RESERVED } = require('../lib/slug');
const { cleanText, toInt, normalizePhone, yes, clamp } = require('../lib/validate');
const content = require('../lib/content');

/**
 * Service managing guest database records, queries, metrics, and operations.
 */
const guestService = {
  /**
   * Query guests with optional filtering by search query (name/slug/phone), group, RSVP status, and event type.
   */
  getGuests({ q = '', grp = '', status = '', event_type = '', sort = 'id_desc' } = {}) {
    let query = `
      SELECT g.*, r.attending, r.pax, r.wish, r.created_at AS rsvp_at
      FROM guests g
      LEFT JOIN rsvps r ON g.id = r.guest_id
      WHERE 1=1
    `;
    const params = [];

    const cleanQ = cleanText(q, 100);
    if (cleanQ) {
      query += ` AND (g.name LIKE ? OR g.slug LIKE ? OR g.phone LIKE ?)`;
      const term = `%${cleanQ}%`;
      params.push(term, term, term);
    }

    const cleanGrp = cleanText(grp, 60);
    if (cleanGrp) {
      query += ` AND g.grp = ?`;
      params.push(cleanGrp);
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
    } else if (status === 'shared') {
      query += ` AND g.is_shared = 1`;
    } else if (status === 'unshared') {
      query += ` AND g.is_shared = 0`;
    }

    if (event_type === 'both' || event_type === 'reception' || event_type === 'akad') {
      query += ` AND g.event_type = ?`;
      params.push(event_type);
    }

    if (sort === 'id_asc') {
      query += ` ORDER BY g.id ASC`;
    } else if (sort === 'name_asc') {
      query += ` ORDER BY g.name ASC`;
    } else {
      query += ` ORDER BY g.id DESC`;
    }

    return db.prepare(query).all(...params);
  },

  /**
   * Retrieve distinct group tags for filter dropdowns.
   */
  getDistinctGroups() {
    return db
      .prepare("SELECT DISTINCT grp FROM guests WHERE grp != '' ORDER BY grp ASC")
      .all()
      .map((r) => r.grp);
  },

  /**
   * Aggregate invitation and attendance statistics across all guests.
   */
  getStats() {
    return db
      .prepare(`
        SELECT
          COUNT(g.id) AS totalGuests,
          SUM(CASE WHEN g.is_shared = 1 THEN 1 ELSE 0 END) AS totalShared,
          SUM(CASE WHEN g.is_shared = 0 THEN 1 ELSE 0 END) AS totalUnshared,
          SUM(CASE WHEN g.open_count > 0 THEN 1 ELSE 0 END) AS totalOpened,
          SUM(CASE WHEN r.attending = 1 THEN 1 ELSE 0 END) AS totalAttending,
          SUM(CASE WHEN r.attending = 0 THEN 1 ELSE 0 END) AS totalAbsent,
          COALESCE(SUM(r.pax), 0) AS totalPax
        FROM guests g
        LEFT JOIN rsvps r ON g.id = r.guest_id
      `)
      .get();
  },

  /**
   * Retrieve a single guest record by its numeric ID.
   */
  getGuestById(id) {
    const numId = toInt(id, 0);
    if (!numId) return null;
    return db.prepare('SELECT * FROM guests WHERE id = ?').get(numId) || null;
  },

  /**
   * Retrieve a single guest record by URL slug (case-insensitive).
   */
  getGuestBySlug(slug) {
    const s = String(slug || '').trim().toLowerCase();
    if (!s) return null;
    return db.prepare('SELECT * FROM guests WHERE LOWER(slug) = ?').get(s) || null;
  },

  /**
   * Validate and create a new guest.
   */
  createGuest(rawData) {
    const name = cleanText(rawData.name, 120);
    if (!name) {
      throw new Error('nama_wajib');
    }

    const title = cleanText(rawData.title, 30);
    const partner_name = cleanText(rawData.partner_name, 120);
    const with_partner = partner_name || yes(rawData.with_partner) ? 1 : 0;
    const max_pax = clamp(toInt(rawData.max_pax, content.maxPaxDefault), 1, 10);
    const phone = normalizePhone(rawData.phone);
    const grp = cleanText(rawData.grp, 60);
    const event_type = rawData.event_type === 'reception' ? 'reception' : rawData.event_type === 'akad' ? 'akad' : 'both';

    let show_story = null;
    if (rawData.show_story === '0' || rawData.show_story === 0) {
      show_story = 0;
    } else if (rawData.show_story === '1' || rawData.show_story === 1) {
      show_story = 1;
    }

    let slug = '';
    const customSlugInput = cleanText(rawData.slug, 70);
    if (customSlugInput) {
      slug = slugify(customSlugInput);
      if (RESERVED.has(slug)) {
        throw new Error('slug_reserved');
      }
      const conflict = db.prepare('SELECT id FROM guests WHERE slug = ?').get(slug);
      if (conflict) {
        throw new Error('slug_terpakai');
      }
    } else {
      slug = uniqueSlug(name);
    }

    const result = db.prepare(`
      INSERT INTO guests (slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story);

    return { id: result.lastInsertRowid, slug };
  },

  /**
   * Validate and update an existing guest record.
   */
  updateGuest(id, rawData) {
    const numId = toInt(id, 0);
    if (!numId) throw new Error('tamu_tidak_ada');

    const currentGuest = db.prepare('SELECT id, slug FROM guests WHERE id = ?').get(numId);
    if (!currentGuest) {
      throw new Error('tamu_tidak_ada');
    }

    const name = cleanText(rawData.name, 120);
    if (!name) {
      throw new Error('nama_wajib');
    }

    const title = cleanText(rawData.title, 30);
    const partner_name = cleanText(rawData.partner_name, 120);
    const with_partner = partner_name || yes(rawData.with_partner) ? 1 : 0;
    const max_pax = clamp(toInt(rawData.max_pax, content.maxPaxDefault), 1, 10);
    const phone = normalizePhone(rawData.phone);
    const grp = cleanText(rawData.grp, 60);
    const event_type = rawData.event_type === 'reception' ? 'reception' : rawData.event_type === 'akad' ? 'akad' : 'both';

    let show_story = null;
    if (rawData.show_story === '0' || rawData.show_story === 0) {
      show_story = 0;
    } else if (rawData.show_story === '1' || rawData.show_story === 1) {
      show_story = 1;
    }

    const customSlugInput = cleanText(rawData.slug, 70);
    let targetSlug = customSlugInput ? slugify(customSlugInput) : currentGuest.slug;
    if (!targetSlug) {
      targetSlug = slugify(name);
    }

    if (RESERVED.has(targetSlug)) {
      throw new Error('slug_reserved');
    }

    const conflict = db.prepare('SELECT id FROM guests WHERE slug = ? AND id != ?').get(targetSlug, numId);
    if (conflict) {
      throw new Error('slug_terpakai');
    }

    db.prepare(`
      UPDATE guests
      SET slug = ?, title = ?, name = ?, with_partner = ?, partner_name = ?, max_pax = ?, phone = ?, grp = ?, event_type = ?, show_story = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(targetSlug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type, show_story, numId);

    return { id: numId, slug: targetSlug };
  },

  /**
   * Delete a single guest record and cascade delete associated RSVP.
   */
  deleteGuest(id) {
    const numId = toInt(id, 0);
    if (!numId) return false;
    db.prepare('DELETE FROM guests WHERE id = ?').run(numId);
    return true;
  },

  /**
   * Bulk delete multiple guests within a transaction.
   */
  bulkDeleteGuests(ids) {
    let cleanIds = [];
    if (typeof ids === 'string') {
      cleanIds = ids.split(',').map((s) => toInt(s.trim(), 0)).filter((n) => n > 0);
    } else if (Array.isArray(ids)) {
      cleanIds = ids.map((s) => toInt(s, 0)).filter((n) => n > 0);
    }

    if (cleanIds.length === 0) return 0;

    tx(() => {
      const stmt = db.prepare('DELETE FROM guests WHERE id = ?');
      for (const id of cleanIds) {
        stmt.run(id);
      }
    });

    return cleanIds.length;
  },

  /**
   * Toggle or set the invitation sharing status for a guest.
   */
  toggleShared(id, forceValue = null) {
    const numId = toInt(id, 0);
    if (!numId) return null;
    const guest = this.getGuestById(numId);
    if (!guest) return null;

    let nextShared;
    if (forceValue !== null && forceValue !== undefined) {
      nextShared = forceValue === 1 || forceValue === '1' || forceValue === true || forceValue === 'true' ? 1 : 0;
    } else {
      nextShared = guest.is_shared === 1 ? 0 : 1;
    }

    const sharedAt = nextShared === 1 ? new Date().toISOString() : null;
    db.prepare(`
      UPDATE guests
      SET is_shared = ?, shared_at = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(nextShared, sharedAt, numId);

    return { id: numId, is_shared: nextShared, shared_at: sharedAt };
  },

  /**
   * Bulk set sharing status for multiple guests within a transaction.
   */
  bulkSetShared(ids, isShared = 1) {
    let cleanIds = [];
    if (typeof ids === 'string') {
      cleanIds = ids.split(',').map((s) => toInt(s.trim(), 0)).filter((n) => n > 0);
    } else if (Array.isArray(ids)) {
      cleanIds = ids.map((s) => toInt(s, 0)).filter((n) => n > 0);
    }
    if (cleanIds.length === 0) return 0;

    const val = isShared ? 1 : 0;
    const sharedAt = val === 1 ? new Date().toISOString() : null;

    tx(() => {
      const stmt = db.prepare(`
        UPDATE guests
        SET is_shared = ?, shared_at = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      for (const id of cleanIds) {
        stmt.run(val, sharedAt, id);
      }
    });

    return cleanIds.length;
  },

  /**
   * Record that a guest opened their invitation.
   */
  recordGuestOpen(guestId) {
    const numId = toInt(guestId, 0);
    if (!numId) return;
    try {
      db.prepare(`
        UPDATE guests
        SET open_count = open_count + 1,
            first_opened_at = COALESCE(first_opened_at, datetime('now'))
        WHERE id = ?
      `).run(numId);
    } catch (_) {
      // Non-fatal analytics metric
    }
  },

  /**
   * Construct WhatsApp invitation text with personalized link.
   * Inherits partner name if specified, otherwise uses ' & Pasangan' if with_partner.
   */
  formatWhatsAppMessage(guest, baseUrl) {
    const isReception = guest.event_type === 'reception';
    const url = `${baseUrl}/${guest.slug}`;
    const partnerSuffix = guest.partner_name
      ? ` & ${guest.partner_name}`
      : guest.with_partner
      ? ' & Pasangan'
      : '';
    const recipientName = `${guest.title ? guest.title + ' ' : ''}${guest.name}${partnerSuffix}`;
    const eventName = isReception ? 'Syukuran Pernikahan' : guest.event_type === 'akad' ? 'Akad Nikah' : 'Pernikahan';
    return `Assalamu’alaikum Wr. Wb. Kepada Yth. ${recipientName}, tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara ${eventName} Farabi & Syifa: ${url}`;
  }
};

module.exports = guestService;
