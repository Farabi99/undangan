const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95';
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

async function createSyukuranShowcase() {
  // 1. Story Chapter Header Comparison
  // Old: Two ugly boxes as uploaded by user
  const userBoxCrop = await sharp(path.join(brainDir, '.user_uploaded', 'media_1794748856667_220d9b93.png'))
    .resize(260, 60, { fit: 'contain', background: { r: 8, g: 14, b: 28, alpha: 1 } })
    .toBuffer();

  // New: Clean typography (SVG simulation on #080E1C)
  const newHeaderSvg = `
  <svg width="260" height="60">
    <rect width="260" height="60" fill="#080E1C"/>
    <text x="10" y="38" font-family="'Cinzel', 'Playfair Display', serif" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">BAB I</text>
    <circle cx="82" cy="32" r="2.5" fill="#94A3B8" opacity="0.6"/>
    <text x="96" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="500" fill="#94A3B8">2017–2020</text>
  </svg>
  `;
  const newHeaderBuf = Buffer.from(newHeaderSvg);

  // 2. Joglo House Comparison on Nocturnal Deep Navy (#080E1C)
  // Old joglo (with sage/grey rectangle background)
  const oldJogloBuf = await sharp(path.join(publicImgDir, 'rumah-joglo.jpg'))
    .resize(320, 200, { fit: 'cover' })
    .toBuffer();

  // New joglo (silver transparent etching on #080E1C)
  const newJogloTrans = await sharp(path.join(publicImgDir, 'rumah-joglo-silver.webp'))
    .resize(320, 200, { fit: 'contain' })
    .toBuffer();

  const newJogloOnNavy = await sharp({
    create: {
      width: 320,
      height: 200,
      channels: 4,
      background: { r: 8, g: 14, b: 28, alpha: 1 }
    }
  }).composite([
    { input: newJogloTrans, top: 0, left: 0 }
  ]).png().toBuffer();

  // Full composite banner
  const width = 840;
  const height = 480;
  const bannerSvg = `
  <svg width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#161922" rx="14"/>
    <text x="${width/2}" y="36" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="600" fill="#FFFFFF" letter-spacing="1">SYUKURAN DESIGN REFINEMENTS SHOWCASE</text>

    <!-- SECTION 1: CHAPTER PILLS -->
    <text x="40" y="70" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#93C5FD">1. CHAPTER BADGES (BOX BORDERS REMOVED)</text>
    <rect x="40" y="85" width="360" height="90" fill="#080E1C" rx="8" stroke="#EF4444" stroke-width="1"/>
    <text x="55" y="105" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#EF4444">BEFORE (HARSH OUTLINE BOXES)</text>

    <rect x="440" y="85" width="360" height="90" fill="#080E1C" rx="8" stroke="#10B981" stroke-width="1.5"/>
    <text x="455" y="105" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#10B981">AFTER (CLEAN ELEGANT TYPOGRAPHY)</text>

    <!-- SECTION 2: JOGLO BACKGROUND -->
    <text x="40" y="210" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#93C5FD">2. JOGLO HOUSE (GREYISH BACKGROUND REMOVED)</text>
    <rect x="40" y="225" width="360" height="230" fill="#080E1C" rx="8" stroke="#EF4444" stroke-width="1"/>
    <text x="55" y="245" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#EF4444">BEFORE (GREYISH CLASHING BACKGROUND)</text>

    <rect x="440" y="225" width="360" height="230" fill="#080E1C" rx="8" stroke="#10B981" stroke-width="1.5"/>
    <text x="455" y="245" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#10B981">AFTER (100% TRANSPARENT SILVER ETCHING)</text>
  </svg>
  `;

  await sharp(Buffer.from(bannerSvg))
    .composite([
      { input: userBoxCrop, top: 110, left: 90 },
      { input: newHeaderBuf, top: 110, left: 490 },
      { input: oldJogloBuf, top: 250, left: 60 },
      { input: newJogloOnNavy, top: 250, left: 460 }
    ])
    .png()
    .toFile(path.join(brainDir, 'syukuran_refinements_showcase.png'));

  console.log('Saved syukuran_refinements_showcase.png successfully!');
}

createSyukuranShowcase().catch(console.error);
