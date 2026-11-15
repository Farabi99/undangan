const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

// 1. Read the authentic traced vector path
const rawSvg = fs.readFileSync(path.join(brainScratch, 'traced_raw.svg'), 'utf8');
const match = rawSvg.match(/<path d="([^"]+)"/);
if (!match) throw new Error('Could not extract path data from traced_raw.svg');
const pathData = match[1];

// Geometry calculations
const offsetX = 19.5;
const offsetY = 8.9;

const capX = (234.0 - 18 + offsetX).toFixed(2);
const capY = (88.9 - 18 + offsetY).toFixed(2);
const capW = (517.5 + 36).toFixed(2);
const capH = (828.4 + 36).toFixed(2);
const capRx = (capW / 2).toFixed(2);

function buildSvg({ theme = 'akad', solidSquare = false } = {}) {
  const isReception = theme === 'reception' || theme === 'silver';
  
  // Akad: user's authentic soft dusty rose (#E99DA7) and warm candlelight ivory (#FFF2E9)
  // Reception: Nocturnal Deep Navy (#0E1B33) and Pure White (#FFFFFF) with silver accent
  const pillFill = isReception ? '#0E1B33' : '#E99DA7';
  const monoFill = isReception ? '#FFFFFF' : '#FFF2E9';
  const shadowColor = isReception ? '#030712' : '#8E4F49';

  const backgroundElement = solidSquare
    ? `<rect width="1024" height="1024" fill="${pillFill}"/>`
    : `<!-- Stadium Capsule Badge with soft dimensional elevation -->
       <rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="${capRx}" fill="${pillFill}" filter="url(#emblemElevation)"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <filter id="emblemElevation" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="${shadowColor}" flood-opacity="${isReception ? '0.45' : '0.22'}"/>
    </filter>
  </defs>

  ${backgroundElement}

  <!-- Authentic S & F Monogram and Stadium Ring -->
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})" fill="${monoFill}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
}

async function deploy() {
  console.log('Generating authentic vector logos for both themes...');

  const svgAkadPill = buildSvg({ theme: 'akad', solidSquare: false });
  const svgAkadSolid = buildSvg({ theme: 'akad', solidSquare: true });
  const svgReceptionPill = buildSvg({ theme: 'reception', solidSquare: false });
  const svgReceptionSolid = buildSvg({ theme: 'reception', solidSquare: true });

  // Write SVGs to public/img
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs.svg'), svgAkadPill);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'), svgAkadPill);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-silver.svg'), svgReceptionPill);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'), svgReceptionPill);
  fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-navy.svg'), svgReceptionPill);
  console.log('Successfully written SVG files.');

  // Render high quality PNGs
  const bufAkadPill = Buffer.from(svgAkadPill);
  const bufAkadSolid = Buffer.from(svgAkadSolid);
  const bufReceptionPill = Buffer.from(svgReceptionPill);

  await Promise.all([
    // Akad PNGs
    sharp(bufAkadPill).resize(1024, 1024).png().toFile(path.join(publicImgDir, 'logo-fs.png')),
    sharp(bufAkadPill).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge.png')),
    
    // Social / OpenGraph preview image (Solid Dusty Rose card for pristine WhatsApp rendering)
    sharp(bufAkadSolid).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-image.png')),
    sharp(bufAkadSolid).resize(180, 180).png().toFile(path.join(publicImgDir, 'apple-touch-icon.png')),
    sharp(bufAkadSolid).resize(32, 32).png().toFile(path.join(publicImgDir, 'favicon-32x32.png')),
    sharp(bufAkadSolid).resize(16, 16).png().toFile(path.join(publicImgDir, 'favicon-16x16.png')),

    // Reception PNGs
    sharp(bufReceptionPill).resize(1024, 1024).png().toFile(path.join(publicImgDir, 'logo-fs-silver.png')),
    sharp(bufReceptionPill).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge-silver.png')),
    sharp(bufReceptionPill).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge-navy.png'))
  ]);

  console.log('Successfully generated all PNG assets in public/img!');
}

deploy().catch(err => {
  console.error('Error during deployment:', err);
  process.exit(1);
});
