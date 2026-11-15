const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const pS = font.getPath('S', 0, 0, 240);
const pF = font.getPath('F', 0, 0, 250);

// We want:
// S at the top: from y = 80 to y = 245
// F at the bottom: from y = 225 to y = 395
// Overlap zone: y = 225 to y = 245
// When scaled with scale(1, -1), if we translate(targetX, targetTopY):
// Let's test translate(190, 80) for S and translate(200, 225) for F:

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <rect x="115" y="25" width="270" height="450" rx="135" fill="#EB98A6"/>
  <rect x="127" y="37" width="246" height="426" rx="123" fill="none" stroke="white" stroke-width="2.2" opacity="0.95"/>
  
  <g fill="white">
    <g transform="translate(195, 230) scale(1, -1)">
      ${pF.toSVG()}
    </g>
    <g transform="translate(190, 80) scale(1, -1)">
      ${pS.toSVG()}
    </g>
  </g>
</svg>`;

sharp(Buffer.from(svg)).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/perfect_positioned_test.png')
  .then(() => console.log('Saved perfect_positioned_test.png'))
  .catch(console.error);
