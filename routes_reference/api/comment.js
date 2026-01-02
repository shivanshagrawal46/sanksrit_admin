const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');

// POST - Submit a new comment
router.post('/', async (req, res) => {
    try {
        const { userId, name, mobile, comment } = req.body;

        // Validate required fields
        if (!userId || !name || !mobile || !comment) {
            return res.status(400).json({
                success: false,
                message: 'All fields (userId, name, mobile, comment) are required'
            });
        }

        // Create new comment (saved immediately, no approval needed)
        const newComment = await Comment.create({
            userId,
            name,
            mobile,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Comment submitted successfully',
            data: {
                id: newComment.id,
                userId: newComment.userId,
                name: newComment.name,
                mobile: newComment.mobile,
                comment: newComment.comment,
                createdAt: newComment.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error submitting comment: ' + err.message
        });
    }
});

// GET - Get all comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find({})
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: comments
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching comments: ' + err.message
        });
    }
});

// GET - Get comments by userId
router.get('/user/:userId', async (req, res) => {
    try {
        const comments = await Comment.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: comments
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user comments: ' + err.message
        });
    }
});

module.exports = router;

