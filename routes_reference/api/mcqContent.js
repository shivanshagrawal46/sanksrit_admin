const express = require('express');
const router = express.Router();
const McqContent = require('../../models/McqContent');
const auth = require('../../middleware/auth');

// Get all MCQs for a master
router.get('/master/:masterId', async (req, res) => {
    try {
        const contents = await McqContent.find({ master: req.params.masterId })
            .select('question options correctAnswer explanation references image createdAt')
            .sort({ createdAt: -1 });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single MCQ
router.get('/:id', async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id)
            .select('question options correctAnswer explanation references image createdAt');
        if (!content) {
            return res.status(404).json({ message: 'MCQ not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new MCQ (protected route)
router.post('/master/:masterId', auth, async (req, res) => {
    try {
        const content = new McqContent({
            master: req.params.masterId,
            question: req.body.question,
            options: [
                req.body.option1,
                req.body.option2,
                req.body.option3,
                req.body.option4
            ],
            correctAnswer: parseInt(req.body.correctAnswer),
            explanation: req.body.explanation,
            references: req.body.references ? req.body.references.split(',').map(ref => ref.trim()) : [],
            image: req.body.image
        });
        const newContent = await content.save();
        res.status(201).json(newContent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an MCQ (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'MCQ not found' });
        }

        content.question = req.body.question;
        content.options = [
            req.body.option1,
            req.body.option2,
            req.body.option3,
            req.body.option4
        ];
        content.correctAnswer = parseInt(req.body.correctAnswer);
        content.explanation = req.body.explanation;
        content.references = req.body.references ? req.body.references.split(',').map(ref => ref.trim()) : [];
        if (req.body.image) {
            content.image = req.body.image;
        }

        const updatedContent = await content.save();
        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an MCQ (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'MCQ not found' });
        }
        await content.remove();
        res.json({ message: 'MCQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk import MCQs (protected route)
router.post('/master/:masterId/bulk', auth, async (req, res) => {
    try {
        const mcqs = req.body.mcqs.map(mcq => ({
            master: req.params.masterId,
            question: mcq.question,
            options: [mcq.option1, mcq.option2, mcq.option3, mcq.option4],
            correctAnswer: parseInt(mcq.correctAnswer),
            explanation: mcq.explanation,
            references: mcq.references ? mcq.references.split(',').map(ref => ref.trim()) : [],
            image: mcq.image
        }));

        const insertedMcqs = await McqContent.insertMany(mcqs);
        res.status(201).json(insertedMcqs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 