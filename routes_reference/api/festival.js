const express = require('express');
const router = express.Router();
const Festival = require('../../models/Festival');

// Get all festivals with pagination
router.get('/festivals', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Festival.countDocuments();

        // Get festivals with pagination (sorted by upload sequence)
        const festivals = await Festival.find()
            .sort({ sequence: 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: festivals,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching festivals',
            message: error.message
        });
    }
});

module.exports = router; 