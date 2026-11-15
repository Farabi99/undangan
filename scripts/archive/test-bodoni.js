const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const bodoniR = opentype.parse(fs.readFileSync('C:/Windows/Fonts/BOD_R.TTF').buffer);
const bodoniB = opentype.parse(fs.readFileSync('C:/Windows/Fonts/BOD_B.TTF').buffer);

// Let's create an SVG that renders Bodoni MT 'S' and 'F'
// In opentype: to make glyphs render correctly in SVG (since opentype Y points up):
// We can invert Y and position them!
// Let's test a few vertical overlaps:
// S on top, F below it, with the bottom part of S overlapping the top part of F!

function renderTest(font, fontSize, sOffsetY, fOffsetY, name) {
  // Let's get the SVG paths
  const glyphS = font.charToGlyph('S');
  const glyphF = font.charToGlyph('F');

  // Let's get path at (0, 0)
  const pathS = font.getPath('S', 0, 0, fontSize);
  const pathF = font.getPath('F', 0, 0, fontSize);

  // In Bodoni:
  // F stem is on the left of F's bounding box.
  // S is centered.
  // To center both S and F horizontally:
  // S width at fontSize ~ fontSize * 0.6
  // F width at fontSize ~ fontSize * 0.55
  // We want F's vertical stem to align with the center or slightly left of center!
  
  return `
    <g transform="translate(180, ${fOffsetY}) scale(1, -1)">
      ${pathF.toSVG()}
    </g>
    <g transform="translate(180, ${sOffsetY}) scale(1, -1)">
      ${pathS.toSVG()}
    </g>
  `;
}

// Let's test font paths in a test script
console.log('Ready to test Bodoni');
