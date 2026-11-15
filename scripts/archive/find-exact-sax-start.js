const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const inputPath = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

const starts = [8.0, 8.4, 8.6, 8.8, 8.9, 9.0];
starts.forEach(s => {
  const out = path.join(scratch, `test_start_${s}.mp3`);
  execSync(`"${ffmpeg}" -y -i "${inputPath}" -ss ${s} -t 5 -c:a mp3 "${out}"`);
});

console.log('Test start clips generated.');
