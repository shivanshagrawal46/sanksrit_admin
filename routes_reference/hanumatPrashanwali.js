const express = require('express');
const router = express.Router();
const HanumatPrashanwali = require('../models/HanumatPrashanwali');

// GET: Show the form with 49 fields
router.get('/', async (req, res) => {
    let prashanwali = await HanumatPrashanwali.findOne();
    if (!prashanwali) {
        // Initialize with 49 empty entries if not present
        prashanwali = await HanumatPrashanwali.create({
            entries: Array.from({ length: 49 }, (_, i) => ({ number: i + 1, content: '' }))
        });
    }
    res.render('hanumatPrashanwali/index', {
        entries: prashanwali.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'hanumat-prashanwali'
    });
});

// POST: Save/update all 49 fields
router.post('/', async (req, res) => {
    let prashanwali = await HanumatPrashanwali.findOne();
    if (!prashanwali) {
        prashanwali = new HanumatPrashanwali();
    }
    // Update entries
    for (let i = 1; i <= 49; i++) {
        const content = req.body[`content_${i}`] || '';
        const entry = prashanwali.entries.find(e => e.number === i);
        if (entry) {
            entry.content = content;
        } else {
            prashanwali.entries.push({ number: i, content });
        }
    }
    // Ensure only 49 entries
    prashanwali.entries = prashanwali.entries.slice(0, 49);
    await prashanwali.save();
    req.flash('success', 'Hanumat Prashanwali updated successfully!');
    res.redirect('/hanumat-prashanwali');
});

module.exports = router; 