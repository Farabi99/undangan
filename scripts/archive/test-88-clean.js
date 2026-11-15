const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const out88 = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/test_start_8.80_clean.mp3';

execSync(`"${ffmpeg}" -y -ss 8.80 -t 8 -i "${raw}" -af "afade=t=in:ss=0:d=0.08" -c:a libmp3lame -b:a 192k "${out88}"`, { stdio: 'inherit' });
console.log('Done 8.80 clean');
