const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Helper: format user for response
const formatUser = (user) => ({
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio || '',
    followers: user.followers?.length || 0,
    following: user.following?.length || 0,
    joinedAt: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024',
});

// @desc    Register new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'buyer',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=200`
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// @desc    Login user with email/password
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @desc    Google Auth for Mobile (ID Token verification)
// @route   POST /api/auth/google/mobile
router.post('/google/mobile', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                googleId,
                name,
                email,
                avatar,
                role: 'buyer'
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (avatar) user.avatar = avatar;
            await user.save();
        }

        const token = generateToken(user);
        res.json({ success: true, token, user: formatUser(user) });
    } catch (error) {
        console.error('Google mobile auth error:', error);
        res.status(400).json({ success: false, message: 'Invalid Google Token' });
    }
});

// @desc    Google Auth for Web (exchange auth code or credential for token)
// @route   POST /api/auth/google/web
router.post('/google/web', async (req, res) => {
    const { credential } = req.body;

    try {
        // Verify the Google ID token (from Google Sign-In for Web)
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                googleId,
                name,
                email,
                avatar,
                role: 'buyer'
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (avatar) user.avatar = avatar;
            await user.save();
        }

        const token = generateToken(user);
        res.json({ success: true, token, user: formatUser(user) });
    } catch (error) {
        console.error('Google web auth error:', error);
        res.status(400).json({ success: false, message: 'Invalid Google credential' });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, (req, res) => {
    res.json(formatUser(req.user));
});

module.exports = router;

