const express = require('express');
const KarmkandCategory = require('../models/KarmkandCategory');
const KarmkandSubCategory = require('../models/KarmkandSubCategory');
const KarmkandContent = require('../models/KarmkandContent');
const router = express.Router();

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all subcategories for a parent category
router.get('/karmkand-category/:parentId/subcategories', requireAuth, async (req, res) => {
  const parent = await KarmkandCategory.findById(req.params.parentId);
  const subcategories = await KarmkandSubCategory.find({ parentCategory: req.params.parentId }).sort({ position: 1 });
  const categories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('karmkandSubCategories', {
    parent,
    subcategories,
    karmkandCategories: categories,
    username: req.session.username
  });
});

// Add subcategory (GET)
router.get('/karmkand-category/:parentId/add-subcategory', requireAuth, async (req, res) => {
  const parent = await KarmkandCategory.findById(req.params.parentId);
  const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('addKarmkandSubCategory', {
    parent,
    error: null,
    username: req.session.username,
    karmkandCategories
  });
});

// Add subcategory (POST)
router.post('/karmkand-category/:parentId/add-subcategory', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  try {
    await KarmkandSubCategory.create({ parentCategory: req.params.parentId, name, position, introduction, cover_image });
    res.redirect(`/karmkand-subcategories?category=${req.params.parentId}`);
  } catch (err) {
    const parent = await KarmkandCategory.findById(req.params.parentId);
    const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
    res.render('addKarmkandSubCategory', {
      parent,
      error: 'All fields required.',
      username: req.session.username,
      karmkandCategories
    });
  }
});

// Edit subcategory (GET)
router.get('/karmkand-subcategory/:id/edit', requireAuth, async (req, res) => {
  const subcategory = await KarmkandSubCategory.findById(req.params.id);
  const parent = await KarmkandCategory.findById(subcategory.parentCategory);
  res.render('editKarmkandSubCategory', {
    subcategory,
    parent,
    error: null,
    username: req.session.username
  });
});

// Edit subcategory (POST)
router.post('/karmkand-subcategory/:id/edit', requireAuth, async (req, res) => {
  const { name, position, introduction, cover_image } = req.body;
  const subcategory = await KarmkandSubCategory.findById(req.params.id);
  try {
    await KarmkandSubCategory.findByIdAndUpdate(req.params.id, { name, position, introduction, cover_image });
    res.redirect(`/karmkand-subcategories?category=${subcategory.parentCategory}`);
  } catch (err) {
    const parent = await KarmkandCategory.findById(subcategory.parentCategory);
    res.render('editKarmkandSubCategory', {
      subcategory,
      parent,
      error: 'Error updating subcategory.',
      username: req.session.username
    });
  }
});

// Delete subcategory
router.delete('/karmkand-subcategory/:id/delete', requireAuth, async (req, res) => {
  try {
    const subcategory = await KarmkandSubCategory.findById(req.params.id);
    if (!subcategory) {
      return res.redirect('/karmkand-subcategories');
    }
    const parentId = subcategory.parentCategory;
    await KarmkandSubCategory.findByIdAndDelete(req.params.id);
    res.redirect(`/karmkand-subcategories?category=${parentId}`);
  } catch (err) {
    console.error(err);
    res.redirect('/karmkand-subcategories');
  }
});

// List all Karmkand Subcategories (optionally filtered by category)
router.get('/karmkand-subcategories', requireAuth, async (req, res) => {
  const { category, sub, page } = req.query;
  const categories = await KarmkandCategory.find().sort({ position: 1 });
  let parent = null;
  let subcategories = [];
  let selectedSubCategory = null;
  let contents = [];
  let currentPage = parseInt(page) || 1;
  let totalPages = 1;
  let subcategoryNav = [];
  let contentTotal = 0;
  let subcategoryMode = true;

  if (category) {
    parent = await KarmkandCategory.findById(category);
    subcategories = await KarmkandSubCategory.find({ parentCategory: category }).sort({ position: 1 });
    subcategoryMode = true;
    if (subcategories.length > 0 && sub) {
      selectedSubCategory = subcategories.find(s => s._id.toString() === sub);
      if (!selectedSubCategory) selectedSubCategory = subcategories[0];
      // Pagination for content
      const limit = 10;
      const skip = (currentPage - 1) * limit;
      contentTotal = await KarmkandContent.countDocuments({ subCategory: selectedSubCategory._id });
      contents = await KarmkandContent.find({ subCategory: selectedSubCategory._id })
        .sort({ sequenceNo: 1 })
        .skip(skip)
        .limit(limit);
      totalPages = Math.ceil(contentTotal / limit) || 1;
      subcategoryNav = subcategories;
      subcategoryMode = false;
    }
  } else {
    subcategories = await KarmkandSubCategory.find().sort({ position: 1 });
  }

  res.render('karmkandSubCategories', {
    parent,
    subcategories,
    selectedSubCategory,
    contents,
    currentPage,
    totalPages,
    subcategoryNav,
    contentTotal,
    karmkandCategories: categories,
    username: req.session.username,
    subcategoryMode
  });
});

// Karmkand Subcategories for a specific category (content management)
router.get('/karmkand-subcategories/:categoryId', requireAuth, async (req, res) => {
  try {
    const categories = await KarmkandCategory.find().sort({ position: 1 });
    const parent = await KarmkandCategory.findById(req.params.categoryId);
    if (!parent) {
      return res.redirect('/karmkand-subcategories');
    }
    // Get all subcategories for this category
    const subcategories = await KarmkandSubCategory.find({ parentCategory: req.params.categoryId }).sort({ position: 1 });
    if (subcategories.length === 0) {
      return res.render('karmkandSubCategories', {
        karmkandCategories: categories,
        parent,
        subcategories: [],
        selectedSubCategory: null,
        contents: [],
        username: req.session.username,
        currentPage: 1,
        totalPages: 1,
        subcategoryNav: [],
        contentTotal: 0,
        subcategoryMode: false
      });
    }
    // Determine selected subcategory
    let selectedSubCategoryId = req.query.sub || subcategories[0]._id.toString();
    const selectedSubCategory = subcategories.find(sub => sub._id.toString() === selectedSubCategoryId) || subcategories[0];
    // Pagination for content
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const contentTotal = await KarmkandContent.countDocuments({ subCategory: selectedSubCategory._id });
    const contents = await KarmkandContent.find({ subCategory: selectedSubCategory._id })
      .sort({ sequenceNo: 1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(contentTotal / limit) || 1;
    res.render('karmkandSubCategories', {
      karmkandCategories: categories,
      parent,
      subcategories,
      selectedSubCategory,
      contents,
      username: req.session.username,
      currentPage: page,
      totalPages,
      subcategoryNav: subcategories,
      contentTotal,
      subcategoryMode: false
    });
  } catch (err) {
    return res.redirect('/karmkand-subcategories');
  }
});

module.exports = router; 