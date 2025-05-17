const express = require('express');
const router = express.Router();
const McqCategory = require('../../models/McqCategory');
const auth = require('../../middleware/auth');

// Get all MCQ Categories with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const categories = await McqCategory.find()
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit);

        const total = await McqCategory.countDocuments();

        res.json({
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single MCQ Category
router.get('/:id', async (req, res) => {
    try {
        const category = await McqCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new MCQ Category (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const category = new McqCategory({
            name: req.body.name,
            description: req.body.description,
            position: req.body.position,
            isActive: req.body.isActive
        });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an MCQ Category (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const category = await McqCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = req.body.name;
        category.description = req.body.description;
        category.position = req.body.position;
        category.isActive = req.body.isActive;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an MCQ Category (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await McqCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await category.remove();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 