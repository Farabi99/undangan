const test = require('node:test');
const assert = require('node:assert/strict');
const guestService = require('../server/services/guestService');

test('guestService - getDistinctGroups returns an array of strings', () => {
  const groups = guestService.getDistinctGroups();
  assert.ok(Array.isArray(groups));
});

test('guestService - getStats returns aggregated attendance metrics', () => {
  const stats = guestService.getStats();
  assert.ok(typeof stats.totalGuests === 'number');
  assert.ok(typeof stats.totalPax === 'number');
  assert.ok(stats.totalGuests >= 0);
});

test('guestService - CRUD lifecycle creates, updates, and deletes a guest', () => {
  const testName = 'Unit Test Guest ' + Date.now();
  const created = guestService.createGuest({
    name: testName,
    title: 'Mr.',
    event_type: 'both',
    max_pax: 2
  });

  assert.ok(created.id > 0);
  assert.ok(created.slug.startsWith('unit-test-guest'));

  const fetched = guestService.getGuestById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.name, testName);
  assert.equal(fetched.title, 'Mr.');

  const fetchedBySlug = guestService.getGuestBySlug(created.slug);
  assert.ok(fetchedBySlug);
  assert.equal(fetchedBySlug.id, created.id);

  // Update
  guestService.updateGuest(created.id, {
    name: testName,
    title: 'Dr.',
    event_type: 'reception',
    max_pax: 3
  });

  const updated = guestService.getGuestById(created.id);
  assert.equal(updated.title, 'Dr.');
  assert.equal(updated.event_type, 'reception');
  assert.equal(updated.max_pax, 3);

  // Delete
  const deleted = guestService.deleteGuest(created.id);
  assert.equal(deleted, true);

  const afterDelete = guestService.getGuestById(created.id);
  assert.equal(afterDelete, null);
});
