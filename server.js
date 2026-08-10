const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
require('dotenv').config();
const db = require('./db');

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Sitemap - we'll implement dynamically later if needed


// Live status & Maintenance mode middleware
app.use((req, res, next) => {
    let settings = {};
    const settingsPath = path.join(__dirname, 'settings.json');
    if (fs.existsSync(settingsPath)) {
        try {
            const localSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            settings = localSettings.general || localSettings || {};
        } catch (e) {}
    }

    db.get("SELECT value FROM settings WHERE key = 'general'", (err, row) => {
        try {
            if (!err && row && row.value) {
                const dbSettings = JSON.parse(row.value);
                settings = { ...settings, ...dbSettings };
            }
        } catch (e) {}

        const maintenance = !!settings.maintenance;
        const isDeployed = settings.isDeployed !== false;
        const pageStatus = settings.pageStatus || {};

        const isAdmin = req.path.startsWith('/admin') || req.path.startsWith('/api/admin');
        const isApi = req.path.startsWith('/api');
        const isStatic = req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|mp4|webm|webp|ico|txt|xml)$/i) || req.path.startsWith('/Video/') || req.path.startsWith('/uploads/');

        if (!isAdmin && !isApi && !isStatic && req.method === 'GET') {
            if (!isDeployed) {
                return res.sendFile(path.join(__dirname, 'public', 'coming-soon.html'));
            }
            if (maintenance) {
                return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
            }

            // Check individual page access toggles (Home page is always enabled)
            const reqPath = req.path.toLowerCase();
            const isHomePage = reqPath === '/' || reqPath === '/index.html' || reqPath === '/html/index.html';

            if (!isHomePage) {
                if (reqPath.includes('about') && pageStatus.about === false) {
                    return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
                }
                if (reqPath.includes('matches') && pageStatus.matches === false) {
                    return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
                }
                if ((reqPath.includes('blog') || reqPath.includes('blogs')) && pageStatus.blogs === false) {
                    return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
                }
                if (reqPath.includes('contact') && pageStatus.contact === false) {
                    return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
                }
                if (reqPath.includes('scoring') && pageStatus.scoring === false) {
                    return res.sendFile(path.join(__dirname, 'public', 'maintenance.html'));
                }
            }
        }
        next();
    });
});

// Helper to serve HTML with dynamic canonical headers, GA4 tracking & metadata
function sendHtmlWithDynamicCanonical(req, res, pageName) {
    const filePath = path.join(__dirname, 'public', 'html', pageName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Not Found');
    }
    let html = fs.readFileSync(filePath, 'utf8');

    db.get("SELECT value FROM settings WHERE key = 'general'", (err, row) => {
        try {
            if (row && row.value) {
                const settings = JSON.parse(row.value);
                const siteTitle = (settings.siteName || 'Champions Cricket Club') + (settings.siteTagline ? ' | ' + settings.siteTagline : '');
                
                // Replace title tag
                html = html.replace(/<title>.*?<\/title>/gi, `<title>${siteTitle}</title>`);
                
                // Replace or inject meta description
                if (settings.siteDescription) {
                    if (html.includes('name="description"')) {
                        html = html.replace(/<meta\s+name="description"\s+content=".*?"/gi, `<meta name="description" content="${settings.siteDescription}">`);
                    } else {
                        html = html.replace('</head>', `<meta name="description" content="${settings.siteDescription}">\n</head>`);
                    }
                }

                // Inject GA4 Analytics snippet if configured
                if (settings.googleAnalyticsId && !html.includes('gtag/js?id=')) {
                    const gaSnippet = `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${settings.googleAnalyticsId}');
</script>`;
                    html = html.replace('</head>', `${gaSnippet}\n</head>`);
                }
            }
        } catch (e) {
            console.error("Metadata injection error:", e.message);
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('X-Robots-Tag', 'index, follow');
        res.send(html);
    });
}

// Serve public HTML pages with dynamic canonical tags & operational metadata
app.get(['/', '/index.html', '/html/index.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'index.html'));
app.get(['/about', '/about.html', '/html/about.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'about.html'));
app.get(['/matches', '/matches.html', '/html/matches.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'matches.html'));
app.get(['/blog', '/blogs', '/blogs.html', '/html/blogs.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'blogs.html'));
app.get(['/contact', '/contact.html', '/html/contact.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'contact.html'));
app.get(['/scoring', '/scoring.html', '/html/scoring-app.html'], (req, res) => sendHtmlWithDynamicCanonical(req, res, 'scoring-app.html'));


// Serve static files (Frontend & Admin UI) with 1-year caching for assets, but NO CACHE for HTML
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 31536000000,
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Routes
const { router: authRoutes } = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/admin', authRoutes);
app.use('/api', apiRoutes);

// Favicon route
app.get(['/favicon.ico', '/favicon.png'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.png'));
});

// Admin panel HTML routes
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'admin', 'login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'admin', 'dashboard.html')));

// 301 Redirect legacy .html extension to clean URLs
app.get(['/contact.html', '/admin/login.html', '/admin/dashboard.html'], (req, res) => {
    const cleanPath = req.path.replace(/\.html$/, '');
    res.redirect(301, cleanPath);
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

// Fallback for frontend SPA routing if needed
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handling middleware (catches JSON parse errors, etc.)
// Must be defined AFTER all routes
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin/login.html`);
    });
}
module.exports = app;
