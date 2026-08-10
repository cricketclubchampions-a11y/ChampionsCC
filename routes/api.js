const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('./auth');

// Helper functions for settings
const getSettings = () => {
    return new Promise((resolve) => {
        let fileSettings = {};
        const settingsPath = path.join(__dirname, '..', 'settings.json');
        if (fs.existsSync(settingsPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                fileSettings = data.general || data || {};
            } catch (e) {}
        }

        db.get("SELECT value FROM settings WHERE key = 'general'", (err, row) => {
            if (!err && row && row.value) {
                try {
                    const dbSettings = JSON.parse(row.value);
                    return resolve({ ...fileSettings, ...dbSettings });
                } catch (e) {}
            }
            resolve(fileSettings);
        });
    });
};

const saveSettings = async (newData) => {
    const current = await getSettings();
    const updated = { ...current, ...newData };
    
    // Save to local settings.json backup file
    try {
        const settingsPath = path.join(__dirname, '..', 'settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify({ general: updated }, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to write settings.json local file:", e);
    }

    return new Promise((resolve) => {
        db.run(
            "INSERT INTO settings (key, value) VALUES ('general', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
            [JSON.stringify(updated), JSON.stringify(updated)],
            function(err) {
                if (err) console.error("DB settings save error:", err);
                resolve();
            }
        );
    });
};

// GET /api/promotion - Public
router.get('/promotion', async (req, res) => {
    try {
        const settings = await getSettings();
        const promo = settings.promo || {};
        const popup = (settings.promo && settings.promo.popup) || {};
        const isActive = !!promo.enabled;
        const response = {
            is_active: isActive,
            text: promo.text || '',
            link_text: promo.btnText || "Today's Exclusive Pricing",
            link_url: promo.btnUrl || '#',
            speed: typeof promo.speed === 'number' ? promo.speed : 15,
            floating_image_active: 0,
            floating_image_url: null,
            floating_image_url_mobile: null,
            popup: {
                enabled: !!popup.enabled,
                desktop_image: popup.desktop_image || null,
                mobile_image: popup.mobile_image || null,
                link_url: popup.link_url || '#'
            }
        };
        res.json(response);
    } catch (error) {
        console.error("Error fetching promotion:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/admin/settings/promo - Admin
router.post('/admin/settings/promo', async (req, res) => {
    try {
        await saveSettings({ promo: req.body });
        res.json({ success: true });
    } catch (error) {
        console.error("Error saving promo settings:", error);
        res.status(500).json({ error: "Failed to save promo settings" });
    }
});

// GET /api/site-info - Public
router.get('/site-info', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({
            siteName: settings.siteName || 'Champions Cricket Club',
            siteTagline: settings.siteTagline || 'Official Cricket Club & Sports Academy',
            siteDescription: settings.siteDescription || 'Official portal of Champions Cricket Club',
            isDeployed: settings.isDeployed !== false,
            maintenance: !!settings.maintenance,
            googleAnalyticsId: settings.googleAnalyticsId || ''
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to load site info" });
    }
});

// GET /api/admin/settings/operational - Admin & Local
router.get(['/admin/settings/operational', '/settings/operational'], async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({
            siteName: settings.siteName || 'Champions Cricket Club',
            siteTagline: settings.siteTagline || 'Official Cricket Club & Sports Academy',
            isDeployed: settings.isDeployed !== false,
            maintenance: !!settings.maintenance,
            contactFormEnabled: settings.contactFormEnabled !== false,
            siteDescription: settings.siteDescription || '',
            googleAnalyticsId: settings.googleAnalyticsId || '',
            pageStatus: {
                about: settings.pageStatus?.about !== false,
                matches: settings.pageStatus?.matches !== false,
                blogs: settings.pageStatus?.blogs !== false,
                contact: settings.pageStatus?.contact !== false,
                scoring: settings.pageStatus?.scoring !== false
            }
        });
    } catch (error) {
        console.error("Error fetching operational settings:", error);
        res.status(500).json({ error: "Failed to load operational settings" });
    }
});

// POST /api/admin/settings/operational - Admin & Local
router.post(['/admin/settings/operational', '/settings/operational'], async (req, res) => {
    try {
        const { siteName, siteTagline, isDeployed, maintenance, contactFormEnabled, siteDescription, googleAnalyticsId, pageStatus } = req.body;
        await saveSettings({
            siteName: siteName || 'Champions Cricket Club',
            siteTagline: siteTagline || 'Official Cricket Club & Sports Academy',
            isDeployed: isDeployed !== false,
            maintenance: !!maintenance,
            contactFormEnabled: contactFormEnabled !== false,
            siteDescription: siteDescription || '',
            googleAnalyticsId: googleAnalyticsId || '',
            pageStatus: pageStatus || {}
        });
        res.json({ success: true, message: "Operational settings saved successfully!" });
    } catch (error) {
        console.error("Error saving operational settings:", error);
        res.status(500).json({ error: "Failed to save operational settings" });
    }
});

// Handle contact form submission
router.post('/contact', async (req, res) => {
    try {
        const settings = await getSettings();
        if (settings.contactFormEnabled === false) {
            return res.status(403).json({ error: 'Contact form submissions are currently disabled by administrator.' });
        }
        
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        const stmt = 'INSERT INTO leads (name, email, phone, service_interest, message) VALUES (?, ?, ?, ?, ?)';
        db.run(stmt, [name, email, phone || null, subject || null, message], function(err) {
            if (err) {
                console.error('Error inserting lead:', err.message);
                return res.status(500).json({ error: 'Failed to submit contact form.' });
            }
            res.status(201).json({ success: true, message: 'Message sent successfully!' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process contact submission' });
    }
});

// Admin Route: Get all leads (Contact Submissions)
router.get('/admin/leads', (req, res) => {
    // In a real scenario, this would be protected by auth middleware
    db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching leads:', err.message);
            return res.status(500).json({ error: 'Failed to fetch leads.' });
        }
        res.json(rows);
    });
});

// --- Gallery Routes ---

// GET /api/gallery - Public
router.get('/gallery', (req, res) => {
    db.all('SELECT * FROM gallery ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch gallery' });
        res.json(rows);
    });
});

// POST /api/admin/gallery - Admin
router.post('/admin/gallery', requireAuth, (req, res) => {
    const { title, url, type, category } = req.body;
    if (!url || !type) return res.status(400).json({ error: 'URL and type are required' });
    
    const stmt = 'INSERT INTO gallery (title, url, type, category) VALUES (?, ?, ?, ?)';
    db.run(stmt, [title || '', url, type, category || 'Uncategorized'], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to insert gallery item' });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

// DELETE /api/admin/gallery/:id - Admin
router.delete('/admin/gallery/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM gallery WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete gallery item' });
        res.json({ success: true });
    });
});

module.exports = router;
