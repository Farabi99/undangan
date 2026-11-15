const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/raw_syukuran.mp3';

// Let's decode the first 12 seconds into 16-bit 44.1kHz mono WAV
const wavPath = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch/first_12s.wav';
execSync(`"${ffmpeg}" -y -i "${inputPath}" -t 12 -ar 44100 -ac 1 "${wavPath}"`);

// Read PCM samples from WAV (WAV header is 44 bytes)
const wavBuf = fs.readFileSync(wavPath);
const pcm = wavBuf.slice(44);
const numSamples = pcm.length / 2;

console.log('Decoded', numSamples, 'samples (duration:', (numSamples / 44100).toFixed(2), 's)');

// Calculate RMS energy per 0.1 second block
const blockSize = 4410; // 0.1s
const blocks = [];
for (let i = 0; i < numSamples; i += blockSize) {
  let sumSq = 0;
  const count = Math.min(blockSize, numSamples - i);
  for (let j = 0; j < count; j++) {
    const sample = pcm.readInt16LE((i + j) * 2);
    sumSq += sample * sample;
  }
  const rms = Math.sqrt(sumSq / count);
  const time = (i / 44100).toFixed(1);
  blocks.push({ time, rms: Math.round(rms) });
}

// Print timeline of energy
blocks.forEach(b => {
  const bars = '#'.repeat(Math.min(50, Math.round(b.rms / 200)));
  console.log(`${b.time.padStart(4)}s [${String(b.rms).padStart(5)}]: ${bars}`);
});
