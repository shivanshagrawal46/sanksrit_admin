const express = require('express');
const McqCategory = require('../models/McqCategory');
const McqMaster = require('../models/McqMaster');
const router = express.Router();
const KoshCategory = require('../models/KoshCategory');
const McqContent = require('../models/McqContent');

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// List all masters for a category
router.get('/mcq-category/:catId/masters', requireAuth, async (req, res) => {
  try {
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    const parent = await McqCategory.findById(req.params.catId);
    const masters = await McqMaster.find({ category: req.params.catId }).sort({ position: 1 });

    let selectedMaster = null;
    let contents = [];
    if (req.query.master) {
      selectedMaster = await McqMaster.findById(req.query.master);
      if (selectedMaster) {
        contents = await McqContent.find({ master: selectedMaster._id }).sort({ createdAt: -1 });
      }
    }

    res.render('mcqMasters', { 
      mcqCategories,
      koshCategories,
      parent,
      masters,
      selectedMaster,
      contents,
      username: req.session.username,
      masterMode: false,
      activePage: null,
      activeCategory: req.params.catId,
      selectedCategory: null
    });
  } catch (error) {
    console.error('Error fetching MCQ masters:', error);
    res.redirect('/mcq-master');
  }
});

// Add master (GET)
router.get('/mcq-category/:catId/add-master', requireAuth, async (req, res) => {
  const mcqCategories = await McqCategory.find().sort({ position: 1 });
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  const category = await McqCategory.findById(req.params.catId);
  res.render('addMcqMaster', { 
    mcqCategories, 
    koshCategories,
    category, 
    error: null,
    username: req.session.username,
    activePage: null,
    activeCategory: req.params.catId,
    masterMode: false
  });
});

// Add master (POST)
router.post('/mcq-category/:catId/add-master', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  try {
    await McqMaster.create({ category: req.params.catId, name, position, introduction });
    res.redirect(`/mcq-master?category=${req.params.catId}`);
  } catch (err) {
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    const category = await McqCategory.findById(req.params.catId);
    res.render('addMcqMaster', { 
      mcqCategories,
      koshCategories, 
      category, 
      error: 'All fields required.',
      username: req.session.username,
      activePage: null,
      activeCategory: req.params.catId,
      masterMode: false
    });
  }
});

// Edit master (GET)
router.get('/mcq-master/:id/edit', requireAuth, async (req, res) => {
  const master = await McqMaster.findById(req.params.id);
  const mcqCategories = await McqCategory.find().sort({ position: 1 });
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  const category = await McqCategory.findById(master.category);
  res.render('editMcqMaster', { 
    mcqCategories, 
    koshCategories,
    master, 
    category, 
    error: null,
    username: req.session.username,
    activePage: null,
    activeCategory: master.category,
    masterMode: false
  });
});

// Edit master (POST)
router.post('/mcq-master/:id/edit', requireAuth, async (req, res) => {
  const { name, position, introduction } = req.body;
  const master = await McqMaster.findById(req.params.id);
  try {
    await McqMaster.findByIdAndUpdate(req.params.id, { name, position, introduction });
    res.redirect(`/mcq-master?category=${master.category}`);
  } catch (err) {
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    const category = await McqCategory.findById(master.category);
    res.render('editMcqMaster', { 
      mcqCategories, 
      koshCategories,
      master, 
      category, 
      error: 'Error updating master.',
      username: req.session.username,
      activePage: null,
      activeCategory: master.category,
      masterMode: false
    });
  }
});

// Delete master
router.post('/mcq-master/:id/delete', requireAuth, async (req, res) => {
  const master = await McqMaster.findById(req.params.id);
  await McqMaster.findByIdAndDelete(req.params.id);
  res.redirect(`/mcq-master?category=${master.category}`);
});

// MCQ Masters main page (master management)
router.get('/mcq-master', requireAuth, async (req, res) => {
  try {
    const mcqCategories = await McqCategory.find().sort({ position: 1 });
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    
    if (!mcqCategories.length) {
      return res.render('mcqMasters', {
        mcqCategories,
        koshCategories,
        parent: null,
        masters: [],
        selectedCategory: null,
        username: req.session.username,
        masterMode: true,
        activePage: 'mcq-master',
        activeCategory: null
      });
    }

    // Determine selected category
    let selectedCategoryId = req.query.category || mcqCategories[0]._id.toString();
    const selectedCategory = mcqCategories.find(cat => cat._id.toString() === selectedCategoryId) || mcqCategories[0];
    
    // Get masters for selected category
    const masters = await McqMaster.find({ category: selectedCategory._id }).sort({ position: 1 });
    
    res.render('mcqMasters', {
      mcqCategories,
      koshCategories,
      parent: null,
      masters,
      selectedCategory,
      username: req.session.username,
      masterMode: true,
      activePage: 'mcq-master',
      activeCategory: null
    });
  } catch (error) {
    console.error('Error fetching MCQ masters:', error);
    res.redirect('/dashboard');
  }
});

module.exports = router; 