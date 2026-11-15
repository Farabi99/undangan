const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

function testPlacement(font, {
  fontSizeS,
  fontSizeF,
  sX,
  sY,
  fX,
  fY,
  gap = 4.5,
  name
}) {
  const pillFill = '#EB98A6';
  const innerStroke = '#FFFFFF';
  const monoFill = '#FFFFFF';

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

  const pathS = font.getPath('S', sX, sY, fontSizeS);
  const pathF = font.getPath('F', fX, fY, fontSizeF);

  // Intertwined:
  // Base F in crisp white
  // S in crisp white with a delicate cutout gap where it passes over F's stem
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <g id="monogram">
    <!-- F base layer -->
    <g fill="${monoFill}">
      ${pathF.toSVG()}
    </g>

    <!-- S with gap stroke so it weaves cleanly over F's top -->
    <g fill="${monoFill}" stroke="${pillFill}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
      ${pathS.toSVG()}
    </g>
  </g>
</svg>`;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's test 4 precise alignment variants:
// In Bodoni:
// F has its stem at x ~ fX + 15 to fX + 45.
// If fX = 180, stem is at x = 195 to 225.
// S has its left curve at x ~ sX + 10, center spine at x ~ sX + 60, right curve at x ~ sX + 110.
// If sX = 175, S left curve is at 185, right curve is at 285.
// F's stem at 210 is nicely in the middle of S!
// Top of S: baseline at sY = 225 -> top at ~ 225 - 165 = 60
// Bottom of S: at 225
// Top of F: baseline at fY = 390 -> top at ~ 390 - 165 = 225
// Bottom of F: at 390

const a1 = testPlacement(fontR, { fontSizeS: 230, fontSizeF: 240, sX: 175, sY: 230, fX: 180, fY: 395, gap: 4.5, name: 'a1' });
const a2 = testPlacement(fontR, { fontSizeS: 240, fontSizeF: 250, sX: 172, sY: 235, fX: 178, fY: 400, gap: 4.5, name: 'a2' });
const a3 = testPlacement(fontB, { fontSizeS: 230, fontSizeF: 240, sX: 175, sY: 230, fX: 180, fY: 395, gap: 5.0, name: 'a3' });
const a4 = testPlacement(fontB, { fontSizeS: 240, fontSizeF: 250, sX: 172, sY: 235, fX: 178, fY: 400, gap: 5.0, name: 'a4' });

fs.writeFileSync(path.join(outDir, 'align_a1.svg'), a1);
fs.writeFileSync(path.join(outDir, 'align_a2.svg'), a2);
fs.writeFileSync(path.join(outDir, 'align_a3.svg'), a3);
fs.writeFileSync(path.join(outDir, 'align_a4.svg'), a4);

Promise.all([
  sharp(Buffer.from(a1)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(a2)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(a3)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(a4)).resize(380, 380).png().toBuffer(),
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
  ]).png().toFile(path.join(outDir, 'bodoni_perfect_alignment.png'));
}).then(() => console.log('Saved bodoni_perfect_alignment.png')).catch(console.error);
