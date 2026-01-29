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
    selectedSubCategory: null,
    contents: [],
    contentTotal: 0,
    currentPage: 1,
    totalPages: 1,
    subcategoryMode: true,
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
    await KoshSubCategory.create({ 
      name, 
      position, 
      introduction, 
      cover_image,
      parentCategory: req.params.parentId 
    });
    res.redirect(`/kosh-subcategories/${req.params.parentId}`);
  } catch (err) {
    const parent = await KoshCategory.findById(req.params.parentId);
    res.render('addKoshSubCategory', { 
      parent, 
      error: 'Error creating subcategory.',
      username: req.session.username || 'Admin'
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
  try {
    await KoshSubCategory.findByIdAndUpdate(req.params.id, { 
      name, 
      position, 
      introduction, 
      cover_image 
    });
    const subcategory = await KoshSubCategory.findById(req.params.id);
    res.redirect(`/kosh-subcategories/${subcategory.parentCategory}`);
  } catch (err) {
    const subcategory = await KoshSubCategory.findById(req.params.id);
    const parent = await KoshCategory.findById(subcategory.parentCategory);
    res.render('editKoshSubCategory', { 
      subcategory, 
      parent, 
      error: 'Error updating subcategory.',
      username: req.session.username || 'Admin'
    });
  }
});

// Delete subcategory (support both POST and DELETE)
// Also deletes all kosh content associated with this subcategory
router.post('/kosh-subcategory/:id/delete', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.id);
    if (!subcategory) {
      return res.redirect('/kosh-subcategories');
    }
    const parentId = subcategory.parentCategory;
    
    // Delete all kosh content for this subcategory first
    const KoshContent = require('../models/KoshContent');
    const deletedContent = await KoshContent.deleteMany({ subCategory: req.params.id });
    console.log(`Deleted ${deletedContent.deletedCount} content items from subcategory: ${subcategory.name}`);
    
    // Then delete the subcategory itself
    await KoshSubCategory.findByIdAndDelete(req.params.id);
    console.log(`Deleted subcategory: ${subcategory.name}`);
    
    res.redirect(`/kosh-subcategories?category=${parentId}`);
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    res.redirect('/kosh-subcategories');
  }
});

router.delete('/kosh-subcategory/:id/delete', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.id);
    if (!subcategory) {
      return res.redirect('/kosh-subcategories');
    }
    const parentId = subcategory.parentCategory;
    
    // Delete all kosh content for this subcategory first
    const KoshContent = require('../models/KoshContent');
    const deletedContent = await KoshContent.deleteMany({ subCategory: req.params.id });
    console.log(`Deleted ${deletedContent.deletedCount} content items from subcategory: ${subcategory.name}`);
    
    // Then delete the subcategory itself
    await KoshSubCategory.findByIdAndDelete(req.params.id);
    console.log(`Deleted subcategory: ${subcategory.name}`);
    
    res.redirect(`/kosh-subcategories?category=${parentId}`);
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    res.redirect('/kosh-subcategories');
  }
});

module.exports = router; 