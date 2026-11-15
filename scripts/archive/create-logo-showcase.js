const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95';
const scratchDir = path.join(brainDir, 'scratch');
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

async function createShowcase() {
  console.log('Generating final logo presentation showcase...');

  // 1. User uploaded authentic reference
  const userRef = await sharp(path.join(brainDir, '.user_uploaded', 'media_1794747831495_b619b17a.jpg'))
    .resize(360, 360, { fit: 'contain', background: { r: 245, g: 245, b: 245, alpha: 1 } })
    .toBuffer();

  // 2. Akad Theme Emblem on warm ivory background (#FAF6F0)
  const akadEmblem = await sharp(path.join(publicImgDir, 'logo-fs.png'))
    .resize(320, 320, { fit: 'contain' })
    .toBuffer();
  const akadCard = await sharp({
    create: {
      width: 360,
      height: 360,
      channels: 4,
      background: { r: 250, g: 246, b: 240, alpha: 1 } // #FAF6F0
    }
  }).composite([
    { input: akadEmblem, top: 20, left: 20 }
  ]).png().toBuffer();

  // 3. Syukuran / Reception Theme Emblem on Nocturnal Deep Navy (#080E1C)
  const recepEmblem = await sharp(path.join(publicImgDir, 'logo-fs-silver.png'))
    .resize(320, 320, { fit: 'contain' })
    .toBuffer();
  const recepCard = await sharp({
    create: {
      width: 360,
      height: 360,
      channels: 4,
      background: { r: 8, g: 14, b: 28, alpha: 1 } // #080E1C
    }
  }).composite([
    { input: recepEmblem, top: 20, left: 20 }
  ]).png().toBuffer();

  // 4. Social / WhatsApp preview card (Solid Dusty Rose)
  const socialCard = await sharp(path.join(publicImgDir, 'logo-image.png'))
    .resize(360, 360, { fit: 'cover' })
    .toBuffer();

  // SVG Banner Header & Subtitles
  const bannerWidth = 1580;
  const bannerHeight = 520;
  const headerSvg = `
  <svg width="${bannerWidth}" height="${bannerHeight}">
    <rect width="${bannerWidth}" height="${bannerHeight}" fill="#1A1C23" rx="16"/>
    <text x="790" y="50" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" letter-spacing="2">FARABI &amp; SYIFA — AUTHENTIC MONOGRAM EMBLEM IMPLEMENTATION</text>
    
    <!-- Column 1 Header -->
    <text x="200" y="95" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#CBD5E1">1. YOUR ORIGINAL ASSET</text>
    <text x="200" y="115" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Uploaded reference graphic</text>

    <!-- Column 2 Header -->
    <text x="590" y="95" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#E99DA7">2. AKAD THEME EMBLEM</text>
    <text x="590" y="115" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Dusty Rose &amp; Ivory on #FAF6F0</text>

    <!-- Column 3 Header -->
    <text x="980" y="95" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#93C5FD">3. SYUKURAN THEME EMBLEM</text>
    <text x="980" y="115" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">Nocturnal Navy &amp; Silver (0% pink/green)</text>

    <!-- Column 4 Header -->
    <text x="1370" y="95" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#F472B6">4. SOCIAL &amp; FAVICON ASSET</text>
    <text x="1370" y="115" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94A3B8">WhatsApp, OG Card &amp; App Icons</text>
  </svg>
  `;

  const bannerBuf = Buffer.from(headerSvg);

  await sharp(bannerBuf)
    .composite([
      { input: userRef, top: 135, left: 20 },
      { input: akadCard, top: 135, left: 410 },
      { input: recepCard, top: 135, left: 800 },
      { input: socialCard, top: 135, left: 1190 }
    ])
    .png()
    .toFile(path.join(scratchDir, 'logo_final_showcase.png'));

  console.log('Saved logo_final_showcase.png successfully!');
}

createShowcase().catch(err => {
  console.error('Error creating showcase:', err);
  process.exit(1);
});
