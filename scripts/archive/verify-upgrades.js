const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data).toString('utf8')
        });
      });
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- Verifying Upgrades ---');

  // 1. Assets
  const favicon = await get('/favicon.ico');
  console.log('1. /favicon.ico:', favicon.status, 'size:', favicon.body.length);

  const appleIcon = await get('/apple-touch-icon.png');
  console.log('2. /apple-touch-icon.png:', appleIcon.status, 'size:', appleIcon.body.length);

  const ogAkad = await get('/img/og.jpg');
  console.log('3. /img/og.jpg:', ogAkad.status, 'size:', ogAkad.body.length);

  const ogReception = await get('/img/og-reception.jpg');
  console.log('4. /img/og-reception.jpg:', ogReception.status, 'size:', ogReception.body.length);

  // 2. Akad Page
  const akad = await get('/farhan');
  console.log('5. /farhan (Akad):', akad.status);
  const hasAkadFavicon = akad.body.includes('/img/logo-fs-badge.svg');
  const hasAkadOg = akad.body.includes('/img/og.jpg');
  const hasLap = akad.body.includes('luxury-audio-player');
  console.log('   - Has Akad badge favicon:', hasAkadFavicon);
  console.log('   - Has Akad OG image:', hasAkadOg);
  console.log('   - Has Luxury Audio Player:', hasLap);

  // 3. Reception Page
  const reception = await get('/resepsi/farhan');
  console.log('6. /resepsi/farhan (Reception):', reception.status);
  const hasRecFavicon = reception.body.includes('/img/logo-fs-badge-silver.svg');
  const hasRecOg = reception.body.includes('/img/og-reception.jpg');
  const hasRecLap = reception.body.includes('luxury-audio-player');
  console.log('   - Has Silver badge favicon:', hasRecFavicon);
  console.log('   - Has Reception OG image:', hasRecOg);
  console.log('   - Has Luxury Audio Player:', hasRecLap);

  console.log('--- Verification Complete! ---');
}

verify().catch(console.error);

