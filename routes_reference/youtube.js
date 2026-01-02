const express = require('express');
const router = express.Router();
const YouTube = require('../models/YouTube');

// List page
router.get('/', async (req, res) => {
  const items = await YouTube.find().sort({ createdAt: -1 });
  res.render('youtube/index', { items, username: req.session?.username || null });
});

// Add form
router.get('/add', (req, res) => {
  res.render('youtube/add', { username: req.session?.username || null });
});

// Create
router.post('/add', async (req, res) => {
  try {
    const { title, link, category } = req.body;
    await YouTube.create({ title, link, category });
    res.redirect('/youtube');
  } catch (err) {
    res.status(500).send('Error creating: ' + err.message);
  }
});

// Edit form
router.get('/edit/:id', async (req, res) => {
  const item = await YouTube.findById(req.params.id);
  if (!item) return res.status(404).send('Not found');
  res.render('youtube/edit', { item, username: req.session?.username || null });
});

// Update
router.post('/edit/:id', async (req, res) => {
  try {
    const { title, link, category } = req.body;
    await YouTube.findByIdAndUpdate(req.params.id, { title, link, category });
    res.redirect('/youtube');
  } catch (err) {
    res.status(500).send('Error updating: ' + err.message);
  }
});

// Delete
router.post('/delete/:id', async (req, res) => {
  try {
    await YouTube.findByIdAndDelete(req.params.id);
    res.redirect('/youtube');
  } catch (err) {
    res.status(500).send('Error deleting: ' + err.message);
  }
});

module.exports = router;


