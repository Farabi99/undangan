const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Read traced raw SVG path data
const rawSvg = fs.readFileSync(path.join(outDir, 'traced_raw.svg'), 'utf8');
const match = rawSvg.match(/<path d="([^"]+)"/);
if (!match) throw new Error('Could not extract path data');
const pathData = match[1];

// Let's create the Akad theme emblem and Reception theme emblem:
// Original image dimensions: 985 x 1024
// Let's center it on 1024x1024 viewBox:
// offsetX = (1024 - 985)/2 = 19.5
const offsetX = 19.5;
const offsetY = 0;

function createEmblem(theme = 'akad', { transparentOutside = true } = {}) {
  const isReception = theme === 'reception' || theme === 'silver';
  
  // Theme colors
  const pillFill = isReception ? '#0E1B33' : '#E99CA4';
  const monoFill = isReception ? '#FFFFFF' : '#FAF6F0';
  const shadowColor = isReception ? '#050B14' : '#000000';

  // The stadium capsule dimensions derived from the trace:
  // Outer boundary of white ring: x = 234, y = 89, width = 517, height = 828, rx = 258.5
  // If we fill the capsule with a 15px margin outside the white ring:
  // x = 234 - 15 = 219, y = 89 - 15 = 74, width = 517 + 30 = 547, height = 828 + 30 = 858, rx = 273.5
  const capX = 219 + offsetX;
  const capY = 74;
  const capW = 547;
  const capH = 858;
  const capRx = 273.5;

  const bgRect = transparentOutside 
    ? `<!-- Transparent outside, stadium pill filled -->
       <rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="${capRx}" fill="${pillFill}" filter="url(#dropShadow)"/>`
    : `<!-- Solid full square background -->
       <rect width="1024" height="1024" fill="${pillFill}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${shadowColor}" flood-opacity="0.22"/>
    </filter>
  </defs>

  ${bgRect}

  <!-- Monogram & Stadium Outline from Authentic Source -->
  <g transform="translate(${offsetX}, ${offsetY})" fill="${monoFill}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
}

const svgAkadPill = createEmblem('akad', { transparentOutside: true });
const svgAkadSolid = createEmblem('akad', { transparentOutside: false });
const svgReceptionPill = createEmblem('reception', { transparentOutside: true });
const svgReceptionSolid = createEmblem('reception', { transparentOutside: false });

fs.writeFileSync(path.join(outDir, 'test_akad_pill.svg'), svgAkadPill);
fs.writeFileSync(path.join(outDir, 'test_akad_solid.svg'), svgAkadSolid);
fs.writeFileSync(path.join(outDir, 'test_reception_pill.svg'), svgReceptionPill);
fs.writeFileSync(path.join(outDir, 'test_reception_solid.svg'), svgReceptionSolid);

Promise.all([
  sharp(Buffer.from(svgAkadPill)).resize(400, 400).png().toFile(path.join(outDir, 'test_akad_pill.png')),
  sharp(Buffer.from(svgAkadSolid)).resize(400, 400).png().toFile(path.join(outDir, 'test_akad_solid.png')),
  sharp(Buffer.from(svgReceptionPill)).resize(400, 400).png().toFile(path.join(outDir, 'test_reception_pill.png')),
  sharp(Buffer.from(svgReceptionSolid)).resize(400, 400).png().toFile(path.join(outDir, 'test_reception_solid.png'))
]).then(() => {
  // Side by side comparison with user's original image
  return Promise.all([
    sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/.user_uploaded/media_1794747831495_b619b17a.jpg')
      .resize(360, 360, { fit: 'contain' })
      .toBuffer(),
    sharp(path.join(outDir, 'test_akad_solid.png')).resize(360, 360).toBuffer(),
    sharp(path.join(outDir, 'test_akad_pill.png')).resize(360, 360).toBuffer(),
    sharp(path.join(outDir, 'test_reception_pill.png')).resize(360, 360).toBuffer()
  ]).then(([origBuf, solidBuf, pillBuf, recepBuf]) => {
    return sharp({
      create: {
        width: 1520,
        height: 400,
        channels: 4,
        background: { r: 235, g: 235, b: 235, alpha: 1 }
      }
    }).composite([
      { input: origBuf, top: 20, left: 20 },
      { input: solidBuf, top: 20, left: 400 },
      { input: pillBuf, top: 20, left: 780 },
      { input: recepBuf, top: 20, left: 1160 }
    ]).png().toFile(path.join(outDir, 'authentic_comparison_showcase.png'));
  });
}).then(() => console.log('Saved authentic_comparison_showcase.png')).catch(console.error);
