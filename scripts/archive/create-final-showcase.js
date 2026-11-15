const sharp = require('sharp');
const path = require('path');

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

Promise.all([
  sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/cropped_logo.png')
    .resize(380, 520, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer(),
  sharp('C:/Users/902222/Documents/nikah/Undangan/public/img/logo-fs.png')
    .resize(380, 520, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer(),
  sharp('C:/Users/902222/Documents/nikah/Undangan/public/img/logo-fs-silver.png')
    .resize(380, 520, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer()
]).then(([bPhoto, bRose, bSilver]) => {
  return sharp({
    create: {
      width: 1200,
      height: 540,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 }
    }
  }).composite([
    { input: bPhoto, top: 10, left: 10 },
    { input: bRose, top: 10, left: 410 },
    { input: bSilver, top: 10, left: 810 }
  ]).png().toFile(path.join(outDir, 'final_side_by_side_showcase.png'));
}).then(() => console.log('Saved final_side_by_side_showcase.png')).catch(console.error);
