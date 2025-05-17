const express = require('express');
const router = express.Router();
const AboutUs = require('../../models/AboutUs');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/about');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get about us content
router.get('/', async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOne();
        res.json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Create or update about us content
router.post('/', upload.fields([
    { name: 'screen_cover_image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), async (req, res) => {
    try {
        const {
            about_app,
            inspiration,
            objective,
            work_ethics,
            address
        } = req.body;

        if (!about_app || !inspiration || !objective || !work_ethics || !address) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const updateData = {
            about_app,
            inspiration,
            objective,
            work_ethics,
            address
        };

        // Handle cover image
        if (req.files && req.files.screen_cover_image) {
            updateData.screen_cover_image = `/uploads/about/${req.files.screen_cover_image[0].filename}`;
        }

        // Handle gallery images
        if (req.files && req.files.images) {
            updateData.images = req.files.images.map(file => `/uploads/about/${file.filename}`);
        }

        // Find existing content or create new
        let aboutUs = await AboutUs.findOne();
        if (aboutUs) {
            aboutUs = await AboutUs.findByIdAndUpdate(
                aboutUs._id,
                updateData,
                { new: true, runValidators: true }
            );
        } else {
            aboutUs = await AboutUs.create(updateData);
        }

        res.json({
            success: true,
            data: aboutUs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Delete about us content
router.delete('/', async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOneAndDelete();
        
        if (!aboutUs) {
            return res.status(404).json({
                success: false,
                error: 'About Us content not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

module.exports = router; 