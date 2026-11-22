const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server/index');

test('GET /health - returns 200 and healthy JSON status', async (t) => {
  // Start server on a random port
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(typeof body.uptime, 'number');
    assert.ok(body.timestamp);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
