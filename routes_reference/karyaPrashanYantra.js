const express = require('express');
const router = express.Router();
const KaryaPrashanYantra = require('../models/KaryaPrashanYantra');

// GET: Show the form with 9 fields
router.get('/', async (req, res) => {
    let karyaPrashan = await KaryaPrashanYantra.findOne();
    if (!karyaPrashan) {
        karyaPrashan = await KaryaPrashanYantra.create({
            entries: Array.from({ length: 9 }, (_, i) => ({ number: i + 1, content: '' }))
        });
    }
    res.render('karyaPrashanYantra/index', {
        entries: karyaPrashan.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'karya-prashan-yantra'
    });
});

// POST: Save/update all 9 fields
router.post('/', async (req, res) => {
    let karyaPrashan = await KaryaPrashanYantra.findOne();
    if (!karyaPrashan) {
        karyaPrashan = new KaryaPrashanYantra();
    }
    for (let i = 1; i <= 9; i++) {
        const content = req.body[`content_${i}`] || '';
        const entry = karyaPrashan.entries.find(e => e.number === i);
        if (entry) {
            entry.content = content;
        } else {
            karyaPrashan.entries.push({ number: i, content });
        }
    }
    karyaPrashan.entries = karyaPrashan.entries.slice(0, 9);
    await karyaPrashan.save();
    req.flash('success', 'Karya Prashan Yantra updated successfully!');
    res.redirect('/karya-prashan-yantra');
});

module.exports = router; 