const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify, isValidSlug, RESERVED } = require('../server/lib/slug');

test('slugify - transforms names into clean URL slugs', () => {
  assert.equal(slugify('Daeng Muhammad Alfarabi'), 'daeng-muhammad-alfarabi');
  assert.equal(slugify('Bpk. Andi Pratama'), 'andi-pratama');
  assert.equal(slugify('Ibu Siti Rahma & Partner'), 'siti-rahma-dan-partner');
  assert.equal(slugify('Dr. H. Ahmad Fauzi'), 'ahmad-fauzi');
});

test('slugify - handles special characters and accents', () => {
  assert.equal(slugify('Renée & Chloë'), 'renee-dan-chloe');
  assert.equal(slugify('   ---Test User---  '), 'test-user');
});

test('isValidSlug - validates slug format and blocks reserved names', () => {
  assert.equal(isValidSlug('daeng-farabi'), true);
  assert.equal(isValidSlug('syifa'), true);
  assert.equal(isValidSlug('family-123'), true);

  // Reserved paths
  assert.equal(isValidSlug('admin'), false);
  assert.equal(isValidSlug('api'), false);
  assert.equal(isValidSlug('resepsi'), false);
  assert.equal(isValidSlug('syukuran'), false);

  // Invalid characters
  assert.equal(isValidSlug('invalid_slug'), false);
  assert.equal(isValidSlug('Invalid-Slug'), false);
  assert.equal(isValidSlug('-leading-hyphen'), false);
});
