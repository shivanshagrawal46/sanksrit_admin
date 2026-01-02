const express = require('express');
const router = express.Router();
const KoshCategory = require('../models/KoshCategory');
const KoshSubCategory = require('../models/KoshSubCategory');
const KoshContent = require('../models/KoshContent');

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// Home route
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('dashboard', { 
        username: req.session.username,
        title: 'Dashboard'
    });
});

// Kosh Subcategories main page (subcategory management)
router.get('/kosh-subcategories', requireAuth, async (req, res) => {
  const categories = await KoshCategory.find().sort({ position: 1 });
  if (!categories.length) {
    return res.render('koshSubCategories', {
      koshCategories: categories,
      parent: null,
      subcategories: [],
      selectedCategory: null,
      username: req.session.username,
      subcategoryMode: true,
      activePage: 'kosh-subcategories',
      activeCategory: null
    });
  }
  // Determine selected category
  let selectedCategoryId = req.query.category || categories[0]._id.toString();
  const selectedCategory = categories.find(cat => cat._id.toString() === selectedCategoryId) || categories[0];
  // Get subcategories for selected category
  const subcategories = await KoshSubCategory.find({ parentCategory: selectedCategory._id }).sort({ position: 1 });
  res.render('koshSubCategories', {
    koshCategories: categories,
    parent: selectedCategory,
    subcategories,
    selectedCategory,
    username: req.session.username,
    subcategoryMode: true,
    activePage: 'kosh-subcategories',
    activeCategory: null
  });
});

// Kosh Subcategories for a specific category (content management)
router.get('/kosh-subcategories/:categoryId', requireAuth, async (req, res) => {
  try {
    const categories = await KoshCategory.find().sort({ position: 1 });
    const parent = await KoshCategory.findById(req.params.categoryId);
    if (!parent) {
      return res.redirect('/kosh-subcategories');
    }
    // Get all subcategories for this category
    const subcategories = await KoshSubCategory.find({ parentCategory: req.params.categoryId }).sort({ position: 1 });
    if (subcategories.length === 0) {
      return res.render('koshSubCategories', {
        koshCategories: categories,
        parent,
        subcategories: [],
        selectedSubCategory: null,
        contents: [],
        username: req.session.username,
        currentPage: 1,
        totalPages: 1,
        subcategoryNav: [],
        contentTotal: 0,
        subcategoryMode: false,
        activePage: null,
        activeCategory: req.params.categoryId
      });
    }
    // Determine selected subcategory
    let selectedSubCategoryId = req.query.sub || subcategories[0]._id.toString();
    const selectedSubCategory = subcategories.find(sub => sub._id.toString() === selectedSubCategoryId) || subcategories[0];
    // Search query
    const searchQuery = req.query.search || '';
    // Build query with search
    const query = { subCategory: selectedSubCategory._id };
    if (searchQuery) {
      query.$or = [
        { hindiWord: { $regex: searchQuery, $options: 'i' } },
        { englishWord: { $regex: searchQuery, $options: 'i' } },
        { hinglishWord: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    // Pagination for content
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const contentTotal = await KoshContent.countDocuments(query);
    const contents = await KoshContent.find(query)
      .sort({ hindiWord: 1, englishWord: 1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(contentTotal / limit) || 1;
    res.render('koshSubCategories', {
      koshCategories: categories,
      parent,
      subcategories,
      selectedSubCategory,
      contents,
      username: req.session.username,
      currentPage: page,
      totalPages,
      subcategoryNav: subcategories,
      contentTotal,
      subcategoryMode: false,
      activePage: null,
      activeCategory: req.params.categoryId,
      searchQuery: searchQuery
    });
  } catch (err) {
    console.error(err);
    res.redirect('/kosh-subcategories');
  }
});

module.exports = router; 