const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

// Let's create a test harness that renders multiple positioning and weight variations
function createBodoniSvg(font, {
  fontSizeS = 260,
  fontSizeF = 260,
  sX = 205,
  sY = 270,
  fX = 210,
  fY = 425,
  weaveOrder = 's-over-f' // 's-over-f', 'f-over-s', 'intertwined'
}) {
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

  // Get paths
  const pathS = font.getPath('S', 0, 0, fontSizeS);
  const pathF = font.getPath('F', 0, 0, fontSizeF);

  // SVG transform: scale(1, -1) to flip Y-axis
  // If we weave them:
  let glyphContent = '';
  if (weaveOrder === 's-over-f') {
    glyphContent = `
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="#FFFFFF">
        ${pathF.toSVG()}
      </g>
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="#FFFFFF">
        ${pathS.toSVG()}
      </g>
    `;
  } else if (weaveOrder === 'f-over-s') {
    glyphContent = `
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="#FFFFFF">
        ${pathS.toSVG()}
      </g>
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="#FFFFFF">
        ${pathF.toSVG()}
      </g>
    `;
  } else if (weaveOrder === 'intertwined') {
    // Intertwined: S in back, F in middle, with S lower bowl overlapping F stem, or with gap stroke
    glyphContent = `
      <!-- F base layer -->
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="#FFFFFF">
        ${pathF.toSVG()}
      </g>
      <!-- S with cutout gap outline -->
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="#FFFFFF" stroke="#EB98A6" stroke-width="6" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="#EB98A6" filter="url(#emblemShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="#FFFFFF" stroke-width="2.2" opacity="0.95"/>

  <!-- Glyphs -->
  ${glyphContent}
</svg>`;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's create variations:
// Variation 1: Regular Bodoni, S over F
const v1 = createBodoniSvg(fontR, { fontSizeS: 250, fontSizeF: 260, sX: 198, sY: 275, fX: 200, fY: 425, weaveOrder: 's-over-f' });
// Variation 2: Regular Bodoni, Intertwined with gap
const v2 = createBodoniSvg(fontR, { fontSizeS: 250, fontSizeF: 260, sX: 198, sY: 275, fX: 200, fY: 425, weaveOrder: 'intertwined' });
// Variation 3: Bold Bodoni, S over F
const v3 = createBodoniSvg(fontB, { fontSizeS: 250, fontSizeF: 260, sX: 198, sY: 275, fX: 200, fY: 425, weaveOrder: 's-over-f' });
// Variation 4: Bold Bodoni, Intertwined
const v4 = createBodoniSvg(fontB, { fontSizeS: 250, fontSizeF: 260, sX: 198, sY: 275, fX: 200, fY: 425, weaveOrder: 'intertwined' });

fs.writeFileSync(path.join(outDir, 'bodoni_v1.svg'), v1);
fs.writeFileSync(path.join(outDir, 'bodoni_v2.svg'), v2);
fs.writeFileSync(path.join(outDir, 'bodoni_v3.svg'), v3);
fs.writeFileSync(path.join(outDir, 'bodoni_v4.svg'), v4);

Promise.all([
  sharp(Buffer.from(v1)).resize(400, 400).png().toFile(path.join(outDir, 'bodoni_v1.png')),
  sharp(Buffer.from(v2)).resize(400, 400).png().toFile(path.join(outDir, 'bodoni_v2.png')),
  sharp(Buffer.from(v3)).resize(400, 400).png().toFile(path.join(outDir, 'bodoni_v3.png')),
  sharp(Buffer.from(v4)).resize(400, 400).png().toFile(path.join(outDir, 'bodoni_v4.png'))
]).then(() => {
  // Create a 2x2 grid of the 4 variations
  return sharp({
    create: {
      width: 820,
      height: 820,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 }
    }
  }).composite([
    { input: path.join(outDir, 'bodoni_v1.png'), top: 10, left: 10 },
    { input: path.join(outDir, 'bodoni_v2.png'), top: 10, left: 420 },
    { input: path.join(outDir, 'bodoni_v3.png'), top: 420, left: 10 },
    { input: path.join(outDir, 'bodoni_v4.png'), top: 420, left: 420 }
  ]).png().toFile(path.join(outDir, 'bodoni_grid.png'));
}).then(() => {
  console.log('Saved bodoni_grid.png');
}).catch(console.error);
