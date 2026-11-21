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

/**
 * Normalizes global / international phone numbers to E.164 wa.me format.
 * Accepts global numbers (+48..., +1..., +44..., +84..., etc.) as well as Indonesian local numbers (08... -> 628...).
 */
function normalizePhone(value) {
  if (value === undefined || value === null) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  const hasPlus = raw.startsWith('+');
  const has00 = raw.startsWith('00');

  let digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';

  if (hasPlus) {
    // Explicit international format (e.g. +48..., +84..., +1..., +62...)
  } else if (has00) {
    // International dial prefix 00 (e.g. 0048... -> 48...)
    digits = digits.slice(2);
  } else if (digits.startsWith('08')) {
    // Indonesian mobile format starting with 08 (e.g. 0812... -> 62812...)
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('0') && digits.length >= 10 && digits.length <= 12) {
    // Indonesian landline format starting with 0 (e.g. 021..., 031...)
    digits = '62' + digits.slice(1);
  } else if (/^8[1-3,5,7-9]\d{7,10}$/.test(digits)) {
    // Indonesian mobile number without leading 0 (e.g. 812..., 857...)
    digits = '62' + digits;
  }

  // Valid global phone numbers in E.164 format: 7 to 15 digits
  return digits.length >= 7 && digits.length <= 15 ? digits : '';
}

function yes(value) {
  return /^(1|y|ya|yes|true|iya|x|v|✓)$/i.test(String(value == null ? '' : value).trim());
}

module.exports = { hasLinkOrCode, cleanText, toInt, clamp, normalizePhone, yes };
