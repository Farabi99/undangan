const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const raw = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';
const outEnd = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/test_end.mp3';

// The total duration is ~188.6s (3m 8s). Let's extract the last 15 seconds: from 173s to 188.6s
execSync(`"${ffmpeg}" -y -ss 173 -i "${raw}" -c:a libmp3lame -b:a 192k "${outEnd}"`, { stdio: 'inherit' });
console.log('Done end clip');
