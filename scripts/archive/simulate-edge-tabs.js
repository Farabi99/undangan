const sharp = require('sharp');
const path = require('path');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

async function simulateEdgeTabs() {
  // Edge vertical tab slot background is #2B3532
  // Tab item height ~40px, icon size 18x18 or 20x20
  const iconSq = await sharp(path.join(brainScratch, 'fav_squircle_akad_32.png')).resize(20, 20).toBuffer();
  const iconCa = await sharp(path.join(brainScratch, 'fav_capsule_akad_32.png')).resize(20, 20).toBuffer();
  const iconCi = await sharp(path.join(brainScratch, 'fav_circle_akad_32.png')).resize(20, 20).toBuffer();
  const iconSqRec = await sharp(path.join(brainScratch, 'fav_squircle_rec_32.png')).resize(20, 20).toBuffer();
  const iconCaRec = await sharp(path.join(brainScratch, 'fav_capsule_rec.svg')).resize(20, 20).toBuffer();

  const svgTabMock = `
  <svg width="700" height="260">
    <rect width="700" height="260" fill="#202624" rx="8"/>
    <text x="20" y="32" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#E2E8F0">MICROSOFT EDGE VERTICAL TABS SIMULATION (100% SCALE &amp; 300% ZOOM)</text>

    <!-- Tab 1: Squircle Akad -->
    <rect x="20" y="55" width="310" height="42" fill="#2B3532" rx="6" stroke="#3A4844" stroke-width="1"/>
    <text x="56" y="81" font-family="'Segoe UI', sans-serif" font-size="13" fill="#FFFFFF">Farabi &amp; Syifa Wedding (Squircle)</text>

    <!-- Tab 2: Stadium Capsule Akad -->
    <rect x="20" y="105" width="310" height="42" fill="#2B3532" rx="6" stroke="#3A4844" stroke-width="1"/>
    <text x="56" y="131" font-family="'Segoe UI', sans-serif" font-size="13" fill="#FFFFFF">Farabi &amp; Syifa Wedding (Capsule)</text>

    <!-- Tab 3: Syukuran Squircle -->
    <rect x="20" y="155" width="310" height="42" fill="#2B3532" rx="6" stroke="#3A4844" stroke-width="1"/>
    <text x="56" y="181" font-family="'Segoe UI', sans-serif" font-size="13" fill="#FFFFFF">Farabi &amp; Syifa Syukuran (Navy Squircle)</text>

    <!-- Tab 4: Syukuran Capsule -->
    <rect x="20" y="205" width="310" height="42" fill="#2B3532" rx="6" stroke="#3A4844" stroke-width="1"/>
    <text x="56" y="231" font-family="'Segoe UI', sans-serif" font-size="13" fill="#FFFFFF">Farabi &amp; Syifa Syukuran (Navy Capsule)</text>
  </svg>
  `;

  // Zoomed version for the right pane
  const zSq = await sharp(iconSq).resize(60, 60, { kernel: 'nearest' }).toBuffer();
  const zCa = await sharp(iconCa).resize(60, 60, { kernel: 'nearest' }).toBuffer();
  const zSqRec = await sharp(iconSqRec).resize(60, 60, { kernel: 'nearest' }).toBuffer();
  const zCaRec = await sharp(iconCaRec).resize(60, 60, { kernel: 'nearest' }).toBuffer();

  await sharp(Buffer.from(svgTabMock))
    .composite([
      { input: iconSq, top: 66, left: 28 },
      { input: iconCa, top: 116, left: 28 },
      { input: iconSqRec, top: 166, left: 28 },
      { input: iconCaRec, top: 216, left: 28 },

      { input: zSq, top: 50, left: 450 },
      { input: zCa, top: 140, left: 450 },
      { input: zSqRec, top: 50, left: 560 },
      { input: zCaRec, top: 140, left: 560 }
    ])
    .png()
    .toFile(path.join(brainScratch, 'edge_tab_simulation.png'));

  console.log('Simulated Edge tabs in edge_tab_simulation.png');
}

simulateEdgeTabs().catch(console.error);
