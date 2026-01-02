const express = require('express');
const router = express.Router();
const McqMaster = require('../../models/McqMaster');
const auth = require('../../middleware/auth');

// Get all MCQ Masters with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const masters = await McqMaster.find()
            .select('-category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await McqMaster.countDocuments();

        res.json({
            masters,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMasters: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get MCQ Masters by category with pagination
router.get('/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const masters = await McqMaster.find({ category: req.params.categoryId })
            .select('-category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await McqMaster.countDocuments({ category: req.params.categoryId });

        res.json({
            masters,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMasters: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single MCQ Master
router.get('/:id', async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.id)
            .select('-category');
        if (!master) {
            return res.status(404).json({ message: 'MCQ Master not found' });
        }
        res.json(master);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new MCQ Master (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const master = new McqMaster({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            isActive: req.body.isActive
        });
        const newMaster = await master.save();
        res.status(201).json(newMaster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an MCQ Master (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.id);
        if (!master) {
            return res.status(404).json({ message: 'MCQ Master not found' });
        }

        master.title = req.body.title;
        master.description = req.body.description;
        master.category = req.body.category;
        master.isActive = req.body.isActive;

        const updatedMaster = await master.save();
        res.json(updatedMaster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an MCQ Master (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.id);
        if (!master) {
            return res.status(404).json({ message: 'MCQ Master not found' });
        }
        await master.remove();
        res.json({ message: 'MCQ Master deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 