const test = require('node:test');
const assert = require('node:assert/strict');
const exportService = require('../server/services/exportService');

test('exportService - generates valid Excel and CSV buffers', () => {
  const dummyGuests = [
    {
      id: 1,
      title: 'Bpk.',
      name: 'Test Guest',
      event_type: 'both',
      with_partner: 1,
      partner_name: 'Partner',
      max_pax: 2,
      phone: '081234567890',
      grp: 'VIP',
      slug: 'test-guest',
      attending: 1,
      pax: 2,
      wish: 'Selamat berbahagia!'
    }
  ];

  const excelBuf = exportService.exportGuestsToExcel(dummyGuests, 'http://localhost:3000');
  assert.ok(Buffer.isBuffer(excelBuf));
  assert.ok(excelBuf.length > 0);

  const csvBuf = exportService.exportGuestsToCsv(dummyGuests, 'http://localhost:3000');
  assert.ok(Buffer.isBuffer(csvBuf));
  const csvStr = csvBuf.toString('utf8');
  assert.ok(csvStr.includes('Test Guest'));
  assert.ok(csvStr.includes('081234567890'));
});
