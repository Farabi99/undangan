const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const finalOut = path.resolve(__dirname, '../public/audio/syukuran.mp3');

// Start at 25.5s as requested by user
const cmd = `"${ffmpeg}" -y -ss 25.5 -to 186.5 -i "${raw}" -af "afade=t=in:ss=0:d=0.08,afade=t=out:st=158.5:d=2.4" -c:a libmp3lame -b:a 192k "${finalOut}"`;

console.log('Exporting syukuran.mp3 starting at 25.5s...');
execSync(cmd, { stdio: 'inherit' });
console.log('Export complete:', finalOut);
