const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

// Load Baskerville font
const fontBuf = fs.readFileSync('C:/Windows/Fonts/BASKVILL.TTF');
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

function generateMonogramSvg({
  pillFill = '#EFA3AF',
  innerBorder = '#FFFFFF',
  textColor = '#FFFFFF'
} = {}) {
  // Pill dimensions: 500x500 box
  // Pill: 330w x 460h, rx=165
  // Inner: 304w x 434h, rx=152, stroke 2.5
  
  // We can construct the custom paths for S, F, and loop
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Outer Stadium / Pill -->
  <rect x="85" y="20" width="330" height="460" rx="165" fill="${pillFill}" filter="url(#softShadow)"/>

  <!-- Inset Border Line -->
  <rect x="98" y="33" width="304" height="434" rx="152" fill="none" stroke="${innerBorder}" stroke-width="2.5" opacity="0.95"/>

  <!-- MONOGRAM: S and F with loop -->
  <g fill="${textColor}">
    <!-- Temporary test markup -->
  </g>
</svg>`;
}

console.log('Script template ready');
