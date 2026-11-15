const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const finalOut = path.resolve(__dirname, '../public/audio/syukuran.mp3');

// Raw total duration is 188.6s.
// Start at 8.80s (exact sax start, 0 bell).
// Duration until 186.5s = ~177.7s.
// Fade in for 0.08s at start (smooth note entry), fade out for 2.5s from 175s to 177.5s.
const cmd = `"${ffmpeg}" -y -ss 8.80 -to 186.5 -i "${raw}" -af "afade=t=in:ss=0:d=0.08,afade=t=out:st=175.2:d=2.5" -c:a libmp3lame -b:a 192k "${finalOut}"`;

console.log('Exporting final syukuran.mp3...');
execSync(cmd, { stdio: 'inherit' });
console.log('Export complete:', finalOut);
