// Turns a guest name into a URL slug: "Bpk. Daeng Muhammad Alfarabi" -> "daeng-muhammad-alfarabi"
const { db } = require('../db');

// Paths used by the app itself; a guest can never get these as a slug.
const RESERVED = new Set(['admin', 'api', 'css', 'js', 'img', 'fonts', 'calendar.ics', 'favicon.ico', 'robots.txt', 'health', 'resepsi', 'syukuran']);

// Honorifics are stored in the separate `title` column, so strip them from the slug.
const TITLE_RE = /^((bpk|bapak|pak|ibu|bu|mr|mrs|ms|miss|sdr|sdri|saudara|saudari|dr|drs|dra|ir|hj|h|prof|kak|mas|mbak|tn|ny|nn)\.?\s+)+/i;

function slugify(name) {
  const s = String(name || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // é -> e
    .trim().replace(TITLE_RE, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return s || 'tamu';
}

/**
 * Returns a slug that is not used in the DB nor in `taken` (a Set of slugs reserved in the same batch).
 * Duplicates get -2, -3, ...
 */
function uniqueSlug(name, taken) {
  const base = slugify(name);
  const exists = db.prepare('SELECT 1 FROM guests WHERE slug = ?');
  let slug = base;
  let n = 1;
  while (RESERVED.has(slug) || (taken && taken.has(slug)) || exists.get(slug)) {
    n += 1;
    slug = base + '-' + n;
  }
  if (taken) taken.add(slug);
  return slug;
}

function isValidSlug(slug) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 70 && !RESERVED.has(slug);
}

module.exports = { slugify, uniqueSlug, isValidSlug, RESERVED };
