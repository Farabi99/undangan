// SQLite via Node's built-in `node:sqlite` (Node >= 22.13), so there are no native modules to compile.
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'undangan.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS guests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL DEFAULT '',
  name            TEXT NOT NULL,
  with_partner    INTEGER NOT NULL DEFAULT 0,
  partner_name    TEXT NOT NULL DEFAULT '',
  max_pax         INTEGER NOT NULL DEFAULT 2,
  phone           TEXT NOT NULL DEFAULT '',
  grp             TEXT NOT NULL DEFAULT '',
  open_count      INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS rsvps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id   INTEGER NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  attending  INTEGER NOT NULL,
  pax        INTEGER NOT NULL DEFAULT 0,
  wish       TEXT NOT NULL DEFAULT '',
  is_hidden  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS votes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_slug TEXT NOT NULL UNIQUE,
  side       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Safe column migration for event_type
try {
  db.exec("ALTER TABLE guests ADD COLUMN event_type TEXT NOT NULL DEFAULT 'both'");
} catch (e) {
  // column already exists
}

// Safe column migration for per-guest Kisah Kami / Story toggle (NULL = follow global, 0 = hide, 1 = show)
try {
  db.exec("ALTER TABLE guests ADD COLUMN show_story INTEGER DEFAULT NULL");
} catch (e) {
  // column already exists
}

// Safe column migrations for private voice notes
try {
  db.exec("ALTER TABLE rsvps ADD COLUMN voice_file TEXT DEFAULT NULL");
} catch (e) {
  // column already exists
}
try {
  db.exec("ALTER TABLE rsvps ADD COLUMN voice_mime TEXT DEFAULT NULL");
} catch (e) {
  // column already exists
}
try {
  db.exec("ALTER TABLE rsvps ADD COLUMN voice_duration INTEGER NOT NULL DEFAULT 0");
} catch (e) {
  // column already exists
}

const VOICE_DIR = path.join(DATA_DIR, 'voice-notes');
fs.mkdirSync(VOICE_DIR, { recursive: true });

function getSetting(key, fallback) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}

/** Runs fn inside a transaction; rolls back on error. */
function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

module.exports = { db, getSetting, setSetting, tx };
