const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bufR = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const fontR = opentype.parse(bufR.buffer.slice(bufR.byteOffset, bufR.byteOffset + bufR.byteLength));

const bufB = fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF');
const fontB = opentype.parse(bufB.buffer.slice(bufB.byteOffset, bufB.byteOffset + bufB.byteLength));

function buildIntertwinedMonogram(font, {
  fontSizeS = 220,
  fontSizeF = 240,
  sX = 188,
  sY = 235,
  fX = 202,
  fY = 395,
  weave = 's-front',
  gap = 5,
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

  const pathS = font.getPath('S', 0, 0, fontSizeS);
  const pathF = font.getPath('F', 0, 0, fontSizeF);

  let glyphsSvg = '';

  if (weave === 's-front') {
    glyphsSvg = `
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}">
        ${pathS.toSVG()}
      </g>
    `;
  } else if (weave === 'f-front') {
    glyphsSvg = `
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}">
        ${pathS.toSVG()}
      </g>
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
    `;
  } else if (weave === 'weave-gap') {
    glyphsSvg = `
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}">
        ${pathF.toSVG()}
      </g>
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathS.toSVG()}
      </g>
    `;
  } else if (weave === 'true-intertwined') {
    glyphsSvg = `
      <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}">
        ${pathS.toSVG()}
      </g>
      <g transform="translate(${fX}, ${fY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
        ${pathF.toSVG()}
      </g>
      <g clip-path="url(#leftHalfClip)">
        <g transform="translate(${sX}, ${sY}) scale(1, -1)" fill="${monoFill}" stroke="${gapStroke}" stroke-width="${gap}" stroke-linejoin="round" paint-order="stroke fill">
          ${pathS.toSVG()}
        </g>
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="emblemShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
    <clipPath id="leftHalfClip">
      <rect x="0" y="200" width="225" height="150"/>
    </clipPath>
  </defs>

  <!-- Capsule -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="${pillFill}" filter="url(#emblemShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="${innerStroke}" stroke-width="2.2" opacity="0.95"/>

  <!-- Glyphs -->
  ${glyphsSvg}
</svg>`;
}

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

const opt1 = buildIntertwinedMonogram(fontR, { fontSizeS: 225, fontSizeF: 235, sX: 188, sY: 235, fX: 202, fY: 395, weave: 's-front' });
const opt2 = buildIntertwinedMonogram(fontR, { fontSizeS: 225, fontSizeF: 235, sX: 188, sY: 235, fX: 202, fY: 395, weave: 'weave-gap', gap: 5 });
const opt3 = buildIntertwinedMonogram(fontB, { fontSizeS: 225, fontSizeF: 235, sX: 190, sY: 235, fX: 202, fY: 395, weave: 's-front' });
const opt4 = buildIntertwinedMonogram(fontB, { fontSizeS: 225, fontSizeF: 235, sX: 190, sY: 235, fX: 202, fY: 395, weave: 'weave-gap', gap: 5 });
const opt5 = buildIntertwinedMonogram(fontR, { fontSizeS: 225, fontSizeF: 235, sX: 188, sY: 235, fX: 202, fY: 395, weave: 'true-intertwined', gap: 5 });
const opt6 = buildIntertwinedMonogram(fontB, { fontSizeS: 225, fontSizeF: 235, sX: 190, sY: 235, fX: 202, fY: 395, weave: 'true-intertwined', gap: 5 });

fs.writeFileSync(path.join(outDir, 'bodoni_opt1.svg'), opt1);
fs.writeFileSync(path.join(outDir, 'bodoni_opt2.svg'), opt2);
fs.writeFileSync(path.join(outDir, 'bodoni_opt3.svg'), opt3);
fs.writeFileSync(path.join(outDir, 'bodoni_opt4.svg'), opt4);
fs.writeFileSync(path.join(outDir, 'bodoni_opt5.svg'), opt5);
fs.writeFileSync(path.join(outDir, 'bodoni_opt6.svg'), opt6);

Promise.all([
  sharp(Buffer.from(opt1)).resize(300, 300).png().toBuffer(),
  sharp(Buffer.from(opt2)).resize(300, 300).png().toBuffer(),
  sharp(Buffer.from(opt3)).resize(300, 300).png().toBuffer(),
  sharp(Buffer.from(opt4)).resize(300, 300).png().toBuffer(),
  sharp(Buffer.from(opt5)).resize(300, 300).png().toBuffer(),
  sharp(Buffer.from(opt6)).resize(300, 300).png().toBuffer(),
  sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/cropped_logo.png')
    .resize(300, 300, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer()
]).then(([b1, b2, b3, b4, b5, b6, bPhoto]) => {
  return sharp({
    create: {
      width: 1240,
      height: 620,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 }
    }
  }).composite([
    { input: bPhoto, top: 10, left: 10 },
    { input: b1, top: 10, left: 320 },
    { input: b2, top: 10, left: 630 },
    { input: b5, top: 10, left: 940 },
    { input: bPhoto, top: 320, left: 10 },
    { input: b3, top: 320, left: 320 },
    { input: b4, top: 320, left: 630 },
    { input: b6, top: 320, left: 940 }
  ]).png().toFile(path.join(outDir, 'bodoni_showcase.png'));
}).then(() => console.log('Saved bodoni_showcase.png')).catch(console.error);
