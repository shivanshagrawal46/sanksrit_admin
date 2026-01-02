const express = require('express');
const router = express.Router();
const DivineSanskrit = require('../../models/DivineSanskrit');

// GET all quotes with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const total = await DivineSanskrit.countDocuments();

        // Get quotes with pagination
        const quotes = await DivineSanskrit.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('id quote meaning createdAt updatedAt');

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: quotes,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quotes: ' + err.message
        });
    }
});

// GET a single quote by ID
router.get('/:id', async (req, res) => {
    try {
        const quote = await DivineSanskrit.findById(req.params.id)
            .select('id quote meaning createdAt updatedAt');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            data: quote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching quote: ' + err.message
        });
    }
});

module.exports = router;

