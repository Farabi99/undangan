const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const pS = font.getPath('S', 50, 150, 120);
const pF = font.getPath('F', 150, 150, 120);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="white"/>${pS.toSVG()}${pF.toSVG()}</svg>`;

sharp(Buffer.from(svg)).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_bodoni_test.png')
  .then(() => console.log('Saved raw_bodoni_test.png'))
  .catch(console.error);
