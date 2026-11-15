const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicImgDir = path.join(__dirname, '..', 'public', 'img');

// Silver & Deep Navy Monogram SVG
const svgSilverFS = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="silverShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F1F5F9"/>
      <stop offset="70%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>

  <!-- Outer Fine Rings in Radiant Silver -->
  <circle cx="250" cy="250" r="230" fill="none" stroke="url(#silverRim)" stroke-width="2.5" filter="url(#silverShadow)"/>
  <circle cx="250" cy="250" r="218" fill="none" stroke="rgba(226, 232, 240, 0.75)" stroke-width="1.2" stroke-dasharray="4 4"/>

  <!-- Top and Bottom Delicate Floral Finials -->
  <g fill="#FFFFFF" stroke="none">
    <path d="M 250 14 C 246 22, 238 25, 232 29 C 241 27, 248 24, 250 34 C 252 24, 259 27, 268 29 C 262 25, 254 22, 250 14 Z"/>
    <path d="M 250 486 C 246 478, 238 475, 232 471 C 241 473, 248 476, 250 466 C 252 476, 259 473, 268 471 C 262 475, 254 478, 250 486 Z"/>
  </g>

  <!-- Side Accent Stars -->
  <g fill="#E2E8F0" stroke="none">
    <circle cx="18" cy="250" r="3.5"/>
    <circle cx="482" cy="250" r="3.5"/>
  </g>

  <!-- Intertwined F and S Monogram in Silver -->
  <g filter="url(#silverShadow)">
    <!-- Letter F (Classical Roman Serif Architecture in Pure White Platinum) -->
    <path d="
      M 175 110 
      L 325 110 
      C 336 110, 342 115, 342 124 
      L 342 158 
      L 318 158 
      C 315 136, 307 132, 282 132 
      L 242 132 
      L 242 222 
      L 290 222 
      C 300 222, 305 225, 307 236 
      L 307 256 
      L 290 256 
      L 242 256 
      L 242 355 
      C 242 378, 250 384, 276 386 
      L 276 402 
      L 145 402 
      L 145 386 
      C 170 384, 175 378, 175 355 
      Z" 
      fill="#FFFFFF"/>

    <!-- Letter S (Curving Gracefully Through F in Metallic Silver) -->
    <path d="
      M 345 175 
      C 338 142, 310 120, 265 120 
      C 225 120, 202 136, 202 160 
      C 202 182, 222 198, 260 214 
      C 310 234, 342 258, 342 304 
      C 342 358, 295 398, 225 398 
      C 175 398, 138 372, 128 335 
      L 160 324 
      C 168 352, 195 372, 232 372 
      C 278 372, 308 346, 308 306 
      C 308 274, 282 254, 240 235 
      C 195 214, 168 192, 168 154 
      C 168 112, 210 92, 260 92 
      C 305 92, 332 110, 345 138 
      Z" 
      fill="url(#silverGrad)" 
      stroke="#080E1C" 
      stroke-width="1.8" 
      opacity="0.98"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicImgDir, 'logo-fs-silver.svg'), svgSilverFS);

// Deep Navy badge with Silver Ring
const svgSilverBadge = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="navyBg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#182B4D"/>
      <stop offset="60%" stop-color="#0E1B33"/>
      <stop offset="100%" stop-color="#070D1A"/>
    </radialGradient>
  </defs>
  <circle cx="250" cy="250" r="248" fill="url(#navyBg)" stroke="#CBD5E1" stroke-width="3"/>
  ${svgSilverFS.replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">', '').replace('</svg>', '')}
</svg>`;

fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'), svgSilverBadge);

Promise.all([
  sharp(Buffer.from(svgSilverFS)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-silver.png')),
  sharp(Buffer.from(svgSilverBadge)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge-silver.png'))
]).then(() => {
  console.log('Successfully generated logo-fs-silver.svg, logo-fs-silver.png, logo-fs-badge-silver.svg, and logo-fs-badge-silver.png!');
}).catch(err => {
  console.error('Error generating silver logos:', err);
});

