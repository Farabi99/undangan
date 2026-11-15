const sharp = require('sharp');
const path = require('path');

const brainDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95';
const scratchDir = path.join(brainDir, 'scratch');

async function createFaviconShowcase() {
  // Crop old tab icon from user screenshot media_1794748730847_1548408a.jpg
  // The user screenshot is 768x1024. In the screenshot, the left sidebar tab bar has icons at x ~18, y ~258
  const oldIconCrop = await sharp(path.join(brainDir, '.user_uploaded', 'media_1794748730847_1548408a.jpg'))
    .extract({ left: 4, top: 236, width: 34, height: 44 })
    .resize(100, 130, { kernel: 'nearest' })
    .toBuffer();

  // New Akad Favicon (64x64 scaled up)
  const newAkadIcon = await sharp(path.join(scratchDir, 'fav_capsule_akad_32.png'))
    .resize(100, 100, { kernel: 'nearest' })
    .toBuffer();

  // New Reception Favicon (64x64 scaled up)
  const newRecIcon = await sharp(path.join(scratchDir, 'fav_capsule_rec.svg'))
    .resize(100, 100)
    .toBuffer();

  const width = 860;
  const height = 340;
  const svg = `
  <svg width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#1E222B" rx="12"/>
    <text x="${width/2}" y="42" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF" letter-spacing="1">BROWSER TAB &amp; URL FAVICON UPDATE</text>

    <!-- Card 1: Old Cached Icon -->
    <rect x="30" y="70" width="240" height="230" fill="#282D37" rx="8" stroke="#3D4452" stroke-width="1"/>
    <text x="150" y="100" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#EF4444">OLD (BEFORE)</text>
    <text x="150" y="122" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" fill="#94A3B8">From Edge Vertical Tabs</text>

    <!-- Card 2: New Akad Favicon -->
    <rect x="310" y="70" width="240" height="230" fill="#282D37" rx="8" stroke="#E99DA7" stroke-width="1.5"/>
    <text x="430" y="100" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#E99DA7">NEW AKAD FAVICON</text>
    <text x="430" y="122" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" fill="#CBD5E1">Dusty Rose Authentic Capsule</text>

    <!-- Card 3: New Syukuran Favicon -->
    <rect x="590" y="70" width="240" height="230" fill="#282D37" rx="8" stroke="#60A5FA" stroke-width="1.5"/>
    <text x="710" y="100" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#93C5FD">NEW SYUKURAN FAVICON</text>
    <text x="710" y="122" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" fill="#CBD5E1">Deep Navy &amp; Silver Capsule</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([
      { input: oldIconCrop, top: 145, left: 100 },
      { input: newAkadIcon, top: 145, left: 380 },
      { input: newRecIcon, top: 145, left: 660 }
    ])
    .png()
    .toFile(path.join(brainDir, 'favicon_update_showcase.png'));

  console.log('Saved favicon_update_showcase.png');
}

createFaviconShowcase().catch(console.error);
