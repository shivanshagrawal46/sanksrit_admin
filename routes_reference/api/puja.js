const express = require('express');
const router = express.Router();
const Puja = require('../../models/Puja');

// Helper function for pagination
const paginateResults = async (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const total = await Puja.countDocuments(query);
    const results = await Puja.find(query)
        .sort({ puja_date: -1 })
        .skip(skip)
        .limit(limit);

    return {
        results,
        pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        }
    };
};

// Get all poojas with pagination
router.get('/poojas', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { results, pagination } = await paginateResults({}, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get single pooja by ID
router.get('/poojas/:id', async (req, res) => {
    try {
        const pooja = await Puja.findById(req.params.id);
        if (!pooja) {
            return res.status(404).json({
                success: false,
                error: 'Pooja not found'
            });
        }
        res.json({
            success: true,
            data: pooja
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get active poojas
router.get('/poojas/active', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { results, pagination } = await paginateResults({ is_active: true }, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get upcoming poojas
router.get('/poojas/upcoming', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { results, pagination } = await paginateResults({
            puja_date: { $gte: new Date() },
            is_active: true
        }, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Search poojas
router.get('/poojas/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { temple_name: { $regex: query, $options: 'i' } },
                { temple_location: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        const { results, pagination } = await paginateResults(searchQuery, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get poojas by temple
router.get('/poojas/temple/:templeName', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { results, pagination } = await paginateResults({
            temple_name: { $regex: req.params.templeName, $options: 'i' }
        }, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get poojas by date range
router.get('/poojas/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { results, pagination } = await paginateResults({
            puja_date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }, page, limit);
        
        res.json({
            success: true,
            data: results,
            pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

module.exports = router; 