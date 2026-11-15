// Shared validation + text helpers (used by public API and admin).

// Same rule as the reference site: wishes/notes may not contain links or code.
const LINK_OR_CODE_RE = /(https?:|ftp:|www\.|javascript:|[<>{}`]|\b[a-z0-9-]+\.(com|net|org|id|co|io|me|xyz|ly|info|biz|site|link|app)\b)/i;

function hasLinkOrCode(text) {
  return LINK_OR_CODE_RE.test(String(text || ''));
}

function cleanText(value, maxLen) {
  return String(value == null ? '' : value).replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/** Normalizes Indonesian phone numbers to wa.me format: 0812.. / +62812.. / 812.. -> 62812.. */
function normalizePhone(value) {
  let d = String(value || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d.length >= 9 && d.length <= 15 ? d : '';
}

function yes(value) {
  return /^(1|y|ya|yes|true|iya|x|v|✓)$/i.test(String(value == null ? '' : value).trim());
}

module.exports = { hasLinkOrCode, cleanText, toInt, clamp, normalizePhone, yes };
