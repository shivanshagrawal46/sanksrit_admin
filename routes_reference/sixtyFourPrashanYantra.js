const express = require('express');
const router = express.Router();
const SixtyFourPrashanYantra = require('../models/SixtyFourPrashanYantra');

// GET: Show the form with 64 fields
router.get('/', async (req, res) => {
    let sixtyFourPrashan = await SixtyFourPrashanYantra.findOne();
    if (!sixtyFourPrashan) {
        sixtyFourPrashan = await SixtyFourPrashanYantra.create({
            entries: Array.from({ length: 64 }, (_, i) => ({ number: i + 1, content: '' }))
        });
    }
    res.render('sixtyFourPrashanYantra/index', {
        entries: sixtyFourPrashan.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'sixty-four-prashan-yantra'
    });
});

// POST: Save/update all 64 fields
router.post('/', async (req, res) => {
    let sixtyFourPrashan = await SixtyFourPrashanYantra.findOne();
    if (!sixtyFourPrashan) {
        sixtyFourPrashan = new SixtyFourPrashanYantra();
    }
    for (let i = 1; i <= 64; i++) {
        const content = req.body[`content_${i}`] || '';
        const entry = sixtyFourPrashan.entries.find(e => e.number === i);
        if (entry) {
            entry.content = content;
        } else {
            sixtyFourPrashan.entries.push({ number: i, content });
        }
    }
    sixtyFourPrashan.entries = sixtyFourPrashan.entries.slice(0, 64);
    await sixtyFourPrashan.save();
    req.flash('success', '64 Prashan Yantra updated successfully!');
    res.redirect('/sixty-four-prashan-yantra');
});

module.exports = router; 