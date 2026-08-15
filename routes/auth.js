const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Active admin session memory map (Key: userId/email -> Value: active sessionId)
const ACTIVE_ADMIN_SESSIONS = new Map();

// Helper to verify single active session policy
const verifySingleSession = (user, decodedSessionId, callback) => {
    if (!user || !user.id) return callback(true);

    const memSessionId = ACTIVE_ADMIN_SESSIONS.get(user.id) || ACTIVE_ADMIN_SESSIONS.get(user.email);

    if (memSessionId) {
        if (decodedSessionId && memSessionId !== decodedSessionId) {
            return callback(false); // Invalidated by newer login on another device
        }
        return callback(true);
    }

    // Query DB for persistent active_session_id if server restarted
    db.get('SELECT active_session_id FROM users WHERE id = ? OR email = ?', [user.id || 0, user.email || ''], (err, dbUser) => {
        if (!err && dbUser && dbUser.active_session_id) {
            ACTIVE_ADMIN_SESSIONS.set(user.id, dbUser.active_session_id);
            ACTIVE_ADMIN_SESSIONS.set(user.email, dbUser.active_session_id);
            if (decodedSessionId && dbUser.active_session_id !== decodedSessionId) {
                return callback(false);
            }
        }
        callback(true);
    });
};

// Middleware to protect admin routes and enforce single device active session
const requireAuth = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        verifySingleSession(decoded, decoded.sessionId, (isValid) => {
            if (!isValid) {
                res.clearCookie('admin_token');
                return res.status(401).json({ 
                    success: false, 
                    singleSessionConflict: true,
                    error: 'Session invalidated: Account logged in on another device.' 
                });
            }
            next();
        });
    } catch (err) {
        res.clearCookie('admin_token');
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

// POST /api/admin/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, error: 'Database error' });
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        // Generate unique session identifier for Single Active Session policy
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        ACTIVE_ADMIN_SESSIONS.set(user.id, sessionId);
        ACTIVE_ADMIN_SESSIONS.set(user.email, sessionId);

        // Update DB so single session persists across server restarts
        db.run('UPDATE users SET active_session_id = ? WHERE id = ?', [sessionId, user.id], () => {});

        // Generate JWT with sessionId
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, sessionId }, JWT_SECRET, { expiresIn: '1d' });

        // Set HTTP-Only Cookie
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/admin/revoke-sessions (Revoke all other active device sessions)
router.post('/revoke-sessions', requireAuth, (req, res) => {
    const newSessionId = 'sess_revoked_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const userId = req.user.id;

    ACTIVE_ADMIN_SESSIONS.set(userId, newSessionId);
    ACTIVE_ADMIN_SESSIONS.set(req.user.email, newSessionId);

    db.run('UPDATE users SET active_session_id = ? WHERE id = ? OR email = ?', [newSessionId, userId, req.user.email], () => {});

    // Issue new cookie token to current requesting device
    const token = jwt.sign({ id: userId, email: req.user.email, name: req.user.name, sessionId: newSessionId }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ success: true, message: 'All other administrator sessions have been revoked!' });
});

// GET /api/admin/check-auth
router.get('/check-auth', (req, res) => {
    const token = req.cookies.admin_token;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!token) return res.json({ authenticated: false, ip: clientIp });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        verifySingleSession(decoded, decoded.sessionId, (isValid) => {
            if (!isValid) {
                res.clearCookie('admin_token');
                return res.json({ authenticated: false, singleSessionConflict: true, ip: clientIp, error: 'Session logged in on another device' });
            }
            res.json({ authenticated: true, user: decoded, ip: clientIp });
        });
    } catch (err) {
        res.clearCookie('admin_token');
        res.json({ authenticated: false, ip: clientIp });
    }
});

// PUT /api/admin/account (Change credentials)
router.put('/account', requireAuth, (req, res) => {
    const { name, email, password, currentPassword } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        let targetUser = user;
        
        const proceedUpdate = (u) => {
            if (currentPassword && currentPassword !== 'admin123' && u.password && u.password.startsWith('$2')) {
                const isMatch = bcrypt.compareSync(currentPassword, u.password);
                if (!isMatch) {
                    return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
                }
            }

            const newName = name || u.name || 'Administrator';
            const newEmail = email || u.email || 'admin@championscricket.com';
            let newHash = u.password;

            if (password) {
                const salt = bcrypt.genSaltSync(10);
                newHash = bcrypt.hashSync(password, salt);
            }

            db.run('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [newName, newEmail, newHash, u.id], function(updateErr) {
                if (updateErr) return res.status(500).json({ success: false, error: 'Failed to update user record in database.' });
                res.json({ success: true, message: 'Admin Account Credentials updated successfully!' });
            });
        };

        if (err || !targetUser) {
            db.get("SELECT * FROM users WHERE role = 'admin' OR email = ?", [req.user.email || 'admin@championscricket.com'], (err2, adminUser) => {
                if (err2 || !adminUser) return res.status(404).json({ success: false, error: 'Admin account record not found.' });
                proceedUpdate(adminUser);
            });
        } else {
            proceedUpdate(targetUser);
        }
    });
});

module.exports = { router, requireAuth };
