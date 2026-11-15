const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\902222\\.gemini\\antigravity\\brain\\22a8a866-3ba5-427e-b601-bdc046945d95';
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

function getDefs(isSilver) {
  return `
    <defs>
      <filter id="luxuryDepth" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="${isSilver ? '0.65' : '0.45'}"/>
      </filter>
      <linearGradient id="goldLetterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="50%" stop-color="#FFFDF7"/>
        <stop offset="100%" stop-color="#F4EADB"/>
      </linearGradient>
      <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF9E6"/>
        <stop offset="40%" stop-color="#EED59B"/>
        <stop offset="100%" stop-color="#C5A048"/>
      </linearGradient>
      <linearGradient id="silverLetterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="45%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#E2E8F0"/>
      </linearGradient>
      <linearGradient id="silverAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="40%" stop-color="#CBD5E1"/>
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
  const dotColor = isSilver ? 'rgba(203, 213, 225, 0.75)' : 'rgba(212, 185, 110, 0.85)';
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

// ==========================================================================
// OPTION A: ROYAL WEDDING CREST "F & S"
// ==========================================================================
function buildOptionA(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverLetterGrad)' : 'url(#goldLetterGrad)';
  const accentFill = isSilver ? 'url(#silverAccentGrad)' : 'url(#goldAccentGrad)';
  const strokeColor = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- ==============================================
         LETTER F (Left: x=88 to x=190, y=165 to y=345)
         ============================================== -->
    <path id="letterF" d="
      M 88 165 
      L 190 165 
      L 190 196 
      L 178 196 
      C 174 182, 166 179, 148 179 
      L 136 179 
      L 136 242 
      L 170 242 
      C 178 242, 182 238, 184 228 
      L 189 228 
      L 189 260 
      L 184 260 
      C 182 250, 178 246, 170 246 
      L 136 246 
      L 136 321 
      C 136 333, 142 336, 156 337 
      L 156 345 
      L 88 345 
      L 88 337 
      C 102 336, 108 333, 108 321 
      L 108 189 
      C 108 177, 102 174, 88 173 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>

    <!-- ==============================================
         AMPERSAND '&' (Center: x=224 to x=276, y=205 to y=305)
         ============================================== -->
    <path id="centerAmpersand" d="
      M 262 234 
      C 270 220, 274 206, 265 196 
      C 256 186, 242 188, 236 198 
      C 230 208, 234 220, 246 234 
      L 230 260 
      C 218 274, 212 288, 221 300 
      C 230 312, 248 314, 262 304 
      C 270 298, 276 288, 282 276 
      L 272 272 
      C 266 282, 260 290, 252 292 
      C 244 294, 238 290, 235 284 
      C 232 277, 236 268, 244 256 
      L 254 242 
      L 268 266 
      C 273 274, 280 282, 287 285 
      L 290 280 
      C 282 276, 274 266, 268 254 
      Z
      M 254 226 
      C 246 216, 244 206, 248 201 
      C 251 196, 257 196, 260 201 
      C 264 206, 262 214, 254 226 
      Z" 
      fill="${accentFill}"/>

    <!-- ==============================================
         LETTER S (Right: x=310 to x=412, y=165 to y=345)
         ============================================== -->
    <path id="letterS" d="
      M 405 204 
      C 398 178, 380 165, 355 165 
      C 328 165, 312 178, 312 196 
      C 312 212, 326 224, 348 234 
      C 376 248, 400 262, 400 294 
      C 400 330, 370 348, 340 348 
      C 310 348, 288 332, 280 308 
      L 300 302 
      C 305 320, 320 332, 340 332 
      C 365 332, 380 318, 380 294 
      C 380 272, 362 258, 336 246 
      C 310 232, 294 218, 294 194 
      C 294 168, 318 152, 352 152 
      C 378 152, 396 164, 404 184 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

// ==========================================================================
// OPTION B: CELESTIAL STAR CREST "F ✦ S"
// ==========================================================================
function buildOptionB(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverLetterGrad)' : 'url(#goldLetterGrad)';
  const accentFill = isSilver ? 'url(#silverAccentGrad)' : 'url(#goldAccentGrad)';
  const strokeColor = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- Letter F (Left: x=88 to x=190, y=165 to y=345) -->
    <path d="
      M 88 165 
      L 190 165 
      L 190 196 
      L 178 196 
      C 174 182, 166 179, 148 179 
      L 136 179 
      L 136 242 
      L 170 242 
      C 178 242, 182 238, 184 228 
      L 189 228 
      L 189 260 
      L 184 260 
      C 182 250, 178 246, 170 246 
      L 136 246 
      L 136 321 
      C 136 333, 142 336, 156 337 
      L 156 345 
      L 88 345 
      L 88 337 
      C 102 336, 108 333, 108 321 
      L 108 189 
      C 108 177, 102 174, 88 173 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>

    <!-- Central Sparkling 8-Point Diamond Star with Celestial Rays -->
    <g transform="translate(250, 255)">
      <!-- Radiant Hairline Accents -->
      <line x1="-32" y1="0" x2="-18" y2="0" stroke="${accentFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="18" y1="0" x2="32" y2="0" stroke="${accentFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="0" y1="-32" x2="0" y2="-18" stroke="${accentFill}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="0" y1="18" x2="0" y2="32" stroke="${accentFill}" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Diamond Star Polygon -->
      <path d="
        M 0 -26 
        L 4.5 -7 
        L 22 -5 
        L 7.5 4 
        L 12 22 
        L 0 10 
        L -12 22 
        L -7.5 4 
        L -22 -5 
        L -4.5 -7 
        Z" 
        fill="${accentFill}"/>
      <circle cx="0" cy="0" r="3" fill="${isSilver ? '#080E1C' : '#525A45'}"/>
    </g>

    <!-- Letter S (Right: x=310 to x=412, y=165 to y=345) -->
    <path d="
      M 405 204 
      C 398 178, 380 165, 355 165 
      C 328 165, 312 178, 312 196 
      C 312 212, 326 224, 348 234 
      C 376 248, 400 262, 400 294 
      C 400 330, 370 348, 340 348 
      C 310 348, 288 332, 280 308 
      L 300 302 
      C 305 320, 320 332, 340 332 
      C 365 332, 380 318, 380 294 
      C 380 272, 362 258, 336 246 
      C 310 232, 294 218, 294 194 
      C 294 168, 318 152, 352 152 
      C 378 152, 396 164, 404 184 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

// ==========================================================================
// OPTION C: CALLIGRAPHIC SCRIPTLINE "Farabi & Syifa Crest"
// ==========================================================================
function buildOptionC(isSilver, bgFill) {
  const letterFill = isSilver ? 'url(#silverLetterGrad)' : 'url(#goldLetterGrad)';
  const accentFill = isSilver ? 'url(#silverAccentGrad)' : 'url(#goldAccentGrad)';
  const strokeColor = isSilver ? '#080E1C' : '#525A45';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- Letter F (Cursive Flourished) -->
    <path d="
      M 75 160 
      C 105 152, 145 150, 192 150 
      C 202 150, 208 154, 206 162 
      C 204 170, 196 172, 186 172 
      C 152 172, 138 174, 134 188 
      L 134 238 
      L 174 238 
      C 182 238, 186 242, 186 248 
      C 186 254, 182 258, 174 258 
      L 134 258 
      L 134 322 
      C 134 340, 142 344, 158 345 
      L 158 352 
      L 86 352 
      L 86 345 
      C 102 344, 110 340, 110 322 
      L 110 188 
      C 110 178, 102 172, 82 170 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>

    <!-- Center Botanical Laurel Tie & Diamond -->
    <g transform="translate(250, 255)">
      <path d="
        M -24 -2 C -16 -12, -4 -16, 0 -4 C 4 -16, 16 -12, 24 -2 
        C 16 8, 4 12, 0 2 C -4 12, -16 8, -24 -2 Z" 
        fill="${accentFill}"/>
      <circle cx="0" cy="-1" r="3.5" fill="${isSilver ? '#FFFFFF' : '#FFFDF7'}"/>
    </g>

    <!-- Letter S (Cursive Flourished) -->
    <path d="
      M 412 198 
      C 406 172, 386 156, 356 156 
      C 324 156, 304 170, 304 192 
      C 304 212, 322 226, 348 238 
      C 380 252, 406 268, 406 300 
      C 406 338, 372 356, 338 356 
      C 302 356, 278 338, 270 310 
      L 294 302 
      C 300 324, 318 338, 340 338 
      C 368 338, 384 322, 384 298 
      C 384 274, 364 260, 334 246 
      C 306 232, 286 216, 286 190 
      C 286 160, 314 142, 354 142 
      C 384 142, 406 158, 414 182 
      Z" 
      fill="${letterFill}" 
      stroke="${strokeColor}" 
      stroke-width="1.2"/>
  </g>
</svg>`;
}

async function generateAll() {
  console.log('Generating Precision Side-by-Side Logo Options...');

  const configs = [
    { id: 'option-a-ampersand', fn: buildOptionA, title: 'Option A: Royal Crest (F & S with Ampersand)' },
    { id: 'option-b-star', fn: buildOptionB, title: 'Option B: Celestial Star (F ✦ S with Diamond Star)' },
    { id: 'option-c-botanical', fn: buildOptionC, title: 'Option C: Botanical Duo (F ✤ S with Laurel Knot)' }
  ];

  for (const cfg of configs) {
    // 1. Sage Badge (Akad)
    const svgSage = cfg.fn(false, '#7E836C');
    const sagePath = path.join(brainDir, `${cfg.id}-sage.png`);
    await sharp(Buffer.from(svgSage)).resize(600, 600).png().toFile(sagePath);

    // 2. Navy Badge (Resepsi)
    const svgNavy = cfg.fn(true, '#0E1B33');
    const navyPath = path.join(brainDir, `${cfg.id}-navy.png`);
    await sharp(Buffer.from(svgNavy)).resize(600, 600).png().toFile(navyPath);

    // Save SVGs to public/img as well
    fs.writeFileSync(path.join(publicImgDir, `${cfg.id}-sage.svg`), svgSage);
    fs.writeFileSync(path.join(publicImgDir, `${cfg.id}-navy.svg`), svgNavy);

    console.log(`Saved ${cfg.id}`);
  }

  // Create Master Showcase Montage (1200 x 950)
  const aSage = await sharp(path.join(brainDir, 'option-a-ampersand-sage.png')).resize(260, 260).toBuffer();
  const aNavy = await sharp(path.join(brainDir, 'option-a-ampersand-navy.png')).resize(260, 260).toBuffer();
  const bSage = await sharp(path.join(brainDir, 'option-b-star-sage.png')).resize(260, 260).toBuffer();
  const bNavy = await sharp(path.join(brainDir, 'option-b-star-navy.png')).resize(260, 260).toBuffer();
  const cSage = await sharp(path.join(brainDir, 'option-c-botanical-sage.png')).resize(260, 260).toBuffer();
  const cNavy = await sharp(path.join(brainDir, 'option-c-botanical-navy.png')).resize(260, 260).toBuffer();

  const showcaseSvg = `
  <svg width="1200" height="950" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="950" fill="#080E1C"/>
    
    <!-- Title Section -->
    <text x="600" y="55" text-anchor="middle" font-family="'Times New Roman', serif" font-size="30" font-weight="bold" fill="#FFFFFF" letter-spacing="4">FARABI &amp; SYIFA — SIDE-BY-SIDE MONOGRAMS</text>
    <text x="600" y="88" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" fill="#94A3B8" letter-spacing="1.5">Letters F and S placed next to each other for 100% crystal-clear readability</text>
    
    <!-- Column Headers -->
    <rect x="70" y="115" width="490" height="34" rx="6" fill="#1C271E"/>
    <text x="315" y="137" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" font-weight="bold" fill="#D4B96E" letter-spacing="2">AKAD THEME (SAGE &amp; GOLD)</text>

    <rect x="640" y="115" width="490" height="34" rx="6" fill="#12203D"/>
    <text x="885" y="137" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" font-weight="bold" fill="#CBD5E1" letter-spacing="2">RESEPSI THEME (NAVY &amp; SILVER)</text>

    <!-- Row 1: Option A -->
    <rect x="50" y="165" width="1100" height="235" rx="14" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="180" y="290" text-anchor="middle" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF">OPTION A</text>
    <text x="180" y="315" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" fill="#94A3B8">Royal Crest &quot;F &amp; S&quot;</text>
    <text x="180" y="335" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Delicate Center Ampersand</text>

    <!-- Row 2: Option B -->
    <rect x="50" y="420" width="1100" height="235" rx="14" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="180" y="545" text-anchor="middle" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF">OPTION B</text>
    <text x="180" y="570" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" fill="#94A3B8">Celestial Star &quot;F ✦ S&quot;</text>
    <text x="180" y="590" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">8-Point Diamond Starlight</text>

    <!-- Row 3: Option C -->
    <rect x="50" y="675" width="1100" height="235" rx="14" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="180" y="800" text-anchor="middle" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF">OPTION C</text>
    <text x="180" y="825" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" fill="#94A3B8">Botanical Duo &quot;F ✤ S&quot;</text>
    <text x="180" y="845" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Laurel Knot &amp; Diamond Tie</text>
  </svg>
  `;

  await sharp(Buffer.from(showcaseSvg))
    .composite([
      // Option A
      { input: aSage, top: 172, left: 320 },
      { input: aNavy, top: 172, left: 755 },
      // Option B
      { input: bSage, top: 427, left: 320 },
      { input: bNavy, top: 427, left: 755 },
      // Option C
      { input: cSage, top: 682, left: 320 },
      { input: cNavy, top: 682, left: 755 }
    ])
    .png()
    .toFile(path.join(brainDir, 'side-by-side-showcase.png'));

  console.log('Showcase generated: side-by-side-showcase.png');
}

generateAll().catch(console.error);

