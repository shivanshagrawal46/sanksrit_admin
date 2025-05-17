const express = require('express');
const router = express.Router();
const KoshSubCategory = require('../../models/KoshSubCategory');
const auth = require('../../middleware/auth');

// Get all Kosh Subcategories with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const subcategories = await KoshSubCategory.find()
            .populate('parentCategory', 'name')
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit);

        const total = await KoshSubCategory.countDocuments();

        res.json({
            subcategories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSubcategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get subcategories by parent category with pagination
router.get('/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const subcategories = await KoshSubCategory.find({ parentCategory: req.params.categoryId })
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit);

        const total = await KoshSubCategory.countDocuments({ parentCategory: req.params.categoryId });

        res.json({
            subcategories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSubcategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single Kosh Subcategory
router.get('/:id', async (req, res) => {
    try {
        const subcategory = await KoshSubCategory.findById(req.params.id)
            .populate('parentCategory', 'name');
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.json(subcategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Kosh Subcategory (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const subcategory = new KoshSubCategory({
            name: req.body.name,
            description: req.body.description,
            parentCategory: req.body.parentCategory,
            position: req.body.position,
            isActive: req.body.isActive
        });
        const newSubcategory = await subcategory.save();
        res.status(201).json(newSubcategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a Kosh Subcategory (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const subcategory = await KoshSubCategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        subcategory.name = req.body.name;
        subcategory.description = req.body.description;
        subcategory.parentCategory = req.body.parentCategory;
        subcategory.position = req.body.position;
        subcategory.isActive = req.body.isActive;

        const updatedSubcategory = await subcategory.save();
        res.json(updatedSubcategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a Kosh Subcategory (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const subcategory = await KoshSubCategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        await subcategory.remove();
        res.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 