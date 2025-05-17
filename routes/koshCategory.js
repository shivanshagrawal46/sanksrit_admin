const express = require('express');
const KoshCategory = require('../models/KoshCategory');
const router = express.Router();

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all Kosh Categories
router.get('/kosh-categories', requireAuth, async (req, res) => {
  const categories = await KoshCategory.find().sort({ position: 1 });
  res.render('koshCategories', { 
    categories,
    username: req.session.username || 'Admin',
    error: null,
    success: null,
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });
});

// Add Kosh Category (GET)
router.get('/kosh-categories/add', requireAuth, (req, res) => {
  res.render('addKoshCategory', { 
    error: null,
    username: req.session.username || 'Admin'
  });
});

// Add Kosh Category (POST)
router.post('/kosh-categories/add', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  try {
    await KoshCategory.create({ name, position, introduction });
    res.redirect('/kosh-categories');
  } catch (err) {
    res.render('addKoshCategory', { 
      error: 'Category name must be unique and all fields required.',
      username: req.session.username || 'Admin'
    });
  }
});

// Edit Kosh Category (GET)
router.get('/kosh-categories/:id/edit', requireAuth, async (req, res) => {
  const category = await KoshCategory.findById(req.params.id);
  res.render('editKoshCategory', { 
    category, 
    error: null,
    username: req.session.username || 'Admin'
  });
});

// Edit Kosh Category (POST)
router.post('/kosh-categories/:id/edit', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  try {
    await KoshCategory.findByIdAndUpdate(req.params.id, { name, position, introduction });
    res.redirect('/kosh-categories');
  } catch (err) {
    const category = await KoshCategory.findById(req.params.id);
    res.render('editKoshCategory', { 
      category, 
      error: 'Error updating category.',
      username: req.session.username || 'Admin'
    });
  }
});

// Delete Kosh Category
router.delete('/kosh-categories/:id', requireAuth, async (req, res) => {
  await KoshCategory.findByIdAndDelete(req.params.id);
  res.redirect('/kosh-categories');
});

module.exports = router; 