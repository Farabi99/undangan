const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicImgDir = path.join(__dirname, '..', 'public', 'img');
const publicDir = path.join(__dirname, '..', 'public');

// Read the new high-legibility SVG badges
const silverBadgeSvg = fs.readFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'));
const goldBadgeSvg = fs.readFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'));

async function generateFavicons() {
  console.log('Generating Favicons & App Icons...');

  // 192x192 PNG for PWA / Android
  await sharp(silverBadgeSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicImgDir, 'icon-192.png'));

  // 180x180 Apple Touch Icon
  await sharp(silverBadgeSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 32x32 & 16x16 standard PNG favicons
  await sharp(silverBadgeSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicImgDir, 'favicon-32x32.png'));

  await sharp(silverBadgeSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicImgDir, 'favicon-16x16.png'));

  // Also write to public/favicon.ico as a PNG fallback (modern browsers accept PNG favicons even as .ico)
  await sharp(silverBadgeSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Favicons generated successfully!');
}

async function generateOpenGraphBanners() {
  console.log('Generating Luxury 1200x630 Open Graph Banners...');

  // Render 220x220 emblems for embedding into the OG card
  const silverEmblemBuffer = await sharp(silverBadgeSvg)
    .resize(220, 220)
    .png()
    .toBuffer();

  const goldEmblemBuffer = await sharp(goldBadgeSvg)
    .resize(220, 220)
    .png()
    .toBuffer();

  // 1. Reception OG Card (Deep Navy & Silver)
  const ogReceptionSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="navyVignette" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#1B2E52"/>
        <stop offset="50%" stop-color="#0E1B33"/>
        <stop offset="100%" stop-color="#060B16"/>
      </radialGradient>
      <linearGradient id="silverText" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="50%" stop-color="#E2E8F0"/>
        <stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#navyVignette)"/>

    <!-- Subtle luxury pinstripes -->
    <g stroke="rgba(255, 255, 255, 0.025)" stroke-width="1">
      ${Array.from({ length: 42 }).map((_, i) => `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="630"/>`).join('\n')}
    </g>

    <!-- Star field particles -->
    <g fill="#FFFFFF">
      <circle cx="120" cy="90" r="1.5" opacity="0.6"/>
      <circle cx="280" cy="140" r="2" opacity="0.75"/>
      <circle cx="210" cy="380" r="1.8" opacity="0.5"/>
      <circle cx="150" cy="510" r="2.2" opacity="0.7"/>
      <circle cx="420" cy="80" r="1.5" opacity="0.4"/>
      <circle cx="780" cy="110" r="1.8" opacity="0.6"/>
      <circle cx="950" cy="160" r="2.5" opacity="0.8"/>
      <circle cx="1060" cy="90" r="1.5" opacity="0.5"/>
      <circle cx="890" cy="420" r="2" opacity="0.7"/>
      <circle cx="1020" cy="490" r="1.8" opacity="0.6"/>
      <circle cx="1120" cy="360" r="2.2" opacity="0.75"/>
      <circle cx="340" cy="540" r="1.5" opacity="0.5"/>
      <circle cx="820" cy="550" r="1.6" opacity="0.45"/>
    </g>

    <!-- Luxury Hairline Frame -->
    <rect x="36" y="36" width="1128" height="558" fill="none" stroke="rgba(226, 232, 240, 0.28)" stroke-width="1.2"/>
    <rect x="44" y="44" width="1112" height="542" fill="none" stroke="rgba(226, 232, 240, 0.15)" stroke-width="0.8" stroke-dasharray="4 4"/>

    <!-- Corner Diamond Accents -->
    <path d="M 44 44 L 50 44 L 44 50 Z" fill="rgba(226, 232, 240, 0.6)"/>
    <path d="M 1156 44 L 1150 44 L 1156 50 Z" fill="rgba(226, 232, 240, 0.6)"/>
    <path d="M 44 586 L 50 586 L 44 580 Z" fill="rgba(226, 232, 240, 0.6)"/>
    <path d="M 1156 586 L 1150 586 L 1156 580 Z" fill="rgba(226, 232, 240, 0.6)"/>

    <!-- Header Eyebrow -->
    <text x="600" y="115" font-family="'EB Garamond', Georgia, serif" font-size="20" font-weight="600" letter-spacing="9" fill="#CBD5E1" text-anchor="middle" text-transform="uppercase">
      Syukuran Pernikahan
    </text>

    <!-- Couple Names in Majestic Serif -->
    <text x="600" y="175" font-family="'Cinzel', 'Baskerville', 'EB Garamond', Georgia, serif" font-size="52" font-weight="700" letter-spacing="3" fill="#FFFFFF" text-anchor="middle">
      Farabi &amp; Syifa
    </text>

    <!-- Event Date & Venue -->
    <text x="600" y="490" font-family="'EB Garamond', Georgia, serif" font-size="22" font-weight="600" letter-spacing="5" fill="#E2E8F0" text-anchor="middle">
      SABTU, 26 DESEMBER 2026 • SURABAYA
    </text>
  </svg>
  `;

  // 2. Akad OG Card (Sage & Cream)
  const ogAkadSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sageVignette" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#8C927A"/>
        <stop offset="60%" stop-color="#7E836C"/>
        <stop offset="100%" stop-color="#5E634F"/>
      </radialGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#sageVignette)"/>

    <!-- Subtle pinstripes -->
    <g stroke="rgba(255, 255, 255, 0.04)" stroke-width="1">
      ${Array.from({ length: 42 }).map((_, i) => `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="630"/>`).join('\n')}
    </g>

    <!-- Luxury Hairline Frame -->
    <rect x="36" y="36" width="1128" height="558" fill="none" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.2"/>
    <rect x="44" y="44" width="1112" height="542" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.8" stroke-dasharray="4 4"/>

    <!-- Header Eyebrow -->
    <text x="600" y="115" font-family="'EB Garamond', Georgia, serif" font-size="20" font-weight="600" letter-spacing="9" fill="#FFFDF8" text-anchor="middle" text-transform="uppercase">
      The Wedding Of
    </text>

    <!-- Couple Names in Majestic Serif -->
    <text x="600" y="175" font-family="'Cinzel', 'Baskerville', 'EB Garamond', Georgia, serif" font-size="52" font-weight="700" letter-spacing="3" fill="#FFFFFF" text-anchor="middle">
      Farabi &amp; Syifa
    </text>

    <!-- Event Date & Venue -->
    <text x="600" y="490" font-family="'EB Garamond', Georgia, serif" font-size="22" font-weight="600" letter-spacing="5" fill="#FFFDF8" text-anchor="middle">
      SABTU, 5 DESEMBER 2026 • JAKARTA
    </text>
  </svg>
  `;

  // Composite emblem at center: (1200 - 220)/2 = 490 x, 215 y
  await sharp(Buffer.from(ogReceptionSvg))
    .composite([{ input: silverEmblemBuffer, top: 215, left: 490 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImgDir, 'og-reception.jpg'));

  await sharp(Buffer.from(ogAkadSvg))
    .composite([{ input: goldEmblemBuffer, top: 215, left: 490 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImgDir, 'og.jpg'));

  console.log('Open Graph banners generated successfully!');
}

async function run() {
  await generateFavicons();
  await generateOpenGraphBanners();
}

run().catch(console.error);

