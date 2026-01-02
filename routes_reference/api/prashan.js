const express = require('express');
const router = express.Router();

const HanumatPrashanwali = require('../../models/HanumatPrashanwali');
const AnkPrashan = require('../../models/AnkPrashan');
const KaryaPrashanYantra = require('../../models/KaryaPrashanYantra');
const TwentyPrashanYantra = require('../../models/TwentyPrashanYantra');
const SixtyFourPrashanYantra = require('../../models/SixtyFourPrashanYantra');
const BeejPrashanYantra = require('../../models/BeejPrashanYantra');
const HanumatJyotishQuestion = require('../../models/HanumatJyotishQuestion');
const HanumatJyotishResponse = require('../../models/HanumatJyotishResponse');

// Hanumat Prashanwali
router.get('/hanumat-prashanwali', async (req, res) => {
    const doc = await HanumatPrashanwali.findOne();
    res.json(doc ? doc.entries : []);
});

// Ank Prashan
router.get('/ank-prashan', async (req, res) => {
    const doc = await AnkPrashan.findOne();
    res.json(doc ? doc.entries : []);
});

// Karya Prashan Yantra
router.get('/karya-prashan-yantra', async (req, res) => {
    const doc = await KaryaPrashanYantra.findOne();
    res.json(doc ? doc.entries : []);
});

// 20 Prashan Yantra
router.get('/twenty-prashan-yantra', async (req, res) => {
    const doc = await TwentyPrashanYantra.findOne();
    res.json(doc ? doc.entries : []);
});

// 64 Prashan Yantra
router.get('/sixty-four-prashan-yantra', async (req, res) => {
    const doc = await SixtyFourPrashanYantra.findOne();
    res.json(doc ? doc.entries : []);
});

// Beej Prashan Yantra
router.get('/beej-prashan-yantra', async (req, res) => {
    const doc = await BeejPrashanYantra.findOne();
    res.json(doc ? doc.entries : []);
});

// Hanumat Jyotish - all questions
router.get('/hanumat-jyotish', async (req, res) => {
    const questions = await HanumatJyotishQuestion.find().sort({ position: 1 });
    res.json(questions.map(q => ({
        id: q._id,
        question: q.question,
        description: q.description,
        position: q.position
    })));
});

// Hanumat Jyotish - responses for a question
router.get('/hanumat-jyotish/:questionId', async (req, res) => {
    const response = await HanumatJyotishResponse.findOne({ question: req.params.questionId });
    res.json(response ? response.responses : []);
});

module.exports = router; 