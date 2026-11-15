const http = require('http');

function check(url) {
  return new Promise(resolve => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const audioSrc = data.match(/<audio id="bgmAudio"[\s\S]*?<\/audio>/);
        const widget = data.match(/class="music-floating-widget"/);
        resolve({ url, audioSrc: audioSrc ? audioSrc[0].replace(/\s+/g, ' ') : null, hasWidget: !!widget });
      });
    });
  });
}

Promise.all([
  check('http://localhost:3000/farhan'),
  check('http://localhost:3000/syukuran/farhan')
]).then(res => {
  res.forEach(r => {
    console.log(`\nURL: ${r.url}`);
    console.log(`Audio HTML: ${r.audioSrc}`);
    console.log(`Has Widget: ${r.hasWidget}`);
  });
});
