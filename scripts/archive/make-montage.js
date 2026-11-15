const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:\\Users\\902222\\.gemini\\antigravity\\brain\\22a8a866-3ba5-427e-b601-bdc046945d95';

async function makeMontage() {
  const opt1Sage = await sharp(path.join(brainDir, 'option1-ampersand-gold-sage.png')).resize(320, 320).toBuffer();
  const opt1Navy = await sharp(path.join(brainDir, 'option1-ampersand-silver-navy.png')).resize(320, 320).toBuffer();

  const opt2Sage = await sharp(path.join(brainDir, 'option2-star-gold-sage.png')).resize(320, 320).toBuffer();
  const opt2Navy = await sharp(path.join(brainDir, 'option2-star-silver-navy.png')).resize(320, 320).toBuffer();

  const opt3Sage = await sharp(path.join(brainDir, 'option3-cartier-gold-sage.png')).resize(320, 320).toBuffer();
  const opt3Navy = await sharp(path.join(brainDir, 'option3-cartier-silver-navy.png')).resize(320, 320).toBuffer();

  // Create SVG backdrop
  const bgSvg = `
  <svg width="1120" height="1140" xmlns="http://www.w3.org/2000/svg">
    <rect width="1120" height="1140" fill="#080E1C"/>
    
    <!-- Header -->
    <text x="560" y="50" text-anchor="middle" font-family="'Times New Roman', serif" font-size="28" font-weight="bold" fill="#FFFFFF" letter-spacing="3">FARABI &amp; SYIFA — SIDE-BY-SIDE LOGO OPTIONS</text>
    <text x="560" y="80" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" fill="#94A3B8" letter-spacing="1">Letters F and S placed next to each other for 100% crystal-clear legibility</text>
    
    <!-- Column Titles -->
    <text x="290" y="125" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" fill="#D4B96E" letter-spacing="2">AKAD (SAGE &amp; GOLD)</text>
    <text x="830" y="125" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" fill="#CBD5E1" letter-spacing="2">RESEPSI (NAVY &amp; SILVER)</text>
    
    <!-- Option 1 Label -->
    <rect x="60" y="145" width="1000" height="30" rx="6" fill="#141E33"/>
    <text x="560" y="165" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">OPTION 1: ROYAL CREST &quot;F &amp; S&quot; (With Delicate Center Ampersand)</text>

    <!-- Option 2 Label -->
    <rect x="60" y="525" width="1000" height="30" rx="6" fill="#141E33"/>
    <text x="560" y="545" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">OPTION 2: CELESTIAL STAR &quot;F ✦ S&quot; (With 8-Point Diamond Star)</text>

    <!-- Option 3 Label -->
    <rect x="60" y="905" width="1000" height="30" rx="6" fill="#141E33"/>
    <text x="560" y="925" text-anchor="middle" font-family="'Arial', sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">OPTION 3: MODERN CARTIER &quot;F | S&quot; (Clean Architectural Duo)</text>
  </svg>
  `;

  await sharp(Buffer.from(bgSvg))
    .composite([
      // Option 1
      { input: opt1Sage, top: 185, left: 130 },
      { input: opt1Navy, top: 185, left: 670 },
      // Option 2
      { input: opt2Sage, top: 565, left: 130 },
      { input: opt2Navy, top: 565, left: 670 },
      // Option 3
      { input: opt3Sage, top: 945, left: 130 },
      { input: opt3Navy, top: 945, left: 670 }
    ])
    .png()
    .toFile(path.join(brainDir, 'logo-options-comparison.png'));

  console.log('Comparison sheet generated: logo-options-comparison.png');
}

makeMontage().catch(console.error);

