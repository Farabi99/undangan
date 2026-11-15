const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const publicImgDir = path.join(__dirname, '..', 'public', 'img');

// Load Bodoni MT font
const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

function buildBodoniLogoSvg(theme = 'rose') {
  const isNavy = theme === 'navy' || theme === 'silver' || theme === 'reception';
  const pillFill = isNavy ? '#0E1B33' : '#EB98A6';
  const innerStroke = isNavy ? '#E2E8F0' : '#FFFFFF';
  const monoFill = '#FFFFFF';
  const gapStroke = pillFill;

  // 500x500 box, stadium capsule centered at (250, 250)
  const pillW = 270;
  const pillH = 450;
  const pillX = 115;
  const pillY = 25;
  const pillRx = 135;

  const inset = 12;
  const innerX = pillX + inset;
  const innerY = pillY + inset;
  const innerW = pillW - 2 * inset;
  const innerH = pillH - 2 * inset;
  const innerRx = pillRx - inset;

  // Bodoni glyph sizes & positions:
  // S on top of F, bottom of S intertwined with top of F
  const fontSizeS = 255;
  const fontSizeF = 265;
  const sX = 190;
  const sY = 70;
  const fX = 196;
  const fY = 218;
  const gap = 4.5;

  const pathS = font.getPath('S', 0, 0, fontSizeS);
  const pathF = font.getPath('F', 0, 0, fontSizeF);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="${isNavy ? '#050B14' : '#000000'}" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Outer Stadium / Pill Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>

  <!-- Concentric Inner Outline -->
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <!-- MONOGRAM: Bodoni S on top of Bodoni F, intertwined -->
  <g id="monogram">
    <!-- Letter F (Base layer) -->
    <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
      ${pathF.toSVG()}
    </g>

    <!-- Letter S (Intertwined on top with negative-space cutout gap) -->
    <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
      ${pathS.toSVG()}
    </g>
  </g>
</svg>`;
}

// Generate both SVG variants
const svgAkad = buildBodoniLogoSvg('rose');
const svgReception = buildBodoniLogoSvg('reception');

fs.writeFileSync(path.join(publicImgDir, 'logo-fs.svg'), svgAkad);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'), svgAkad);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-silver.svg'), svgReception);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'), svgReception);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-navy.svg'), svgReception);

console.log('Successfully written Bodoni SVG logos to public/img/');

// Convert to high-resolution PNGs
Promise.all([
  sharp(Buffer.from(svgAkad)).resize(1024, 1024).png().toFile(path.join(publicImgDir, 'logo-fs.png')),
  sharp(Buffer.from(svgAkad)).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge.png')),
  sharp(Buffer.from(svgAkad)).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-image.png')),
  sharp(Buffer.from(svgAkad)).resize(180, 180).png().toFile(path.join(publicImgDir, 'apple-touch-icon.png')),
  sharp(Buffer.from(svgAkad)).resize(32, 32).png().toFile(path.join(publicImgDir, 'favicon-32x32.png')),
  sharp(Buffer.from(svgReception)).resize(1024, 1024).png().toFile(path.join(publicImgDir, 'logo-fs-silver.png')),
  sharp(Buffer.from(svgReception)).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge-silver.png')),
  sharp(Buffer.from(svgReception)).resize(512, 512).png().toFile(path.join(publicImgDir, 'logo-fs-badge-navy.png'))
]).then(() => {
  console.log('Successfully generated all high-resolution Bodoni PNG files!');
}).catch(err => {
  console.error('Error generating PNGs:', err);
});
