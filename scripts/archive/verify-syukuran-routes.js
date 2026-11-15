const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, res => {
      resolve({ path, status: res.statusCode, location: res.headers.location });
    }).on('error', err => resolve({ path, error: err.message }));
  });
}

async function run() {
  const tests = [
    '/farhan',
    '/syukuran',
    '/syukuran/farhan',
    '/resepsi',
    '/resepsi/farhan'
  ];
  for (const t of tests) {
    const res = await get(t);
    console.log(`${res.path} -> Status: ${res.status}${res.location ? ' (Redirect to: ' + res.location + ')' : ''}`);
  }
}

run();
