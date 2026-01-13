const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Admin Login (POST) - Session-based for web dashboard
// Hardcoded admin credentials
const ADMIN_USERNAME = 'bholenath';
const ADMIN_PASSWORD = 'password123';

router.post('/login', async (req, res) => {
  try {
    console.log('Admin login attempt:', {
      username: req.body.username,
      timestamp: new Date().toISOString()
    });
    
    const { username, password } = req.body;
    
    // Check hardcoded admin credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('Invalid credentials for username:', username);
      return res.render('login', { error: 'Invalid username or password' });
    }

    console.log('Admin login successful');

    // Set session
    req.session.userId = 'admin';
    req.session.username = 'Bholenath Admin';
    req.session.isAdmin = true;
    
    // Log session details
    console.log('Session details after setting:', {
      id: req.session.id,
      userId: req.session.userId,
      username: req.session.username,
      cookie: req.session.cookie
    });

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('login', { error: 'Session error occurred' });
      }
      console.log('Session saved successfully');
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('login', { error: 'An error occurred during login' });
  }
});

// Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
