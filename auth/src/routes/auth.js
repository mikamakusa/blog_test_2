const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, role: req.user.role },
            process.env.JWT_SECRET || 'your-jwt-secret',
            { expiresIn: '1d' }
        );
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// Local authentication routes
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt with body:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ 
                message: 'Email and password are required',
                received: { email, password: password ? 'provided' : 'missing' }
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        console.log('Found user:', user ? 'yes' : 'no');
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch ? 'yes' : 'no');
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data and token
        const response = {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        };
        console.log('Sending response:', { ...response, token: 'hidden' });
        res.json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router; 