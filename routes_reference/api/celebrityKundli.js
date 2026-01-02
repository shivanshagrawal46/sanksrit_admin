const express = require('express');
const router = express.Router();
const CelebrityKundli = require('../../models/CelebrityKundli');
const CelebrityKundliCategory = require('../../models/CelebrityKundliCategory');

// Get all categories
router.get('/celebrity-kundli', async (req, res) => {
    try {
        const categories = await CelebrityKundliCategory.find()
            .select('id name -_id')
            .sort({ name: 1 });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error fetching categories'
        });
    }
});

// Get kundlis by category ID with pagination
router.get('/celebrity-kundli/:categoryId', async (req, res) => {
    try {
        const category = await CelebrityKundliCategory.findOne({ id: req.params.categoryId });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await CelebrityKundli.countDocuments({ category: category._id });
        const totalPages = Math.ceil(total / limit);

        // Get paginated kundlis
        const kundlis = await CelebrityKundli.find({ category: category._id })
            .select('name dob time place about -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: kundlis,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error fetching kundlis'
        });
    }
});

module.exports = router; 