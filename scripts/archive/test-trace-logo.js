const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const srcImg = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/.user_uploaded/media_1794747831495_b619b17a.jpg';
const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

async function testTrace() {
  // 1. Create a high-contrast binary mask where text/border = black (for potrace) and background = white.
  // The original image has:
  // Pink bg: R~233, G~156, B~164
  // Ivory text: R~246, G~237, B~230
  // In green channel: bg is 156, text is 237.
  // Threshold around 195 gives a razor-clean mask!
  const maskBuffer = await sharp(srcImg)
    .extractChannel('green')
    .threshold(190) // pixels > 190 become 255 (white), rest 0 (black)
    .negate()       // potrace traces black shapes on white background, so negate to make text black
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'trace_mask.png'), maskBuffer);
  console.log('Saved trace_mask.png');

  // 2. Run potrace with high-precision curve smoothing
  const params = {
    threshold: 128,
    optTolerance: 0.2, // fine curve fitting
    turdSize: 5        // suppress tiny noise specks
  };

  potrace.trace(maskBuffer, params, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync(path.join(outDir, 'traced_raw.svg'), svg);
    console.log('Traced raw SVG length:', svg.length);

    // Let's render the raw trace to verify
    sharp(Buffer.from(svg)).png().toFile(path.join(outDir, 'traced_raw.png')).then(() => {
      console.log('Saved traced_raw.png');
    });
  });
}

testTrace().catch(console.error);
