# Reverse-Engineering & Design Architecture Analysis
**Reference**: [byaisyahluthfi.com/daeng-muhammad-alfarabi](https://www.byaisyahluthfi.com/daeng-muhammad-alfarabi)  
**Project**: E-Invitation Wedding Platform  
**Analysis Scope**: Page Layout Architecture, Presentation Mechanics, Motion Systems, Component Hierarchy, and Visual Systems.

---

## 1. Executive Summary & Design Philosophy

The reference design is not a standard static website or a generic template. It is engineered as an **interactive, multimedia digital keepsake** combining:
1. **Editorial Book / Archival Paper Feel**: Uses vintage Mooi Indie & European pastoral oil paintings, warm cream paper tones (`#F4F0E4`), antique brown ink (`#3A3028`), and delicate botanical illustrations.
2. **Dynamic Kinetic Depth**: Rather than flat images or passive video, the scene is composed of **25 isolated botanical layers** swaying with harmonic oscillation physics to simulate natural wind.
3. **Story-Driven Progression**: Organised as a sequential narrative—from the formal envelope gate, to pastoral welcome, couple intros, wedding logistics, romantic road-to-us chapters, interactive gamification, RSVP desk, and modern gift registry.
4. **Adaptive Viewport Presentation**: Dual-mode viewport system:
   - **Desktop**: A sophisticated **split-screen editorial showcase** (left side fixed artwork aside; right side phone-proportioned scroll container).
   - **Mobile**: A full-bleed **100dvh immersive experience** with sticky floating controls.

---

## 2. Layout & Presentation Mechanics

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               DESKTOP PRESENTATION (>= 1024px)                        │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│  LEFT ASIDE: Sticky Editorial Showcase (65% width)    │  RIGHT COLUMN: Phone Viewport  │
│  - Solid Sage Canvas (#7E836C)                        │  - Width: 35% (max-w: 532px)   │
│  - Eyebrow: "THE WEDDING OF"                          │  - Height: 100vh overflow-y    │
│  - Script Heading: "Aisyah & Luthfi"                  │  - Uses Container Queries (cqw)│
│  - Scalloped Oval Cameo (grouped-image.webp)          │  - Sequential 10 Slides/Screens│
│  - Hashtag: "#AISaidyestoLUTHFI"                      │  - content-visibility: auto    │
└───────────────────────────────────────────────────────┴────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│              MOBILE PRESENTATION (< 1024px)           │
├───────────────────────────────────────────────────────┤
│  - Fullscreen 100vw × 100dvh                          │
│  - Sticky Floating Controls (Top Right: Audio & Lang) │
│  - Smooth vertical single-column scroll or slide deck │
└───────────────────────────────────────────────────────┘
```

### A. The Responsive Engine: CSS Container Queries (`cqw`)
A signature technical feat in the reference site is the use of **Container Query Units (`cqw`)** instead of standard `vw` or static `px`:
- The right scroll column declares `container-type: inline-size` or `container-type: size`.
- All dimensions, padding, font sizes, and absolute asset coordinates are computed in `cqw`:
  ```css
  /* Example from reference site slide 2 */
  height: calc(100cqw * 874 / 402 + 1px);
  min-height: calc(100lvh + 1px);
  font-size: 3.109cqw;
  letter-spacing: 0.547cqw;
  ```
- **Why this matters**: On any phone width (iPhone SE 375px, iPhone Pro Max 430px, Android 390px, or desktop split-column 532px), line breaks never shift awkwardly, images never overflow, and coordinates remain mathematically locked to the background paintings.

### B. High-Performance Virtualization: `content-visibility: auto`
To prevent massive performance lag on low-end phones from having 10 graphic-heavy sections, the reference wraps each slide in:
```css
content-visibility: auto;
contain-intrinsic-size: auto max(100lvh, calc(100cqw * 874 / 405));
```
This defers the rendering and layout calculations of off-screen slides until the user scrolls near them, maintaining a 60fps frame rate.

---

## 3. Structural Slide-by-Slide Breakdown

The reference website is structured into **10 distinct narrative stages**:

| Slide / Section | Internal Component | Key Assets & Visual Elements | Key Content & User Interactions |
| :--- | :--- | :--- | :--- |
| **1. The Envelope / Cover** | `<Opening>` | `repeating-linear-gradient` (pinstripes), `CD.webp`, spinning photo thumbnail, vintage badges | Personalized guest greeting (`Mr. Daeng Muhammad Alfarabi`), spinning vinyl disc, "Buka Undangan" gate trigger button. |
| **2. Welcome Landscape** | `<Introduction>` | `Slide 2.webp` (sky/hills), `rumah-raster.webp` (house), 25 waving botanical elements | "Selamat Datang di Hari Bahagia Kami", couple credit callout, animated scroll down arrow. |
| **3. Meet the Couple** | `<MeetTheCouple>` | Soft floral watercolor borders (`raster1..46.webp`), oval cameo portraits | Bride bio (Palembang-Sunda, The Beatles lover), Groom bio (Madura-Solo, Green Day lover), Surah Ar-Rum 21 quote card. |
| **4. The Wedding Day** | `<Slide4>` | Deep pastoral oil painting (`slide-4-background.webp`) | Live countdown clock (Hari, Jam, Menit, Detik), Save to Calendar (.ics), Akad Nikah & Resepsi cards with Google Maps. |
| **5. Road to Us (Story)** | `<RoadToUs>` | Chapters I – VII narrative cards, milestone dates (2021–2026) | Seven-stage love story ("Satu Kelas", "Pesan Pertama", "Pagi Sore", "Lamaran"). |
| **5b. Interactive Game** | `<RoadToUs.Question>` | Team Bride vs Team Groom voting pills, live vote counters | **Gamification**: "Kamu Tim yang Mana?" Guests vote between Team Bride & Team Groom; live percentage results display immediately. |
| **6. RSVP & Wall of Love** | `<RsvpScreen>` | Vintage landscape (`background-rsvp.webp`), baroque frame (`arrum-box.svg`) | Personalized RSVP form (Hadir/Tidak Hadir, Pax counter, Doa/Ucapan), anti-code validation modal, paginated public wish wall. |
| **7. Photo Gallery** | `<GalleryScreen>` | Scalloped photo frames (`photo-frame.svg`), vintage brass pins | "Ruang Kenangan" photo exhibition with touch swipe hint ("GESER FOTO"). |
| **8. Digital Envelope** | `<DigitalEnvelope>` | Bank badges (BCA, Mandiri), `2x-jpeg-non-moving-background.webp` | Cash gift details with 1-click account number copy + toast feedback. |
| **9. Wedding Registry** | `<WishlistScreen>` | Product cards (Espresso Machine, Air Purifier, Suitcase, Lego, Joke item) | Modern gift registry: Guests can claim specific items ("Klaim Hadiah ini!") and link directly to Tokopedia/Shopee. |
| **10. Closing** | `<Closing>` | Monogram badge (`logo-image.png`), vintage gradient mask | "Terima kasih", formal Indonesian closing statement, official hashtag `#AISaidyestoLUTHFI`. |

---

## 4. The Motion & "Moving Background" System

### A. The 25-Layer Botanical Wind Physics
The botanical layer in Slide 2 is split into 4 tiers of oscillation anchored at the ground:

```
        transform-origin: 50% 100% (Base of the stem/trunk)
          ├── 6 Trees:         6.50s duration | ±1.5° arc | Deep Background
          ├── 2 Flowers:       3.25s duration | ±2.0° arc | Flanking Midground
          ├── 2 Hard Flowers:  2.34s duration | ±4.0° arc | Dynamic Windward
          └── 15 Meadow Flora: 3.90s duration | ±2.0° arc | Foreground Ground Cover
```

### B. Entrance Choreography
When the user clicks **"Buka Undangan"**, three concurrent animations execute:
1. **Gate Fade-out**: Cover overlay drops opacity to 0 and becomes `pointer-events: none` over 800ms.
2. **House Scale-up**: The country house (`rumah-raster.webp`) scales up from `scale(0.08)` to `scale(1)` at `transform-origin: center center`.
3. **Botanical Blossom Inflow**:
   - Left-side trees/flowers transition from `translateX(-200px)` to `translateX(0)`.
   - Right-side trees/flowers transition from `translateX(200px)` to `translateX(0)`.
   - Bottom flowers transition from `translateY(200px)` to `translateY(0)`.
   - Staggered delays (`0.2s` to `1.4s`) produce a natural blooming wave.

---

## 5. Visual System: Color Palette & Typography

### A. Color Hierarchy
- **Sage Canvas** (`#7E836C`): Cover canvas, primary background, tranquil olive.
- **Deep Sage Accent** (`#3F543E`): Couple name callouts, button hovers, emphasis.
- **Archival Ecru Cream** (`#F4F0E4`): Content cards, paper warmth, alternate background.
- **Pale Cream Base** (`#FFF7E9`): Meet the couple backdrop.
- **Antique Brown Ink** (`#3A3028`): Primary text, headings, navigation bar.
- **Muted Sepia Body** (`#6A5E52`): Paragraph text, bios, subtitles.
- **Antique Gold Brass** (`#D4B96E`): Dividers, countdown borders, badges.
- **Terracotta Red** (`#A05246`): Declined RSVP, warning alerts.

### B. Typography Pairings
1. **Classical Calligraphy / Script**: `Pinyon Script` / `Great Vibes`
   - Couple names (`Aisyah & Luthfi`), "Terima kasih", "Salam Hangat".
2. **Classical Editorial Display**: `EB Garamond` / `Philosopher`
   - Section titles ("HARI PERNIKAHAN", "TENTANG MEMPELAI", "THE WEDDING OF").
3. **Refined Editorial Body & Quotes**: `Baskerville` / `Georgia`
   - Couple bios, romantic quotes, storytelling chapters, welcome text.
4. **Micro-Typography & UI Controls**: Modern `Sans-serif` (`Inter` / system-ui)
   - Dates, venue addresses, countdown labels, button text (letter-spacing: `0.15em` to `0.35em`).

---

## 6. How It Presents Data to the Guest (UX Polish)

1. **Hyper-Personalization**:
   - Every guest receives a custom slug (e.g. `/daeng-muhammad-alfarabi`).
   - The cover immediately shows their title, full name, and partner label (`Mr. Daeng Muhammad Alfarabi dan Pasangan`).
   - The RSVP form automatically limits the pax stepper to their personal allocation (`guest.max_pax`).
2. **Audio Experience**:
   - Floating top-right audio pill shows play/pause and mute controls.
   - Smooth looping of nostalgic acoustic music (*The Beatles — "Here, There and Everywhere"*).
3. **Frictionless Social Sharing**:
   - Pre-formatted WhatsApp invitation templates.
   - Direct Google Maps deep-links with venue coordinates.
   - `.ics` calendar file download for Apple, Google, and Outlook calendars.
4. **Modern Alternatives to Cash Envelopes**:
   - In addition to standard bank account numbers with 1-click copy, it incorporates an interactive **Wishlist Registry**, allowing friends to claim specific home gifts without duplicates.

---

## 7. Comparison: Reference vs. Our Implementation

| Feature | Reference Site | Our Enhanced Implementation | Status in Project |
| :--- | :--- | :--- | :---: |
| **Moving Background** | 25 botanical waving layers | 25 botanical waving layers + Reception starry atmosphere | Complete |
| **Dual Concept** | Single Sage/Cream palette | Sage/Cream (Akad) + Midnight Navy & Silver (Reception) | Complete |
| **Audio** | Auto-playing music with vinyl disc | Monogram seal; zero invasive audio playback (as requested) | Preserved |
| **Desktop Layout** | Split-screen (Left aside, right phone) | Split-screen with mathematical SVG cameo portrait | Complete |
| **Admin View** | Not publicly accessible | Full-featured Admin Dashboard (Add, Edit, Bulk, RSVP, Excel) | Complete |
| **Database** | Supabase / PostgreSQL | Lightweight self-contained SQLite (`undangan.db`) | Complete |
