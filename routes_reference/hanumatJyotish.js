const express = require('express');
const router = express.Router();
const HanumatJyotishQuestion = require('../models/HanumatJyotishQuestion');
const HanumatJyotishResponse = require('../models/HanumatJyotishResponse');

// List all questions
router.get('/questions', async (req, res) => {
    try {
        const questions = await HanumatJyotishQuestion.find().sort({ position: 1 });
        res.render('hanumatJyotish/questions/index', {
            questions,
            activePage: 'prashan-yantra',
            activeCategory: 'hanumat-jyotish'
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching questions');
        res.redirect('/prashan-yantra');
    }
});

// List all responses
router.get('/responses', async (req, res) => {
    try {
        const questions = await HanumatJyotishQuestion.find().sort({ position: 1 });
        const responses = await HanumatJyotishResponse.find().populate('question');
        res.render('hanumatJyotish/responses/list', {
            questions,
            responses,
            activePage: 'prashan-yantra',
            activeCategory: 'hanumat-jyotish'
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching responses');
        res.redirect('/hanumat-jyotish/questions');
    }
});

// Add question form
router.get('/questions/add', (req, res) => {
    res.render('hanumatJyotish/questions/add', {
        activePage: 'prashan-yantra',
        activeCategory: 'hanumat-jyotish'
    });
});

// Add question
router.post('/questions/add', async (req, res) => {
    try {
        const { question, description, position } = req.body;
        await HanumatJyotishQuestion.create({ question, description, position });
        req.flash('success', 'Question added successfully');
        res.redirect('/hanumat-jyotish/questions');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error adding question');
        res.redirect('/hanumat-jyotish/questions/add');
    }
});

// Edit question form
router.get('/questions/edit/:id', async (req, res) => {
    try {
        const question = await HanumatJyotishQuestion.findById(req.params.id);
        res.render('hanumatJyotish/questions/edit', {
            question,
            activePage: 'prashan-yantra',
            activeCategory: 'hanumat-jyotish'
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching question');
        res.redirect('/hanumat-jyotish/questions');
    }
});

// Update question
router.post('/questions/edit/:id', async (req, res) => {
    try {
        const { question, description, position } = req.body;
        await HanumatJyotishQuestion.findByIdAndUpdate(req.params.id, {
            question,
            description,
            position
        });
        req.flash('success', 'Question updated successfully');
        res.redirect('/hanumat-jyotish/questions');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error updating question');
        res.redirect('/hanumat-jyotish/questions');
    }
});

// Delete question
router.post('/questions/delete/:id', async (req, res) => {
    try {
        await HanumatJyotishQuestion.findByIdAndDelete(req.params.id);
        await HanumatJyotishResponse.deleteMany({ question: req.params.id });
        req.flash('success', 'Question deleted successfully');
        res.redirect('/hanumat-jyotish/questions');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting question');
        res.redirect('/hanumat-jyotish/questions');
    }
});

// List responses for a question
router.get('/responses/:questionId', async (req, res) => {
    try {
        const question = await HanumatJyotishQuestion.findById(req.params.questionId);
        const response = await HanumatJyotishResponse.findOne({ question: req.params.questionId });
        res.render('hanumatJyotish/responses/index', {
            question,
            response,
            activePage: 'prashan-yantra',
            activeCategory: 'hanumat-jyotish'
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching responses');
        res.redirect('/hanumat-jyotish/questions');
    }
});

// Add/Update responses
router.post('/responses/:questionId', async (req, res) => {
    try {
        const responses = [];
        for (let i = 1; i <= 10; i++) {
            if (req.body[`response_${i}`]) {
                responses.push({
                    field_number: i,
                    content: req.body[`response_${i}`]
                });
            }
        }

        await HanumatJyotishResponse.findOneAndUpdate(
            { question: req.params.questionId },
            { question: req.params.questionId, responses },
            { upsert: true, new: true }
        );

        req.flash('success', 'Responses saved successfully');
        res.redirect(`/hanumat-jyotish/responses/${req.params.questionId}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error saving responses');
        res.redirect(`/hanumat-jyotish/responses/${req.params.questionId}`);
    }
});

module.exports = router; 