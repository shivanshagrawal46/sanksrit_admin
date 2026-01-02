const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const GranthCategory = require('../../models/GranthCategory');
const GranthName = require('../../models/GranthName');
const GranthChapter = require('../../models/GranthChapter');
const GranthContent = require('../../models/GranthContent');

// Get all categories
router.get('/category', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const categories = await GranthCategory.find()
            .select('id name cover_image')
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit);

        const total = await GranthCategory.countDocuments();

        res.json({
            success: true,
            data: categories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Get books by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await GranthCategory.findOne({ id: req.params.categoryId });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const books = await GranthName.find({ category: category._id })
            .select('id name book_image')
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit);

        const total = await GranthName.countDocuments({ category: category._id });

        res.json({
            success: true,
            data: books,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching books',
            error: error.message
        });
    }
});

// Get chapters by book
router.get('/category/:categoryId/:nameId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await GranthCategory.findOne({ id: req.params.categoryId });
        const book = await GranthName.findOne({ id: req.params.nameId });

        if (!category || !book) {
            return res.status(404).json({
                success: false,
                message: 'Category or book not found'
            });
        }

        const chapters = await GranthChapter.find({
            category: category._id,
            book: book._id
        })
        .select('id name')
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit);

        const total = await GranthChapter.countDocuments({
            category: category._id,
            book: book._id
        });

        res.json({
            success: true,
            data: chapters,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chapters',
            error: error.message
        });
    }
});

// Get content by chapter
router.get('/category/:categoryId/:nameId/:chapterId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await GranthCategory.findOne({ id: req.params.categoryId });
        const book = await GranthName.findOne({ id: req.params.nameId });
        const chapter = await GranthChapter.findOne({ id: req.params.chapterId });

        if (!category || !book || !chapter) {
            return res.status(404).json({
                success: false,
                message: 'Category, book, or chapter not found'
            });
        }

        const content = await GranthContent.find({
            category: category._id,
            book: book._id,
            chapter: chapter._id
        })
        .select('id title_hn title_en title_hinglish meaning details extra images video_links')
        .sort({ sequence: 1 })
        .skip(skip)
        .limit(limit);

        const total = await GranthContent.countDocuments({
            category: category._id,
            book: book._id,
            chapter: chapter._id
        });

        res.json({
            success: true,
            data: content,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

// Get specific content by ID within a chapter
router.get('/category/:categoryId/:nameId/:chapterId/:contentId', async (req, res) => {
    try {
        const category = await GranthCategory.findOne({ id: req.params.categoryId });
        const book = await GranthName.findOne({ id: req.params.nameId });
        const chapter = await GranthChapter.findOne({ id: req.params.chapterId });

        if (!category || !book || !chapter) {
            return res.status(404).json({
                success: false,
                message: 'Category, book, or chapter not found'
            });
        }

        const contentFilters = [{ id: req.params.contentId }];
        const numericContentId = parseInt(req.params.contentId, 10);
        if (!Number.isNaN(numericContentId)) {
            contentFilters.push({ id: numericContentId });
        }
        if (mongoose.Types.ObjectId.isValid(req.params.contentId)) {
            contentFilters.push({ _id: req.params.contentId });
        }

        const content = await GranthContent.findOne({
            category: category._id,
            book: book._id,
            chapter: chapter._id,
            $or: contentFilters
        })
        .select('id title_hn title_en title_hinglish meaning details extra images video_links');

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

module.exports = router; 