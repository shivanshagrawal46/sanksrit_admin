const express = require('express');
const router = express.Router();
const Inspiration = require('../models/Inspiration');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'public/uploads/inspiration';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// List all inspiration members
router.get('/', async (req, res) => {
    try {
        const inspirationMembers = await Inspiration.find().sort({ createdAt: -1 });
        res.render('inspiration/list', { 
            inspirationMembers,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching inspiration members:', error);
        res.status(500).send('Error fetching inspiration members');
    }
});

// Show form to add new inspiration member
router.get('/add', (req, res) => {
    res.render('inspiration/form', { 
        inspirationMember: null,
        username: req.session.username
    });
});

// Add new inspiration member
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const inspirationMember = new Inspiration({
            name: req.body.name,
            designation: req.body.designation,
            details: req.body.details,
            team_name: req.body.team_name,
            image: req.file ? `/uploads/inspiration/${req.file.filename}` : null
        });

        await inspirationMember.save();
        res.redirect('/inspiration');
    } catch (error) {
        console.error('Error adding inspiration member:', error);
        res.status(500).send('Error adding inspiration member');
    }
});

// Show form to edit inspiration member
router.get('/edit/:id', async (req, res) => {
    try {
        const inspirationMember = await Inspiration.findById(req.params.id);
        if (!inspirationMember) {
            return res.status(404).send('Inspiration member not found');
        }
        res.render('inspiration/form', { 
            inspirationMember,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching inspiration member:', error);
        res.status(500).send('Error fetching inspiration member');
    }
});

// Update inspiration member
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            designation: req.body.designation,
            details: req.body.details,
            team_name: req.body.team_name
        };

        if (req.file) {
            updateData.image = `/uploads/inspiration/${req.file.filename}`;
        }

        await Inspiration.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/inspiration');
    } catch (error) {
        console.error('Error updating inspiration member:', error);
        res.status(500).send('Error updating inspiration member');
    }
});

// Delete inspiration member
router.post('/delete/:id', async (req, res) => {
    try {
        await Inspiration.findByIdAndDelete(req.params.id);
        res.redirect('/inspiration');
    } catch (error) {
        console.error('Error deleting inspiration member:', error);
        res.status(500).send('Error deleting inspiration member');
    }
});

module.exports = router;
