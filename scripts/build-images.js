// Compresses the source artwork in /assets-src into small progressive JPEGs in /public/img.
// JPEG (not WebP) on purpose: iOS < 14 cannot show WebP, and one format keeps markup simple.
// Usage: npm run images   (replace files in assets-src with your real photos, keep the names)
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets-src');
const OUT = path.join(__dirname, '..', 'public', 'img');
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  { in: 'welcome.jpg', out: 'welcome.jpg', width: 800, quality: 72 },
  // the generated frame has a grey margin around the paper, crop it away
  { in: 'frame.jpg', out: 'frame.jpg', width: 720, quality: 70, extract: { left: 30, top: 130, width: 708, height: 1080 } },
  { in: 'arch.jpg', out: 'arch.jpg', width: 1000, quality: 74 },
  { in: 'bride.jpg', out: 'bride.jpg', width: 600, quality: 75 },
  { in: 'groom.jpg', out: 'groom.jpg', width: 600, quality: 75 },
  { in: 'arch.jpg', out: 'og.jpg', width: 1200, height: 630, quality: 78 },
  { in: 'reception.jpg', out: 'reception.jpg', width: 900, quality: 75 },
  { in: 'reception.jpg', out: 'og-reception.jpg', width: 1200, height: 630, quality: 78 }
];

(async function run() {
  for (const j of jobs) {
    const src = path.join(SRC, j.in);
    if (!fs.existsSync(src)) { console.warn('skip (missing):', j.in); continue; }
    let img = sharp(src);
    if (j.extract) {
      const meta = await sharp(src).metadata();
      // only crop when the source still has the original generated size
      if (meta.width >= j.extract.left + j.extract.width && meta.height >= j.extract.top + j.extract.height) img = img.extract(j.extract);
    }
    img = j.height ? img.resize(j.width, j.height, { fit: 'cover' }) : img.resize({ width: j.width, withoutEnlargement: true });
    const info = await img.jpeg({ quality: j.quality, progressive: true, mozjpeg: true }).toFile(path.join(OUT, j.out));
    console.log(j.out.padEnd(12), Math.round(info.size / 1024) + ' KB');
  }
})();
