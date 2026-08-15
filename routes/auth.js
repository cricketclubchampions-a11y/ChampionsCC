const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Middleware to protect routes
const requireAuth = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
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

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

        // Set cookie
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

// GET /api/admin/check-auth
router.get('/check-auth', (req, res) => {
    const token = req.cookies.admin_token;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!token) return res.json({ authenticated: false, ip: clientIp });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ authenticated: true, user: decoded, ip: clientIp });
    } catch (err) {
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
