const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const fontBuf = fs.readFileSync('C:/Windows/Fonts/BASKVILL.TTF');
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

// Let's inspect the commands of Baskerville 'S' and 'F'
const glyphS = font.charToGlyph('S');
const glyphF = font.charToGlyph('F');

console.log('Glyph S commands count:', glyphS.path.commands.length);
console.log('Glyph F commands count:', glyphF.path.commands.length);
