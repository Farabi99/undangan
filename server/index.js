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

const app = express();
const PORT = process.env.PORT || 3000;

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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`💍 Undangan Digital running on http://localhost:${PORT}`);
    console.log(`🔑 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`===============================================`);
  });
}

module.exports = app;
