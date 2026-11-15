const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'img', 'test-logo-options');
fs.mkdirSync(outDir, { recursive: true });

// Approach 1: Diagonal Interlocking Monogram (High Legibility & Woven 3D Depth)
function getSvgDiagonal(theme) {
  const isSilver = theme === 'silver';
  const fColor = '#FFFFFF';
  const sGradId = isSilver ? 'sGradSilver' : 'sGradGold';
  const bgRing = isSilver ? 'rgba(226, 232, 240, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  const dotRing = isSilver ? 'rgba(203, 213, 225, 0.65)' : 'rgba(212, 185, 110, 0.75)';
  const knockoutStroke = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="monogramGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <linearGradient id="sGradSilver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F1F5F9"/>
      <stop offset="70%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="sGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7"/>
      <stop offset="35%" stop-color="#EEDCB0"/>
      <stop offset="100%" stop-color="#C5A850"/>
    </linearGradient>
  </defs>

  <!-- Luxury Ring Cartouche -->
  <circle cx="250" cy="250" r="234" fill="none" stroke="${bgRing}" stroke-width="2.2" filter="url(#monogramGlow)"/>
  <circle cx="250" cy="250" r="224" fill="none" stroke="${dotRing}" stroke-width="1.2" stroke-dasharray="3.5 4.5"/>

  <!-- North/South Diamond Stars -->
  <g fill="${bgRing}" filter="url(#monogramGlow)">
    <path d="M 250 8 L 253.5 17 L 262 20.5 L 253.5 24 L 250 33 L 246.5 24 L 238 20.5 L 246.5 17 Z"/>
    <path d="M 250 467 L 253.5 476 L 262 479.5 L 253.5 483 L 250 492 L 246.5 483 L 238 479.5 L 246.5 476 Z"/>
  </g>
  <circle cx="16" cy="250" r="3.5" fill="${dotRing}"/>
  <circle cx="484" cy="250" r="3.5" fill="${dotRing}"/>

  <!-- MONOGRAM GLYPHS -->
  <g filter="url(#monogramGlow)">

    <!-- LETTER F (Crisp Roman Serif, Left Center: stem at x=175..205) -->
    <path id="stemF" d="
      M 145 115 
      L 295 115 
      L 295 155 
      L 278 155 
      C 275 138, 265 132, 240 132 
      L 210 132 
      L 210 230 
      L 262 230 
      C 275 230, 280 225, 282 215 
      L 292 215 
      L 292 262 
      L 282 262 
      C 280 250, 275 246, 262 246 
      L 210 246 
      L 210 348 
      C 210 368, 218 373, 240 375 
      L 240 388 
      L 135 388 
      L 135 375 
      C 158 373, 166 368, 166 348 
      L 166 155 
      C 166 135, 158 130, 135 128 
      L 135 115 
      Z" 
      fill="${fColor}"/>

    <!-- Knockout gap around S (so S cuts cleanly through F's crossbar with 3D depth) -->
    <path d="
      M 345 180 
      C 345 142, 318 122, 280 122 
      C 240 122, 222 142, 222 168 
      C 222 195, 244 212, 280 230 
      C 328 254, 358 278, 358 322 
      C 358 368, 318 395, 265 395 
      C 222 395, 190 372, 180 335 
      L 206 326 
      C 214 354, 235 372, 268 372 
      C 308 372, 332 350, 332 320 
      C 332 288, 308 268, 268 248 
      C 222 224, 196 202, 196 166 
      C 196 128, 232 104, 280 104 
      C 320 104, 348 122, 360 155 
      Z"
      fill="none" 
      stroke="${knockoutStroke}" 
      stroke-width="9" 
      stroke-linejoin="round"/>

    <!-- LETTER S (Sensual Didone Curves, Right Center: spine at x=280..310) -->
    <path id="glyphS" d="
      M 345 180 
      C 345 142, 318 122, 280 122 
      C 240 122, 222 142, 222 168 
      C 222 195, 244 212, 280 230 
      C 328 254, 358 278, 358 322 
      C 358 368, 318 395, 265 395 
      C 222 395, 190 372, 180 335 
      L 206 326 
      C 214 354, 235 372, 268 372 
      C 308 372, 332 350, 332 320 
      C 332 288, 308 268, 268 248 
      C 222 224, 196 202, 196 166 
      C 196 128, 232 104, 280 104 
      C 320 104, 348 122, 360 155 
      Z" 
      fill="url(#${sGradId})" 
      stroke="${knockoutStroke}" 
      stroke-width="1"/>

    <!-- Distinct Teardrop Ball Finials on S -->
    <circle cx="356" cy="166" r="8" fill="${fColor}" stroke="${knockoutStroke}" stroke-width="1"/>
    <circle cx="192" cy="340" r="8" fill="url(#${sGradId})" stroke="${knockoutStroke}" stroke-width="1"/>

  </g>
</svg>`;
}

// Approach 2: Side-by-Side Intertwined with Romantic Ampersand & Floral Laurel
function getSvgSideBySide(theme) {
  const isSilver = theme === 'silver';
  const fColor = '#FFFFFF';
  const sColor = isSilver ? 'url(#sGradSilver)' : 'url(#sGradGold)';
  const sGradId = isSilver ? 'sGradSilver' : 'sGradGold';
  const bgRing = isSilver ? 'rgba(226, 232, 240, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  const innerDotColor = isSilver ? 'rgba(203, 213, 225, 0.65)' : 'rgba(212, 185, 110, 0.75)';
  const strokeGap = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="monogramGlow2" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <linearGradient id="sGradSilver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F1F5F9"/>
      <stop offset="70%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="sGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7"/>
      <stop offset="35%" stop-color="#EEDCB0"/>
      <stop offset="100%" stop-color="#C5A850"/>
    </linearGradient>
  </defs>

  <!-- Luxury Ring Cartouche -->
  <circle cx="250" cy="250" r="234" fill="none" stroke="${bgRing}" stroke-width="2.2" filter="url(#monogramGlow2)"/>
  <circle cx="250" cy="250" r="224" fill="none" stroke="${innerDotColor}" stroke-width="1.2" stroke-dasharray="3.5 4.5"/>

  <!-- Star Accents -->
  <g fill="${bgRing}" filter="url(#monogramGlow2)">
    <path d="M 250 8 L 253.5 17 L 262 20.5 L 253.5 24 L 250 33 L 246.5 24 L 238 20.5 L 246.5 17 Z"/>
    <path d="M 250 467 L 253.5 476 L 262 479.5 L 253.5 483 L 250 492 L 246.5 483 L 238 479.5 L 246.5 476 Z"/>
  </g>
  <circle cx="16" cy="250" r="3.5" fill="${innerDotColor}"/>
  <circle cx="484" cy="250" r="3.5" fill="${innerDotColor}"/>

  <!-- MONOGRAM GLYPHS -->
  <g filter="url(#monogramGlow2)">

    <!-- LETTER F (Left Side: x=110 to x=240, completely unobstructed) -->
    <path d="
      M 115 130 
      L 245 130 
      L 245 168 
      L 230 168 
      C 227 152, 218 146, 198 146 
      L 174 146 
      L 174 230 
      L 218 230 
      C 230 230, 234 225, 236 215 
      L 246 215 
      L 246 258 
      L 236 258 
      C 234 248, 230 244, 218 244 
      L 174 244 
      L 174 345 
      C 174 365, 180 370, 200 372 
      L 200 385 
      L 105 385 
      L 105 372 
      C 125 370, 132 365, 132 345 
      L 132 165 
      C 132 145, 125 140, 105 138 
      L 105 130 
      Z" 
      fill="${fColor}"
      stroke="${strokeGap}"
      stroke-width="1"/>

    <!-- Intertwined Calligraphic Ampersand in the center (&) -->
    <path d="
      M 264 265 
      C 255 245, 235 210, 248 190 
      C 256 178, 270 178, 276 188 
      C 282 198, 274 212, 260 230 
      L 225 285 
      C 214 302, 210 318, 218 330 
      C 228 345, 252 345, 272 328 
      C 282 318, 290 305, 298 290 
      L 306 295 
      C 295 315, 282 334, 268 346 
      C 246 364, 218 362, 204 340 
      C 194 322, 198 300, 212 280 
      L 246 226 
      C 258 208, 262 195, 256 185 
      C 250 175, 240 176, 234 186 
      C 224 202, 240 235, 252 258 
      Z"
      fill="${innerDotColor}"
      opacity="0.9"/>

    <!-- LETTER S (Right Side: x=260 to x=390, completely unobstructed) -->
    <path d="
      M 385 190 
      C 385 152, 358 130, 320 130 
      C 280 130, 260 152, 260 178 
      C 260 205, 282 222, 318 240 
      C 366 264, 396 288, 396 332 
      C 396 378, 356 405, 305 405 
      C 262 405, 230 382, 220 345 
      L 246 336 
      C 254 364, 275 382, 308 382 
      C 348 382, 370 360, 370 330 
      C 370 298, 346 278, 308 258 
      C 262 234, 236 212, 236 176 
      C 236 138, 272 112, 320 112 
      C 360 112, 388 132, 400 168 
      Z" 
      fill="${sColor}" 
      stroke="${strokeGap}" 
      stroke-width="1"/>

    <!-- S Terminals -->
    <circle cx="396" cy="176" r="8" fill="${fColor}" stroke="${strokeGap}" stroke-width="1"/>
    <circle cx="232" cy="350" r="8" fill="${sColor}" stroke="${strokeGap}" stroke-width="1"/>

  </g>
</svg>`;
}

async function buildAll() {
  // Option 1
  fs.writeFileSync(path.join(outDir, 'option1-diagonal-silver.svg'), getSvgDiagonal('silver'));
  fs.writeFileSync(path.join(outDir, 'option1-diagonal-gold.svg'), getSvgDiagonal('gold'));

  // Option 2
  fs.writeFileSync(path.join(outDir, 'option2-sidebyside-silver.svg'), getSvgSideBySide('silver'));
  fs.writeFileSync(path.join(outDir, 'option2-sidebyside-gold.svg'), getSvgSideBySide('gold'));

  // Render PNG previews on navy and sage backgrounds
  const navyBg = Buffer.from('<svg width="500" height="500"><rect width="500" height="500" fill="#080E1C"/></svg>');
  const sageBg = Buffer.from('<svg width="500" height="500"><rect width="500" height="500" fill="#7E836C"/></svg>');

  await sharp(Buffer.from(getSvgDiagonal('silver')))
    .composite([{ input: navyBg, blend: 'dest-over' }])
    .png()
    .toFile(path.join(outDir, 'option1-diagonal-silver-preview.png'));

  await sharp(Buffer.from(getSvgSideBySide('silver')))
    .composite([{ input: navyBg, blend: 'dest-over' }])
    .png()
    .toFile(path.join(outDir, 'option2-sidebyside-silver-preview.png'));

  console.log('Both options generated and rendered successfully!');
}

buildAll().catch(console.error);

