const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicImgDir = path.join(__dirname, '..', 'public', 'img');

async function processJoglo() {
  console.log('Building transparent Joglo house assets for both themes...');
  const { data, info } = await sharp(path.join(publicImgDir, 'rumah-joglo.jpg'))
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgR = 126, bgG = 131, bgB = 108; // #7E836C
  const rawTrans = Buffer.alloc(info.width * info.height * 4);
  const rawSilver = Buffer.alloc(info.width * info.height * 4);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const srcIdx = (y * info.width + x) * 3;
      const dstIdx = (y * info.width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Distance from sage background
      const dist = Math.sqrt(
        (r - bgR) ** 2 +
        (g - bgG) ** 2 +
        (b - bgB) ** 2
      );

      // Clean cutout: bottom right flower speck removal if y > 245 and x > 380
      let alpha = 255;
      if (dist < 14) {
        alpha = 0;
      } else if (dist < 28) {
        alpha = Math.round(((dist - 14) / (28 - 14)) * 255);
      }

      // Cutout corner floating leaves if far top corners to keep house clean
      if (y < 40 && (x < 70 || x > 350)) {
        alpha = Math.round(alpha * 0.2);
      }
      if (y > 240 && x > 380) {
        alpha = 0; // remove orange floral artifact
      }

      // 1. Warm Architectural Drawing for Akad (Transparent background)
      rawTrans[dstIdx] = r;
      rawTrans[dstIdx + 1] = g;
      rawTrans[dstIdx + 2] = b;
      rawTrans[dstIdx + 3] = alpha;

      // 2. Moonlight Silver Architectural Etching for Syukuran (Transparent background)
      if (alpha > 0) {
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        // Silver highlights (#E2E8F0) to deep moonlight blue (#162744)
        rawSilver[dstIdx] = Math.round(22 + lum * (226 - 22));     // R
        rawSilver[dstIdx + 1] = Math.round(39 + lum * (232 - 39)); // G
        rawSilver[dstIdx + 2] = Math.round(68 + lum * (240 - 68)); // B
        rawSilver[dstIdx + 3] = alpha;
      } else {
        rawSilver[dstIdx + 3] = 0;
      }
    }
  }

  const transImg = sharp(rawTrans, { raw: { width: info.width, height: info.height, channels: 4 } });
  const silverImg = sharp(rawSilver, { raw: { width: info.width, height: info.height, channels: 4 } });

  // Save Akad transparent joglo
  await transImg.png().toFile(path.join(publicImgDir, 'rumah-joglo.png'));
  await transImg.webp({ quality: 95 }).toFile(path.join(publicImgDir, 'rumah-joglo.webp'));
  console.log('Saved transparent rumah-joglo.png and rumah-joglo.webp!');

  // Save Syukuran silver transparent joglo
  await silverImg.png().toFile(path.join(publicImgDir, 'rumah-joglo-silver.png'));
  await silverImg.webp({ quality: 95 }).toFile(path.join(publicImgDir, 'rumah-joglo-silver.webp'));
  console.log('Saved transparent rumah-joglo-silver.png and rumah-joglo-silver.webp!');
}

processJoglo().catch(err => {
  console.error('Error processing joglo:', err);
  process.exit(1);
});
