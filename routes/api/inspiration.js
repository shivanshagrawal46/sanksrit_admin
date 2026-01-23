const express = require('express');
const router = express.Router();
const Inspiration = require('../../models/Inspiration');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/inspiration');
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

// Get all inspiration members
router.get('/', async (req, res) => {
    try {
        const inspirationMembers = await Inspiration.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: inspirationMembers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get single inspiration member
router.get('/:id', async (req, res) => {
    try {
        const inspirationMember = await Inspiration.findById(req.params.id);
        if (!inspirationMember) {
            return res.status(404).json({
                success: false,
                error: 'Inspiration member not found'
            });
        }
        res.json({
            success: true,
            data: inspirationMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Create inspiration member
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, designation, team_name, details } = req.body;
        
        if (!name || !designation || !team_name || !details) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const inspirationMember = await Inspiration.create({
            name,
            designation,
            team_name,
            details,
            image: req.file ? `/uploads/inspiration/${req.file.filename}` : null
        });

        res.status(201).json({
            success: true,
            data: inspirationMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Update inspiration member
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, designation, team_name, details } = req.body;
        
        if (!name || !designation || !team_name || !details) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const updateData = {
            name,
            designation,
            team_name,
            details
        };

        if (req.file) {
            updateData.image = `/uploads/inspiration/${req.file.filename}`;
        }

        const inspirationMember = await Inspiration.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!inspirationMember) {
            return res.status(404).json({
                success: false,
                error: 'Inspiration member not found'
            });
        }

        res.json({
            success: true,
            data: inspirationMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Delete inspiration member
router.delete('/:id', async (req, res) => {
    try {
        const inspirationMember = await Inspiration.findByIdAndDelete(req.params.id);
        
        if (!inspirationMember) {
            return res.status(404).json({
                success: false,
                error: 'Inspiration member not found'
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
