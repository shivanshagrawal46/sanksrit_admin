const express = require('express');
const router = express.Router();
const BeejPrashanYantra = require('../models/BeejPrashanYantra');

const FIELD_NAMES = [
    'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ',
    'क', 'ख', 'ग', 'घ', 'ङ',
    'च', 'छ', 'ज', 'झ', 'ञ',
    'ट', 'ठ', 'ड', 'ढ', 'ण',
    'त', 'थ', 'द', 'ध', 'न',
    'प', 'फ', 'ब', 'भ', 'म',
    'य', 'र', 'ल', 'व',
    'श', 'ष', 'स', 'ह',
    'क्ष', 'त्र', 'ज्ञ'
];

// GET: Show the form with 47 named fields
router.get('/', async (req, res) => {
    let beej = await BeejPrashanYantra.findOne();
    if (!beej) {
        beej = await BeejPrashanYantra.create({
            entries: FIELD_NAMES.map(name => ({ name, content: '' }))
        });
    }
    // Ensure all fields are present
    FIELD_NAMES.forEach(name => {
        if (!beej.entries.find(e => e.name === name)) {
            beej.entries.push({ name, content: '' });
        }
    });
    // Keep only the 47 fields in order
    beej.entries = FIELD_NAMES.map(name => beej.entries.find(e => e.name === name) || { name, content: '' });
    await beej.save();
    res.render('beejPrashanYantra/index', {
        entries: beej.entries,
        activePage: 'prashan-yantra',
        activeCategory: 'beej-prashan-yantra'
    });
});

// POST: Save/update all 47 fields
router.post('/', async (req, res) => {
    let beej = await BeejPrashanYantra.findOne();
    if (!beej) {
        beej = new BeejPrashanYantra();
    }
    beej.entries = FIELD_NAMES.map(name => ({
        name,
        content: req.body[`content_${name}`] || ''
    }));
    await beej.save();
    req.flash('success', 'Beej Prashan Yantra updated successfully!');
    res.redirect('/beej-prashan-yantra');
});

module.exports = router; 