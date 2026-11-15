const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const scratch = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

execSync(`"${ffmpeg}" -y -ss 32.00 -t 6 -i "${raw}" -af "afade=t=in:ss=0:d=0.06" -c:a mp3 "${path.join(scratch, 'test_final_sax_3200.mp3')}"`);
execSync(`"${ffmpeg}" -y -ss 32.05 -t 6 -i "${raw}" -af "afade=t=in:ss=0:d=0.04" -c:a mp3 "${path.join(scratch, 'test_final_sax_3205.mp3')}"`);
execSync(`"${ffmpeg}" -y -ss 32.08 -t 6 -i "${raw}" -af "afade=t=in:ss=0:d=0.03" -c:a mp3 "${path.join(scratch, 'test_final_sax_3208.mp3')}"`);
console.log('Done test_final_sax');
