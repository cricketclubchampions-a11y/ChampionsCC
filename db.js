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
                    const row = res.rows && res.rows.length > 0 ? res.rows[0] : undefined;
                    if (callback) callback(null, row);
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
                    if (callback) callback(null, res.rows);
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

    db.run(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure default admin & settings exist
    ensureDefaultAdmin();
    ensureDefaultSettings();
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

module.exports = db;
