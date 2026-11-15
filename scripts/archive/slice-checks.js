const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's slice:
// 0 to 10s
// 10 to 20s
// 20 to 35s
// 35 to 50s
execSync(`"${ffmpeg}" -y -ss 0 -t 10 -i "${raw}" -c:a mp3 "${path.join(scratch, 'check_0_10.mp3')}"`);
execSync(`"${ffmpeg}" -y -ss 10 -t 15 -i "${raw}" -c:a mp3 "${path.join(scratch, 'check_10_25.mp3')}"`);
execSync(`"${ffmpeg}" -y -ss 25 -t 20 -i "${raw}" -c:a mp3 "${path.join(scratch, 'check_25_45.mp3')}"`);
console.log('Done generating check slices');
