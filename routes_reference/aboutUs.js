const express = require('express');
const router = express.Router();
const AboutUs = require('../models/AboutUs');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/about')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Show About Us content
router.get('/', async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOne();
        res.render('aboutUs/view', { 
            aboutUs,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching about us content:', error);
        res.status(500).send('Error fetching about us content');
    }
});

// Show form to edit About Us content
router.get('/edit', async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOne();
        res.render('aboutUs/form', { 
            aboutUs,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching about us content:', error);
        res.status(500).send('Error fetching about us content');
    }
});

// Update About Us content
router.post('/edit', upload.fields([
    { name: 'screen_cover_image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), async (req, res) => {
    try {
        const updateData = {
            about_app: req.body.about_app,
            inspiration: req.body.inspiration,
            objective: req.body.objective,
            work_ethics: req.body.work_ethics,
            address: req.body.address
        };

        if (req.files['screen_cover_image']) {
            updateData.screen_cover_image = `/uploads/about/${req.files['screen_cover_image'][0].filename}`;
        }

        if (req.files['images']) {
            updateData.images = req.files['images'].map(file => `/uploads/about/${file.filename}`);
        }

        let aboutUs = await AboutUs.findOne();
        if (aboutUs) {
            await AboutUs.findByIdAndUpdate(aboutUs._id, updateData);
        } else {
            aboutUs = new AboutUs(updateData);
            await aboutUs.save();
        }

        res.redirect('/about-us');
    } catch (error) {
        console.error('Error updating about us content:', error);
        res.status(500).send('Error updating about us content');
    }
});

module.exports = router; 