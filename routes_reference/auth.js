const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Login (POST)
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', {
      username: req.body.username,
      headers: req.headers,
      protocol: req.protocol,
      secure: req.secure,
      cookies: req.cookies,
      host: req.get('host'),
      xForwardedProto: req.get('x-forwarded-proto'),
      sessionID: req.sessionID
    });
    
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with username:', username);
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.log('Password does not match for user:', username);
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    // Log session details
    console.log('Session details after setting:', {
      id: req.session.id,
      userId: req.session.userId,
      username: req.session.username,
      cookie: req.session.cookie,
      sessionID: req.sessionID
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
    console.error('Login error:', error);
    res.render('login', { error: 'An error occurred during login' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// User management routes (for admin)
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.render('users', { 
    users,
    username: req.session.username || 'Admin' 
  });
});

router.post('/users/add', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.redirect('/users');
});

router.post('/users/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router; 