// Loads content.json + i18n.json and builds what the views need:
// per-language string dictionaries, formatted dates, Maps/Calendar links and the .ics file.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'content');

const MONTHS = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
const DAYS = {
  id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

/** Wall-clock parts of an ISO string in its own offset ("2026-12-12T08:00:00+07:00" -> 08:00 that day). */
function localParts(iso) {
  const m = /([+-])(\d{2}):?(\d{2})$/.exec(iso);
  const offsetMin = m ? (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10)) : 0;
  const d = new Date(new Date(iso).getTime() + offsetMin * 60000);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}
const pad = (n) => (n < 10 ? '0' : '') + n;

function formatDate(iso, lang) {
  const p = localParts(iso);
  return DAYS[lang][p.wd] + ', ' + p.d + ' ' + MONTHS[lang][p.mo] + ' ' + p.y;
}
function formatTime(iso, lang) {
  const p = localParts(iso);
  return pad(p.h) + (lang === 'id' ? '.' : ':') + pad(p.mi);
}
/** "2026-12-12T08:00:00+07:00" -> "20261212T010000Z" (Google Calendar / iCal UTC format) */
function calStamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function load() {
  const content = JSON.parse(fs.readFileSync(path.join(DIR, 'content.json'), 'utf8'));
  const i18n = JSON.parse(fs.readFileSync(path.join(DIR, 'i18n.json'), 'utf8'));
  const c = content.couple;
  const tz = content.timezoneLabel || 'WIB';
  const langs = ['id', 'en'];

  const events = content.events.map((ev) => ({
    ...ev,
    mapsUrl: ev.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ev.venue + ', ' + ev.address),
    googleCalUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent((ev.key === 'akad' ? 'Akad Nikah ' : 'Syukuran ') + c.short)
      + '&dates=' + calStamp(ev.start) + '/' + calStamp(ev.end)
      + '&details=' + encodeURIComponent(c.bride.name + ' & ' + c.groom.name)
      + '&location=' + encodeURIComponent(ev.venue + ', ' + ev.address)
  }));

  const dict = {};
  langs.forEach((lang) => {
    const d = { ...i18n[lang] };
    d['site.description'] = content.site.description[lang];
    d['bride.parents'] = c.bride.parents[lang];
    d['groom.parents'] = c.groom.parents[lang];
    d['quote.text'] = content.quote.text[lang];
    events.forEach((ev) => {
      d['event.' + ev.key + '.date'] = formatDate(ev.start, lang);
      d['event.' + ev.key + '.time'] = formatTime(ev.start, lang) + ' – ' + formatTime(ev.end, lang) + ' ' + tz;
      d['event.' + ev.key + '.note'] = ev.note ? ev.note[lang] : '';
    });
    d['rsvp.deadlineDate'] = formatDate(content.rsvp.deadline + 'T12:00:00+07:00', lang);
    d['rsvp.receptionDeadlineDate'] = formatDate((content.rsvp.receptionDeadline || content.rsvp.deadline) + 'T12:00:00+07:00', lang);
    dict[lang] = d;
  });

  // One .ics with every event, for iPhone / Outlook users.
  const now = calStamp(new Date().toISOString());
  const makeIcs = (eventList) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
    .concat(...eventList.map((ev) => [
      'BEGIN:VEVENT',
      'UID:' + ev.key + '-' + calStamp(ev.start) + '@undangan',
      'DTSTAMP:' + now,
      'DTSTART:' + calStamp(ev.start),
      'DTEND:' + calStamp(ev.end),
      'SUMMARY:' + icsEscape(dict.id['day.' + ev.key] + ' ' + c.short),
      'LOCATION:' + icsEscape(ev.venue + ', ' + ev.address),
      'DESCRIPTION:' + icsEscape(c.bride.name + ' & ' + c.groom.name),
      'END:VEVENT'
    ]))
    .concat(['END:VCALENDAR']).join('\r\n');

  const ics = makeIcs(events);
  const akadIcs = makeIcs(events.filter(e => e.key === 'akad'));
  const receptionIcs = makeIcs(events.filter(e => e.key === 'resepsi'));

  return {
    raw: content,
    site: content.site,
    quote: content.quote,
    couple: c,
    events,
    story: content.story || [],
    gallery: content.gallery || [],
    gift: content.gift || {},
    dict,
    ics,
    akadIcs,
    receptionIcs,
    countdownTarget: new Date(events[0].start).getTime(),
    receptionCountdownTarget: new Date((events.find(e => e.key === 'resepsi') || events[0]).start).getTime(),
    maxPaxDefault: content.rsvp.maxPaxDefault || 2
  };
}

// Loaded once at start-up; restart the server after editing the JSON files.
module.exports = load();
