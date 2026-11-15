const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create exquisite intertwined F & S monogram SVG
// F in crisp white/gold with serifs, S gracefully looping through F
const svgFS = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDFBF7"/>
      <stop offset="45%" stop-color="#EEDCB0"/>
      <stop offset="100%" stop-color="#C4A94E"/>
    </linearGradient>
  </defs>

  <!-- Outer Fine Rings -->
  <circle cx="250" cy="250" r="230" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" filter="url(#shadow)"/>
  <circle cx="250" cy="250" r="218" fill="none" stroke="rgba(212, 185, 110, 0.85)" stroke-width="1.2" stroke-dasharray="4 4"/>

  <!-- Top and Bottom Delicate Floral Finials -->
  <g fill="rgba(255,255,255,0.9)" stroke="none">
    <path d="M 250 14 C 246 22, 238 25, 232 29 C 241 27, 248 24, 250 34 C 252 24, 259 27, 268 29 C 262 25, 254 22, 250 14 Z"/>
    <path d="M 250 486 C 246 478, 238 475, 232 471 C 241 473, 248 476, 250 466 C 252 476, 259 473, 268 471 C 262 475, 254 478, 250 486 Z"/>
  </g>

  <!-- Side Accent Leaves -->
  <g fill="rgba(212, 185, 110, 0.8)" stroke="none">
    <circle cx="18" cy="250" r="3"/>
    <circle cx="482" cy="250" r="3"/>
  </g>

  <!-- Intertwined F and S Monogram -->
  <g filter="url(#shadow)">
    <!-- Letter F (Classical Roman Serif Architecture) -->
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

    <!-- Letter S (Curving Gracefully Through F) -->
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
      fill="url(#goldGrad)" 
      stroke="#7E836C" 
      stroke-width="1.5" 
      opacity="0.96"/>
  </g>
</svg>`;

const publicImgDir = path.join(__dirname, '..', 'public', 'img');
fs.writeFileSync(path.join(publicImgDir, 'logo-fs.svg'), svgFS);

// Also generate sage-badge version
const svgBadge = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <circle cx="250" cy="250" r="248" fill="#7E836C"/>
  ${svgFS.replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">', '').replace('</svg>', '')}
</svg>`;
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'), svgBadge);

// Deep Navy badge version for reception theme
const svgNavyBadge = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <circle cx="250" cy="250" r="248" fill="#0E1B33"/>
  ${svgFS.replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">', '').replace('stroke="#7E836C"', 'stroke="#0E1B33"').replace('</svg>', '')}
</svg>`;
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-navy.svg'), svgNavyBadge);

// Convert to high-res PNGs
Promise.all([
  sharp(Buffer.from(svgFS)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs.png')),
  sharp(Buffer.from(svgBadge)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge.png')),
  sharp(Buffer.from(svgNavyBadge)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge-navy.png')),
  sharp(Buffer.from(svgFS)).resize(240, 240).png().toFile(path.join(publicImgDir, 'logo-image.png'))
]).then(() => {
  console.log('Successfully generated logo-fs.svg, logo-fs.png, logo-fs-badge.svg, logo-fs-badge-navy.svg, and updated logo-image.png');
}).catch(err => {
  console.error('Error generating logos:', err);
});

