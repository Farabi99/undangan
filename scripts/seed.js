const { db, tx } = require('../server/db');
const { uniqueSlug } = require('../server/lib/slug');

console.log('Seeding demo data...');

const sampleGuests = [
  {
    title: 'Mr.',
    name: 'Daeng Muhammad Alfarabi',
    with_partner: 1,
    partner_name: '',
    max_pax: 2,
    phone: '6281234567890',
    grp: 'Sahabat',
    event_type: 'reception'
  },
  {
    title: 'Bpk.',
    name: 'Budi Santoso',
    with_partner: 1,
    partner_name: 'Ibu Ani Lestari',
    max_pax: 2,
    phone: '6281298765432',
    grp: 'Keluarga',
    event_type: 'akad'
  },
  {
    title: 'Ibu',
    name: 'Siti Rahmawati',
    with_partner: 0,
    partner_name: '',
    max_pax: 1,
    phone: '',
    grp: 'Kantor',
    event_type: 'both'
  }
];

tx(() => {
  const insertGuest = db.prepare(`
    INSERT INTO guests (slug, title, name, with_partner, partner_name, max_pax, phone, grp, event_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name, event_type = excluded.event_type
  `);

  const insertRsvp = db.prepare(`
    INSERT INTO rsvps (guest_id, attending, pax, wish)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guest_id) DO UPDATE SET wish = excluded.wish
  `);

  sampleGuests.forEach((g) => {
    const slug = uniqueSlug(g.name);
    insertGuest.run(slug, g.title, g.name, g.with_partner, g.partner_name, g.max_pax, g.phone, g.grp, g.event_type || 'both');
    const row = db.prepare('SELECT id FROM guests WHERE slug = ?').get(slug);

    if (g.name === 'Budi Santoso') {
      insertRsvp.run(row.id, 1, 2, 'Selamat menempuh hidup baru Farabi & Syifa! Semoga senantiasa sakinah, mawaddah, warahmah.');
    }
  });
});

console.log('✓ Seeding complete. Sample links created:');
console.log('  - http://localhost:3000/daeng-muhammad-alfarabi');
console.log('  - http://localhost:3000/budi-santoso');
