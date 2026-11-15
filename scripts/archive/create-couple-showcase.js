const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:/Users/902222/.gemini/antigravity/brain/22a8a866-3ba5-427e-b601-bdc046945d95';
const coupleDir = path.join(__dirname, '..', 'public', 'img', 'couple');
const storyDir = path.join(__dirname, '..', 'public', 'img', 'story');

async function createShowcase() {
  const width = 1000;
  const height = 980;

  // Prepare Couple Images
  const syifaNow = await sharp(path.join(coupleDir, 'syifa-now.webp')).resize(130, 165, { fit: 'cover' }).toBuffer();
  const syifaChild = await sharp(path.join(coupleDir, 'syifa-child.webp')).resize(130, 165, { fit: 'cover' }).toBuffer();
  const farabiNow = await sharp(path.join(coupleDir, 'farabi-now.webp')).resize(130, 165, { fit: 'cover' }).toBuffer();
  const farabiChild = await sharp(path.join(coupleDir, 'farabi-child.webp')).resize(130, 165, { fit: 'cover' }).toBuffer();

  // Prepare 8 Story Chapters thumbnails (95x95)
  const chImgs = [];
  for (let i = 1; i <= 8; i++) {
    const buf = await sharp(path.join(storyDir, 'chapter-' + i + '.webp'))
      .resize(95, 95, { fit: 'cover' })
      .toBuffer();
    chImgs.push(buf);
  }

  const svg = `
  <svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
    </defs>
    
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" rx="16"/>
    
    <!-- Title Header -->
    <text x="${width/2}" y="42" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="22" font-weight="700" fill="#F8FAFC" letter-spacing="2">COUPLE PORTRAITS &amp; OUR JOURNEY STORY SHOWCASE</text>
    <text x="${width/2}" y="68" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#94A3B8">Dual Photos (Sekarang &amp; Masa Kecil) with Malay Wedding Attire Cartoon + 8 Authentic Chapters</text>

    <!-- SECTION 1: MEET THE COUPLE DUAL-ERA PORTRAITS -->
    <rect x="30" y="88" width="940" height="390" fill="url(#cardGrad)" rx="12" stroke="#334155" stroke-width="1"/>
    <text x="55" y="118" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#38BDF8" letter-spacing="1">1. MEET THE COUPLE: DUAL-ERA PHOTOS (SEKARANG &amp; MASA KECIL)</text>
    <text x="55" y="136" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#CBD5E1">Interactive toggle switch allows guests to view either the White Malay Wedding Attire portrait or Childhood photo.</text>

    <!-- Syifa Card -->
    <rect x="55" y="150" width="380" height="200" fill="#0B1120" rx="10" stroke="rgba(201,138,134,0.3)" stroke-width="1"/>
    <text x="75" y="175" font-family="'Playfair Display', serif" font-size="15" font-weight="700" fill="#FDA4AF">BRIDE: SYIFA HASANAH</text>
    <text x="75" y="192" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#94A3B8">Sekarang (Foto Biru Cartoon) | Masa Kecil (SyifaKecil)</text>
    
    <!-- Syifa Capsule Frames -->
    <rect x="75" y="205" width="130" height="165" rx="40" fill="#1877F2" stroke="#FDA4AF" stroke-width="2"/>
    <rect x="225" y="205" width="130" height="165" rx="40" fill="#334155" stroke="#FDA4AF" stroke-width="2"/>
    <rect x="110" y="350" width="60" height="16" rx="8" fill="rgba(0,0,0,0.7)"/>
    <text x="140" y="362" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFF">SEKARANG</text>
    <rect x="255" y="350" width="70" height="16" rx="8" fill="rgba(0,0,0,0.7)"/>
    <text x="290" y="362" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFF">MASA KECIL</text>

    <!-- Farabi Card -->
    <rect x="565" y="150" width="380" height="200" fill="#0B1120" rx="10" stroke="rgba(126,131,108,0.3)" stroke-width="1"/>
    <text x="585" y="175" font-family="'Playfair Display', serif" font-size="15" font-weight="700" fill="#A7F3D0">GROOM: DAENG MUHAMMAD YUSUF AQSHA ALFARABI</text>
    <text x="585" y="192" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#94A3B8">Sekarang (Foto Biru Cartoon) | Masa Kecil (FarabiKecil)</text>

    <!-- Farabi Capsule Frames -->
    <rect x="585" y="205" width="130" height="165" rx="40" fill="#1877F2" stroke="#34D399" stroke-width="2"/>
    <rect x="735" y="205" width="130" height="165" rx="40" fill="#334155" stroke="#34D399" stroke-width="2"/>
    <rect x="620" y="350" width="60" height="16" rx="8" fill="rgba(0,0,0,0.7)"/>
    <text x="650" y="362" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFF">SEKARANG</text>
    <rect x="765" y="350" width="70" height="16" rx="8" fill="rgba(0,0,0,0.7)"/>
    <text x="800" y="362" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFF">MASA KECIL</text>

    <!-- Toggle Controls Preview Banner -->
    <rect x="55" y="390" width="890" height="72" fill="#0B1120" rx="8" stroke="#1E293B" stroke-width="1"/>
    <text x="75" y="414" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#E2E8F0">Interactive Segmented Switcher in UI:</text>
    <rect x="75" y="424" width="145" height="28" rx="14" fill="rgba(126,131,108,0.2)" stroke="rgba(126,131,108,0.4)"/>
    <rect x="77" y="426" width="70" height="24" rx="12" fill="#FFFFFF"/>
    <text x="112" y="442" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#8E4F49">Sekarang</text>
    <text x="182" y="442" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#94A3B8">Masa Kecil</text>
    <text x="240" y="442" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#94A3B8">&#x27A4; Seamless animated cross-fade between White Malay Attire Cartoon and Childhood memory.</text>

    <!-- SECTION 2: 8 AUTHENTIC CHAPTERS IN OUR JOURNEY -->
    <rect x="30" y="495" width="940" height="460" fill="url(#cardGrad)" rx="12" stroke="#334155" stroke-width="1"/>
    <text x="55" y="525" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#38BDF8" letter-spacing="1">2. OUR JOURNEY: 8 AUTHENTIC CHAPTER POLAROID PHOTOS</text>
    <text x="55" y="544" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#CBD5E1">All user-uploaded authentic photos integrated with optimized WebP/JPEG format and responsive polaroids.</text>

    <!-- Chapter 1-4 Labels -->
    <text x="60" y="670" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab I: 2017–2020</text>
    <text x="60" y="685" font-family="sans-serif" font-size="9" fill="#94A3B8">Handwritten Note &amp; Snacks</text>

    <text x="290" y="670" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab II: 2020–2024</text>
    <text x="290" y="685" font-family="sans-serif" font-size="9" fill="#94A3B8">European City Square</text>

    <text x="520" y="670" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab III: Juni 2024</text>
    <text x="520" y="685" font-family="sans-serif" font-size="9" fill="#94A3B8">Ice Skating Reunion</text>

    <text x="750" y="670" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab IV: Agustus 2024</text>
    <text x="750" y="685" font-family="sans-serif" font-size="9" fill="#94A3B8">Basketball Court Selfie</text>

    <!-- Chapter 5-8 Labels -->
    <text x="60" y="895" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab V: 2024–2025</text>
    <text x="60" y="910" font-family="sans-serif" font-size="9" fill="#94A3B8">Holycow Surabaya</text>

    <text x="290" y="895" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab VI: Juli 2026</text>
    <text x="290" y="910" font-family="sans-serif" font-size="9" fill="#94A3B8">Travel Selfie</text>

    <text x="520" y="895" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab VII: September 2026</text>
    <text x="520" y="910" font-family="sans-serif" font-size="9" fill="#94A3B8">Family Gathering</text>

    <text x="750" y="895" font-family="sans-serif" font-size="10" font-weight="600" fill="#E2E8F0">Bab VIII: Akad Nikah</text>
    <text x="750" y="910" font-family="sans-serif" font-size="9" fill="#94A3B8">Masjid Agung At-Tin</text>
  </svg>
  `;

  // Composite images onto canvas
  const composites = [
    // Couple Portraits
    { input: syifaNow, top: 205, left: 75 },
    { input: syifaChild, top: 205, left: 225 },
    { input: farabiNow, top: 205, left: 585 },
    { input: farabiChild, top: 205, left: 735 },

    // Story Row 1 (Chapters 1 to 4)
    { input: chImgs[0], top: 560, left: 60 },
    { input: chImgs[1], top: 560, left: 290 },
    { input: chImgs[2], top: 560, left: 520 },
    { input: chImgs[3], top: 560, left: 750 },

    // Story Row 2 (Chapters 5 to 8)
    { input: chImgs[4], top: 785, left: 60 },
    { input: chImgs[5], top: 785, left: 290 },
    { input: chImgs[6], top: 785, left: 520 },
    { input: chImgs[7], top: 785, left: 750 },
  ];

  await sharp(Buffer.from(svg))
    .composite(composites)
    .png()
    .toFile(path.join(brainDir, 'couple_and_story_showcase.png'));

  console.log('Saved couple_and_story_showcase.png successfully!');
}

createShowcase().catch(console.error);
