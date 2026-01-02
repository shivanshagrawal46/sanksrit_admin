const express = require('express');
const router = express.Router();
const SavedKundli = require('../models/SavedKundli');
const requireAuth = require('../middleware/requireAuth');

// Apply authentication middleware to all routes
router.use(requireAuth);

// List all saved kundlis
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, search } = req.query;

    const query = {};

    // Filter by userId if provided
    if (userId) {
      query.userId = userId;
    }

    // Search by name or place
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const savedKundlis = await SavedKundli.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SavedKundli.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get statistics
    const stats = await SavedKundli.aggregate([
      {
        $group: {
          _id: null,
          totalKundlis: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    const genderStats = await SavedKundli.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    res.render('savedKundli/index', {
      savedKundlis,
      currentPage: parseInt(page),
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      userId,
      search,
      stats: stats[0] || { totalKundlis: 0, uniqueUsers: [] },
      genderStats: genderStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      username: req.session.username,
      activePage: 'saved-kundli',
      activeCategory: null,
      koshCategories: res.locals.koshCategories || [],
      koshSubCategoriesMap: res.locals.koshSubCategoriesMap || {}
    });

  } catch (error) {
    console.error('Error fetching saved kundlis:', error);
    req.flash('error', 'Error fetching saved kundlis');
    res.redirect('/dashboard');
  }
});

// View saved kundli details
router.get('/:id', async (req, res) => {
  try {
    const savedKundli = await SavedKundli.findById(req.params.id);

    if (!savedKundli) {
      req.flash('error', 'Saved kundli not found');
      return res.redirect('/saved-kundli');
    }

    res.render('savedKundli/view', {
      savedKundli,
      username: req.session.username,
      activePage: 'saved-kundli',
      activeCategory: null,
      koshCategories: res.locals.koshCategories || [],
      koshSubCategoriesMap: res.locals.koshSubCategoriesMap || {}
    });

  } catch (error) {
    console.error('Error fetching saved kundli:', error);
    req.flash('error', 'Error fetching saved kundli details');
    res.redirect('/saved-kundli');
  }
});

// Delete saved kundli
router.delete('/:id', async (req, res) => {
  try {
    const savedKundli = await SavedKundli.findByIdAndDelete(req.params.id);

    if (!savedKundli) {
      req.flash('error', 'Saved kundli not found');
      return res.redirect('/saved-kundli');
    }

    req.flash('success', 'Saved kundli deleted successfully');
    res.redirect('/saved-kundli');

  } catch (error) {
    console.error('Error deleting saved kundli:', error);
    req.flash('error', 'Error deleting saved kundli');
    res.redirect('/saved-kundli');
  }
});

module.exports = router;

