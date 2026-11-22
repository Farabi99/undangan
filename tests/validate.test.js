const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanText, hasLinkOrCode, normalizePhone, clamp, toInt, yes } = require('../server/lib/validate');

test('cleanText - trims leading/trailing whitespace and respects max length', () => {
  assert.equal(cleanText('  Hello   World  ', 20), 'Hello   World');
  assert.equal(cleanText('123456789012345', 10), '1234567890');
  assert.equal(cleanText(null), '');
});

test('hasLinkOrCode - detects malicious URLs and code snippets', () => {
  assert.equal(hasLinkOrCode('Selamat berbahagia Farabi & Syifa!'), false);
  assert.equal(hasLinkOrCode('Semoga samawa ya!'), false);

  // Links
  assert.equal(hasLinkOrCode('Check this out: https://example.com'), true);
  assert.equal(hasLinkOrCode('Visit http://malicious.site'), true);
  assert.equal(hasLinkOrCode('Go to www.google.com'), true);

  // Script tags / HTML
  assert.equal(hasLinkOrCode('<script>alert("xss")</script>'), true);
  assert.equal(hasLinkOrCode('javascript:void(0)'), true);
  assert.equal(hasLinkOrCode('<img src=x onerror=alert(1)>'), true);
});

test('normalizePhone - standardizes Indonesian mobile numbers', () => {
  assert.equal(normalizePhone('08123456789'), '628123456789');
  assert.equal(normalizePhone('+62 812-3456-789'), '628123456789');
  assert.equal(normalizePhone('628123456789'), '628123456789');
  assert.equal(normalizePhone(''), '');
});

test('clamp & toInt - safely converts and constrains integer bounds', () => {
  assert.equal(clamp(5, 1, 10), 5);
  assert.equal(clamp(0, 1, 10), 1);
  assert.equal(clamp(15, 1, 10), 10);

  assert.equal(toInt('42', 0), 42);
  assert.equal(toInt('invalid', 5), 5);
});

test('yes - handles common boolean truthy representations', () => {
  assert.equal(yes(1), true);
  assert.equal(yes('1'), true);
  assert.equal(yes('true'), true);
  assert.equal(yes('yes'), true);
  assert.equal(yes('ya'), true);
  assert.equal(yes(0), false);
  assert.equal(yes('no'), false);
});
