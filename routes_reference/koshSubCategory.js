const express = require('express');
const KoshCategory = require('../models/KoshCategory');
const KoshSubCategory = require('../models/KoshSubCategory');
const router = express.Router();

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all subcategories for a parent category
router.get('/kosh-category/:parentId/subcategories', requireAuth, async (req, res) => {
  const parent = await KoshCategory.findById(req.params.parentId);
  const subcategories = await KoshSubCategory.find({ parentCategory: req.params.parentId }).sort({ position: 1 });
  const categories = await KoshCategory.find().sort({ position: 1 });
  res.render('koshSubCategories', { 
    parent, 
    subcategories, 
    koshCategories: categories,
    username: req.session.username
  });
});

// Add subcategory (GET)
router.get('/kosh-category/:parentId/add-subcategory', requireAuth, async (req, res) => {
  const parent = await KoshCategory.findById(req.params.parentId);
  res.render('addKoshSubCategory', { 
    parent, 
    error: null,
    username: req.session.username
  });
});

// Add subcategory (POST)
router.post('/kosh-category/:parentId/add-subcategory', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  try {
    await KoshSubCategory.create({ parentCategory: req.params.parentId, name, position, introduction, cover_image });
    res.redirect(`/kosh-subcategories?category=${req.params.parentId}`);
  } catch (err) {
    const parent = await KoshCategory.findById(req.params.parentId);
    res.render('addKoshSubCategory', { 
      parent, 
      error: 'All fields required.',
      username: req.session.username
    });
  }
});

// Edit subcategory (GET)
router.get('/kosh-subcategory/:id/edit', requireAuth, async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.id);
  const parent = await KoshCategory.findById(subcategory.parentCategory);
  res.render('editKoshSubCategory', { 
    subcategory, 
    parent, 
    error: null,
    username: req.session.username
  });
});

// Edit subcategory (POST)
router.post('/kosh-subcategory/:id/edit', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  const subcategory = await KoshSubCategory.findById(req.params.id);
  try {
    await KoshSubCategory.findByIdAndUpdate(req.params.id, { name, position, introduction, cover_image });
    res.redirect(`/kosh-subcategories?category=${subcategory.parentCategory}`);
  } catch (err) {
    const parent = await KoshCategory.findById(subcategory.parentCategory);
    res.render('editKoshSubCategory', { 
      subcategory, 
      parent, 
      error: 'Error updating subcategory.',
      username: req.session.username
    });
  }
});

// Delete subcategory
router.delete('/kosh-subcategory/:id/delete', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.id);
    if (!subcategory) {
      return res.redirect('/kosh-subcategories');
    }
    const parentId = subcategory.parentCategory;
    await KoshSubCategory.findByIdAndDelete(req.params.id);
    res.redirect(`/kosh-subcategories?category=${parentId}`);
  } catch (err) {
    console.error(err);
    res.redirect('/kosh-subcategories');
  }
});

module.exports = router; 