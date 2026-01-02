const express = require('express');
const router = express.Router();
const TwentyPrashanYantra = require('../models/TwentyPrashanYantra');

// GET: Show the form with 20 fields
router.get('/', async (req, res) => {
    let twentyPrashan = await TwentyPrashanYantra.findOne();
    if (!twentyPrashan) {
        twentyPrashan = await TwentyPrashanYantra.create({
            entries: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, content: '' }))
        });
    }
    res.render('twentyPrashanYantra/index', {
        entries: twentyPrashan.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'twenty-prashan-yantra'
    });
});

// POST: Save/update all 20 fields
router.post('/', async (req, res) => {
    let twentyPrashan = await TwentyPrashanYantra.findOne();
    if (!twentyPrashan) {
        twentyPrashan = new TwentyPrashanYantra();
    }
    for (let i = 1; i <= 20; i++) {
        const content = req.body[`content_${i}`] || '';
        const entry = twentyPrashan.entries.find(e => e.number === i);
        if (entry) {
            entry.content = content;
        } else {
            twentyPrashan.entries.push({ number: i, content });
        }
    }
    twentyPrashan.entries = twentyPrashan.entries.slice(0, 20);
    await twentyPrashan.save();
    req.flash('success', '20 Prashan Yantra updated successfully!');
    res.redirect('/twenty-prashan-yantra');
});

module.exports = router; 