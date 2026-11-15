const { Ytdl } = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadTrack(url, filename) {
  const ytdl = new Ytdl();
  console.log(`\n--- Fetching info for: ${url} ---`);
  const info = await ytdl.getInfo(url);
  console.log('Title:', info.videoDetails.title);
  console.log('Author:', info.videoDetails.author?.name);
  console.log('Duration:', info.videoDetails.lengthSeconds, 'seconds');

  const stream = await ytdl.download(url, {
    filter: f => f.hasAudio && !f.hasVideo,
    quality: 'highestaudio'
  });

  const outPath = path.join(outDir, filename);
  const ws = fs.createWriteStream(outPath);

  await new Promise((resolve, reject) => {
    stream.pipe(ws);
    ws.on('finish', () => {
      console.log(`Saved ${filename} (${fs.statSync(outPath).size} bytes)`);
      resolve();
    });
    stream.on('error', reject);
    ws.on('error', reject);
  });
}

async function run() {
  // Track 1: Malam Bainai Talempong Instrumental Minangkabau by Indra Jaya
  await downloadTrack('https://www.youtube.com/watch?v=wbVhRCAO9XI', 'akad.mp3');

  // Track 2: Janji Putih - Doddie Latuharhary (Cover Saxophone)
  await downloadTrack('https://www.youtube.com/watch?v=1MkDqvqg-ew', 'syukuran.mp3');

  console.log('\nAll audio tracks downloaded successfully!');
}

run().catch(console.error);
