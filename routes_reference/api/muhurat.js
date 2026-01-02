const express = require('express');
const router = express.Router();
const MuhuratCategory = require('../../models/MuhuratCategory');
const MuhuratContent = require('../../models/MuhuratContent');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await MuhuratCategory.find()
            .select('id categoryName imageUrl -_id')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all content for a specific category
router.get('/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Find category by id or _id
        let category;
        if (categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId
            category = await MuhuratCategory.findById(categoryId);
        } else {
            // Numeric id
            category = await MuhuratCategory.findOne({ id: parseInt(categoryId) });
        }
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        const contents = await MuhuratContent.find({ categoryId: category._id })
            .select('id year date detail -_id')
            .sort({ year: -1, date: 1 });
        
        res.json({
            success: true,
            category: {
                id: category.id,
                categoryName: category.categoryName,
                imageUrl: category.imageUrl
            },
            data: contents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific content by ID (optional endpoint)
router.get('/:categoryId/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        
        // Find content by id or _id
        let content;
        if (contentId.match(/^[0-9a-fA-F]{24}$/)) {
            content = await MuhuratContent.findById(contentId);
        } else {
            content = await MuhuratContent.findOne({ id: parseInt(contentId) });
        }
        
        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: content.id,
                year: content.year,
                date: content.date,
                detail: content.detail
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

