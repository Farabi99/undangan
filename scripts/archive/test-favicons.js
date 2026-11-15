const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainScratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Read authentic vector path
const rawSvg = fs.readFileSync(path.join(brainScratch, 'traced_raw.svg'), 'utf8');
const pathData = rawSvg.match(/<path d="([^"]+)"/)[1];

// Style 1: Squircle app icon with full authentic emblem (stadium ring + S-F monogram)
// Style 2: Capsule emblem (transparent outside)
function createFaviconSvg({ theme = 'akad', style = 'squircle' } = {}) {
  const isReception = theme === 'reception';
  const bg = isReception ? '#0E1B33' : '#E99DA7';
  const fg = isReception ? '#FFFFFF' : '#FFF2E9';

  if (style === 'squircle') {
    const s = 0.54;
    const tx = (256 - 492.75 * s).toFixed(2);
    const ty = (256 - 503.1 * s).toFixed(2);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="${bg}"/>
  <g transform="translate(${tx}, ${ty}) scale(${s})" fill="${fg}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
  } else if (style === 'circle') {
    const s = 0.54;
    const tx = (256 - 492.75 * s).toFixed(2);
    const ty = (256 - 503.1 * s).toFixed(2);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="256" fill="${bg}"/>
  <g transform="translate(${tx}, ${ty}) scale(${s})" fill="${fg}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
  } else if (style === 'capsule') {
    const s = 0.56;
    const tx = (256 - 492.75 * s).toFixed(2);
    const ty = (256 - 503.1 * s).toFixed(2);

    const capW = (517.5 * s + 24).toFixed(2);
    const capH = (828.4 * s + 24).toFixed(2);
    const capX = (256 - capW / 2).toFixed(2);
    const capY = (256 - capH / 2).toFixed(2);
    const capRx = (capW / 2).toFixed(2);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect x="${capX}" y="${capY}" width="${capW}" height="${capH}" rx="${capRx}" fill="${bg}"/>
  <g transform="translate(${tx}, ${ty}) scale(${s})" fill="${fg}" fill-rule="evenodd">
    <path d="${pathData}"/>
  </g>
</svg>`;
  }
}

async function testFavicons() {
  const styles = ['squircle', 'circle', 'capsule'];
  for (const st of styles) {
    const svgAkad = createFaviconSvg({ theme: 'akad', style: st });
    const svgRec = createFaviconSvg({ theme: 'reception', style: st });

    fs.writeFileSync(path.join(brainScratch, `fav_${st}_akad.svg`), svgAkad);
    fs.writeFileSync(path.join(brainScratch, `fav_${st}_rec.svg`), svgRec);

    await sharp(Buffer.from(svgAkad)).resize(64, 64).png().toFile(path.join(brainScratch, `fav_${st}_akad_64.png`));
    await sharp(Buffer.from(svgAkad)).resize(32, 32).png().toFile(path.join(brainScratch, `fav_${st}_akad_32.png`));
    await sharp(Buffer.from(svgAkad)).resize(16, 16).png().toFile(path.join(brainScratch, `fav_${st}_akad_16.png`));
    
    await sharp(Buffer.from(svgRec)).resize(32, 32).png().toFile(path.join(brainScratch, `fav_${st}_rec_32.png`));
  }

  // Create a montage comparison
  const [sq32, ci32, ca32, sqRec32] = await Promise.all([
    sharp(path.join(brainScratch, 'fav_squircle_akad_32.png')).resize(128, 128, { kernel: 'nearest' }).toBuffer(),
    sharp(path.join(brainScratch, 'fav_circle_akad_32.png')).resize(128, 128, { kernel: 'nearest' }).toBuffer(),
    sharp(path.join(brainScratch, 'fav_capsule_akad_32.png')).resize(128, 128, { kernel: 'nearest' }).toBuffer(),
    sharp(path.join(brainScratch, 'fav_squircle_rec_32.png')).resize(128, 128, { kernel: 'nearest' }).toBuffer()
  ]);

  await sharp({
    create: {
      width: 620,
      height: 180,
      channels: 4,
      background: { r: 40, g: 45, b: 55, alpha: 1 }
    }
  }).composite([
    { input: sq32, top: 26, left: 20 },
    { input: ci32, top: 26, left: 170 },
    { input: ca32, top: 26, left: 320 },
    { input: sqRec32, top: 26, left: 470 }
  ]).png().toFile(path.join(brainScratch, 'favicon_styles_comparison.png'));

  console.log('Comparison saved to favicon_styles_comparison.png');
}

testFavicons().catch(console.error);
