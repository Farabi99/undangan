const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

const times = [31.8, 31.9, 32.0, 32.05, 32.1, 32.15];
times.forEach(t => {
  execSync(`"${ffmpeg}" -y -ss ${t} -t 5 -i "${raw}" -c:a mp3 "${path.join(scratch, `exact_sax_${t}.mp3`)}"`);
});
console.log('Done exact slices');
