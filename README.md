# 💍 Undangan Digital — Farabi & Syifa

A luxury, high-performance digital wedding invitation and guest management platform built with Node.js, Express, EJS, and SQLite.

Designed with dual-event themes, personalized guest invitations, audio voice notes, an administrative management dashboard, and seamless WhatsApp sharing.

---

## ✨ Key Features

### 🎨 Dual-Event Adaptive Themes
- **🌸 ʿAqd al-Nikāḥ (Akad)** — Dusty Rose, Olive Sage, and Gold botanical aesthetic (Jakarta).
- **🌙 Syukuran Pernikahan** — Midnight Navy, Celestial Silver, and Starry Night aesthetic (Surabaya).
- Theme resolves automatically based on guest invitation type (`akad`, `reception`, or `both`).

### 💌 Personalized Guest Experience
- **Unique Guest Slugs**: Clean URLs (`/:slug`, e.g. `http://localhost:3000/budi-santoso`).
- **Partner & Pax Controls**: Support for `+ Pasangan` and configurable maximum guest allowances.
- **Kisah Kami (Story) Toggle**:
  - Global toggle switch in Admin Dashboard.
  - Granular path-based URL toggle:
    - `/0/:slug` — Without Kisah Kami / Story section.
    - `/1/:slug` — With Kisah Kami / Story section.
  - Generic previews supported: `/`, `/0`, `/1`, `/syukuran`, `/0/syukuran`, `/1/syukuran`.

### 🎙️ Digital RSVP & Audio Guestbook
- Real-time RSVP confirmation (Attending / Unable to attend, pax count, written wishes).
- **Voice Note Recording**: Guests can record audio wishes directly from the browser.
- **Private Audio Streaming**: Secure playback for guests and organizers.
- **Instant Email Notifications**: Optional Gmail integration dispatches voice notes immediately to the host's inbox.

### 🎭 Interactive Touches
- **Auto-Cycling Avatars**: Seamless portrait transition between current and childhood photos (tap to toggle).
- **Countdown Timers**: Real-time ticker targeted to each event date.
- **Calendar Sync**: One-click Google Calendar & Apple/Outlook `.ics` calendar file downloads.
- **Google Maps**: Direct venue navigation links for At-Tin Mosque (Jakarta) & Smamda Tower (Surabaya).
- **Audio Experience**: Tailored background acoustic tracks with floating player and autoplay controls.
- **Bilingual**: Seamless Indonesian (`id`) and English (`en`) language switching.

### 🛡️ Administrative Portal (`/admin`)
- **Secure Authentication**: Password-protected session access.
- **Guest Management**: Search, filter by event type/status, edit details, and bulk delete.
- **WhatsApp Invitation Engine**: One-click WhatsApp message generator with 3 customizable etiquette styles (*Formal*, *Casual*, and *English*).
- **Check-In QR Codes**: Instant QR code modal for venue verification.
- **Excel Import / Export**: Complete guest list download and spreadsheet bulk import.

---

## 📁 Repository Structure

```
.
├── content/              # Invitation copy, event schedule, i18n dictionaries
│   ├── content.json      # Wedding metadata, couple bio, venues, countdowns
│   └── i18n.json         # Indonesian & English language translations
├── public/               # Static assets
│   ├── audio/            # Background music tracks
│   ├── css/              # Main stylesheet and admin styles
│   ├── img/              # Logos, couple portraits, story illustrations
│   └── js/               # Frontend interactivity, audio recorder, animations
├── server/               # Backend application
│   ├── db.js             # SQLite database initialization & migrations
│   ├── index.js          # Express app entry point
│   ├── lib/              # Security, mailer, importer, slug, & validation utils
│   └── routes/           # Public & Admin Express routers
├── views/                # EJS templates
│   ├── invitation.ejs    # Public invitation view
│   ├── 404.ejs           # Error view
│   ├── partials/         # Background animations (stars, botanicals)
│   └── admin/            # Admin dashboard, guest table, RSVP logs
├── scripts/              # Database seed and maintenance scripts
├── data/                 # SQLite database & voice notes storage (git-ignored)
├── Dockerfile            # Production Docker container definition
├── docker-compose.yml    # Docker Compose orchestration
└── package.json          # Node.js dependencies & scripts
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20.x or higher (Node 22 LTS recommended)
- `npm` v10.x or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd Undangan
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Edit `.env` as needed:
```ini
PORT=3000
ADMIN_PASSWORD=admin123
SESSION_SECRET=your_strong_random_secret_here
DATA_DIR=./data

# Optional: Instant Gmail Voice Note Notification
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NOTIFICATION_EMAIL=your-email@gmail.com
```

### 4. Seed Initial Data
Initialize the SQLite database schema and sample guests:
```bash
npm run seed
```

### 5. Run Application
Start the server in development mode (with auto-reload):
```bash
npm run dev
```
Or start in standard production mode:
```bash
npm start
```

Open your browser:
- **Public Invitation**: [http://localhost:3000](http://localhost:3000)
- **Syukuran Preview**: [http://localhost:3000/syukuran](http://localhost:3000/syukuran)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Password: `admin123`)*

---

## 🐳 Docker Deployment

The application is fully containerized and production-ready.

### Run with Docker Compose
```bash
# Build and start in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

Data and voice notes are persisted inside the named volume `wedding_data`.

For full deployment walkthroughs on Railway, VPS, or Cloudflare, refer to [DEPLOYMENT_GUIDE.md](file:///c:/Users/902222/Documents/nikah/Undangan/DEPLOYMENT_GUIDE.md) and [DOMAIN_SETUP_GUIDE.md](file:///c:/Users/902222/Documents/nikah/Undangan/DOMAIN_SETUP_GUIDE.md).

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `start` | `node server/index.js` | Starts the production web server |
| `dev` | `node --watch server/index.js` | Starts server with native Node file watcher |
| `seed` | `node scripts/seed.js` | Initializes and seeds sample database guests |
| `images` | `node scripts/build-images.js` | Optimizes and builds responsive image assets |

---

## 🔒 Security & Best Practices
- **Data Isolation**: SQLite database and guest voice recordings reside outside the public root.
- **Input Sanitization**: HTML escaping and code-injection prevention across all text inputs.
- **Rate Limiting**: In-memory rate limiter on RSVP endpoints to prevent spam.
- **Asset Caching & Compression**: Native Gzip HTTP compression enabled via `compression`.

---

## 📄 License
ISC License © 2026 Daeng Muhammad Yusuf Aqsha Alfarabi & Syifa Hasanah.
