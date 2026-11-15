const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function buildRefinedEmblemSvg() {
  const pillW = 286;
  const pillH = 484;
  const pillX = 57;
  const pillY = 38;
  const pillRx = 143;

  const innerInset = 13;
  const innerX = pillX + innerInset;
  const innerY = pillY + innerInset;
  const innerW = pillW - 2 * innerInset;
  const innerH = pillH - 2 * innerInset;
  const innerRx = pillRx - innerInset;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Outer Stadium / Pill in Soft Dusty Rose Pink -->
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillRx}" fill="#EB98A6" filter="url(#subtleShadow)"/>

  <!-- Inset Border Line in Pure White -->
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" fill="none" stroke="#FFFFFF" stroke-width="2.2" opacity="0.95"/>

  <!-- MONOGRAM GLYPHS IN PURE WHITE -->
  <g fill="#FFFFFF">

    <!-- ==========================================
         LETTER F (Baskerville Roman Serif)
         Vertical stem centered at x = 186 (x from 176 to 196)
         ========================================== -->
    
    <!-- Vertical Stem with Base Foot Serif & Top Head Serif -->
    <path d="
      M 148 448 
      L 224 448 
      L 224 439 
      C 209 438, 198 428, 196 414 
      L 196 238
      C 198 232, 206 228, 218 228
      L 218 222
      L 154 222
      L 154 228
      C 166 228, 174 232, 176 238
      L 176 414
      C 174 428, 163 438, 148 439
      Z" />

    <!-- Top Arm of F with Crisp Classical Vertical Terminal Serif -->
    <path d="
      M 196 222 
      L 252 222 
      C 254 222, 256 219, 256 215
      L 256 208
      L 262 208
      L 262 244
      L 256 244
      L 256 237
      C 256 233, 254 231, 248 231
      C 242 231, 236 228, 228 227
      L 196 227
      Z" />

    <!-- Middle Arm of F with Downward Terminal Serif -->
    <path d="
      M 196 344 
      L 240 344 
      C 245 344, 248 346, 250 351
      L 250 370
      L 244 370
      C 243 363, 240 359, 232 359
      L 196 359
      Z" />

    <!-- ==========================================
         LETTER S (Baskerville Roman Serif)
         Authentic Serif Beak, Upper Arch, and Graceful Spine
         ========================================== -->
    <path d="
      M 228 178
      L 236 178
      C 236 166, 230 154, 220 144
      C 208 132, 193 124, 176 124
      C 150 124, 132 138, 132 158
      C 132 176, 145 190, 170 205
      C 198 222, 222 242, 222 272
      C 222 288, 216 302, 204 312
      L 195 302
      C 204 294, 209 284, 209 271
      C 209 248, 191 232, 164 216
      C 140 201, 120 182, 120 156
      C 120 126, 145 110, 176 110
      C 201 110, 222 120, 236 136
      C 244 146, 248 158, 248 176
      L 237 176
      C 236 166, 234 161, 228 161
      Z" />

    <!-- ==========================================
         THE CIRCULAR EMBRACE LOOP
         Full, balanced circular counter (x: 84 to 196, y: 228 to 362)
         ========================================== -->
    <path d="
      M 184 228
      C 130 228, 84 258, 84 302
      C 84 346, 130 366, 184 366
      C 190 366, 196 364, 202 360
      L 200 350
      C 195 353, 189 355, 182 355
      C 138 355, 98 334, 98 302
      C 98 270, 138 239, 182 239
      C 188 239, 194 241, 200 244
      L 204 235
      C 198 230, 191 228, 184 228
      Z" />

  </g>
</svg>`;
}

const refinedSvg = buildRefinedEmblemSvg();
fs.writeFileSync('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/exact_test_4.svg', refinedSvg);

sharp(Buffer.from(refinedSvg)).resize(380, 532).png().toBuffer().then(svgBuf => {
  return sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/cropped_logo.png')
    .resize(380, 532, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer()
    .then(photoBuf => {
      return sharp({
        create: {
          width: 800,
          height: 552,
          channels: 4,
          background: { r: 245, g: 245, b: 245, alpha: 1 }
        }
      }).composite([
        { input: photoBuf, top: 10, left: 10 },
        { input: svgBuf, top: 10, left: 410 }
      ]).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/side_by_side_comparison.png');
    });
}).then(() => console.log('Saved updated side_by_side_comparison.png')).catch(console.error);
