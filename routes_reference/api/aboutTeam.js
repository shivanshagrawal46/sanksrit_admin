const express = require('express');
const router = express.Router();
const AboutTeam = require('../../models/AboutTeam');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/team');
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

// Get all team members
router.get('/', async (req, res) => {
    try {
        const teamMembers = await AboutTeam.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: teamMembers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Get single team member
router.get('/:id', async (req, res) => {
    try {
        const teamMember = await AboutTeam.findById(req.params.id);
        if (!teamMember) {
            return res.status(404).json({
                success: false,
                error: 'Team member not found'
            });
        }
        res.json({
            success: true,
            data: teamMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Create team member
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, designation, team_name, details } = req.body;
        
        if (!name || !designation || !team_name || !details) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const teamMember = await AboutTeam.create({
            name,
            designation,
            team_name,
            details,
            image: req.file ? `/uploads/team/${req.file.filename}` : null
        });

        res.status(201).json({
            success: true,
            data: teamMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Update team member
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
            updateData.image = `/uploads/team/${req.file.filename}`;
        }

        const teamMember = await AboutTeam.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!teamMember) {
            return res.status(404).json({
                success: false,
                error: 'Team member not found'
            });
        }

        res.json({
            success: true,
            data: teamMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Delete team member
router.delete('/:id', async (req, res) => {
    try {
        const teamMember = await AboutTeam.findByIdAndDelete(req.params.id);
        
        if (!teamMember) {
            return res.status(404).json({
                success: false,
                error: 'Team member not found'
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