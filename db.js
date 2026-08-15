require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

let db;

if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require('@libsql/client');
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    db = {
        get(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            params = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
            client.execute({ sql, args: params })
                .then(res => {
                    if (!res.rows || res.rows.length === 0) {
                        if (callback) callback(null, undefined);
                        return;
                    }
                    const row = res.rows[0];
                    const plain = {};
                    if (res.columns && Array.isArray(res.columns)) {
                        res.columns.forEach((col, idx) => {
                            plain[col] = row[col] !== undefined ? row[col] : row[idx];
                        });
                    } else {
                        Object.keys(row).forEach(k => plain[k] = row[k]);
                    }
                    if (callback) callback(null, plain);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        },
        all(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            params = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
            client.execute({ sql, args: params })
                .then(res => {
                    const plainRows = (res.rows || []).map(row => {
                        const plain = {};
                        if (res.columns && Array.isArray(res.columns)) {
                            res.columns.forEach((col, idx) => {
                                plain[col] = row[col] !== undefined ? row[col] : row[idx];
                            });
                        } else {
                            Object.keys(row).forEach(k => plain[k] = row[k]);
                        }
                        return plain;
                    });
                    if (callback) callback(null, plainRows);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        },
        run(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            params = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
            client.execute({ sql, args: params })
                .then(res => {
                    if (callback) callback.call({ lastID: res.lastInsertRowid ? Number(res.lastInsertRowid) : 0, changes: res.rowsAffected }, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        }
    };
    console.log('Connected to Turso database (libsql)');
    initializeDatabase();
} else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to local SQLite database:', err.message);
        } else {
            console.log('Connected to local SQLite database');
            initializeDatabase();
        }
    });
}

function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        service_interest TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migration helper for leads & users table columns
    db.run("ALTER TABLE users ADD COLUMN active_session_id TEXT", () => {});
    db.run("ALTER TABLE leads ADD COLUMN phone TEXT", () => {});
    db.run("ALTER TABLE leads ADD COLUMN service_interest TEXT", () => {});
    db.run("ALTER TABLE leads ADD COLUMN is_read INTEGER DEFAULT 0", () => {});

    db.run(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT,
        author TEXT,
        image TEXT,
        excerpt TEXT,
        video_url TEXT,
        read_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS squad (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        roleCategory TEXT NOT NULL,
        role TEXT NOT NULL,
        experience TEXT,
        tenure TEXT,
        photo TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure default admin, settings, blogs & squad exist
    ensureDefaultAdmin();
    ensureDefaultSettings();
    ensureDefaultBlogs();
    ensureDefaultSquad();
}

function ensureDefaultSettings() {
    const defaultSettings = {
        siteName: "Champions Cricket Club",
        siteTagline: "Official Cricket Club & Sports Academy",
        isDeployed: false,
        maintenance: false,
        contactFormEnabled: true,
        siteDescription: "Official portal of Champions Cricket Club",
        googleAnalyticsId: "",
        pageStatus: {
            about: true,
            matches: true,
            blogs: true,
            contact: true,
            scoring: true
        }
    };

    db.get("SELECT value FROM settings WHERE key = 'general'", (err, row) => {
        if (!err && !row) {
            db.run(
                "INSERT INTO settings (key, value) VALUES ('general', ?)",
                [JSON.stringify(defaultSettings)],
                (err) => {
                    if (!err) console.log("Default operational settings initialized (isDeployed: false).");
                }
            );
        }
    });
}

function ensureDefaultAdmin() {
    db.get('SELECT * FROM users WHERE email = ?', ['admin@championscricket.com'], (err, row) => {
        if (!err && !row) {
            bcrypt.hash('admin123', 10, (err, hash) => {
                if (!err) {
                    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', ['admin@championscricket.com', hash, 'Super Admin']);
                    console.log('Default admin user created.');
                }
            });
        }
    });
}

function ensureDefaultBlogs() {
    db.get("SELECT COUNT(*) as count FROM blogs", (err, row) => {
        if (!err && row && (row.count === 0 || row.count === "0")) {
            const initialBlogs = [
                {
                    id: "blog-1",
                    title: "How to Perfect Your Cover Drive: Biomechanics & Timing",
                    category: "Coaching Tips",
                    date: "Aug 10, 2026",
                    author: "Coach Rahul Sharma",
                    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
                    excerpt: `<h2>Mastering Front-Foot Placement & Head Balance</h2><p>The cover drive is widely considered the crown jewel of classic cricket batting strokeplay. Executing it with precision requires seamless synchronicity between your lead foot, shoulder alignment, and head position directly above the ball contact zone.</p><div class="article-img-wrap float-left img-w-50"><img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" alt="Cover drive technique"><span class="img-caption">Figure 1. Lead foot planted towards cover with head over ball.</span></div><p>When playing off the front foot against full-pitched deliveries on off-stump, batsmen often make the error of reaching out with their hands instead of driving their weight forward. Your head must dictate your balance line. If your head drops inside or behind the knee line, the bat face will twist upon impact, resulting in aerial edges to gully.</p><h3>Key Execution Steps:</h3><ul><li><b>Dominant Top-Hand Control:</b> Maintain a firm top-hand grip while using the bottom hand solely for direction control.</li><li><b>Weight Transfer:</b> Flex your front knee so that your center of gravity shifts forward fluidly.</li><li><b>High Elbow Follow Through:</b> Finish the stroke with your front elbow pointing towards the bowler or extra cover boundary.</li></ul><p>Practice this technique with high-volume throwdowns using target cones set at extra cover and mid-off.</p>`,
                    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    read_time: "5 min read"
                },
                {
                    id: "blog-2",
                    title: "High-Performance Pace Bowling: Seam Position & Wrist Snap",
                    category: "Biomechanics",
                    date: "Aug 08, 2026",
                    author: "Liam Taylor",
                    image: "https://images.unsplash.com/photo-1512719994953-eabf50895df7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
                    excerpt: `<h2>Unlocking Explosive Pace and Seam Upright Alignment</h2><p>Generating consistent pace upwards of 135 km/h requires maximum rotational force and a stable wrist snap at release. Seam orientation is the single biggest factor in achieving outswing and inswing late off the pitch surface.</p><div class="article-img-wrap float-right img-w-50"><img src="https://images.unsplash.com/photo-1512719994953-eabf50895df7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" alt="Pace bowling seam release"><span class="img-caption">Figure 2. Upright seam release with stiff front-leg block.</span></div><p>At front-foot stride contact, the front leg acts as a stiff braking lever. This converts horizontal approach momentum into explosive trunk rotation and arm speed. Keep the wrist cocked behind the ball until the final millisecond before release.</p><h3>Drills to Improve Wrist Stability:</h3><ol><li>Targeted target bowling from 15 paces focussing purely on seam wobble reduction.</li><li>Single-leg deceleration bounds for core and lower back stability.</li></ol>`,
                    video_url: "",
                    read_time: "4 min read"
                },
                {
                    id: "blog-3",
                    title: "Champions Regional T20 Cup Final Victory Recap",
                    category: "Club News",
                    date: "Aug 04, 2026",
                    author: "Marcus Vance",
                    image: "https://images.unsplash.com/photo-1565787154274-c8d076ad34e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
                    excerpt: `<h2>A Historic Night at Champions Sports Complex</h2><p>In a nail-biting final that came down to the final ball, Champions CC secured the coveted Regional T20 Cup title! Defending 168 runs against Metro Warriors, our bowling unit showed incredible grit in the death overs.</p><p>Marcus Vance led from the front with a sterling 74 off 48 balls, supported by Sarah Jenkins' crucial 3-wicket spell in the middle overs. The club thanks all members and supporters who cheered from the stands!</p>`,
                    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    read_time: "6 min read"
                }
            ];

            initialBlogs.forEach(b => {
                db.run(
                    "INSERT INTO blogs (id, title, category, date, author, image, excerpt, video_url, read_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [b.id, b.title, b.category, b.date, b.author, b.image, b.excerpt, b.video_url, b.read_time]
                );
            });
            console.log("Seeded initial default blogs into database.");
        }
    });
}

function ensureDefaultSquad() {
    db.all("SELECT * FROM squad", (err, rows) => {
        if (!err && (!rows || rows.length === 0)) {
            const initialSquad = [
                {
                    id: "m-vance",
                    roleCategory: "management",
                    name: "Marcus Vance",
                    role: "Club Captain",
                    experience: "12 Years Exp.",
                    tenure: "Member for 8 Years",
                    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
                    bio: "Former State Opening Batsman with over 4,500 first-class runs. Leads the 1st XI with tactical aggression and mentors younger players."
                },
                {
                    id: "s-jenkins",
                    roleCategory: "coaches",
                    name: "Sarah Jenkins",
                    role: "Vice Captain",
                    experience: "10 Years Pro",
                    tenure: "Member for 6 Years",
                    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
                    bio: "Dynamic left-arm spinner. Always happy to share spin variation tactics with new club members."
                },
                {
                    id: "r-sharma",
                    roleCategory: "batters",
                    name: "Rahul Sharma",
                    role: "Top-Order Wicketkeeper Batter",
                    experience: "5 Years Pro",
                    tenure: "Member for 4 Years",
                    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
                    bio: "Explosive stroke-player behind the stumps. Known for quick glovework and high-tempo batting during death overs."
                },
                {
                    id: "l-taylor",
                    roleCategory: "bowlers",
                    name: "Liam Taylor",
                    role: "Fast Bowling Specialist",
                    experience: "7 Years Pro",
                    tenure: "Member for 5 Years",
                    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=srgb&fm=jpg&q=85&w=500",
                    bio: "Clocking speeds above 140 km/h, Liam leads our pace attack with aggressive seam position and lethal yorkers."
                }
            ];

            initialSquad.forEach(member => {
                db.run(
                    "INSERT INTO squad (id, name, roleCategory, role, experience, tenure, photo, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [member.id, member.name, member.roleCategory, member.role, member.experience, member.tenure, member.photo, member.bio],
                    (err) => {
                        if (err) console.error(`Error inserting squad member ${member.name}:`, err);
                        else console.log(`Successfully seeded squad member: ${member.name}`);
                    }
                );
            });
        }
    });

    // Create Gallery table
    db.run(`
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT DEFAULT 'photo',
            category TEXT DEFAULT 'Matches',
            url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Error creating gallery table:", err);
        } else {
            db.get("SELECT COUNT(*) as count FROM gallery", (err, row) => {
                if (!err && row && row.count === 0) {
                    const initialGallery = [
                        { title: "Championship Victory Trophy 2025", type: "photo", category: "Matches", url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
                        { title: "Academy Net Practice & Biomechanics", type: "photo", category: "Training", url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
                        { title: "Annual Sports Award Ceremony", type: "photo", category: "Events", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
                        { title: "Fast Bowling Analysis Session", type: "photo", category: "Biometrics", url: "https://images.unsplash.com/photo-1565787154274-c8d076ad34e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" }
                    ];

                    initialGallery.forEach(g => {
                        db.run(
                            "INSERT INTO gallery (title, type, category, url) VALUES (?, ?, ?, ?)",
                            [g.title, g.type, g.category, g.url],
                            (e) => {
                                if (!e) console.log(`Seeded gallery item: ${g.title}`);
                            }
                        );
                    });
                }
            });
        }
    });
}

module.exports = db;

