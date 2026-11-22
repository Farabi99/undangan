const test = require('node:test');
const assert = require('node:assert/strict');
const settingsService = require('../server/services/settingsService');

test('settingsService - can read, set, and toggle global settings', () => {
  const initialStory = settingsService.getGlobalShowStory();
  assert.ok(typeof initialStory === 'boolean');

  // Set explicit true
  settingsService.setGlobalShowStory(true);
  assert.equal(settingsService.getGlobalShowStory(), true);

  // Set explicit false
  settingsService.setGlobalShowStory(false);
  assert.equal(settingsService.getGlobalShowStory(), false);

  // Restore initial
  settingsService.setGlobalShowStory(initialStory);
  assert.equal(settingsService.getGlobalShowStory(), initialStory);
});
