const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const inputPath = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

// Let's create:
// clip 1: 0s to 5s
// clip 2: 3.3s to 8s
// clip 3: 5.5s to 12s
// clip 4: 8.8s to 15s
execSync(`"${ffmpeg}" -y -i "${inputPath}" -ss 0 -to 5 -c:a mp3 "${path.join(scratch, 'clip_0_5.mp3')}"`);
execSync(`"${ffmpeg}" -y -i "${inputPath}" -ss 3.3 -to 8 -c:a mp3 "${path.join(scratch, 'clip_33_8.mp3')}"`);
execSync(`"${ffmpeg}" -y -i "${inputPath}" -ss 5.5 -to 12 -c:a mp3 "${path.join(scratch, 'clip_55_12.mp3')}"`);
execSync(`"${ffmpeg}" -y -i "${inputPath}" -ss 8.8 -to 16 -c:a mp3 "${path.join(scratch, 'clip_88_16.mp3')}"`);

console.log('Clips exported.');
