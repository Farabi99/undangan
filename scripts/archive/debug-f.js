const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

const buf = fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Let's get the glyph and manually flip each command's Y so that:
// Head of F (y=1341) is at the TOP (small Y in SVG)
// Foot of F (y=0) is at the BOTTOM (large Y in SVG)
function getCorrectGlyphPath(char, x, y, size) {
  const glyph = font.charToGlyph(char);
  const scale = size / font.unitsPerEm;
  // In font: cap-height ~ 1350 units
  // We want baseline at y:
  // Foot (font y=0) should be at y
  // Head (font y=1341) should be at y - (1341 * scale)
  // Let's inspect what opentype did:
  // Opentype did: p.moveTo(x + cmd.x * scale, y + -cmd.y * scale);
  // Wait! If cmd.y = 1341, then y + (-1341 * scale) IS y - 1341 * scale!
  // Wait, then why did head end up at the bottom?!
  // LET'S CHECK WHAT CMD.Y ACTUALLY WAS AT THE ARMS!
}

// Let's print EVERY command of F with its description:
const gF = font.charToGlyph('F');
console.log('--- F commands ---');
gF.path.commands.forEach((c, i) => {
  console.log(`[${i}] ${c.type} x=${c.x} y=${c.y}`);
});
