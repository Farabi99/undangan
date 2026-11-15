const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

execSync(`"${ffmpeg}" -y -ss 25.9 -t 8 -i "${raw}" -af "afade=t=in:ss=0:d=0.08" -c:a mp3 "${path.join(scratch, 'test_opt_259.mp3')}"`);
execSync(`"${ffmpeg}" -y -ss 26.0 -t 8 -i "${raw}" -af "afade=t=in:ss=0:d=0.06" -c:a mp3 "${path.join(scratch, 'test_opt_260.mp3')}"`);
console.log('Done test_opt');
