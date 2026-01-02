const express = require('express');
const router = express.Router();
const AboutTeam = require('../models/AboutTeam');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/team')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// List all team members
router.get('/', async (req, res) => {
    try {
        const teamMembers = await AboutTeam.find().sort({ createdAt: -1 });
        res.render('aboutTeam/list', { 
            teamMembers,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).send('Error fetching team members');
    }
});

// Show form to add new team member
router.get('/add', (req, res) => {
    res.render('aboutTeam/form', { 
        teamMember: null,
        username: req.session.username
    });
});

// Add new team member
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const teamMember = new AboutTeam({
            name: req.body.name,
            designation: req.body.designation,
            details: req.body.details,
            team_name: req.body.team_name,
            image: req.file ? `/uploads/team/${req.file.filename}` : null
        });

        await teamMember.save();
        res.redirect('/about-team');
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).send('Error adding team member');
    }
});

// Show form to edit team member
router.get('/edit/:id', async (req, res) => {
    try {
        const teamMember = await AboutTeam.findById(req.params.id);
        if (!teamMember) {
            return res.status(404).send('Team member not found');
        }
        res.render('aboutTeam/form', { 
            teamMember,
            username: req.session.username
        });
    } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).send('Error fetching team member');
    }
});

// Update team member
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            designation: req.body.designation,
            details: req.body.details,
            team_name: req.body.team_name
        };

        if (req.file) {
            updateData.image = `/uploads/team/${req.file.filename}`;
        }

        await AboutTeam.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/about-team');
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).send('Error updating team member');
    }
});

// Delete team member
router.post('/delete/:id', async (req, res) => {
    try {
        await AboutTeam.findByIdAndDelete(req.params.id);
        res.redirect('/about-team');
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).send('Error deleting team member');
    }
});

module.exports = router; 