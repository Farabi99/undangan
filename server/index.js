const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch (e) {
      console.warn('Could not load .env file:', e.message);
    }
  } else {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || '').trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    } catch (e) {
      console.warn('Could not load .env fallback:', e.message);
    }
  }
}

const express = require('express');
const compression = require('compression');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const content = require('./lib/content');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Railway, Render, Cloudflare) for accurate client IP in rate limiters
app.set('trust proxy', 1);

// Automated cache-busting helper for views
const BUILD_VERSION = process.env.RAILWAY_GIT_COMMIT_SHA
  ? process.env.RAILWAY_GIT_COMMIT_SHA.slice(0, 7)
  : (process.env.npm_package_version || '1.5.1') + '-' + Date.now().toString(36).slice(-4);

app.locals.asset = function (url) {
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${BUILD_VERSION}`;
};

// Enable gzip/deflate response compression
app.use(compression());

// Security & header settings
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static assets
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true
}));

// Health check endpoint for cloud orchestrators (Railway, Render, Fly.io)
app.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Mount Routes
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).render('404', {
    lang: 'id',
    t: (k) => (content.dict.id && content.dict.id[k]) || k,
    content
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start listening if run directly
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`💍 Undangan Digital running on http://localhost:${PORT}`);
    console.log(`🔑 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`===============================================`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        try {
          db.close();
          console.log('[Database] SQLite database connection closed.');
        } catch (dbErr) {
          console.error('[Database] Error closing SQLite connection:', dbErr.message);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
