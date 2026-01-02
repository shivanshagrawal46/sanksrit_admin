const express = require('express');
const router = express.Router();
const CelebrityKundli = require('../models/CelebrityKundli');
const CelebrityKundliCategory = require('../models/CelebrityKundliCategory');

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all kundlis
router.get('/celebrity-kundli', requireAuth, async (req, res) => {
  const kundlis = await CelebrityKundli.find().populate('category').sort({ createdAt: -1 });
  res.render('celebrityKundli', {
    kundlis,
    username: req.session.username,
    error: null,
    success: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Show add kundli form
router.get('/celebrity-kundli/add', requireAuth, async (req, res) => {
  const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
  res.render('addCelebrityKundli', {
    categories,
    username: req.session.username,
    error: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Handle add kundli
router.post('/celebrity-kundli/add', requireAuth, async (req, res) => {
  try {
    const { category, name, dob, time, place, about } = req.body;
    await CelebrityKundli.create({ category, name, dob, time, place, about });
    res.redirect('/celebrity-kundli');
  } catch (err) {
    const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
    res.render('addCelebrityKundli', {
      categories,
      username: req.session.username,
      error: 'All required fields must be filled.',
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});

// Show edit kundli form
router.get('/celebrity-kundli/:id/edit', requireAuth, async (req, res) => {
  const kundli = await CelebrityKundli.findById(req.params.id);
  const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
  if (!kundli) return res.redirect('/celebrity-kundli');
  res.render('editCelebrityKundli', {
    kundli,
    categories,
    username: req.session.username,
    error: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Handle edit kundli
router.post('/celebrity-kundli/:id/edit', requireAuth, async (req, res) => {
  try {
    const { category, name, dob, time, place, about } = req.body;
    await CelebrityKundli.findByIdAndUpdate(req.params.id, { category, name, dob, time, place, about });
    res.redirect('/celebrity-kundli');
  } catch (err) {
    const kundli = await CelebrityKundli.findById(req.params.id);
    const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
    res.render('editCelebrityKundli', {
      kundli,
      categories,
      username: req.session.username,
      error: 'All required fields must be filled.',
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});

// Handle delete kundli
router.post('/celebrity-kundli/:id/delete', requireAuth, async (req, res) => {
  await CelebrityKundli.findByIdAndDelete(req.params.id);
  res.redirect('/celebrity-kundli');
});

// CATEGORY MANAGEMENT
// List categories
router.get('/celebrity-kundli/categories', requireAuth, async (req, res) => {
  const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
  res.render('celebrityKundliCategories', {
    categories,
    username: req.session.username,
    error: null,
    success: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});
// Add category
router.post('/celebrity-kundli/categories/add', requireAuth, async (req, res) => {
  try {
    await CelebrityKundliCategory.create({ 
      id: req.body.id,
      name: req.body.name 
    });
    res.redirect('/celebrity-kundli/categories');
  } catch (err) {
    const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
    res.render('celebrityKundliCategories', {
      categories,
      username: req.session.username,
      error: 'Category ID and name are required and must be unique.',
      success: null,
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});
// Edit category
router.post('/celebrity-kundli/categories/:id/edit', requireAuth, async (req, res) => {
  try {
    await CelebrityKundliCategory.findByIdAndUpdate(req.params.id, { 
      name: req.body.name 
    });
    res.redirect('/celebrity-kundli/categories');
  } catch (err) {
    const categories = await CelebrityKundliCategory.find().sort({ name: 1 });
    res.render('celebrityKundliCategories', {
      categories,
      username: req.session.username,
      error: 'Category name is required and must be unique.',
      success: null,
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});
// Delete category
router.post('/celebrity-kundli/categories/:id/delete', requireAuth, async (req, res) => {
  await CelebrityKundliCategory.findByIdAndDelete(req.params.id);
  res.redirect('/celebrity-kundli/categories');
});

module.exports = router; 