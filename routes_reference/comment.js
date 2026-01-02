const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

// List all comments
router.get('/', requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const comments = await Comment.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Comment.countDocuments({});
        const totalPages = Math.ceil(total / parseInt(limit));

        res.render('comment/index', {
            username: req.session.username,
            activePage: 'comments',
            comments,
            currentPage: parseInt(page),
            totalPages,
            total
        });
    } catch (error) {
        res.render('comment/index', {
            username: req.session.username,
            activePage: 'comments',
            comments: [],
            currentPage: 1,
            totalPages: 1,
            total: 0,
            error: 'Error loading comments'
        });
    }
});

// Delete comment
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting comment: ' + error.message
        });
    }
});

module.exports = router;

