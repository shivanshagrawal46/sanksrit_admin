const express = require('express');
const KarmkandCategory = require('../models/KarmkandCategory');
const router = express.Router();

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all Karmkand Categories
router.get('/karmkand-categories', requireAuth, async (req, res) => {
  const categories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('karmkandCategories', {
    categories,
    username: req.session.username || 'Admin',
    error: null,
    success: null,
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });
});

// Add Karmkand Category (GET)
router.get('/karmkand-categories/add', requireAuth, (req, res) => {
  res.render('addKarmkandCategory', {
    error: null,
    username: req.session.username || 'Admin'
  });
});

// Add Karmkand Category (POST)
router.post('/karmkand-categories/add', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  try {
    await KarmkandCategory.create({ name, position, introduction, cover_image });
    res.redirect('/karmkand-categories');
  } catch (err) {
    res.render('addKarmkandCategory', {
      error: 'Category name must be unique and all fields required.',
      username: req.session.username || 'Admin'
    });
  }
});

// Edit Karmkand Category (GET)
router.get('/karmkand-categories/:id/edit', requireAuth, async (req, res) => {
  const category = await KarmkandCategory.findById(req.params.id);
  res.render('editKarmkandCategory', {
    category,
    error: null,
    username: req.session.username || 'Admin'
  });
});

// Edit Karmkand Category (POST)
router.post('/karmkand-categories/:id/edit', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  try {
    await KarmkandCategory.findByIdAndUpdate(req.params.id, { name, position, introduction, cover_image });
    res.redirect('/karmkand-categories');
  } catch (err) {
    const category = await KarmkandCategory.findById(req.params.id);
    res.render('editKarmkandCategory', {
      category,
      error: 'Error updating category.',
      username: req.session.username || 'Admin'
    });
  }
});

// Delete Karmkand Category
router.delete('/karmkand-categories/:id', requireAuth, async (req, res) => {
  await KarmkandCategory.findByIdAndDelete(req.params.id);
  res.redirect('/karmkand-categories');
});

module.exports = router; 