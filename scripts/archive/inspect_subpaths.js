const fs = require('fs');

const svg = fs.readFileSync('C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/traced_raw.svg', 'utf8');

// The path has multiple subpaths (separated by M or m or Z)
const subpaths = svg.match(/M[^M]+/g);
console.log('Number of subpaths:', subpaths ? subpaths.length : 0);

if (subpaths) {
  subpaths.forEach((sp, idx) => {
    // find min and max x, y in this subpath
    const nums = sp.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < nums.length; i += 2) {
      if (nums[i] < minX) minX = nums[i];
      if (nums[i] > maxX) maxX = nums[i];
      if (nums[i+1] < minY) minY = nums[i+1];
      if (nums[i+1] > maxY) maxY = nums[i+1];
    }
    console.log(`Subpath ${idx}: x[${minX.toFixed(1)}, ${maxX.toFixed(1)}], y[${minY.toFixed(1)}, ${maxY.toFixed(1)}], len: ${sp.length}`);
  });
}
