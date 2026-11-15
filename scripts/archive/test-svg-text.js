const sharp = require('sharp');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="white"/>
  <text x="80" y="260" font-family="Bodoni MT, Bodoni, serif" font-size="200" fill="black">S</text>
  <text x="220" y="260" font-family="Bodoni MT, Bodoni, serif" font-size="200" fill="black">F</text>
</svg>`;

sharp(Buffer.from(svg)).png().toFile('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/svg_text_bodoni.png')
  .then(() => console.log('Saved svg_text_bodoni.png'))
  .catch(console.error);
