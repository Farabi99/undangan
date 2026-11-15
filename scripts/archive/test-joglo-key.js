const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

async function processJoglo() {
  const { data, info } = await sharp('public/img/rumah-joglo.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgR = 126, bgG = 131, bgB = 108; // #7E836C
  const outBuf = Buffer.alloc(info.width * info.height * 4);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const srcIdx = (y * info.width + x) * 3;
      const dstIdx = (y * info.width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Euclidean color distance from sage background
      const dist = Math.sqrt(
        (r - bgR) ** 2 +
        (g - bgG) ** 2 +
        (b - bgB) ** 2
      );

      outBuf[dstIdx] = r;
      outBuf[dstIdx + 1] = g;
      outBuf[dstIdx + 2] = b;

      // Soft alpha threshold
      if (dist < 12) {
        outBuf[dstIdx + 3] = 0;
      } else if (dist < 26) {
        const alpha = Math.round(((dist - 12) / (26 - 12)) * 255);
        outBuf[dstIdx + 3] = alpha;
      } else {
        outBuf[dstIdx + 3] = 255;
      }
    }
  }

  await sharp(outBuf, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).png().toFile(path.join(brainScratch, 'joglo_transparent_test.png'));

  console.log('Saved joglo_transparent_test.png');
}

processJoglo().catch(console.error);
