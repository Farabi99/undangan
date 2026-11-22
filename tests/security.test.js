const test = require('node:test');
const assert = require('node:assert/strict');
const { rateLimit } = require('../server/lib/security');

test('rateLimit - blocks requests exceeding threshold', () => {
  const limiter = rateLimit({
    windowMs: 1000,
    max: 2,
    message: 'Rate limit reached'
  });

  const req = { ip: '127.0.0.1', accepts: () => 'text/html' };
  let status = 200;
  let sentBody = '';
  const res = {
    status: (s) => { status = s; return res; },
    send: (b) => { sentBody = b; },
    json: (j) => { sentBody = j; }
  };

  let nextCalled = 0;
  const next = () => { nextCalled++; };

  // First request - allowed
  limiter(req, res, next);
  assert.equal(nextCalled, 1);

  // Second request - allowed
  limiter(req, res, next);
  assert.equal(nextCalled, 2);

  // Third request - blocked
  limiter(req, res, next);
  assert.equal(nextCalled, 2); // next should NOT be called
  assert.equal(status, 429);
  assert.equal(sentBody, 'Rate limit reached');
});
