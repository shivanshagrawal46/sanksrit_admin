const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const EMagazineCategory = require('../models/EMagazineCategory');
const EMagazineSubject = require('../models/EMagazineSubject');
const EMagazineWriter = require('../models/EMagazineWriter');
const EMagazine = require('../models/EMagazine');

// Multer config for cover image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/emagazine/categories';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Main E-Magazine navigation page
router.get('/', (req, res) => {
    res.render('eMagazine/index', { activePage: 'e-magazine' });
});

// CATEGORY SECTION
// List categories
router.get('/category', async (req, res) => {
    const categories = await EMagazineCategory.find().sort({ position: 1, createdAt: -1 });
    res.render('eMagazine/category/index', {
        categories,
        activePage: 'e-magazine',
        activeTab: 'category'
    });
});

// Add category form
router.get('/category/add', (req, res) => {
    res.render('eMagazine/category/add', {
        activePage: 'e-magazine',
        activeTab: 'category'
    });
});

// Add category POST
router.post('/category/add', upload.single('coverImage'), async (req, res) => {
    try {
        const { name, position, description } = req.body;
        let coverImage = '';
        if (req.file) {
            coverImage = '/uploads/emagazine/categories/' + req.file.filename;
        }
        const category = new EMagazineCategory({
            name,
            position,
            description,
            coverImage
        });
        await category.save();
        res.redirect('/e-magazine/category');
    } catch (err) {
        res.status(500).send('Error saving category: ' + err.message);
    }
});

// Edit category form
router.get('/category/edit/:id', async (req, res) => {
    const category = await EMagazineCategory.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');
    res.render('eMagazine/category/edit', {
        category,
        activePage: 'e-magazine',
        activeTab: 'category'
    });
});

// Edit category POST
router.post('/category/edit/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const { name, position, description } = req.body;
        const updateData = { name, position, description };
        if (req.file) {
            updateData.coverImage = '/uploads/emagazine/categories/' + req.file.filename;
        }
        await EMagazineCategory.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/e-magazine/category');
    } catch (err) {
        res.status(500).send('Error updating category: ' + err.message);
    }
});

// Delete category
router.post('/category/delete/:id', async (req, res) => {
    try {
        await EMagazineCategory.findByIdAndDelete(req.params.id);
        res.redirect('/e-magazine/category');
    } catch (err) {
        res.status(500).send('Error deleting category: ' + err.message);
    }
});

// SUBJECT SECTION
// List subjects
router.get('/subject', async (req, res) => {
    const subjects = await EMagazineSubject.find().sort({ createdAt: -1 });
    res.render('eMagazine/subject/index', {
        subjects,
        activePage: 'e-magazine',
        activeTab: 'subject'
    });
});

// Add subject form
router.get('/subject/add', (req, res) => {
    res.render('eMagazine/subject/add', {
        activePage: 'e-magazine',
        activeTab: 'subject'
    });
});

// Add subject POST
router.post('/subject/add', async (req, res) => {
    try {
        const { name } = req.body;
        const subject = new EMagazineSubject({ name });
        await subject.save();
        res.redirect('/e-magazine/subject');
    } catch (err) {
        res.status(500).send('Error saving subject: ' + err.message);
    }
});

// Edit subject form
router.get('/subject/edit/:id', async (req, res) => {
    const subject = await EMagazineSubject.findById(req.params.id);
    if (!subject) return res.status(404).send('Subject not found');
    res.render('eMagazine/subject/edit', {
        subject,
        activePage: 'e-magazine',
        activeTab: 'subject'
    });
});

// Edit subject POST
router.post('/subject/edit/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await EMagazineSubject.findByIdAndUpdate(req.params.id, { name });
        res.redirect('/e-magazine/subject');
    } catch (err) {
        res.status(500).send('Error updating subject: ' + err.message);
    }
});

// Delete subject
router.post('/subject/delete/:id', async (req, res) => {
    try {
        await EMagazineSubject.findByIdAndDelete(req.params.id);
        res.redirect('/e-magazine/subject');
    } catch (err) {
        res.status(500).send('Error deleting subject: ' + err.message);
    }
});

// WRITER SECTION
// List writers
router.get('/writer', async (req, res) => {
    const writers = await EMagazineWriter.find().sort({ createdAt: -1 });
    res.render('eMagazine/writer/index', {
        writers,
        activePage: 'e-magazine',
        activeTab: 'writer'
    });
});

// Add writer form
router.get('/writer/add', (req, res) => {
    res.render('eMagazine/writer/add', {
        activePage: 'e-magazine',
        activeTab: 'writer'
    });
});

// Add writer POST
router.post('/writer/add', (req, res, next) => {
    const writerUpload = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = 'public/uploads/emagazine/writers';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    const writerMulter = multer({ storage: writerUpload });
    writerMulter.single('image')(req, res, async function (err) {
        if (err) return res.status(500).send('Error uploading image: ' + err.message);
        try {
            const { name, designation, phone } = req.body;
            let image = '';
            if (req.file) {
                image = '/uploads/emagazine/writers/' + req.file.filename;
            }
            const writer = new EMagazineWriter({
                name,
                designation,
                phone,
                image
            });
            await writer.save();
            res.redirect('/e-magazine/writer');
        } catch (err) {
            res.status(500).send('Error saving writer: ' + err.message);
        }
    });
});

// Edit writer form
router.get('/writer/edit/:id', async (req, res) => {
    const writer = await EMagazineWriter.findById(req.params.id);
    if (!writer) return res.status(404).send('Writer not found');
    res.render('eMagazine/writer/edit', {
        writer,
        activePage: 'e-magazine',
        activeTab: 'writer'
    });
});

// Edit writer POST
router.post('/writer/edit/:id', (req, res, next) => {
    const writerUpload = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = 'public/uploads/emagazine/writers';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    const writerMulter = multer({ storage: writerUpload });
    writerMulter.single('image')(req, res, async function (err) {
        if (err) return res.status(500).send('Error uploading image: ' + err.message);
        try {
            const { name, designation, phone } = req.body;
            const updateData = { name, designation, phone };
            if (req.file) {
                updateData.image = '/uploads/emagazine/writers/' + req.file.filename;
            }
            await EMagazineWriter.findByIdAndUpdate(req.params.id, updateData);
            res.redirect('/e-magazine/writer');
        } catch (err) {
            res.status(500).send('Error updating writer: ' + err.message);
        }
    });
});

// Delete writer
router.post('/writer/delete/:id', async (req, res) => {
    try {
        await EMagazineWriter.findByIdAndDelete(req.params.id);
        res.redirect('/e-magazine/writer');
    } catch (err) {
        res.status(500).send('Error deleting writer: ' + err.message);
    }
});

// MAGAZINE SECTION
// List magazines
router.get('/magazine', async (req, res) => {
    const magazines = await EMagazine.find()
        .populate('category')
        .populate('subject')
        .populate('writer')
        .sort({ createdAt: -1 });
    res.render('eMagazine/magazine/index', {
        magazines,
        activePage: 'e-magazine',
        activeTab: 'magazine'
    });
});

// Add magazine form
router.get('/magazine/add', async (req, res) => {
    const categories = await EMagazineCategory.find().sort({ name: 1 });
    const subjects = await EMagazineSubject.find().sort({ name: 1 });
    const writers = await EMagazineWriter.find().sort({ name: 1 });
    res.render('eMagazine/magazine/add', {
        categories,
        subjects,
        writers,
        activePage: 'e-magazine',
        activeTab: 'magazine'
    });
});

// Add magazine POST
router.post('/magazine/add', upload.array('images', 10), async (req, res) => {
    try {
        const { language, category, subject, writer, month, year, title, introduction, subPoints, importance, explain, summary, reference } = req.body;
        const imageLinks = req.files ? req.files.map(file => '/uploads/emagazine/magazines/' + file.filename) : [];
        const magazine = new EMagazine({
            language,
            category,
            subject,
            writer,
            month,
            year,
            title,
            introduction,
            subPoints,
            importance,
            explain,
            summary,
            reference,
            images: imageLinks
        });
        await magazine.save();
        res.redirect('/e-magazine/magazine');
    } catch (err) {
        res.status(500).send('Error saving magazine: ' + err.message);
    }
});

// Edit magazine form
router.get('/magazine/edit/:id', async (req, res) => {
    const magazine = await EMagazine.findById(req.params.id);
    const categories = await EMagazineCategory.find().sort({ name: 1 });
    const subjects = await EMagazineSubject.find().sort({ name: 1 });
    const writers = await EMagazineWriter.find().sort({ name: 1 });
    if (!magazine) return res.status(404).send('Magazine not found');
    res.render('eMagazine/magazine/edit', {
        magazine,
        categories,
        subjects,
        writers,
        activePage: 'e-magazine',
        activeTab: 'magazine'
    });
});

// Edit magazine POST
router.post('/magazine/edit/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { language, category, subject, writer, month, year, title, introduction, subPoints, importance, explain, summary, reference } = req.body;
        const updateData = {
            language,
            category,
            subject,
            writer,
            month,
            year,
            title,
            introduction,
            subPoints,
            importance,
            explain,
            summary,
            reference
        };
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => '/uploads/emagazine/magazines/' + file.filename);
        }
        await EMagazine.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/e-magazine/magazine');
    } catch (err) {
        res.status(500).send('Error updating magazine: ' + err.message);
    }
});

// Delete magazine
router.post('/magazine/delete/:id', async (req, res) => {
    try {
        await EMagazine.findByIdAndDelete(req.params.id);
        res.redirect('/e-magazine/magazine');
    } catch (err) {
        res.status(500).send('Error deleting magazine: ' + err.message);
    }
});

// Export Excel for magazines
router.get('/magazine/export-excel', async (req, res) => {
    try {
        const magazines = await EMagazine.find()
            .populate('category')
            .populate('subject')
            .populate('writer')
            .sort({ createdAt: -1 });

        const dataToExport = magazines.map(entry => ({
            Language: entry.language || '',
            Category: entry.category ? entry.category.name : '',
            Subject: entry.subject ? entry.subject.name : '',
            Writer: entry.writer ? entry.writer.name : '',
            Month: entry.month || '',
            Year: entry.year || '',
            Title: entry.title || '',
            Introduction: entry.introduction || '',
            'Sub Points': entry.subPoints || '',
            Importance: entry.importance || '',
            Explain: entry.explain || '',
            Summary: entry.summary || '',
            Reference: entry.reference || ''
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Magazines');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="emagazine_magazines.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting magazines Excel:', error);
        res.status(500).send('Error exporting Excel file');
    }
});

// Handle Excel upload for magazines
router.post('/magazine/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('eMagazine/magazine/index', {
                magazines: await EMagazine.find()
                    .populate('category')
                    .populate('subject')
                    .populate('writer')
                    .sort({ createdAt: -1 }),
                activePage: 'e-magazine',
                activeTab: 'magazine',
                error: 'Please upload an Excel file.'
            });
        }

        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const magazines = [];
        for (const row of data) {
            if (!row.Language || !row.Category || !row.Subject || !row.Writer || 
                !row.Month || !row.Year || !row.Title) {
                continue; // Skip rows with missing required fields
            }

            // Validate language
            if (!['Hindi', 'English', 'Sanskrit'].includes(row.Language)) {
                continue;
            }

            // Validate month
            const validMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            if (!validMonths.includes(row.Month)) {
                continue;
            }

            // Find category, subject, and writer by name
            const category = await EMagazineCategory.findOne({ name: row.Category });
            const subject = await EMagazineSubject.findOne({ name: row.Subject });
            const writer = await EMagazineWriter.findOne({ name: row.Writer });

            if (!category || !subject || !writer) {
                continue; // Skip if any required reference not found
            }

            magazines.push({
                language: row.Language,
                category: category._id,
                subject: subject._id,
                writer: writer._id,
                month: row.Month,
                year: parseInt(row.Year),
                title: row.Title,
                introduction: row.Introduction || '',
                subPoints: row['Sub Points'] || '',
                importance: row.Importance || '',
                explain: row.Explain || '',
                summary: row.Summary || '',
                reference: row.Reference || ''
            });
        }

        if (magazines.length > 0) {
            await EMagazine.insertMany(magazines);
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            res.redirect('/e-magazine/magazine');
        } else {
            res.render('eMagazine/magazine/index', {
                magazines: await EMagazine.find()
                    .populate('category')
                    .populate('subject')
                    .populate('writer')
                    .sort({ createdAt: -1 }),
                activePage: 'e-magazine',
                activeTab: 'magazine',
                error: 'No valid magazine data found in the Excel file.'
            });
        }
    } catch (err) {
        console.error('Error processing Excel file:', err);
        res.render('eMagazine/magazine/index', {
            magazines: await EMagazine.find()
                .populate('category')
                .populate('subject')
                .populate('writer')
                .sort({ createdAt: -1 }),
            activePage: 'e-magazine',
            activeTab: 'magazine',
            error: 'Error processing Excel file. Please check the file format.'
        });
    }
});

module.exports = router; 