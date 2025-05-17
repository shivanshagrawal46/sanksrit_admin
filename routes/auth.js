const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Login (POST)
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.username);
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
    console.log('Session set for user:', username);
    console.log('Session data:', req.session);

    // Redirect to dashboard
    res.redirect('/dashboard');
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