const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const out87 = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/test_start_8.7.mp3';
const out875 = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/test_start_8.75.mp3';
const out88_fade = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/test_start_8.8_fade.mp3';

execSync(`"${ffmpeg}" -y -ss 8.70 -t 6 -i "${raw}" -c:a libmp3lame -b:a 192k "${out87}"`, { stdio: 'inherit' });
execSync(`"${ffmpeg}" -y -ss 8.75 -t 6 -i "${raw}" -c:a libmp3lame -b:a 192k "${out875}"`, { stdio: 'inherit' });
execSync(`"${ffmpeg}" -y -ss 8.78 -t 6 -i "${raw}" -af "afade=t=in:ss=0:d=0.1" -c:a libmp3lame -b:a 192k "${out88_fade}"`, { stdio: 'inherit' });
console.log('Done test clips');
