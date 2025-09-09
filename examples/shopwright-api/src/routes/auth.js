const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user data for demo
const users = [
    {
        id: 1,
        email: 'admin@demo.com',
        password: '$2a$10$example.hash.for.password123', // password123
        role: 'admin',
        name: 'Admin User',
    },
    {
        id: 2,
        email: 'user@demo.com',
        password: '$2a$10$example.hash.for.password123', // password123
        role: 'customer',
        name: 'Demo Customer',
    },
];

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user (in real app, this would be a database query)
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password (simplified for demo)
        const isValidPassword = password === 'password123';
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || 'demo-secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route POST /api/auth/register
 * @desc User registration
 * @access Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create new user (simplified for demo)
        const newUser = {
            id: users.length + 1,
            email,
            password: await bcrypt.hash(password, 10),
            name,
            role: 'customer',
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
            process.env.JWT_SECRET || 'demo-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', (req, res) => {
    // In a real app, you might invalidate the token in a blacklist
    res.json({ message: 'Logout successful' });
});

module.exports = router;
