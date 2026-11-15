const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95/scratch';

async function run() {
  console.log('Launching browser to capture screenshots...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile viewport - Akad Cover
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/farhan', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, 'shot_akad_mobile_cover.png') });
  console.log('Saved shot_akad_mobile_cover.png');

  // Open curtain on Akad
  const openBtn = await page.$('#btnOpenInvitation');
  if (openBtn) {
    await openBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }
  await page.screenshot({ path: path.join(outDir, 'shot_akad_mobile_welcome.png') });
  console.log('Saved shot_akad_mobile_welcome.png');

  // Scroll to couple avatars
  await page.evaluate(() => {
    const el = document.getElementById('coupleSection') || document.querySelector('.couple-profiles-wrap');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'shot_akad_mobile_couple.png') });
  console.log('Saved shot_akad_mobile_couple.png');

  // Scroll to closing
  await page.evaluate(() => {
    const el = document.getElementById('closingSection') || document.querySelector('.section-closing');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'shot_akad_mobile_closing.png') });
  console.log('Saved shot_akad_mobile_closing.png');

  // 2. Mobile viewport - Syukuran / Resepsi Cover
  await page.goto('http://localhost:3000/resepsi/farhan', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, 'shot_syukuran_mobile_cover.png') });
  console.log('Saved shot_syukuran_mobile_cover.png');

  // Open curtain on Syukuran
  const openBtnSyukuran = await page.$('#btnOpenInvitation');
  if (openBtnSyukuran) {
    await openBtnSyukuran.click();
    await new Promise(r => setTimeout(r, 1200));
  }
  await page.screenshot({ path: path.join(outDir, 'shot_syukuran_mobile_welcome.png') });
  console.log('Saved shot_syukuran_mobile_welcome.png');

  // Scroll to couple avatars
  await page.evaluate(() => {
    const el = document.getElementById('coupleSection') || document.querySelector('.couple-profiles-wrap');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'shot_syukuran_mobile_couple.png') });
  console.log('Saved shot_syukuran_mobile_couple.png');

  // Scroll to closing
  await page.evaluate(() => {
    const el = document.getElementById('closingSection') || document.querySelector('.section-closing');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'shot_syukuran_mobile_closing.png') });
  console.log('Saved shot_syukuran_mobile_closing.png');

  // 3. Desktop viewport - Akad & Syukuran
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/farhan', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, 'shot_akad_desktop.png') });
  console.log('Saved shot_akad_desktop.png');

  await page.goto('http://localhost:3000/resepsi/farhan', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, 'shot_syukuran_desktop.png') });
  console.log('Saved shot_syukuran_desktop.png');

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
