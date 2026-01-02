const express = require('express');
const router = express.Router();
const AnkPrashan = require('../models/AnkPrashan');

// GET: Show the form with 64 fields
router.get('/', async (req, res) => {
    let ankPrashan = await AnkPrashan.findOne();
    if (!ankPrashan) {
        ankPrashan = await AnkPrashan.create({
            entries: Array.from({ length: 64 }, (_, i) => ({ number: i + 1, content: '' }))
        });
    }
    res.render('ankPrashan/index', {
        entries: ankPrashan.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'ank-prashan'
    });
});

// POST: Save/update all 64 fields
router.post('/', async (req, res) => {
    let ankPrashan = await AnkPrashan.findOne();
    if (!ankPrashan) {
        ankPrashan = new AnkPrashan();
    }
    for (let i = 1; i <= 64; i++) {
        const content = req.body[`content_${i}`] || '';
        const entry = ankPrashan.entries.find(e => e.number === i);
        if (entry) {
            entry.content = content;
        } else {
            ankPrashan.entries.push({ number: i, content });
        }
    }
    ankPrashan.entries = ankPrashan.entries.slice(0, 64);
    await ankPrashan.save();
    req.flash('success', 'Ank Prashan updated successfully!');
    res.redirect('/ank-prashan');
});

module.exports = router; 