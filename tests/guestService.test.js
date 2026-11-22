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
  assert.ok(typeof stats.totalShared === 'number');
  assert.ok(typeof stats.totalUnshared === 'number');
  assert.ok(stats.totalGuests >= 0);
});

test('guestService - formatWhatsAppMessage inherits partner name when specified', () => {
  const guestWithPartnerName = {
    title: 'Bpk.',
    name: 'Budi Santoso',
    with_partner: 1,
    partner_name: 'Ibu Ani',
    slug: 'budi-santoso',
    event_type: 'both'
  };
  const msg1 = guestService.formatWhatsAppMessage(guestWithPartnerName, 'https://undangan.me');
  assert.ok(msg1.includes('Bpk. Budi Santoso & Ibu Ani'));
  assert.ok(msg1.includes('https://undangan.me/budi-santoso'));

  const guestWithGenericPartner = {
    title: '',
    name: 'Farhan',
    with_partner: 1,
    partner_name: '',
    slug: 'farhan',
    event_type: 'reception'
  };
  const msg2 = guestService.formatWhatsAppMessage(guestWithGenericPartner, 'https://undangan.me');
  assert.ok(msg2.includes('Farhan & Pasangan'));
  assert.ok(msg2.includes('Syukuran Pernikahan'));

  const singleGuest = {
    title: 'Ibu',
    name: 'Siti',
    with_partner: 0,
    partner_name: '',
    slug: 'siti',
    event_type: 'akad'
  };
  const msg3 = guestService.formatWhatsAppMessage(singleGuest, 'https://undangan.me');
  assert.ok(msg3.includes('Kepada Yth. Ibu Siti,'));
  assert.ok(!msg3.includes('Pasangan'));
  assert.ok(msg3.includes('Akad Nikah'));
});

test('guestService - toggleShared and bulkSetShared track sharing status and timestamps', () => {
  const testName = 'Share Status Guest ' + Date.now();
  const created = guestService.createGuest({
    name: testName,
    event_type: 'both'
  });

  // Initial state should be 0 (unshared)
  const initial = guestService.getGuestById(created.id);
  assert.equal(initial.is_shared, 0);
  assert.equal(initial.shared_at, null);

  // Toggle to shared (1)
  const toggled = guestService.toggleShared(created.id);
  assert.equal(toggled.is_shared, 1);
  assert.ok(toggled.shared_at);

  const fetchedToggled = guestService.getGuestById(created.id);
  assert.equal(fetchedToggled.is_shared, 1);

  // Toggle back to unshared (0)
  const unshared = guestService.toggleShared(created.id);
  assert.equal(unshared.is_shared, 0);
  assert.equal(unshared.shared_at, null);

  // Bulk set shared
  const bulkCount = guestService.bulkSetShared([created.id], 1);
  assert.equal(bulkCount, 1);
  const fetchedBulk = guestService.getGuestById(created.id);
  assert.equal(fetchedBulk.is_shared, 1);

  // Cleanup
  guestService.deleteGuest(created.id);
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
