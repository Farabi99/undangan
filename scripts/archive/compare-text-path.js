const sharp = require('sharp');
const path = require('path');

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/svg_text_bodoni.png')
  .resize(400, 400, { fit: 'contain', background: 'white' })
  .toBuffer()
  .then(bText => {
    return sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/just_SF.png')
      .resize(400, 400, { fit: 'contain', background: 'white' })
      .toBuffer()
      .then(bPath => {
        return sharp({
          create: {
            width: 820,
            height: 420,
            channels: 4,
            background: { r: 240, g: 240, b: 240, alpha: 1 }
          }
        }).composite([
          { input: bText, top: 10, left: 10 },
          { input: bPath, top: 10, left: 410 }
        ]).png().toFile(path.join(outDir, 'text_vs_path.png'));
      });
  }).then(() => console.log('Saved text_vs_path.png')).catch(console.error);
