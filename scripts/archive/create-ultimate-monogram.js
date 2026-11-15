const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'img', 'test-logo-options');

function createUltimateMonogram(theme) {
  const isSilver = theme === 'silver';
  const fColor = '#FFFFFF';
  const sGradId = isSilver ? 'sGradSilver' : 'sGradGold';
  const bgRing = isSilver ? 'rgba(226, 232, 240, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  const innerDotColor = isSilver ? 'rgba(203, 213, 225, 0.65)' : 'rgba(212, 185, 110, 0.75)';
  const strokeGap = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="monogramDepth" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.55"/>
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
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${isSilver ? '#FFFFFF' : '#FFFDF7'}"/>
      <stop offset="50%" stop-color="${isSilver ? '#CBD5E1' : '#E0C878'}"/>
      <stop offset="100%" stop-color="${isSilver ? '#64748B' : '#9E8230'}"/>
    </linearGradient>
  </defs>

  <!-- Luxury Double Circular Cartouche with Beaded Ring -->
  <circle cx="250" cy="250" r="234" fill="none" stroke="url(#ringGrad)" stroke-width="2.5" filter="url(#monogramDepth)"/>
  <circle cx="250" cy="250" r="223" fill="none" stroke="${innerDotColor}" stroke-width="1.2" stroke-dasharray="3.5 4.5"/>

  <!-- North/South Diamond Stars -->
  <g fill="url(#ringGrad)" filter="url(#monogramDepth)">
    <path d="M 250 7 L 253.5 16.5 L 263 20 L 253.5 23.5 L 250 33 L 246.5 23.5 L 237 20 L 246.5 16.5 Z"/>
    <path d="M 250 467 L 253.5 476.5 L 263 480 L 253.5 483.5 L 250 493 L 246.5 483.5 L 237 480 L 246.5 476.5 Z"/>
  </g>
  <circle cx="16" cy="250" r="3.5" fill="${innerDotColor}"/>
  <circle cx="484" cy="250" r="3.5" fill="${innerDotColor}"/>

  <!-- MONOGRAM EMBLEM -->
  <g filter="url(#monogramDepth)">

    <!-- ========================================================
         LETTER F (Dominant Left & Upper: 100% Unobstructed Top)
         ======================================================== -->
    <path id="letterF" d="
      M 135 95 
      L 295 95 
      L 295 138 
      L 278 138 
      C 275 120, 264 114, 238 114 
      L 204 114 
      L 204 220 
      L 258 220 
      C 272 220, 278 215, 280 202 
      L 290 202 
      L 290 250 
      L 280 250 
      C 278 238, 272 234, 258 234 
      L 204 234 
      L 204 350 
      C 204 372, 212 378, 236 380 
      L 236 394 
      L 125 394 
      L 125 380 
      C 150 378, 158 372, 158 350 
      L 158 138 
      C 158 118, 150 112, 125 110 
      L 125 95 
      Z" 
      fill="${fColor}"
      stroke="${strokeGap}"
      stroke-width="1.2"/>

    <!-- ========================================================
         CUTOUT GAP (Creates crisp negative space around S weave)
         ======================================================== -->
    <path d="
      M 362 205 
      C 362 165, 335 142, 292 142 
      C 250 142, 228 165, 228 195 
      C 228 225, 252 245, 290 264 
      C 342 290, 372 318, 372 364 
      C 372 414, 330 445, 272 445 
      C 225 445, 188 420, 176 380 
      L 204 370 
      C 214 402, 238 422, 274 422 
      C 318 422, 344 398, 344 362 
      C 344 328, 318 305, 276 282 
      C 226 256, 198 230, 198 192 
      C 198 150, 238 122, 290 122 
      C 334 122, 365 142, 378 178 
      Z"
      fill="none" 
      stroke="${strokeGap}" 
      stroke-width="11" 
      stroke-linejoin="round"/>

    <!-- ========================================================
         LETTER S (Dominant Right & Lower: 100% Unobstructed Bottom)
         ======================================================== -->
    <path id="letterS" d="
      M 362 205 
      C 362 165, 335 142, 292 142 
      C 250 142, 228 165, 228 195 
      C 228 225, 252 245, 290 264 
      C 342 290, 372 318, 372 364 
      C 372 414, 330 445, 272 445 
      C 225 445, 188 420, 176 380 
      L 204 370 
      C 214 402, 238 422, 274 422 
      C 318 422, 344 398, 344 362 
      C 344 328, 318 305, 276 282 
      C 226 256, 198 230, 198 192 
      C 198 150, 238 122, 290 122 
      C 334 122, 365 142, 378 178 
      Z" 
      fill="url(#${sGradId})" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>

    <!-- Teardrop Pearl Terminals on S -->
    <circle cx="374" cy="190" r="9" fill="${fColor}" stroke="${strokeGap}" stroke-width="1"/>
    <circle cx="188" cy="388" r="9" fill="url(#${sGradId})" stroke="${strokeGap}" stroke-width="1"/>

  </g>
</svg>`;
}

async function render() {
  const silverSvg = createUltimateMonogram('silver');
  const goldSvg = createUltimateMonogram('gold');

  fs.writeFileSync(path.join(outDir, 'ultimate-silver.svg'), silverSvg);
  fs.writeFileSync(path.join(outDir, 'ultimate-gold.svg'), goldSvg);

  const navyBg = Buffer.from('<svg width="500" height="500"><rect width="500" height="500" fill="#080E1C"/></svg>');
  const sageBg = Buffer.from('<svg width="500" height="500"><rect width="500" height="500" fill="#7E836C"/></svg>');

  await sharp(Buffer.from(silverSvg))
    .composite([{ input: navyBg, blend: 'dest-over' }])
    .png()
    .toFile(path.join(outDir, 'ultimate-silver-preview.png'));

  await sharp(Buffer.from(goldSvg))
    .composite([{ input: sageBg, blend: 'dest-over' }])
    .png()
    .toFile(path.join(outDir, 'ultimate-gold-preview.png'));

  console.log('Ultimate monogram generated and previewed!');
}

render().catch(console.error);

