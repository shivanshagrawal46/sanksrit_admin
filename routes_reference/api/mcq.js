const express = require('express');
const router = express.Router();
const McqCategory = require('../../models/McqCategory');
const McqMaster = require('../../models/McqMaster');
const McqContent = require('../../models/McqContent');

// Get all MCQ categories
router.get('/categories', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            McqCategory.find()
                .sort({ position: 1 })
                .select('id name description position')
                .skip(skip)
                .limit(limit),
            McqCategory.countDocuments()
        ]);

        res.json({
            categories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// Get masters for a specific category by id
router.get('/categories/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const category = await McqCategory.findOne({ id: parseInt(req.params.categoryId) });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const [masters, total] = await Promise.all([
            McqMaster.find({ category: category._id })
                .sort({ position: 1 })
                .select('id name description position')
                .skip(skip)
                .limit(limit),
            McqMaster.countDocuments({ category: category._id })
        ]);
        
        res.json({
            category: {
                id: category.id,
                name: category.name,
                description: category.description
            },
            masters,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching masters for category:', error);
        res.status(500).json({ error: 'Error fetching masters for category' });
    }
});

// Get contents for a specific master in a category
router.get('/categories/:categoryId/:masterId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const category = await McqCategory.findOne({ id: parseInt(req.params.categoryId) });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const master = await McqMaster.findOne({
            id: parseInt(req.params.masterId),
            category: category._id
        });
        if (!master) {
            return res.status(404).json({ error: 'Master not found in this category' });
        }

        const [contents, total] = await Promise.all([
            McqContent.find({ master: master._id })
                .select('question option1 option2 option3 option4 correctAnswers explanation references image isActive createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            McqContent.countDocuments({ master: master._id })
        ]);

        res.json({
            contents,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).json({ error: 'Error fetching contents' });
    }
});

// Search API Endpoints
router.get('/search', async (req, res) => {
    try {
        const { query, type } = req.query;
        let results = [];

        switch (type) {
            case 'category':
                results = await McqCategory.find({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                });
                break;
            case 'master':
                results = await McqMaster.find({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                });
                break;
            case 'content':
                results = await McqContent.find({
                    $or: [
                        { question: { $regex: query, $options: 'i' } },
                        { explanation: { $regex: query, $options: 'i' } }
                    ]
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid search type' });
        }

        res.json(results);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Error performing search' });
    }
});

module.exports = router; 