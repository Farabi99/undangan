const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\902222\\.gemini\\antigravity\\brain\\22a8a866-3ba5-427e-b601-bdc046945d95';
const outDir = path.join(__dirname, '..', 'public', 'img', 'logo-options');
fs.mkdirSync(outDir, { recursive: true });

// Common SVG Defs (Gradients and Shadows)
function getDefs(isSilver) {
  return `
    <defs>
      <filter id="luxuryDepth" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="${isSilver ? '0.6' : '0.4'}"/>
      </filter>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF7"/>
        <stop offset="35%" stop-color="#F3E5C8"/>
        <stop offset="70%" stop-color="#D4B96E"/>
        <stop offset="100%" stop-color="#B89638"/>
      </linearGradient>
      <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="30%" stop-color="#F1F5F9"/>
        <stop offset="70%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isSilver ? '#FFFFFF' : '#FFFDF7'}"/>
        <stop offset="50%" stop-color="${isSilver ? '#CBD5E1' : '#E5C97A'}"/>
        <stop offset="100%" stop-color="${isSilver ? '#64748B' : '#9E8230'}"/>
      </linearGradient>
    </defs>
  `;
}

function getCartouche(isSilver) {
  const dotColor = isSilver ? 'rgba(203, 213, 225, 0.7)' : 'rgba(212, 185, 110, 0.85)';
  return `
    <!-- Outer Double Luxury Rings with Beaded Track -->
    <circle cx="250" cy="250" r="234" fill="none" stroke="url(#ringGrad)" stroke-width="2.5" filter="url(#luxuryDepth)"/>
    <circle cx="250" cy="250" r="222" fill="none" stroke="${dotColor}" stroke-width="1.2" stroke-dasharray="3.5 4.5"/>
    
    <!-- North & South Diamond Star Finials -->
    <g fill="url(#ringGrad)" filter="url(#luxuryDepth)">
      <path d="M 250 8 L 253.5 17.5 L 263 21 L 253.5 24.5 L 250 34 L 246.5 24.5 L 237 21 L 246.5 17.5 Z"/>
      <path d="M 250 466 L 253.5 475.5 L 263 479 L 253.5 482.5 L 250 492 L 246.5 482.5 L 237 479 L 246.5 475.5 Z"/>
    </g>
    <!-- East & West Accent Beads -->
    <circle cx="16" cy="250" r="3.5" fill="${dotColor}"/>
    <circle cx="484" cy="250" r="3.5" fill="${dotColor}"/>
  `;
}

// -------------------------------------------------------------
// OPTION 1: "Royal Crest F & S" (Side-by-side with elegant Ampersand '&')
// -------------------------------------------------------------
function buildOption1_Ampersand(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverGrad)' : '#FFFFFF';
  const ampFill = isSilver ? '#CBD5E1' : 'url(#goldGrad)';
  const strokeGap = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- ==============================================
         LETTER F (Left Side: Classical Luxury Roman Serif)
         ============================================== -->
    <path id="serifF" d="
      M 95 145 
      L 205 145 
      L 205 180 
      L 192 180 
      C 188 165, 178 160, 160 160 
      L 146 160 
      L 146 232 
      L 182 232 
      C 192 232, 196 228, 198 218 
      L 204 218 
      L 204 256 
      L 198 256 
      C 196 246, 192 242, 182 242 
      L 146 242 
      L 146 325 
      C 146 342, 152 346, 168 348 
      L 168 358 
      L 88 358 
      L 88 348 
      C 104 346, 110 342, 110 325 
      L 110 180 
      C 110 163, 104 159, 88 157 
      L 88 145 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>

    <!-- ==============================================
         AMPERSAND '&' (Center: Delicate Calligraphic Swash)
         ============================================== -->
    <path id="calligraphicAmpersand" d="
      M 264 228 
      C 274 212, 278 196, 268 184 
      C 258 172, 240 174, 234 186 
      C 228 198, 234 214, 248 230 
      L 230 258 
      C 214 274, 206 292, 216 308 
      C 226 324, 248 326, 264 316 
      C 276 308, 284 294, 296 276 
      L 284 270 
      C 275 284, 266 295, 255 298 
      C 245 301, 236 297, 232 288 
      C 228 279, 232 268, 244 254 
      L 258 236 
      L 278 266 
      C 286 278, 295 288, 305 292 
      L 310 286 
      C 298 280, 288 268, 280 254 
      Z
      M 256 218 
      C 246 206, 244 194, 248 188 
      C 252 182, 260 182, 264 188 
      C 268 194, 266 204, 256 218 
      Z" 
      fill="${ampFill}"/>

    <!-- ==============================================
         LETTER S (Right Side: Classical Luxury Roman Serif)
         ============================================== -->
    <path id="serifS" d="
      M 395 186 
      C 390 162, 372 145, 342 145 
      C 314 145, 296 158, 296 178 
      C 296 196, 312 208, 338 220 
      C 370 234, 396 252, 396 286 
      C 396 328, 362 358, 320 358 
      C 285 358, 258 338, 250 310 
      L 272 302 
      C 278 324, 296 338, 322 338 
      C 352 338, 372 318, 372 288 
      C 372 264, 352 248, 322 234 
      C 290 220, 272 202, 272 174 
      C 272 142, 300 125, 338 125 
      C 368 125, 388 138, 396 160 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// OPTION 2: "Celestial Star F ✦ S" (Side-by-side with 8-Point Diamond Star)
// -------------------------------------------------------------
function buildOption2_Star(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverGrad)' : '#FFFFFF';
  const starFill = isSilver ? '#FFFFFF' : 'url(#goldGrad)';
  const strokeGap = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- Letter F (Left) -->
    <path d="
      M 105 145 
      L 215 145 
      L 215 180 
      L 202 180 
      C 198 165, 188 160, 170 160 
      L 156 160 
      L 156 232 
      L 192 232 
      C 202 232, 206 228, 208 218 
      L 214 218 
      L 214 256 
      L 208 256 
      C 206 246, 202 242, 192 242 
      L 156 242 
      L 156 325 
      C 156 342, 162 346, 178 348 
      L 178 358 
      L 98 358 
      L 98 348 
      C 114 346, 120 342, 120 325 
      L 120 180 
      C 120 163, 114 159, 98 157 
      L 98 145 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>

    <!-- Central 8-Point Diamond Celestial Star with Delicate Rays -->
    <g transform="translate(250, 250)">
      <!-- Radiant Hairlines -->
      <line x1="-28" y1="0" x2="-14" y2="0" stroke="${starFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="0" x2="28" y2="0" stroke="${starFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="0" y1="-28" x2="0" y2="-14" stroke="${starFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="0" y1="14" x2="0" y2="28" stroke="${starFill}" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Star Shape -->
      <path d="
        M 0 -22 
        L 3.5 -6 
        L 18 -4 
        L 6 3.5 
        L 10 18 
        L 0 8 
        L -10 18 
        L -6 3.5 
        L -18 -4 
        L -3.5 -6 
        Z" 
        fill="${starFill}"/>
      <circle cx="0" cy="0" r="2.5" fill="${isSilver ? '#080E1C' : '#525A45'}"/>
    </g>

    <!-- Letter S (Right) -->
    <path d="
      M 390 186 
      C 385 162, 368 145, 338 145 
      C 310 145, 292 158, 292 178 
      C 292 196, 308 208, 334 220 
      C 366 234, 392 252, 392 286 
      C 392 328, 358 358, 316 358 
      C 281 358, 254 338, 246 310 
      L 268 302 
      C 274 324, 292 338, 318 338 
      C 348 338, 368 318, 368 288 
      C 368 264, 348 248, 318 234 
      C 286 220, 268 202, 268 174 
      C 268 142, 296 125, 334 125 
      C 364 125, 384 138, 392 160 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// OPTION 3: "Modern Cartier Duo F | S" (Clean High-Fashion Minimalist Serif)
// -------------------------------------------------------------
function buildOption3_CartierDuo(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverGrad)' : '#FFFFFF';
  const barFill = isSilver ? 'url(#ringGrad)' : 'url(#goldGrad)';
  const strokeGap = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- Letter F (Bold Architectural Serif) -->
    <path d="
      M 115 140 
      L 225 140 
      L 225 174 
      L 212 174 
      C 208 158, 198 154, 180 154 
      L 165 154 
      L 165 232 
      L 205 232 
      C 214 232, 218 228, 220 218 
      L 226 218 
      L 226 256 
      L 220 256 
      C 218 246, 214 242, 205 242 
      L 165 242 
      L 165 330 
      C 165 348, 172 352, 188 354 
      L 188 364 
      L 108 364 
      L 108 354 
      C 124 352, 130 348, 130 330 
      L 130 174 
      C 130 156, 124 152, 108 150 
      L 108 140 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>

    <!-- Slender Vertical Divider with Center Diamond -->
    <g transform="translate(250, 250)">
      <line x1="0" y1="-85" x2="0" y2="-15" stroke="${barFill}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 0 -8 L 5 0 L 0 8 L -5 0 Z" fill="${barFill}"/>
      <line x1="0" y1="15" x2="0" y2="85" stroke="${barFill}" stroke-width="1.5" stroke-linecap="round"/>
    </g>

    <!-- Letter S (Matching Classical Proportions) -->
    <path d="
      M 390 190 
      C 385 162, 366 142, 332 142 
      C 300 142, 280 156, 280 178 
      C 280 198, 298 210, 326 222 
      C 360 236, 388 254, 388 290 
      C 388 334, 350 366, 306 366 
      C 268 366, 242 344, 234 314 
      L 258 304 
      C 264 328, 282 344, 310 344 
      C 342 344, 362 322, 362 292 
      C 362 266, 340 250, 308 236 
      C 274 222, 254 202, 254 172 
      C 254 138, 284 120, 326 120 
      C 360 120, 382 136, 390 162 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeGap}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

async function run() {
  console.log('Generating Side-by-Side Logo Options...');

  const options = [
    { name: 'option1-ampersand', fn: buildOption1_Ampersand, label: 'Option 1: Royal Crest F & S' },
    { name: 'option2-star', fn: buildOption2_Star, label: 'Option 2: Celestial Star F ✦ S' },
    { name: 'option3-cartier', fn: buildOption3_CartierDuo, label: 'Option 3: Cartier Duo F | S' }
  ];

  for (const opt of options) {
    // 1. Gold on Sage
    const svgSage = opt.fn(false, '#7E836C');
    const pngSagePath = path.join(brainDir, `${opt.name}-gold-sage.png`);
    await sharp(Buffer.from(svgSage)).resize(600, 600).png().toFile(pngSagePath);

    // 2. Silver on Navy
    const svgNavy = opt.fn(true, '#0E1B33');
    const pngNavyPath = path.join(brainDir, `${opt.name}-silver-navy.png`);
    await sharp(Buffer.from(svgNavy)).resize(600, 600).png().toFile(pngNavyPath);

    // Also write SVGs
    fs.writeFileSync(path.join(outDir, `${opt.name}-gold-sage.svg`), svgSage);
    fs.writeFileSync(path.join(outDir, `${opt.name}-silver-navy.svg`), svgNavy);

    console.log(`Generated ${opt.name} successfully!`);
  }

  // Also create a combined comparison sheet (side-by-side montage)
  console.log('Building comparison montage...');
  const montage = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 840" width="1200" height="840">
  <rect width="1200" height="840" fill="#080E1C"/>
  <text x="600" y="55" text-anchor="middle" font-family="'Libre Baskerville', serif" font-size="28" fill="#FFFFFF" letter-spacing="3">FARABI &amp; SYIFA — SIDE-BY-SIDE LOGO DESIGNS</text>
  <text x="600" y="85" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94A3B8" letter-spacing="1">Both F and S clearly visible next to each other (Akad Sage &amp; Reception Navy)</text>
  
  <!-- Row 1: Option 1 F & S -->
  <g transform="translate(100, 120)">
    <rect width="480" height="200" rx="16" fill="#141E33" stroke="rgba(255,255,255,0.1)"/>
    <text x="240" y="32" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#CBD5E1">OPTION 1: ROYAL CREST F &amp; S</text>
  </g>
</svg>`;

  console.log('All done!');
}

run().catch(console.error);

