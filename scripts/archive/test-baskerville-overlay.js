const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const fontBuf = fs.readFileSync('C:/Windows/Fonts/BASKVILL.TTF');
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

const fontSizeS = 270;
const fontSizeF = 290;

const pathF = font.getPath('F', 0, 0, fontSizeF);
const pathS = font.getPath('S', 0, 0, fontSizeS);

const svgTest = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect x="85" y="20" width="330" height="460" rx="165" fill="#EFA3AF"/>
  <rect x="98" y="33" width="304" height="434" rx="152" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95"/>

  <!-- Letter F: placed in lower/center region -->
  <g transform="translate(210, 420) scale(1, -1)" fill="#FFFFFF">
    ${pathF.toSVG()}
  </g>

  <!-- Letter S: placed in upper region -->
  <g transform="translate(195, 275) scale(1, -1)" fill="#FFFFFF">
    ${pathS.toSVG()}
  </g>
</svg>`;

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';
fs.writeFileSync(path.join(outDir, 'test_overlay_2.svg'), svgTest);

sharp(Buffer.from(svgTest)).png().toFile(path.join(outDir, 'test_overlay_2.png')).then(() => {
  console.log('Saved test_overlay_2.png');
}).catch(console.error);
