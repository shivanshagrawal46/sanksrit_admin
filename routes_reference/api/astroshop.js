const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const AstroShopCategory = require('../../models/AstroShopCategory');

// Helper function for pagination
const paginateResults = async (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    // Create separate queries for count and results
    const countQuery = Product.find(query.getQuery());
    const resultsQuery = query.clone();
    
    const [total, results] = await Promise.all([
        countQuery.countDocuments(),
        resultsQuery.skip(skip).limit(limit)
    ]);
    
    return {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        results
    };
};

// Get all products
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const query = Product.find()
            .populate('category')
            .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(query, page, limit);
        
        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category');
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get products by category
router.get('/products/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const query = Product.find({ category: req.params.categoryId })
            .populate('category')
            .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(query, page, limit);
        
        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await AstroShopCategory.find()
            .sort({ name: 1 });
        res.json({
            success: true,
            data: categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get products by category ID (returns products in same format as /products)
router.get('/categories/:id', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Check if category exists
        const category = await AstroShopCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        const query = Product.find({ category: req.params.id })
            .populate('category')
            .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(query, page, limit);
        
        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Search products
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const searchQuery = Product.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { short_description: { $regex: query, $options: 'i' } },
                { full_description: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('category')
        .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(searchQuery, page, limit);

        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get active products
router.get('/products/active', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const query = Product.find({ is_active: true })
            .populate('category')
            .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(query, page, limit);
        
        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get products with offers
router.get('/products/offers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const query = Product.find({
            'offers.0': { $exists: true }
        })
        .populate('category')
        .sort({ created_at: -1 });

        const paginatedResults = await paginateResults(query, page, limit);
        
        res.json({
            success: true,
            data: paginatedResults.results,
            pagination: {
                total: paginatedResults.total,
                totalPages: paginatedResults.totalPages,
                currentPage: paginatedResults.currentPage,
                hasNextPage: paginatedResults.hasNextPage,
                hasPrevPage: paginatedResults.hasPrevPage
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router; 