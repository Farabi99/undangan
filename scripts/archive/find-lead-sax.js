const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

const times = [25.5, 25.8, 26.0, 26.2];
times.forEach(t => {
  execSync(`"${ffmpeg}" -y -ss ${t} -t 6 -i "${raw}" -c:a mp3 "${path.join(scratch, `lead_sax_${t}.mp3`)}"`);
});
console.log('Done lead slices');
