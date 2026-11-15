const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// If we generate at y = 0, then flip with scale(1, -1):
const pS = font.getPath('S', 50, 0, 120);
const pF = font.getPath('F', 150, 0, 120);

// In SVG:
// translate(0, 150) scale(1, -1) means:
// y in path -> -y -> 150 - y
// If top of letter had negative y in path (e.g. -80), then 150 - (-80) = 230 (still wrong)!
// WAIT! Look at why:
// If path had y = -80 at the top, then in normal SVG (y down), -80 is ABOVE 0!
// So when rendered at baseline y = 150:
// 150 + (-80) = 70!
// Wait! If 70 is above 150, then y=70 is the top, and y=150 is the bottom!
// Then why did `raw_bodoni_test.png` show the foot at the top?!
// BECAUSE:
// In `raw_bodoni_test.png`, the foot was at y = 0, and the top was at y = -65!
// And in `raw_bodoni_test.png`, baseline was at 150:
// So foot was at 150 - 0 = 150?
// Wait, look at `raw_bodoni_test.png`!
// What is at the top of the 'F' in `raw_bodoni_test.png`?
// A horizontal bar across the whole stem!
// What is at the bottom of the 'F' in `raw_bodoni_test.png`?
// The two arms!
// Wait! In an 'F', does the top have arms or does the bottom have arms?
// THE TOP HAS ARMS!
// In `raw_bodoni_test.png`, the arms were at the BOTTOM!
// That PROVES `raw_bodoni_test.png` was UPSIDE DOWN!
// Why were the arms at the bottom?
// Because the arms have y = 1290 in font units (which is positive y)!
// And opentype made y positive or negative?
// Let's check:
// In `getPath`:
// `L15.82 -62.99` was the top!
// And `L60.79 0` was the foot!
// In SVG: -62.99 is at y = 150 - 62.99 = 87!
// 87 is at the TOP of the image (since SVG y=0 is at top)!
// 150 is at the BOTTOM of the image!
// So y = 87 was at the TOP, and y = 150 was at the BOTTOM!
// BUT in `raw_bodoni_test.png`, the FOOT was at y = 87 and the ARMS were at y = 150!
// Why?
// Let's check which command had `L60.79`!

console.log('Let us check which is foot and which is arm:');
const gF = font.charToGlyph('F');
gF.path.commands.forEach((c, idx) => {
  if (c.y > 1000) console.log('High Y command (y=' + c.y + '):', c.type, c.x, c.y);
  if (c.y < 100 && c.y >= 0) console.log('Low Y command (y=' + c.y + '):', c.type, c.x, c.y);
});
