const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\902222\\.gemini\\antigravity\\brain\\22a8a866-3ba5-427e-b601-bdc046945d95';
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

function loadFont(filePath) {
  const buf = fs.readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return opentype.parse(ab);
}

function getGlyphPath(font, char, targetX, targetY, fontSize) {
  const path = font.getPath(char, 0, 0, fontSize);
  const bb = path.getBoundingBox();
  const width = bb.x2 - bb.x1;
  const height = bb.y2 - bb.y1;
  const offsetX = targetX - (bb.x1 + width / 2);
  const offsetY = targetY - (bb.y1 + height / 2);

  const translatedPath = font.getPath(char, offsetX, offsetY, fontSize);
  return {
    d: translatedPath.toPathData(2),
    bb: translatedPath.getBoundingBox(),
    width,
    height
  };
}

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

function buildSvgFromFont(font, isSilver, bgFill, fontName) {
  const letterFill = isSilver ? 'url(#silverLetterGrad)' : 'url(#goldLetterGrad)';
  const accentFill = isSilver ? 'url(#silverAccentGrad)' : 'url(#goldAccentGrad)';
  const strokeColor = isSilver ? '#080E1C' : '#525A45';

  const letterSize = 175;
  const ampSize = 98;

  // Generously spaced positions: F at X=138, Ampersand at X=250, S at X=362
  const pathF = getGlyphPath(font, 'F', 138, 250, letterSize);
  const pathAmp = getGlyphPath(font, '&', 250, 256, ampSize);
  const pathS = getGlyphPath(font, 'S', 362, 250, letterSize);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${getDefs(isSilver)}
  ${bgFill ? `<circle cx="250" cy="250" r="248" fill="${bgFill}"/>` : ''}
  ${getCartouche(isSilver)}

  <g filter="url(#luxuryDepth)">
    <!-- Letter F (${fontName}) -->
    <path id="fontF" d="${pathF.d}" fill="${letterFill}" stroke="${strokeColor}" stroke-width="0.8"/>

    <!-- Ampersand & (${fontName}) -->
    <path id="fontAmp" d="${pathAmp.d}" fill="${accentFill}"/>

    <!-- Letter S (${fontName}) -->
    <path id="fontS" d="${pathS.d}" fill="${letterFill}" stroke="${strokeColor}" stroke-width="0.8"/>
  </g>
</svg>`;
}

async function rebuild() {
  const fonts = [
    { id: 'baskerville', name: 'Baskerville', subtitle: 'Royal English Heritage Serif', file: 'C:\\Windows\\Fonts\\BASKVILL.TTF' },
    { id: 'palatino', name: 'Palatino Linotype Bold', subtitle: 'Master Hermann Zapf Typography', file: 'C:\\Windows\\Fonts\\palab.ttf' },
    { id: 'garamond', name: 'Garamond Bold', subtitle: 'French Royal Court Classical Serif', file: 'C:\\Windows\\Fonts\\GARABD.TTF' },
    { id: 'constantia', name: 'Constantia Bold', subtitle: 'Modern Haute-Couture Luxury Serif', file: 'C:\\Windows\\Fonts\\constanb.ttf' }
  ];

  for (const item of fonts) {
    const font = loadFont(item.file);
    const svgSage = buildSvgFromFont(font, false, '#7E836C', item.name);
    const svgNavy = buildSvgFromFont(font, true, '#0E1B33', item.name);

    await sharp(Buffer.from(svgSage)).resize(600, 600).png().toFile(path.join(brainDir, `font-${item.id}-sage.png`));
    await sharp(Buffer.from(svgNavy)).resize(600, 600).png().toFile(path.join(brainDir, `font-${item.id}-navy.png`));

    // Also write SVGs to public/img/logo-options
    const optDir = path.join(publicImgDir, 'logo-options');
    fs.mkdirSync(optDir, { recursive: true });
    fs.writeFileSync(path.join(optDir, `logo-${item.id}-sage.svg`), svgSage);
    fs.writeFileSync(path.join(optDir, `logo-${item.id}-navy.svg`), svgNavy);
  }

  // Create Master Showcase (1200 x 1140)
  const baskNavy = await sharp(path.join(brainDir, 'font-baskerville-navy.png')).resize(240, 240).toBuffer();
  const palaNavy = await sharp(path.join(brainDir, 'font-palatino-navy.png')).resize(240, 240).toBuffer();
  const garaNavy = await sharp(path.join(brainDir, 'font-garamond-navy.png')).resize(240, 240).toBuffer();
  const consNavy = await sharp(path.join(brainDir, 'font-constantia-navy.png')).resize(240, 240).toBuffer();

  const baskSage = await sharp(path.join(brainDir, 'font-baskerville-sage.png')).resize(240, 240).toBuffer();
  const palaSage = await sharp(path.join(brainDir, 'font-palatino-sage.png')).resize(240, 240).toBuffer();
  const garaSage = await sharp(path.join(brainDir, 'font-garamond-sage.png')).resize(240, 240).toBuffer();
  const consSage = await sharp(path.join(brainDir, 'font-constantia-sage.png')).resize(240, 240).toBuffer();

  const montageSvg = `
  <svg width="1200" height="1140" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1140" fill="#080E1C"/>
    <text x="600" y="52" text-anchor="middle" font-family="'Times New Roman', serif" font-size="28" font-weight="bold" fill="#FFFFFF" letter-spacing="3">AUTHENTIC TYPOGRAPHIC MONOGRAMS (100% MATCHED F &amp; S)</text>
    <text x="600" y="82" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" fill="#94A3B8" letter-spacing="1">Both letters F and S extracted from the exact same master type foundry</text>

    <!-- Column Headers -->
    <rect x="230" y="105" width="260" height="30" rx="6" fill="#1C271E"/>
    <text x="360" y="125" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" font-weight="bold" fill="#D4B96E" letter-spacing="2">AKAD (SAGE &amp; GOLD)</text>

    <rect x="710" y="105" width="260" height="30" rx="6" fill="#12203D"/>
    <text x="840" y="125" text-anchor="middle" font-family="'Arial', sans-serif" font-size="13" font-weight="bold" fill="#CBD5E1" letter-spacing="2">RESEPSI (NAVY &amp; SILVER)</text>

    <!-- Row 1: Baskerville -->
    <rect x="40" y="145" width="1120" height="225" rx="12" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="135" y="245" text-anchor="middle" font-family="'Arial', sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">1. BASKERVILLE</text>
    <text x="135" y="272" text-anchor="middle" font-family="'Arial', sans-serif" font-size="12" fill="#94A3B8">Royal British Heritage</text>
    <text x="135" y="292" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Identical serif terminal brackets</text>

    <!-- Row 2: Palatino Linotype -->
    <rect x="40" y="390" width="1120" height="225" rx="12" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="135" y="490" text-anchor="middle" font-family="'Arial', sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">2. PALATINO BOLD</text>
    <text x="135" y="517" text-anchor="middle" font-family="'Arial', sans-serif" font-size="12" fill="#94A3B8">Hermann Zapf Masterpiece</text>
    <text x="135" y="537" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Perfect optical weight &amp; curves</text>

    <!-- Row 3: Garamond Bold -->
    <rect x="40" y="635" width="1120" height="225" rx="12" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="135" y="735" text-anchor="middle" font-family="'Arial', sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">3. GARAMOND BOLD</text>
    <text x="135" y="762" text-anchor="middle" font-family="'Arial', sans-serif" font-size="12" fill="#94A3B8">French Court Classical</text>
    <text x="135" y="782" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Renaissance royal stationery</text>

    <!-- Row 4: Constantia Bold -->
    <rect x="40" y="880" width="1120" height="225" rx="12" fill="#0E1626" stroke="rgba(255,255,255,0.08)"/>
    <text x="135" y="980" text-anchor="middle" font-family="'Arial', sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">4. CONSTANTIA BOLD</text>
    <text x="135" y="1007" text-anchor="middle" font-family="'Arial', sans-serif" font-size="12" fill="#94A3B8">Modern Haute-Couture</text>
    <text x="135" y="1027" text-anchor="middle" font-family="'Arial', sans-serif" font-size="11" fill="#64748B">Crisp triangular wedge serifs</text>
  </svg>
  `;

  await sharp(Buffer.from(montageSvg))
    .composite([
      // Baskerville
      { input: baskSage, top: 138, left: 240 },
      { input: baskNavy, top: 138, left: 720 },
      // Palatino
      { input: palaSage, top: 383, left: 240 },
      { input: palaNavy, top: 383, left: 720 },
      // Garamond
      { input: garaSage, top: 628, left: 240 },
      { input: garaNavy, top: 628, left: 720 },
      // Constantia
      { input: consSage, top: 873, left: 240 },
      { input: consNavy, top: 873, left: 720 }
    ])
    .png()
    .toFile(path.join(brainDir, 'font-match-showcase.png'));

  console.log('Rebuilt font-match-showcase.png with refined breathing room!');
}

rebuild().catch(console.error);
