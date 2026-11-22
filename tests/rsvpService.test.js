const test = require('node:test');
const assert = require('node:assert/strict');
const rsvpService = require('../server/services/rsvpService');

test('rsvpService - getWishes returns paginated items and hasMore flag', () => {
  const result = rsvpService.getWishes({ page: 1, limit: 5 });
  assert.equal(result.ok, true);
  assert.ok(Array.isArray(result.items));
  assert.ok(typeof result.hasMore === 'boolean');
});

test('rsvpService - getPollStats returns bride and groom tallies', () => {
  const stats = rsvpService.getPollStats();
  assert.equal(stats.ok, true);
  assert.ok(typeof stats.total === 'number');
  assert.ok(typeof stats.bride.count === 'number');
  assert.ok(typeof stats.groom.count === 'number');
  assert.ok(stats.bride.percentage + stats.groom.percentage === 100);
});

test('rsvpService - submitPollVote updates vote counts and handles invalid input', () => {
  assert.throws(() => {
    rsvpService.submitPollVote({ guestSlug: 'test', side: 'invalid_choice' });
  }, /Pilihan tidak valid/);

  const testSlug = 'unit-test-voter-' + Date.now();
  const res = rsvpService.submitPollVote({ guestSlug: testSlug, side: 'bride' });
  assert.equal(res.ok, true);
  assert.ok(res.total >= 1);
});
