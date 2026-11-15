const { Ytdl } = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';
if (!fs.existsSync(brainScratch)) fs.mkdirSync(brainScratch, { recursive: true });

async function downloadRaw() {
  const ytdl = new Ytdl();
  const url = 'https://www.youtube.com/watch?v=kr8GKXgqRpc';
  console.log('Fetching info for:', url);
  const info = await ytdl.getInfo(url);
  console.log('Title:', info.videoDetails.title);
  console.log('Author:', info.videoDetails.author?.name);
  console.log('Duration:', info.videoDetails.lengthSeconds, 'seconds');

  const stream = await ytdl.download(url, {
    filter: f => f.hasAudio && !f.hasVideo,
    quality: 'highestaudio'
  });

  const outPath = path.join(brainScratch, 'raw_syukuran.mp3');
  const ws = fs.createWriteStream(outPath);

  await new Promise((resolve, reject) => {
    stream.pipe(ws);
    ws.on('finish', () => {
      console.log(`Saved raw_syukuran.mp3 (${fs.statSync(outPath).size} bytes)`);
      resolve();
    });
    stream.on('error', reject);
    ws.on('error', reject);
  });
}

downloadRaw().catch(console.error);
