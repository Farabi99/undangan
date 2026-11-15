const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Let's get the paths at origin (0, 0)
const pS = font.getPath('S', 0, 0, 200);
const pF = font.getPath('F', 0, 0, 200);

// If we flip Y with scale(1, -1):
// Let's test what transform makes it identical to SVG <text>!
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <rect width="600" height="400" fill="white"/>
  
  <!-- Left: Real SVG Text -->
  <text x="80" y="260" font-family="Bodoni MT" font-size="200" fill="black">S</text>
  <text x="220" y="260" font-family="Bodoni MT" font-size="200" fill="black">F</text>
  
  <!-- Right: opentype path with correct transform -->
  <g transform="translate(380, 260) scale(1, -1)">
    ${pS.toSVG()}
  </g>
  <g transform="translate(480, 260) scale(1, -1)">
    ${pF.toSVG()}
  </g>
</svg>`;

sharp(Buffer.from(svg)).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/perfect_flip_check.png')
  .then(() => console.log('Saved perfect_flip_check.png'))
  .catch(console.error);
