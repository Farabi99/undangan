const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const target = process.argv[2] || 'palatino';
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

console.log(`Applying authentic font logo: ${target}...`);

let sageSvgPath = path.join(publicImgDir, 'logo-options', `logo-${target}-sage.svg`);
let navySvgPath = path.join(publicImgDir, 'logo-options', `logo-${target}-navy.svg`);

if (!fs.existsSync(sageSvgPath)) {
  sageSvgPath = path.join(publicImgDir, `${target}-sage.svg`);
  navySvgPath = path.join(publicImgDir, `${target}-navy.svg`);
}

if (!fs.existsSync(sageSvgPath) || !fs.existsSync(navySvgPath)) {
  console.error(`Error: SVGs for ${target} not found!`);
  process.exit(1);
}

const sageSvg = fs.readFileSync(sageSvgPath, 'utf8');
const navySvg = fs.readFileSync(navySvgPath, 'utf8');

// Transparent SVGs remove solid background circle
const sageTransparentSvg = sageSvg.replace(/<circle cx="250" cy="250" r="248" fill="#7E836C"\/>/, '');
const navyTransparentSvg = navySvg.replace(/<circle cx="250" cy="250" r="248" fill="#0E1B33"\/>/, '');

// Write primary SVGs
fs.writeFileSync(path.join(publicImgDir, 'logo-fs.svg'), sageTransparentSvg);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-silver.svg'), navyTransparentSvg);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge.svg'), sageSvg);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-silver.svg'), navySvg);
fs.writeFileSync(path.join(publicImgDir, 'logo-fs-badge-navy.svg'), navySvg);

// Generate corresponding PNGs
Promise.all([
  sharp(Buffer.from(sageTransparentSvg)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs.png')),
  sharp(Buffer.from(navyTransparentSvg)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-silver.png')),
  sharp(Buffer.from(sageSvg)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge.png')),
  sharp(Buffer.from(navySvg)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge-silver.png')),
  sharp(Buffer.from(navySvg)).resize(600, 600).png().toFile(path.join(publicImgDir, 'logo-fs-badge-navy.png')),
  sharp(Buffer.from(sageTransparentSvg)).resize(240, 240).png().toFile(path.join(publicImgDir, 'logo-image.png'))
]).then(() => {
  console.log(`Applied ${target} to all primary logo assets!`);
  console.log('Re-generating OG banners and favicons...');
  try {
    execSync('node scripts/generate-og-and-favicons.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('Favicons and OG banners updated successfully!');
  } catch (err) {
    console.warn('Warning: OG update failed:', err.message);
  }
}).catch(console.error);
