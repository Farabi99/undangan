const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95';

async function createMusicShowcase() {
  const width = 880;
  const height = 440;

  const svg = `
  <svg width="${width}" height="${height}">
    <defs>
      <!-- Akad Disc Gradient -->
      <radialGradient id="akadGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E99DA7"/>
        <stop offset="60%" stop-color="#C98A86"/>
        <stop offset="100%" stop-color="#8E4F49"/>
      </radialGradient>
      <!-- Syukuran Disc Gradient -->
      <radialGradient id="syukuranGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1E3A6C"/>
        <stop offset="65%" stop-color="#0E1B33"/>
        <stop offset="100%" stop-color="#050B14"/>
      </radialGradient>
      <!-- Drop Shadows -->
      <filter id="akadShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#8E4F49" flood-opacity="0.35"/>
      </filter>
      <filter id="syukuranShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#030712" flood-opacity="0.75"/>
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#E2E8F0" flood-opacity="0.35"/>
      </filter>
    </defs>

    <rect width="${width}" height="${height}" fill="#161922" rx="14"/>
    <text x="${width/2}" y="38" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF" letter-spacing="1">BACKGROUND MUSIC INTEGRATION</text>

    <!-- CARD 1: AKAD DESIGN MUSIC -->
    <rect x="35" y="75" width="385" height="325" fill="#FAF6F0" rx="12" stroke="#E99DA7" stroke-width="1.5"/>
    <text x="55" y="110" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#8E4F49">🌸 AKAD DESIGN MUSIC</text>
    <text x="55" y="134" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#2C2420">Malam Bainai (Talempong Instrumental)</text>
    <text x="55" y="154" font-family="'Segoe UI', sans-serif" font-size="12" fill="#756A63">By Indra Jaya Official • Minangkabau Traditional</text>

    <!-- Vinyl Disc Graphic Akad -->
    <g transform="translate(195, 255)">
      <!-- Disc Body -->
      <circle cx="0" cy="0" r="48" fill="url(#akadGrad)" filter="url(#akadShadow)" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
      <!-- Grooves -->
      <circle cx="0" cy="0" r="38" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
      <!-- Center -->
      <circle cx="0" cy="0" r="18" fill="#FFF2E9"/>
      <path d="M-2 -8 v10.55 c-.59-.34 -1.27-.55 -2-.55 -2.21 0 -4 1.79 -4 4 s1.79 4 4 4 4 -1.79 4 -4 V-4 h4 V-8 h-6 z" fill="#8E4F49" transform="scale(0.85) translate(4, -2)"/>
    </g>

    <!-- EQ Waves Akad -->
    <rect x="255" y="215" width="4" height="12" fill="#8E4F49" rx="2"/>
    <rect x="263" y="208" width="4" height="26" fill="#8E4F49" rx="2"/>
    <rect x="271" y="218" width="4" height="16" fill="#8E4F49" rx="2"/>

    <text x="227" y="365" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="600" fill="#8E4F49">Floating Luxury Disc Player (Rotating Vinyl)</text>


    <!-- CARD 2: SYUKURAN DESIGN MUSIC -->
    <rect x="460" y="75" width="385" height="325" fill="#080E1C" rx="12" stroke="#60A5FA" stroke-width="1.5"/>
    <text x="480" y="110" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#93C5FD">🌙 SYUKURAN DESIGN MUSIC</text>
    <text x="480" y="134" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#FFFFFF">Janji Putih (Saxophone Instrumental)</text>
    <text x="480" y="154" font-family="'Segoe UI', sans-serif" font-size="12" fill="#94A3B8">Cover Saxophone • Pop Ballad Ambon</text>

    <!-- Vinyl Disc Graphic Syukuran -->
    <g transform="translate(620, 255)">
      <!-- Disc Body -->
      <circle cx="0" cy="0" r="48" fill="url(#syukuranGrad)" filter="url(#syukuranShadow)" stroke="#E2E8F0" stroke-width="2"/>
      <!-- Grooves -->
      <circle cx="0" cy="0" r="38" fill="none" stroke="rgba(226,232,240,0.3)" stroke-width="1"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(226,232,240,0.3)" stroke-width="1"/>
      <!-- Center -->
      <circle cx="0" cy="0" r="18" fill="#FFFFFF"/>
      <path d="M-2 -8 v10.55 c-.59-.34 -1.27-.55 -2-.55 -2.21 0 -4 1.79 -4 4 s1.79 4 4 4 4 -1.79 4 -4 V-4 h4 V-8 h-6 z" fill="#0E1B33" transform="scale(0.85) translate(4, -2)"/>
    </g>

    <!-- EQ Waves Syukuran -->
    <rect x="680" y="215" width="4" height="12" fill="#E2E8F0" rx="2"/>
    <rect x="688" y="208" width="4" height="26" fill="#E2E8F0" rx="2"/>
    <rect x="696" y="218" width="4" height="16" fill="#E2E8F0" rx="2"/>

    <text x="652" y="365" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="600" fill="#E2E8F0">Floating Moonlight Disc Player (Rotating Vinyl)</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(brainDir, 'music_feature_showcase.png'));

  console.log('Saved music_feature_showcase.png!');
}

createMusicShowcase().catch(console.error);
