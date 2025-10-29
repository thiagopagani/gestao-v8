const express = require('express');
const router = express.Router();
const { User } = require('../models');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        // Save user in session
        req.session.user = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
        };

        // Don't send password back
        const userPayload = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            status: user.status
        };

        res.json(userPayload);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/logout
// @desc    Log user out
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        } else {
            res.clearCookie('connect.sid'); // The default session cookie name
            return res.status(200).send('Logged out');
        }
    });
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ msg: 'Not authenticated' });
    }
});

module.exports = router;
