const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PrashanYantraCategory = require('../models/PrashanYantraCategory');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/prashan-yantra';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Main Prashan Yantra page
router.get('/', async (req, res) => {
    try {
        const categories = await PrashanYantraCategory.find().sort({ position: 1 });
        res.render('prashanYantra/index', {
            categories,
            activePage: 'prashan-yantra'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Category
router.get('/category/add', (req, res) => {
    res.render('prashanYantra/category/add', {
        activePage: 'prashan-yantra',
        activeSection: 'category'
    });
});

router.post('/category/add', upload.single('cover_image'), async (req, res) => {
    try {
        const { name, description, position } = req.body;
        let cover_image = '';
        
        if (req.file) {
            cover_image = '/uploads/prashan-yantra/' + req.file.filename;
        }

        const category = new PrashanYantraCategory({
            name,
            description,
            position,
            cover_image
        });

        await category.save();
        res.redirect('/prashan-yantra');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving category: ' + err.message);
    }
});

// Edit Category
router.get('/category/edit/:id', async (req, res) => {
    try {
        const category = await PrashanYantraCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('prashanYantra/category/edit', {
            category,
            activePage: 'prashan-yantra',
            activeSection: 'category'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/category/edit/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { name, description, position } = req.body;
        const updateData = { name, description, position };
        
        if (req.file) {
            updateData.cover_image = '/uploads/prashan-yantra/' + req.file.filename;
        }

        const category = await PrashanYantraCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/prashan-yantra');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Category
router.post('/category/delete/:id', async (req, res) => {
    try {
        const category = await PrashanYantraCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        await category.deleteOne();
        res.redirect('/prashan-yantra');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 