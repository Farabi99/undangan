const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';
const publicDir = path.join(__dirname, '..', 'public');
const publicImgDir = path.join(publicDir, 'img');

// 1. Read authentic vector path
const rawSvg = fs.readFileSync(path.join(brainScratch, 'traced_raw.svg'), 'utf8');
const pathData = rawSvg.match(/<path d="([^"]+)"/)[1];

// Geometry calculations:
// Center: (492.75, 503.1). Bounds: w=517.5, h=828.4
function buildFaviconSvg({ theme = 'akad', shape = 'capsule' } = {}) {
  const isReception = theme === 'reception';
  const bg = isReception ? '#0E1B33' : '#E99DA7';
  const fg = isReception ? '#FFFFFF' : '#FFF2E9';

  // Scale to fit nicely in 512x512
  const s = 0.54;
  const tx = (256 - 492.75 * s).toFixed(2);
  const ty = (256 - 503.1 * s).toFixed(2);

  let bgElement = '';
  if (shape === 'capsule') {
    const capW = (517.5 * s + 24).toFixed(2);
    const capH = (828.4 * s + 24).toFixed(2);
    const capX = (256 - capW / 2).toFixed(2);
    const capY = (256 - capH / 2).toFixed(2);
    const capRx = (capW / 2).toFixed(2);
    bgElement = `<rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="${capRx}" fill="${bg}"/>`;
  } else if (shape === 'squircle') {
    bgElement = `<rect width="512" height="512" rx="112" fill="${bg}"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${bgElement}
  <g transform="translate(${tx}, ${ty}) scale(${s})" fill="${fg}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
}

// Windows multi-resolution ICO builder
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    offset += item.buffer.length;
    dirEntries.push(entry);
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function deployFavicons() {
  console.log('Building authentic favicons for Akad and Reception...');

  const svgAkadCapsule = buildFaviconSvg({ theme: 'akad', shape: 'capsule' });
  const svgAkadSquircle = buildFaviconSvg({ theme: 'akad', shape: 'squircle' });
  const svgRecCapsule = buildFaviconSvg({ theme: 'reception', shape: 'capsule' });
  const svgRecSquircle = buildFaviconSvg({ theme: 'reception', shape: 'squircle' });

  // 1. Write SVG favicons
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'), svgAkadCapsule);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'), svgRecCapsule);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-navy.svg'), svgRecCapsule);
  console.log('Saved SVG badge/favicons.');

  // 2. Generate PNG sizes for Akad ICO
  const sizes = [16, 32, 48, 64];
  const akadPngBuffers = [];
  for (const sz of sizes) {
    const buf = await sharp(Buffer.from(svgAkadCapsule)).resize(sz, sz).png().toBuffer();
    akadPngBuffers.push({ width: sz, height: sz, buffer: buf });
  }
  const akadIco = createIco(akadPngBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), akadIco);
  console.log('Updated public/favicon.ico with multi-resolution ICO (Akad)!');

  // 3. Generate PNG sizes for Reception ICO
  const recPngBuffers = [];
  for (const sz of sizes) {
    const buf = await sharp(Buffer.from(svgRecCapsule)).resize(sz, sz).png().toBuffer();
    recPngBuffers.push({ width: sz, height: sz, buffer: buf });
  }
  const recIco = createIco(recPngBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon-reception.ico'), recIco);
  console.log('Created public/favicon-reception.ico (Reception)!');

  // 4. Standard PNG Favicons in public/img/
  await Promise.all([
    // Akad
    sharp(Buffer.from(svgAkadCapsule)).resize(32, 32).png().toFile(path.join(publicImgDir, 'favicon-32x32.png')),
    sharp(Buffer.from(svgAkadCapsule)).resize(16, 16).png().toFile(path.join(publicImgDir, 'favicon-16x16.png')),
    
    // Reception
    sharp(Buffer.from(svgRecCapsule)).resize(32, 32).png().toFile(path.join(publicImgDir, 'favicon-reception-32x32.png')),
    sharp(Buffer.from(svgRecCapsule)).resize(16, 16).png().toFile(path.join(publicImgDir, 'favicon-reception-16x16.png')),

    // Apple Touch Icons (both in root and in img/)
    sharp(Buffer.from(svgAkadSquircle)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png')),
    sharp(Buffer.from(svgAkadSquircle)).resize(180, 180).png().toFile(path.join(publicImgDir, 'apple-touch-icon.png'))
  ]);

  console.log('All favicon PNGs and ICOs generated successfully!');
}

deployFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
