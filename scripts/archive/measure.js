const fs = require('fs');
const sharp = require('sharp');

sharp('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/traced_raw.png')
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    let top = info.height, bottom = 0, left = info.width, right = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        // Looking for non-white pixels (the black traced strokes)
        if (data[idx] < 128) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    console.log({ 
      width: info.width, 
      height: info.height, 
      left, 
      top, 
      right, 
      bottom, 
      strokeWidth: right - left, 
      strokeHeight: bottom - top,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2
    });
  });
