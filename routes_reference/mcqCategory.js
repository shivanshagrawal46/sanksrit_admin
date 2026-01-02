const express = require('express');
const McqCategory = require('../models/McqCategory');
const KoshCategory = require('../models/KoshCategory');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.get('/mcq-categories', requireAuth, async (req, res) => {
  const categories = await McqCategory.find().sort({ position: 1 });
  const mcqCategories = categories;
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('mcqCategories', { 
    categories,
    mcqCategories,
    username: req.session.username,
    activePage: 'mcq-categories',
    koshCategories,
    activeCategory: null,
    activeSubCategory: null
  });
});

router.get('/add-mcq-category', requireAuth, async (req, res) => {
  const mcqCategories = await McqCategory.find().sort({ position: 1 });
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('addMcqCategory', { 
    error: null,
    mcqCategories,
    username: req.session.username,
    activePage: 'mcq-categories',
    koshCategories,
    activeCategory: null,
    activeSubCategory: null
  });
});

router.post('/add-mcq-category', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  try {
    await McqCategory.create({ name, position, introduction });
    res.redirect('/mcq-categories');
  } catch (err) {
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    res.render('addMcqCategory', { 
      error: 'Category name must be unique and all fields required.',
      mcqCategories,
      username: req.session.username,
      activePage: 'mcq-categories',
      koshCategories,
      activeCategory: null,
      activeSubCategory: null
    });
  }
});

router.get('/edit-mcq-category/:id', requireAuth, async (req, res) => {
  const category = await McqCategory.findById(req.params.id);
  const mcqCategories = await McqCategory.find().sort({ position: 1 });
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('editMcqCategory', { 
    category, 
    error: null,
    mcqCategories,
    username: req.session.username,
    activePage: 'mcq-categories',
    koshCategories,
    activeCategory: null,
    activeSubCategory: null
  });
});

router.post('/edit-mcq-category/:id', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  try {
    await McqCategory.findByIdAndUpdate(req.params.id, { name, position, introduction });
    res.redirect('/mcq-categories');
  } catch (err) {
    const category = await McqCategory.findById(req.params.id);
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    res.render('editMcqCategory', { 
      category, 
      error: 'Error updating category.',
      mcqCategories,
      username: req.session.username,
      activePage: 'mcq-categories',
      koshCategories,
      activeCategory: null,
      activeSubCategory: null
    });
  }
});

router.post('/delete-mcq-category/:id', requireAuth, async (req, res) => {
  await McqCategory.findByIdAndDelete(req.params.id);
  res.redirect('/mcq-categories');
});

module.exports = router; 