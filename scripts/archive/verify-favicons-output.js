const http = require('http');

function check(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/<link rel="(?:icon|apple-touch-icon)"[^>]+>/g);
        resolve({ url, matches });
      });
    }).on('error', reject);
  });
}

async function run() {
  const [f, r] = await Promise.all([
    check('http://localhost:3000/farhan'),
    check('http://localhost:3000/resepsi/farhan')
  ]);
  console.log('Farhan tags:\n', f.matches.join('\n'));
  console.log('\nResepsi tags:\n', r.matches.join('\n'));
}

run().catch(console.error);
