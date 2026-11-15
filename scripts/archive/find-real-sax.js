const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Slices from 28s to 35s
const cuts = [28, 29, 30, 31, 32, 33, 34];
cuts.forEach(s => {
  execSync(`"${ffmpeg}" -y -ss ${s} -t 6 -i "${raw}" -c:a mp3 "${path.join(scratch, `sax_check_${s}.mp3`)}"`);
});
console.log('Done sax check slices');
