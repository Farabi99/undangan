const sharp = require('sharp');
const path = require('path');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

async function testJogloOnNavy() {
  const transJoglo = await sharp(path.join(brainScratch, 'joglo_transparent_test.png')).toBuffer();

  // Test 1: directly on #080E1C
  const test1 = await sharp({
    create: {
      width: 420,
      height: 265,
      channels: 4,
      background: { r: 8, g: 14, b: 28, alpha: 1 }
    }
  }).composite([
    { input: transJoglo, top: 0, left: 0 }
  ]).png().toBuffer();

  // Test 2: silver/moonlight styled joglo on #080E1C
  // Convert house to silver/pure moonlight tones (#E2E8F0)
  const { data, info } = await sharp(transJoglo)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const silverBuf = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 0) {
      // Luminance of pixel
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      // Map to moonlight silver (#E2E8F0) with deep navy shadows (#142442)
      silverBuf[i] = Math.round(20 + lum * (226 - 20));     // R
      silverBuf[i + 1] = Math.round(36 + lum * (232 - 36)); // G
      silverBuf[i + 2] = Math.round(66 + lum * (240 - 66)); // B
      silverBuf[i + 3] = alpha;
    }
  }

  const silverJoglo = await sharp(silverBuf, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  await sharp(silverJoglo).toFile(path.join(brainScratch, 'joglo_silver_transparent.png'));

  const test2 = await sharp({
    create: {
      width: 420,
      height: 265,
      channels: 4,
      background: { r: 8, g: 14, b: 28, alpha: 1 }
    }
  }).composite([
    { input: silverJoglo, top: 0, left: 0 }
  ]).png().toBuffer();

  // Montage side by side
  await sharp({
    create: {
      width: 880,
      height: 285,
      channels: 4,
      background: { r: 20, g: 25, b: 35, alpha: 1 }
    }
  }).composite([
    { input: test1, top: 10, left: 10 },
    { input: test2, top: 10, left: 450 }
  ]).png().toFile(path.join(brainScratch, 'joglo_navy_comparison.png'));

  console.log('Saved joglo_navy_comparison.png');
}

testJogloOnNavy().catch(console.error);
