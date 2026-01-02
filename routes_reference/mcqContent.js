const express = require('express');
const router = express.Router();
const McqContent = require('../models/McqContent');
const McqMaster = require('../models/McqMaster');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine destination based on file type
        const dest = file.mimetype.startsWith('image/') ? 'public/uploads/mcq' : 'public/uploads/excel';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Create separate upload configurations for images and Excel files
const uploadImage = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

const uploadExcel = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Please upload an Excel file (.xlsx or .xls)'), false);
        }
    }
});

// List MCQ Content for a master
router.get('/master/:masterId', async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.masterId);
        const contents = await McqContent.find({ master: req.params.masterId })
            .sort({ createdAt: -1 });
        res.render('mcqContents', { master, contents });
    } catch (error) {
        req.flash('error', 'Error loading MCQ contents');
        res.redirect('/mcq-categories');
    }
});

// Show form to add new MCQ Content
router.get('/master/:masterId/add', async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.masterId);
        res.render('mcqContentForm', { 
            master, 
            content: null,
            username: req.session ? req.session.username : null,
            error: null
        });
    } catch (error) {
        req.flash('error', 'Error loading form');
        res.redirect('/mcq-categories');
    }
});

// Create new MCQ Content
router.post('/master/:masterId', uploadImage.single('image'), async (req, res) => {
    try {
        // Handle correctAnswers - convert to array if it's a single value
        let correctAnswers = [];
        if (req.body.correctAnswers) {
            correctAnswers = Array.isArray(req.body.correctAnswers) 
                ? req.body.correctAnswers.map(Number)
                : [Number(req.body.correctAnswers)];
        }

        const content = new McqContent({
            master: req.params.masterId,
            question: req.body.question,
            option1: req.body.option1,
            option2: req.body.option2,
            option3: req.body.option3,
            option4: req.body.option4,
            correctAnswers: correctAnswers,
            explanation: req.body.explanation,
            references: req.body.references ? req.body.references.split(',').map(ref => ref.trim()) : [],
            image: req.file ? `/uploads/mcq/${req.file.filename}` : undefined
        });
        
        await content.save();
        
        // Get the category ID from the master
        const master = await McqMaster.findById(req.params.masterId);
        if (!master) {
            throw new Error('Master not found');
        }
        
        // Redirect to the MCQ content list page with the correct category and master
        res.redirect(`/mcq-content/${master.category}?master=${req.params.masterId}`);
    } catch (error) {
        console.error('Error adding MCQ content:', error);
        res.redirect(`/mcq-content/master/${req.params.masterId}/add`);
    }
});

// Show form to edit MCQ Content
router.get('/:id/edit', async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id);
        const master = await McqMaster.findById(content.master);
        res.render('mcqContentForm', { 
            master, 
            content,
            username: req.session ? req.session.username : null,
            error: null
        });
    } catch (error) {
        console.error('Error loading edit form:', error);
        res.redirect('/mcq-categories');
    }
});

// Update MCQ Content
router.post('/:id', uploadImage.single('image'), async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id);
        if (!content) {
            throw new Error('MCQ content not found');
        }

        // Get the master to access category ID
        const master = await McqMaster.findById(content.master);
        if (!master) {
            throw new Error('Master not found');
        }

        // Handle correctAnswers - convert to array if it's a single value
        let correctAnswers = [];
        if (req.body.correctAnswers) {
            correctAnswers = Array.isArray(req.body.correctAnswers) 
                ? req.body.correctAnswers.map(Number)
                : [Number(req.body.correctAnswers)];
        }

        content.question = req.body.question;
        content.option1 = req.body.option1;
        content.option2 = req.body.option2;
        content.option3 = req.body.option3;
        content.option4 = req.body.option4;
        content.correctAnswers = correctAnswers;
        content.explanation = req.body.explanation;
        content.references = req.body.references ? req.body.references.split(',').map(ref => ref.trim()) : [];
        
        if (req.file) {
            content.image = `/uploads/mcq/${req.file.filename}`;
        }

        await content.save();

        // Redirect to the MCQ content list page with category and master IDs
        res.redirect(`/mcq-content/${master.category}?master=${content.master}`);
    } catch (error) {
        console.error('Error updating MCQ content:', error);
        // If there's an error, try to redirect to the edit page
        const content = await McqContent.findById(req.params.id);
        if (content) {
            res.redirect(`/mcq-content/${req.params.id}/edit`);
        } else {
            res.redirect('/mcq-categories');
        }
    }
});

// Delete MCQ Content
router.post('/:id/delete', async (req, res) => {
    try {
        const content = await McqContent.findById(req.params.id);
        if (!content) {
            throw new Error('MCQ content not found');
        }

        // Get the master to access category ID
        const master = await McqMaster.findById(content.master);
        if (!master) {
            throw new Error('Master not found');
        }

        // Delete the content
        await McqContent.findByIdAndDelete(req.params.id);

        // Redirect to the MCQ content list page with category and master IDs
        res.redirect(`/mcq-content/${master.category}?master=${content.master}`);
    } catch (error) {
        console.error('Error deleting MCQ content:', error);
        // If there's an error, still try to redirect to the list page
        const content = await McqContent.findById(req.params.id);
        if (content) {
            const master = await McqMaster.findById(content.master);
            if (master) {
                res.redirect(`/mcq-content/${master.category}?master=${content.master}`);
            } else {
                res.redirect('/mcq-categories');
            }
        } else {
            res.redirect('/mcq-categories');
        }
    }
});

// Import MCQ Content from Excel
router.get('/master/:masterId/import', async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.masterId);
        res.render('mcqImportForm', { 
            master,
            username: req.session ? req.session.username : null
        });
    } catch (error) {
        console.error('Error loading import form:', error);
        res.redirect('/mcq-categories');
    }
});

// Export Excel for MCQ content
router.get('/master/:masterId/export-excel', async (req, res) => {
    try {
        const master = await McqMaster.findById(req.params.masterId);
        if (!master) {
            return res.status(404).send('Master not found');
        }

        const contents = await McqContent.find({ master: req.params.masterId }).sort({ createdAt: -1 });

        const dataToExport = contents.map(entry => ({
            question: entry.question || '',
            option1: entry.option1 || '',
            option2: entry.option2 || '',
            option3: entry.option3 || '',
            option4: entry.option4 || '',
            correctAnswers: Array.isArray(entry.correctAnswers) ? entry.correctAnswers.join(',') : '',
            explanation: entry.explanation || '',
            references: Array.isArray(entry.references) ? entry.references.join(',') : ''
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'MCQ Content');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="mcq_${master.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting MCQ Excel:', error);
        res.status(500).send('Error exporting Excel file');
    }
});

router.post('/master/:masterId/import', uploadExcel.single('excel'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const row of data) {
            // Handle correctAnswers - parse comma-separated string into array of numbers
            let correctAnswers = [];
            if (row.correctAnswers) {
                // Handle both string and array inputs
                const answers = typeof row.correctAnswers === 'string' 
                    ? row.correctAnswers.split(',').map(a => a.trim())
                    : Array.isArray(row.correctAnswers) 
                        ? row.correctAnswers 
                        : [row.correctAnswers];
                
                // Convert to numbers and filter out any invalid values
                correctAnswers = answers
                    .map(a => parseInt(a, 10))
                    .filter(a => !isNaN(a) && a >= 1 && a <= 4);
            }

            const content = new McqContent({
                master: req.params.masterId,
                question: row.question,
                option1: row.option1,
                option2: row.option2,
                option3: row.option3,
                option4: row.option4,
                correctAnswers: correctAnswers,
                explanation: row.explanation,
                references: row.references ? row.references.split(',').map(ref => ref.trim()) : []
            });

            await content.save();
        }

        // Get the category ID from the master
        const master = await McqMaster.findById(req.params.masterId);
        if (!master) {
            throw new Error('Master not found');
        }

        // Redirect to the MCQ content list page
        res.redirect(`/mcq-content/${master.category}?master=${req.params.masterId}`);
    } catch (error) {
        console.error('Error importing MCQ contents:', error);
        res.redirect(`/mcq-content/master/${req.params.masterId}/import`);
    }
});

// Kosh-like MCQ Content Page: Category -> Master Nav -> Content
router.get('/:catId', async (req, res) => {
    try {
        const mcqCategories = await require('../models/McqCategory').find().sort({ position: 1 });
        const category = await require('../models/McqCategory').findById(req.params.catId);
        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/mcq-categories');
        }
        const masters = await McqMaster.find({ category: req.params.catId }).sort({ position: 1 });
        let selectedMaster = null;
        if (masters.length > 0) {
            const selectedMasterId = req.query.master || masters[0]._id.toString();
            selectedMaster = masters.find(m => m._id.toString() === selectedMasterId) || masters[0];
        }
        let contents = [];
        let currentPage = parseInt(req.query.page) || 1;
        let totalPages = 1;
        if (selectedMaster) {
            const limit = 10;
            const skip = (currentPage - 1) * limit;
            const total = await McqContent.countDocuments({ master: selectedMaster._id });
            contents = await McqContent.find({ master: selectedMaster._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            totalPages = Math.ceil(total / limit);
        }
        res.render('mcqMastersNav', {
            category,
            masters,
            selectedMaster,
            contents,
            mcqCategories,
            username: req.session ? req.session.username : null,
            currentPage,
            totalPages
        });
    } catch (error) {
        console.error('Error in MCQ master/content page:', error);
        req.flash('error', 'Error loading MCQ masters or contents');
        res.redirect('/mcq-categories');
    }
});

module.exports = router; 