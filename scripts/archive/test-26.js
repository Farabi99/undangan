const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

execSync(`"${ffmpeg}" -y -ss 26.0 -t 12 -i "${raw}" -af "afade=t=in:ss=0:d=0.08" -c:a mp3 "${path.join(scratch, 'test_start_26.mp3')}"`);
console.log('Done test_start_26');
