const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('./auth');

const DEFAULT_SOCIALS_LIST = [
    { name: "Facebook", url: "https://facebook.com/championscricketclub", icon: "facebook", visible: true, show_in_navbar: true },
    { name: "Instagram", url: "https://instagram.com/championscricketclub", icon: "instagram", visible: true, show_in_navbar: true },
    { name: "Threads", url: "https://threads.net/@championscricketclub", icon: "threads", visible: true, show_in_navbar: false },
    { name: "LinkedIn", url: "https://linkedin.com/company/championscricketclub", icon: "linkedin", visible: true, show_in_navbar: false },
    { name: "YouTube", url: "https://youtube.com/@championscricketclub", icon: "youtube", visible: true, show_in_navbar: true },
    { name: "Reddit", url: "https://reddit.com/user/championscricketclub", icon: "reddit", visible: false, show_in_navbar: false },
    { name: "WhatsApp Business", url: "https://wa.me/919938648742", icon: "whatsappbusiness", visible: true, show_in_navbar: false },
    { name: "X (Twitter)", url: "https://x.com/champions_cc", icon: "x", visible: true, show_in_navbar: true },
    { name: "TikTok", url: "https://tiktok.com/@championscricketclub", icon: "tiktok", visible: false, show_in_navbar: false },
    { name: "Pinterest", url: "https://pinterest.com/championscricketclub", icon: "pinterest", visible: false, show_in_navbar: false },
    { name: "Behance", url: "https://behance.net/championscricketclub", icon: "behance", visible: false, show_in_navbar: false },
    { name: "Dribbble", url: "https://dribbble.com/championscricketclub", icon: "dribbble", visible: false, show_in_navbar: false },
    { name: "GitHub", url: "https://github.com/championscricketclub", icon: "github", visible: false, show_in_navbar: false },
    { name: "Upwork", url: "https://upwork.com/ag/championscricketclub", icon: "upwork", visible: false, show_in_navbar: false },
    { name: "Fiverr", url: "https://fiverr.com/championscricketclub", icon: "fiverr", visible: false, show_in_navbar: false },
    { name: "Freelancer", url: "https://freelancer.com/u/championscricketclub", icon: "freelancer", visible: false, show_in_navbar: false },
    { name: "PeoplePerHour", url: "https://peopleperhour.com/championscricketclub", icon: "peopleperhour", visible: false, show_in_navbar: false },
    { name: "Guru", url: "https://guru.com/freelancers/championscricketclub", icon: "guru", visible: false, show_in_navbar: false },
    { name: "Contra", url: "https://contra.com/championscricketclub", icon: "contra", visible: false, show_in_navbar: false },
    { name: "Google Business Profile", url: "https://business.google.com/championscricketclub", icon: "google", visible: false, show_in_navbar: false },
    { name: "Bing Places", url: "https://bingplaces.com/championscricketclub", icon: "bing", visible: false, show_in_navbar: false },
    { name: "Apple Business Connect", url: "https://businessconnect.apple.com/championscricketclub", icon: "apple", visible: false, show_in_navbar: false },
    { name: "Clutch", url: "https://clutch.co/profile/championscricketclub", icon: "clutch", visible: false, show_in_navbar: false },
    { name: "GoodFirms", url: "https://goodfirms.co/championscricketclub", icon: "goodfirms", visible: false, show_in_navbar: false },
    { name: "DesignRush", url: "https://designrush.com/agencies/championscricketclub", icon: "designrush", visible: false, show_in_navbar: false },
    { name: "TechBehemoths", url: "https://techbehemoths.com/championscricketclub", icon: "techbehemoths", visible: false, show_in_navbar: false },
    { name: "Agency Spotter", url: "https://agencyspotter.com/championscricketclub", icon: "agencyspotter", visible: false, show_in_navbar: false },
    { name: "Sortlist", url: "https://sortlist.com/championscricketclub", icon: "sortlist", visible: false, show_in_navbar: false },
    { name: "UpCity", url: "https://upcity.com/championscricketclub", icon: "upcity", visible: false, show_in_navbar: false },
    { name: "Crunchbase", url: "https://crunchbase.com/organization/championscricketclub", icon: "crunchbase", visible: false, show_in_navbar: false },
    { name: "Wellfound (AngelList)", url: "https://wellfound.com/company/championscricketclub", icon: "wellfound", visible: false, show_in_navbar: false },
    { name: "Product Hunt", url: "https://producthunt.com/@championscricketclub", icon: "producthunt", visible: false, show_in_navbar: false },
    { name: "Indie Hackers", url: "https://indiehackers.com/championscricketclub", icon: "indiehackers", visible: false, show_in_navbar: false },
    { name: "Telegram", url: "https://t.me/championscricketclub", icon: "telegram", visible: true, show_in_navbar: false },
    { name: "Yelp", url: "https://yelp.com/biz/championscricketclub", icon: "yelp", visible: false },
    { name: "Hotfrog", url: "https://hotfrog.com/championscricketclub", icon: "hotfrog", visible: false },
    { name: "Justdial", url: "https://justdial.com/championscricketclub", icon: "justdial", visible: false },
    { name: "IndiaMART", url: "https://indiamart.com/championscricketclub", icon: "indiamart", visible: false },
    { name: "Sulekha", url: "https://sulekha.com/championscricketclub", icon: "sulekha", visible: false },
    { name: "Alignable", url: "https://alignable.com/championscricketclub", icon: "alignable", visible: false },
    { name: "Meetup", url: "https://meetup.com/championscricketclub", icon: "meetup", visible: false },
    { name: "Trustpilot", url: "https://trustpilot.com/review/championscricketclub", icon: "trustpilot", visible: false },
    { name: "Capterra", url: "https://capterra.com/p/championscricketclub", icon: "capterra", visible: false },
    { name: "G2", url: "https://g2.com/products/championscricketclub", icon: "g2", visible: false },
    { name: "SourceForge", url: "https://sourceforge.net/championscricketclub", icon: "sourceforge", visible: false },
    { name: "SaaSHub", url: "https://saashub.com/championscricketclub", icon: "saashub", visible: false },
    { name: "F6S", url: "https://f6s.com/championscricketclub", icon: "f6s", visible: false },
    { name: "StartupBlink", url: "https://startupblink.com/championscricketclub", icon: "startupblink", visible: false },
    { name: "Polywork", url: "https://polywork.com/championscricketclub", icon: "polywork", visible: false },
    { name: "Peerlist", url: "https://peerlist.io/championscricketclub", icon: "peerlist", visible: false },
    { name: "Wix Marketplace", url: "https://wix.com/championscricketclub", icon: "wix", visible: false },
    { name: "Shopify Partners", url: "https://shopify.com/partners/championscricketclub", icon: "shopify", visible: false },
    { name: "Webflow Experts", url: "https://webflow.com/experts/championscricketclub", icon: "webflow", visible: false },
    { name: "Squarespace Experts", url: "https://squarespace.com/experts/championscricketclub", icon: "squarespace", visible: false }
];

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
            let resObj = fileSettings;
            if (!err && row && row.value) {
                try {
                    const dbSettings = JSON.parse(row.value);
                    resObj = { ...fileSettings, ...dbSettings };
                } catch (e) {}
            }
            if (!Array.isArray(resObj.socials) || resObj.socials.length === 0) {
                resObj.socials = DEFAULT_SOCIALS_LIST;
            }
            resolve(resObj);
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


// GET /api/socials - Public (visible social platforms)
router.get(['/socials', '/api/socials'], async (req, res) => {
    try {
        const settings = await getSettings();
        const socials = (Array.isArray(settings.socials) && settings.socials.length > 0) ? settings.socials : DEFAULT_SOCIALS_LIST;
        res.json(socials.filter(x => x.visible !== false));
    } catch (error) {
        console.error("Error fetching public socials:", error);
        res.status(500).json({ error: "Failed to load social links" });
    }
});

// GET /api/admin/settings/socials - Admin & Local
router.get(['/admin/settings/socials', '/settings/socials', '/social-links', '/admin/settings/social'], async (req, res) => {
    try {
        const settings = await getSettings();
        const socials = (Array.isArray(settings.socials) && settings.socials.length > 0) ? settings.socials : DEFAULT_SOCIALS_LIST;
        res.json({ socials });
    } catch (error) {
        console.error("Error fetching social links:", error);
        res.status(500).json({ error: "Failed to load social media settings" });
    }
});

// POST /api/admin/settings/socials - Save social media settings
router.post(['/admin/settings/socials', '/settings/socials', '/admin/settings/social'], async (req, res) => {
    try {
        const { socials } = req.body;
        await saveSettings({ socials: socials || [] });
        res.json({ success: true, message: "Social media settings saved successfully!" });
    } catch (error) {
        console.error("Error saving social media settings:", error);
        res.status(500).json({ error: "Failed to save social media settings" });
    }
});

// GET /api/contact-info (Public & Admin)
router.get(['/contact-info', '/admin/settings/contact', '/settings/contact'], async (req, res) => {
    try {
        const settings = await getSettings();
        const contact = settings.contact || {
            address: "Baragae Balijatra Ground, Sisua, Salipur, Cuttack, Odisha",
            coords: "20.4831593, 86.0763922",
            mapLink: "https://www.google.com/maps/dir/?api=1&destination=20.4831593,86.0763922",
            showMap: true,
            zoom: 14,
            markerLabel: "Champions Cricket Club HQ",
            email: "cricketclubchampions@gmail.com",
            phone: "+91 9938648742"
        };
        contact.showMap = !(contact.showMap === false || contact.showMap === 'false' || contact.showMap === 0 || contact.showMap === '0' || contact.showMap === 'off');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json(contact);
    } catch (error) {
        console.error("Error fetching contact settings:", error);
        res.status(500).json({ error: "Failed to load contact information" });
    }
});

// POST /api/admin/settings/contact - Save Contact & Map Settings
router.post(['/contact-info', '/admin/settings/contact', '/settings/contact'], async (req, res) => {
    try {
        const contactSettings = req.body;
        contactSettings.showMap = !(contactSettings.showMap === false || contactSettings.showMap === 'false' || contactSettings.showMap === 0 || contactSettings.showMap === '0' || contactSettings.showMap === 'off');
        await saveSettings({ contact: contactSettings });
        res.json({ success: true, message: "Contact & Location map settings saved successfully!" });
    } catch (error) {
        console.error("Error saving contact settings:", error);
        res.status(500).json({ error: "Failed to save contact settings" });
    }
});

// GET /api/contact-form-config (Public & Admin)
router.get(['/contact-form-config', '/admin/settings/contact-form', '/settings/contact-form'], async (req, res) => {
    try {
        const settings = await getSettings();
        const contactFormConfig = settings.contactFormConfig || settings.contactForm || {
            fields: {
                mobile: { label: "Mobile Number", show: true, required: false }
            },
            services: [
                { id: "membership", name: "Club Membership Inquiry", show: true },
                { id: "academy", name: "Cricket Academy Training", show: true },
                { id: "match-booking", name: "Match & Tournament Booking", show: true },
                { id: "sponsorship", name: "Sponsorship & Partnership", show: true },
                { id: "facility-rental", name: "Ground & Net Rental", show: true },
                { id: "other", name: "General / Other Inquiry", show: true }
            ]
        };
        res.json(contactFormConfig);
    } catch (error) {
        console.error("Error fetching contact form config:", error);
        res.status(500).json({ error: "Failed to load contact form configuration" });
    }
});

// POST /api/admin/settings/contact-form
router.post(['/admin/settings/contact-form', '/settings/contact-form', '/contact-form-config'], async (req, res) => {
    try {
        await saveSettings({ contactFormConfig: req.body, contactForm: req.body });
        res.json({ success: true, message: "Contact Form settings saved successfully!" });
    } catch (error) {
        console.error("Error saving contact form settings:", error);
        res.status(500).json({ error: "Failed to save contact form settings" });
    }
});

// GET /api/media-config (Public & Admin)
router.get(['/media-config', '/media-assets', '/admin/media-assets', '/admin/settings/media', '/settings/media'], async (req, res) => {
    try {
        const settings = await getSettings();
        const mediaConfig = settings.mediaConfig || settings.media || {
            about_community: {
                mainImage: "https://images.unsplash.com/photo-1565787154274-c8d076ad34e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
                subImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
                videoUrl: "",
                videoType: "none",
                autoplay: false,
                showImage: true
            },
            hero_section: {
                mainImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                subImage: "",
                videoUrl: "",
                videoType: "none",
                autoplay: false,
                showImage: true
            },
            academy_section: {
                mainImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
                subImage: "",
                videoUrl: "",
                videoType: "none",
                autoplay: false,
                showImage: true
            }
        };
        res.json(mediaConfig);
    } catch (error) {
        console.error("Error fetching media config:", error);
        res.status(500).json({ error: "Failed to load website assets media configuration" });
    }
});

// POST /api/admin/media-assets & /api/admin/settings/media
router.post(['/admin/media-assets', '/media-assets', '/admin/settings/media', '/settings/media'], async (req, res) => {
    try {
        const mediaConfig = req.body;
        await saveSettings({ mediaConfig, media: mediaConfig });
        res.json({ success: true, message: "Website media assets configuration saved successfully!" });
    } catch (error) {
        console.error("Error saving media config:", error);
        res.status(500).json({ error: "Failed to save media assets configuration" });
    }
});

// GET & POST /api/live-score & /api/admin/live-score
router.get(['/live-score', '/admin/live-score'], async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings.liveScore || {
            stumpsUrl: "",
            youtubeUrl: "",
            matchTitle: "Champions CC vs Metro Royals",
            status: "Live Match in Progress",
            battingTeam: "Champions CC",
            score: "184 / 4",
            overs: "18.2 Overs"
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to load live score" });
    }
});

router.post(['/live-score', '/admin/live-score'], async (req, res) => {
    try {
        await saveSettings({ liveScore: req.body });
        res.json({ success: true, message: "Live score updated successfully!" });
    } catch (error) {
        console.error("Error saving live score:", error);
        res.status(500).json({ error: "Failed to save live score" });
    }
});

// POST /api/admin/session-security
router.post('/admin/session-security', async (req, res) => {
    try {
        await saveSettings({ securitySettings: req.body });
        res.json({ success: true, message: "Session security settings saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save session security settings" });
    }
});

// --- MEDIA LIBRARY ASSET STORAGE & UPLOAD SYSTEM ---

// Helper for Cloudinary or Local uploads
const saveUploadedImage = async (base64Data, originalName = 'image') => {
    // Extract format and base64 string
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer, ext;
    if (matches && matches.length === 3) {
        ext = matches[1].split('/')[1] || 'png';
        if (ext === 'jpeg') ext = 'jpg';
        if (ext.includes('svg')) ext = 'svg';
        buffer = Buffer.from(matches[2], 'base64');
    } else {
        ext = 'png';
        buffer = Buffer.from(base64Data, 'base64');
    }

    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    
    // Abstracted Cloudinary Storage Hook (Triggers when Cloudinary env vars are set)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
            console.log("[Cloudinary Pipeline] Uploading image to Cloudinary cloud storage...");
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            const uploadRes = await cloudinary.uploader.upload(base64Data, {
                folder: 'champions_cc_uploads'
            });
            return {
                id: 'img-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                filename: uploadRes.public_id,
                originalName: originalName,
                url: uploadRes.secure_url,
                size: (uploadRes.bytes ? Math.round(uploadRes.bytes / 1024) : 0) + ' KB',
                created_at: new Date().toISOString()
            };
        } catch (cErr) {
            console.error("Cloudinary upload failed, falling back to local file storage:", cErr.message || cErr);
        }
    }

    // Default Local File Storage inside public/uploads/
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return {
        id: 'img-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        filename: filename,
        originalName: originalName,
        url: publicUrl,
        size: Math.round(buffer.length / 1024) + ' KB',
        created_at: new Date().toISOString()
    };
};

// GET /api/media-library (Public & Admin)
router.get(['/media-library', '/admin/media-library'], async (req, res) => {
    try {
        const settings = await getSettings();
        const library = settings.mediaLibrary || [];
        res.json(library);
    } catch (error) {
        console.error("Error fetching media library:", error);
        res.status(500).json({ error: "Failed to load media library" });
    }
});

// POST /api/admin/upload-image (Admin & Local)
router.post(['/admin/upload-image', '/upload-image', '/api/upload-image'], async (req, res) => {
    try {
        const { image, name } = req.body;
        if (!image) return res.status(400).json({ error: "No image payload provided" });

        const fileRecord = await saveUploadedImage(image, name || 'uploaded-image');
        
        // Save to mediaLibrary registry in settings
        const settings = await getSettings();
        const currentLib = settings.mediaLibrary || [];
        currentLib.unshift(fileRecord);
        await saveSettings({ mediaLibrary: currentLib });

        res.json({ success: true, file: fileRecord, message: "Image uploaded successfully!" });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

// DELETE /api/admin/media-library/:id (Admin & Local)
router.delete(['/admin/media-library/:id', '/media-library/:id'], async (req, res) => {
    try {
        const id = req.params.id;
        const settings = await getSettings();
        let currentLib = settings.mediaLibrary || [];
        
        const target = currentLib.find(item => item.id === id || item.filename === id);
        if (target && target.filename) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', target.filename);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {}
            }
        }

        currentLib = currentLib.filter(item => item.id !== id && item.filename !== id);
        await saveSettings({ mediaLibrary: currentLib });

        res.json({ success: true, message: "Image deleted successfully!" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ error: "Failed to delete image" });
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
    db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching leads:', err.message);
            return res.status(500).json({ error: 'Failed to fetch leads.' });
        }
        res.json(rows);
    });
});

// Admin Route: Mark lead as read/unread
router.patch('/admin/leads/:id/read', (req, res) => {
    const { id } = req.params;
    const isRead = req.body.is_read !== undefined ? (req.body.is_read ? 1 : 0) : 1;
    db.run('UPDATE leads SET is_read = ? WHERE id = ?', [isRead, id], function(err) {
        if (err) {
            console.error('Error updating lead status:', err.message);
            return res.status(500).json({ error: 'Failed to update lead status.' });
        }
        res.json({ success: true, message: 'Lead status updated.' });
    });
});

// Admin Route: Delete lead submission
router.delete('/admin/leads/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting lead:', err.message);
            return res.status(500).json({ error: 'Failed to delete lead.' });
        }
        res.json({ success: true, message: 'Lead deleted.' });
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

// POST /api/admin/gallery - Admin & Local
router.post(['/admin/gallery', '/api/admin/gallery'], (req, res) => {
    const { title, url, type, category } = req.body;
    if (!url || !type) return res.status(400).json({ error: 'URL and type are required' });
    
    const stmt = 'INSERT INTO gallery (title, url, type, category) VALUES (?, ?, ?, ?)';
    db.run(stmt, [title || '', url, type, category || 'Uncategorized'], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to insert gallery item' });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

// DELETE /api/admin/gallery/:id - Admin & Local
router.delete(['/admin/gallery/:id', '/api/admin/gallery/:id'], (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM gallery WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete gallery item' });
        res.json({ success: true });
    });
});

// --- Blog & News Routes ---

// GET /api/blogs - Public
router.get('/blogs', (req, res) => {
    db.all('SELECT * FROM blogs ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch blogs' });
        res.json(rows || []);
    });
});

// POST /api/admin/blogs - Create Blog
router.post(['/admin/blogs', '/api/admin/blogs'], (req, res) => {
    const { id, title, category, date, author, image, excerpt, video_url, read_time } = req.body;
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required' });

    const blogId = id || ('blog-' + Date.now());
    const blogDate = date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const blogReadTime = read_time || '4 min read';

    const stmt = 'INSERT INTO blogs (id, title, category, date, author, image, excerpt, video_url, read_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(stmt, [blogId, title, category, blogDate, author || 'Club Staff', image || '', excerpt || '', video_url || '', blogReadTime], function(err) {
        if (err) {
            console.error("Error creating blog:", err);
            return res.status(500).json({ error: 'Failed to create blog' });
        }
        res.status(201).json({ success: true, id: blogId });
    });
});

// PUT /api/admin/blogs/:id - Update Blog
router.put(['/admin/blogs/:id', '/api/admin/blogs/:id'], (req, res) => {
    const { id } = req.params;
    const { title, category, author, image, excerpt, video_url, read_time } = req.body;

    const stmt = 'UPDATE blogs SET title = ?, category = ?, author = ?, image = ?, excerpt = ?, video_url = ?, read_time = ? WHERE id = ?';
    db.run(stmt, [title, category, author, image, excerpt, video_url, read_time || '4 min read', id], function(err) {
        if (err) {
            console.error("Error updating blog:", err);
            return res.status(500).json({ error: 'Failed to update blog' });
        }
        res.json({ success: true });
    });
});

// DELETE /api/admin/blogs/:id - Delete Blog
router.delete(['/admin/blogs/:id', '/api/admin/blogs/:id'], (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM blogs WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete blog' });
        res.json({ success: true });
    });
});

// --- Squad / Players Routes ---

// GET /api/squad - Public & Admin
router.get(['/squad', '/admin/squad'], (req, res) => {
    db.all('SELECT * FROM squad ORDER BY created_at ASC', (err, rows) => {
        if (err) {
            console.error('Error fetching squad:', err);
            return res.status(500).json({ error: 'Failed to fetch squad' });
        }
        res.json(rows || []);
    });
});

// POST /api/admin/squad - Create Squad Member
router.post(['/squad', '/admin/squad'], (req, res) => {
    const { id, name, roleCategory, role, experience, tenure, photo, bio } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'Name and role are required' });

    const memberId = id || ('m-' + Date.now());
    const stmt = 'INSERT INTO squad (id, name, roleCategory, role, experience, tenure, photo, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(stmt, [
        memberId,
        name,
        roleCategory || 'batters',
        role,
        experience || 'Active Member',
        tenure || 'Joined ' + new Date().getFullYear(),
        photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500',
        bio || ''
    ], function(err) {
        if (err) {
            console.error("Error creating squad member:", err);
            return res.status(500).json({ error: 'Failed to create squad member' });
        }
        res.status(201).json({ success: true, id: memberId });
    });
});

// PUT /api/admin/squad/:id - Update Squad Member
router.put(['/squad/:id', '/admin/squad/:id'], (req, res) => {
    const { id } = req.params;
    const { name, roleCategory, role, experience, tenure, photo, bio } = req.body;

    const stmt = 'UPDATE squad SET name = ?, roleCategory = ?, role = ?, experience = ?, tenure = ?, photo = ?, bio = ? WHERE id = ?';
    db.run(stmt, [
        name,
        roleCategory || 'batters',
        role,
        experience || 'Active Member',
        tenure || 'Joined 2026',
        photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500',
        bio || '',
        id
    ], function(err) {
        if (err) {
            console.error("Error updating squad member:", err);
            return res.status(500).json({ error: 'Failed to update squad member' });
        }
        res.json({ success: true });
    });
});

// DELETE /api/admin/squad/:id - Delete Squad Member
router.delete(['/squad/:id', '/admin/squad/:id'], (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM squad WHERE id = ?', [id], function(err) {
        if (err) {
            console.error("Error deleting squad member:", err);
            return res.status(500).json({ error: 'Failed to delete squad member' });
        }
        res.json({ success: true });
    });
});

module.exports = router;

