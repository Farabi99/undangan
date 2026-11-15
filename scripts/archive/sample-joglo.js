const sharp = require('sharp');

sharp('public/img/rumah-joglo.jpg')
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const samples = [
      [10, 10], [100, 10], [210, 10], [300, 10], [400, 10],
      [10, 250], [400, 250], [10, 100], [410, 100]
    ];
    samples.forEach(([x, y]) => {
      const idx = (y * info.width + x) * info.channels;
      console.log(`Pixel at (${x}, ${y}): r=${data[idx]}, g=${data[idx+1]}, b=${data[idx+2]}`);
    });
  });
