const express = require('express');
const router = express.Router();
const DivineQuote = require('../models/DivineQuote');

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

// List all quotes
router.get('/', requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const quotes = await DivineQuote.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DivineQuote.countDocuments();
        const totalPages = Math.ceil(total / parseInt(limit));

        res.render('divineQuote/index', {
            username: req.session.username,
            activePage: 'divine-quotes',
            quotes,
            currentPage: parseInt(page),
            totalPages,
            total
        });
    } catch (error) {
        res.render('divineQuote/index', {
            username: req.session.username,
            activePage: 'divine-quotes',
            quotes: [],
            currentPage: 1,
            totalPages: 1,
            total: 0,
            error: 'Error loading quotes'
        });
    }
});

// Add quote form
router.get('/add', requireAuth, (req, res) => {
    res.render('divineQuote/add', {
        username: req.session.username,
        activePage: 'divine-quotes'
    });
});

// Create quote
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { quote, meaning } = req.body;
        
        if (!quote || !meaning) {
            req.flash('error', 'Both quote and meaning are required');
            return res.redirect('/divine-quotes/add');
        }

        await DivineQuote.create({ quote, meaning });
        req.flash('success', 'Quote added successfully');
        res.redirect('/divine-quotes');
    } catch (error) {
        req.flash('error', 'Error creating quote: ' + error.message);
        res.redirect('/divine-quotes/add');
    }
});

// Edit quote form
router.get('/edit/:id', requireAuth, async (req, res) => {
    try {
        const quote = await DivineQuote.findById(req.params.id);
        if (!quote) {
            req.flash('error', 'Quote not found');
            return res.redirect('/divine-quotes');
        }
        res.render('divineQuote/edit', {
            username: req.session.username,
            activePage: 'divine-quotes',
            quote
        });
    } catch (error) {
        req.flash('error', 'Error loading quote');
        res.redirect('/divine-quotes');
    }
});

// Update quote
router.post('/edit/:id', requireAuth, async (req, res) => {
    try {
        const { quote, meaning } = req.body;
        
        if (!quote || !meaning) {
            req.flash('error', 'Both quote and meaning are required');
            return res.redirect(`/divine-quotes/edit/${req.params.id}`);
        }

        const updatedQuote = await DivineQuote.findByIdAndUpdate(
            req.params.id,
            { quote, meaning },
            { new: true }
        );

        if (!updatedQuote) {
            req.flash('error', 'Quote not found');
            return res.redirect('/divine-quotes');
        }

        req.flash('success', 'Quote updated successfully');
        res.redirect('/divine-quotes');
    } catch (error) {
        req.flash('error', 'Error updating quote: ' + error.message);
        res.redirect(`/divine-quotes/edit/${req.params.id}`);
    }
});

// Delete quote
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const quote = await DivineQuote.findByIdAndDelete(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting quote: ' + error.message
        });
    }
});

module.exports = router;

