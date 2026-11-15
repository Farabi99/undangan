const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

function renderBodoniEmblem(font, {
  fontSizeS = 250,
  fontSizeF = 260,
  sX = 195,
  sY = 75,
  fX = 200,
  fY = 228,
  gap = 4.0,
  theme = 'rose',
  weaveStyle = 'gap' // 'gap', 'intertwine'
}) {
  const isNavy = theme === 'navy' || theme === 'silver';
  const pillFill = isNavy ? '#0E1B33' : '#EB98A6';
  const innerStroke = isNavy ? '#E2E8F0' : '#FFFFFF';
  const monoFill = '#FFFFFF';
  const gapStroke = pillFill;

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

  const pathS = font.getPath('S', 0, 0, fontSizeS);
  const pathF = font.getPath('F', 0, 0, fontSizeF);

  let monogramMarkup = '';

  if (weaveStyle === 'gap') {
    // F base layer, S in foreground with cutout gap stroke
    monogramMarkup = `
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
    `;
  } else if (weaveStyle === 'intertwine') {
    // True weave:
    // F is base
    // S lower curve is in front of F stem
    // F top-right arm is in front of S
    monogramMarkup = `
      <defs>
        <clipPath id="fTopArmClip">
          <rect x="235" y="220" width="130" height="70"/>
        </clipPath>
      </defs>
      <!-- Base F -->
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <!-- S with cutout gap over F stem -->
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
      <!-- F top-right arm comes in front of S with gap stroke -->
      <g clip-path="url(#fTopArmClip)">
        <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
          ${pathF.toSVG()}
        </g>
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="${isNavy ? '#050B14' : '#000000'}" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <!-- Monogram -->
  <g id="monogram">
    ${monogramMarkup}
  </g>
</svg>`;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Test 1: Bodoni Regular, gap weave, sX=192, fX=198, overlap depth ~ 30px
const m1 = renderBodoniEmblem(fontR, { fontSizeS: 245, fontSizeF: 255, sX: 192, sY: 75, fX: 198, fY: 228, gap: 4.0, weaveStyle: 'gap' });
// Test 2: Bodoni Regular, true intertwine
const m2 = renderBodoniEmblem(fontR, { fontSizeS: 245, fontSizeF: 255, sX: 192, sY: 75, fX: 198, fY: 228, gap: 4.0, weaveStyle: 'intertwine' });
// Test 3: Bodoni Bold, gap weave
const m3 = renderBodoniEmblem(fontB, { fontSizeS: 245, fontSizeF: 255, sX: 192, sY: 75, fX: 198, fY: 228, gap: 4.5, weaveStyle: 'gap' });
// Test 4: Bodoni Regular, deeper overlap (sY=70, fY=218)
const m4 = renderBodoniEmblem(fontR, { fontSizeS: 255, fontSizeF: 265, sX: 190, sY: 70, fX: 196, fY: 218, gap: 4.2, weaveStyle: 'gap' });

fs.writeFileSync(path.join(outDir, 'real_bodoni_m1.svg'), m1);
fs.writeFileSync(path.join(outDir, 'real_bodoni_m2.svg'), m2);
fs.writeFileSync(path.join(outDir, 'real_bodoni_m3.svg'), m3);
fs.writeFileSync(path.join(outDir, 'real_bodoni_m4.svg'), m4);

Promise.all([
  sharp(Buffer.from(m1)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(m2)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(m3)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(m4)).resize(380, 380).png().toBuffer(),
  sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/cropped_logo.png')
    .resize(380, 380, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer()
]).then(([b1, b2, b3, b4, bPhoto]) => {
  return sharp({
    create: {
      width: 1200,
      height: 780,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 }
    }
  }).composite([
    { input: bPhoto, top: 10, left: 10 },
    { input: b1, top: 10, left: 410 },
    { input: b2, top: 10, left: 810 },
    { input: bPhoto, top: 395, left: 10 },
    { input: b3, top: 395, left: 410 },
    { input: b4, top: 395, left: 810 }
  ]).png().toFile(path.join(outDir, 'real_bodoni_side_by_side.png'));
}).then(() => console.log('Saved real_bodoni_side_by_side.png')).catch(console.error);
