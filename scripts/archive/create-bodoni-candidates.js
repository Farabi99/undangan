const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

/**
 * Creates the Bodoni Monogram Emblem:
 * - Bodoni font (BOD_R.TTF / BOD_B.TTF)
 * - S on top of F
 * - Bottom part of S intertwined with top of F
 * - Pill capsule in soft dusty rose (or nocturnal navy for reception)
 * - Concentric white inner border
 */
function createBodoniMonogramSvg({
  font = fontR,
  fontSize = 240,
  sX = 188,
  sY = 248,     // Baseline of S: top of S at ~ 90, bottom of S at ~ 248
  fX = 198,
  fY = 405,     // Baseline of F: top of F at ~ 245, bottom of F at ~ 405
  gap = 4.5,
  weaveType = 's-over-f-gap', // 's-over-f-gap', 'intertwined-weave'
  theme = 'rose'
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

  const pathS = font.getPath('S', sX, sY, fontSize);
  const pathF = font.getPath('F', fX, fY, fontSize);

  let glyphsMarkup = '';

  if (weaveType === 's-over-f-gap') {
    // F base layer, S in front with gap stroke
    glyphsMarkup = `
      <g fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <g fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
    `;
  } else if (weaveType === 'f-over-s-gap') {
    // S base layer, F in front with gap stroke
    glyphsMarkup = `
      <g fill="${monoFill}">
        ${pathS.toSVG()}
      </g>
      <g fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathF.toSVG()}
      </g>
    `;
  } else if (weaveType === 'intertwined-weave') {
    // True intertwine: F's top arm is in front of S, but S's bottom curve is in front of F's stem!
    // Clip the right half of F (top arm) to sit on top of S:
    glyphsMarkup = `
      <!-- Base F -->
      <g fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <!-- S with gap stroke over F's stem -->
      <g fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
      <!-- F top-right arm clipped on top of S with gap stroke -->
      <g clip-path="url(#armClip)">
        <g fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
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
    <clipPath id="armClip">
      <rect x="235" y="220" width="120" height="70"/>
    </clipPath>
  </defs>

  <!-- Outer Stadium / Pill Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>

  <!-- Concentric Inner Outline -->
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <!-- Monogram Glyphs -->
  <g id="monogram">
    ${glyphsMarkup}
  </g>
</svg>`;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's create candidate renderings:
// 1. Bodoni Regular with s-over-f gap
const t1 = createBodoniMonogramSvg({ font: fontR, fontSize: 245, sX: 188, sY: 246, fX: 198, fY: 402, gap: 4.5, weaveType: 's-over-f-gap' });
// 2. Bodoni Regular with true intertwined weave
const t2 = createBodoniMonogramSvg({ font: fontR, fontSize: 245, sX: 188, sY: 246, fX: 198, fY: 402, gap: 4.5, weaveType: 'intertwined-weave' });
// 3. Bodoni Bold with s-over-f gap
const t3 = createBodoniMonogramSvg({ font: fontB, fontSize: 245, sX: 188, sY: 246, fX: 198, fY: 402, gap: 5, weaveType: 's-over-f-gap' });
// 4. Bodoni Bold with true intertwined weave
const t4 = createBodoniMonogramSvg({ font: fontB, fontSize: 245, sX: 188, sY: 246, fX: 198, fY: 402, gap: 5, weaveType: 'intertwined-weave' });

fs.writeFileSync(path.join(outDir, 'bodoni_candidate_1.svg'), t1);
fs.writeFileSync(path.join(outDir, 'bodoni_candidate_2.svg'), t2);
fs.writeFileSync(path.join(outDir, 'bodoni_candidate_3.svg'), t3);
fs.writeFileSync(path.join(outDir, 'bodoni_candidate_4.svg'), t4);

Promise.all([
  sharp(Buffer.from(t1)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(t2)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(t3)).resize(380, 380).png().toBuffer(),
  sharp(Buffer.from(t4)).resize(380, 380).png().toBuffer()
]).then(([b1, b2, b3, b4]) => {
  return sharp({
    create: {
      width: 780,
      height: 780,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 }
    }
  }).composite([
    { input: b1, top: 10, left: 10 },
    { input: b2, top: 10, left: 400 },
    { input: b3, top: 400, left: 10 },
    { input: b4, top: 400, left: 400 }
  ]).png().toFile(path.join(outDir, 'bodoni_candidates_grid.png'));
}).then(() => console.log('Saved bodoni_candidates_grid.png')).catch(console.error);
