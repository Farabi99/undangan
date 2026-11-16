// Small, dependency-free security helpers: rate limiting, admin session cookie, same-origin check.
const crypto = require('crypto');

/** In-memory fixed-window rate limiter keyed by IP. Fine for a single small server. */
function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, windowMs).unref();
  return function (req, res, next) {
    const key = req.ip;
    const now = Date.now();
    let h = hits.get(key);
    if (!h || h.reset < now) { h = { count: 0, reset: now + windowMs }; hits.set(key, h); }
    h.count += 1;
    if (h.count > max) {
      res.status(429);
      return req.accepts(['json', 'html']) === 'json' ? res.json({ ok: false, error: 'rate_limited' }) : res.send(message || 'Too many requests, try again later.');
    }
    next();
  };
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

// Changing ADMIN_PASSWORD or SESSION_SECRET logs every admin out.
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim().replace(/^["']|["']$/g, '');
const SESSION_HOURS = 12;
const COOKIE = 'undangan_admin';

const sign = (value) => crypto.createHmac('sha256', SECRET + ADMIN_PASSWORD).update(value).digest('hex');

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function checkPassword(input) {
  if (!ADMIN_PASSWORD) return false;
  // compare hashes so length differences don't leak through timing
  const cleanInput = String(input || '').trim().replace(/^["']|["']$/g, '');
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
  return safeEqual(h(cleanInput), h(ADMIN_PASSWORD));
}

function setSession(req, res) {
  const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${exp}.${sign(exp)}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0`);
}

function isLoggedIn(req) {
  const raw = parseCookies(req)[COOKIE];
  if (!raw) return false;
  const [exp, sig] = raw.split('.');
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

/** CSRF defence for admin POSTs: SameSite=Strict cookie + require same-origin Origin/Referer. */
function sameOrigin(req, res, next) {
  if (req.method !== 'POST') return next();
  const src = req.headers.origin || req.headers.referer || '';
  try {
    if (src && new URL(src).host === req.headers.host) return next();
  } catch (e) { /* fall through */ }
  res.status(403).send('Forbidden (cross-origin request)');
}

module.exports = { rateLimit, checkPassword, setSession, clearSession, isLoggedIn, sameOrigin, hasAdminPassword: () => !!ADMIN_PASSWORD };
