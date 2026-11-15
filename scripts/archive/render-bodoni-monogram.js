const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

/**
 * Creates the exact Bodoni monogram requested by the user:
 * - Font: Bodoni (Bodoni MT)
 * - S on top of F
 * - The bottom part of the S intertwined with the top of the F
 * - Inside the elegant stadium / pill capsule with concentric white inner border
 */
function generateBodoniEmblem({
  font = fontR,
  fontSizeS = 245,
  fontSizeF = 255,
  sX = 188,
  sY = 245,   // Baseline of S: top of S will be at ~ 245 - 170 = 75, bottom at ~ 245
  fX = 202,
  fY = 398,   // Baseline of F: top of F will be at ~ 398 - 170 = 228, bottom at ~ 398
  gap = 4.5,
  theme = 'rose'
} = {}) {
  const isNavy = theme === 'navy' || theme === 'silver';
  const pillFill = isNavy ? '#0E1B33' : '#EB98A6';
  const innerStroke = isNavy ? '#E2E8F0' : '#FFFFFF';
  const monoFill = '#FFFFFF';
  const gapStroke = pillFill;

  // 500x500 box, capsule centered at (250, 250)
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

  // Generate paths directly at their exact SVG coordinates
  const pathS = font.getPath('S', sX, sY, fontSizeS);
  const pathF = font.getPath('F', fX, fY, fontSizeF);

  // For intertwining:
  // S sits on top of F. Where S overlaps F, a subtle negative-space cutout gap
  // separates them cleanly and luxuriously.
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="${isNavy ? '#050B14' : '#000000'}" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Outer Stadium / Pill Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>

  <!-- Concentric Inner Outline -->
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <!-- MONOGRAM: S on top of F, intertwined -->
  <g id="monogram">
    <!-- Letter F (Base layer) -->
    <g fill="${monoFill}">
      ${pathF.toSVG()}
    </g>

    <!-- Letter S with negative-space intertwining cutout stroke -->
    <g fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
      ${pathS.toSVG()}
    </g>
  </g>
</svg>`;

  return svg;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's test a few fine-tuning variations:
// V1: Bodoni Regular with gap 4.5
const v1 = generateBodoniEmblem({ font: fontR, fontSizeS: 240, fontSizeF: 250, sX: 188, sY: 245, fX: 202, fY: 395, gap: 4.5 });
// V2: Bodoni Regular slightly tighter overlap (sY=255, fY=390)
const v2 = generateBodoniEmblem({ font: fontR, fontSizeS: 245, fontSizeF: 255, sX: 186, sY: 252, fX: 200, fY: 392, gap: 4.5 });
// V3: Bodoni Bold (sY=250, fY=395)
const v3 = generateBodoniEmblem({ font: fontB, fontSizeS: 240, fontSizeF: 250, sX: 188, sY: 248, fX: 202, fY: 395, gap: 5 });
// V4: Bodoni Regular, Navy theme
const v4 = generateBodoniEmblem({ font: fontR, fontSizeS: 245, fontSizeF: 255, sX: 186, sY: 252, fX: 200, fY: 392, gap: 4.5, theme: 'navy' });

fs.writeFileSync(path.join(outDir, 'bodoni_v1.svg'), v1);
fs.writeFileSync(path.join(outDir, 'bodoni_v2.svg'), v2);
fs.writeFileSync(path.join(outDir, 'bodoni_v3.svg'), v3);
fs.writeFileSync(path.join(outDir, 'bodoni_v4.svg'), v4);

Promise.all([
  sharp(Buffer.from(v1)).resize(360, 360).png().toBuffer(),
  sharp(Buffer.from(v2)).resize(360, 360).png().toBuffer(),
  sharp(Buffer.from(v3)).resize(360, 360).png().toBuffer(),
  sharp(Buffer.from(v4)).resize(360, 360).png().toBuffer(),
  sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/cropped_logo.png')
    .resize(360, 360, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer()
]).then(([b1, b2, b3, b4, bPhoto]) => {
  return sharp({
    create: {
      width: 1120,
      height: 740,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 }
    }
  }).composite([
    { input: bPhoto, top: 10, left: 10 },
    { input: b1, top: 10, left: 380 },
    { input: b2, top: 10, left: 750 },
    { input: bPhoto, top: 375, left: 10 },
    { input: b3, top: 375, left: 380 },
    { input: b4, top: 375, left: 750 }
  ]).png().toFile(path.join(outDir, 'bodoni_refined_grid.png'));
}).then(() => console.log('Saved bodoni_refined_grid.png')).catch(console.error);
