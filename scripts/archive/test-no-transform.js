const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Let's position S and F properly:
// Total height of pill: 450 (from y=25 to y=475)
// Center of pill: (250, 250)

// In Bodoni:
// fontSize = 260
// S bounding box at size 260: height ~ 178, width ~ 115
// F bounding box at size 270: height ~ 180, width ~ 150

// We want:
// S at the top: baseline at y = 245 -> top of S is at 245 - 178 = 67
// F at the bottom: baseline at y = 405 -> top of F is at 405 - 180 = 225, bottom of F is at 405
// Overlap zone: from y = 225 to y = 245 (20px) or more!
// If baseline of S is at y = 265, and baseline of F is at y = 400:
// Top of S is at 265 - 178 = 87
// Bottom of S is at 265
// Top of F is at 400 - 180 = 220
// Bottom of F is at 400
// Overlap zone is from y = 220 to y = 265 (45px overlap: the bottom part of S intertwined with top of F!)
// Monogram spans from y = 87 to y = 400 (total height = 313px, perfectly centered in the 450px pill!)

// Center horizontally:
// S width is ~115 (from 0 to 115). Center of S is x ~ 58. To place at center 250: x = 250 - 58 = 192.
// F stem is at x ~ 15 to 45. Arms extend to x ~ 150.
// If F is placed at x = 195, stem is at x ~ 210 to 240, arms extend to x ~ 340.
// Let's test this!

const pS = font.getPath('S', 192, 265, 260);
const pF = font.getPath('F', 188, 400, 270);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <rect x="115" y="25" width="270" height="450" rx="135" fill="#EB98A6"/>
  <rect x="127" y="37" width="246" height="426" rx="123" fill="none" stroke="white" stroke-width="2.2" opacity="0.95"/>
  <g fill="white">
    ${pF.toSVG()}
    ${pS.toSVG()}
  </g>
</svg>`;

const out = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/no_transform_test.png';
sharp(Buffer.from(svg)).png().toFile(out).then(() => {
  console.log('Saved no_transform_test.png');
}).catch(console.error);
