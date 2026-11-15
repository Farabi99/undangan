const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const fonts = [
  { name: 'Baskerville', file: 'C:/Windows/Fonts/BASKVILL.TTF' },
  { name: 'Bodoni', file: 'C:/Windows/Fonts/BOD_R.TTF' },
  { name: 'Garamond', file: 'C:/Windows/Fonts/GARA.TTF' }
];

let svgs = fonts.map((f, i) => {
  const buf = fs.readFileSync(f.file);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const pS = font.getPath('S', i * 260 + 40, 200, 180);
  const pF = font.getPath('F', i * 260 + 130, 200, 180);
  return '<g fill="#333"><text x="' + (i*260+40) + '" y="40" font-size="20" font-family="sans-serif">' + f.name + '</text>' + pS.toSVG() + pF.toSVG() + '</g>';
}).join('');

const fullSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="260" viewBox="0 0 800 260"><rect width="800" height="260" fill="white"/>' + svgs + '</svg>';

sharp(Buffer.from(fullSvg)).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/font_comparison.png')
  .then(() => console.log('Saved font_comparison.png'))
  .catch(console.error);
