const { getSetting, setSetting } = require('../db');
const content = require('../lib/content');

/**
 * Service to manage runtime settings with fallback to content.json defaults.
 */
const settingsService = {
  getSetting(key, fallback = null) {
    return getSetting(key, fallback);
  },

  setSetting(key, value) {
    return setSetting(key, String(value));
  },

  getGlobalShowStory() {
    const val = getSetting('show_story', null);
    if (val !== null && val !== undefined) {
      return String(val) === '1' || String(val) === 'true';
    }
    return content.showStory !== undefined ? content.showStory : false;
  },

  setGlobalShowStory(value) {
    let newVal;
    if (value !== undefined && value !== null) {
      newVal = (value === '1' || value === 1 || value === true || value === 'true') ? '1' : '0';
    } else {
      const cur = this.getGlobalShowStory();
      newVal = cur ? '0' : '1';
    }
    setSetting('show_story', newVal);
    return newVal === '1';
  }
};

module.exports = settingsService;
