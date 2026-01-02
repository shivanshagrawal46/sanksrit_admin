const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const MuhuratCategory = require('../models/MuhuratCategory');
const MuhuratContent = require('../models/MuhuratContent');

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept various Excel MIME types and also check file extension
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/excel',
            'application/x-excel',
            'application/x-msexcel'
        ];
        const allowedExtensions = ['.xlsx', '.xls'];
        const fileExt = require('path').extname(file.originalname).toLowerCase();
        
        if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
            cb(null, true);
        } else {
            console.error('File rejected - MIME type:', file.mimetype, 'Extension:', fileExt);
            cb(new Error('Only Excel files (.xlsx or .xls) are allowed!'), false);
        }
    }
});

// Main muhurat page
router.get('/', requireAuth, async (req, res) => {
    try {
        const categories = await MuhuratCategory.find().sort({ createdAt: -1 });
        res.render('muhurat/index', {
            username: req.session.username,
            activePage: 'muhurat',
            categories
        });
    } catch (error) {
        res.render('muhurat/index', {
            username: req.session.username,
            activePage: 'muhurat',
            categories: [],
            error: 'Error loading muhurat data'
        });
    }
});

// ============= CATEGORY ROUTES =============

// Add category form
router.get('/category/add', requireAuth, (req, res) => {
    res.render('muhurat/categoryAdd', {
        username: req.session.username,
        activePage: 'muhurat'
    });
});

// Create category
router.post('/category/add', requireAuth, async (req, res) => {
    try {
        const { categoryName, imageUrl } = req.body;
        await MuhuratCategory.create({ 
            categoryName, 
            imageUrl: imageUrl || undefined 
        });
        res.redirect('/muhurat');
    } catch (err) {
        res.status(500).send('Error creating category: ' + err.message);
    }
});

// Edit category form
router.get('/category/edit/:id', requireAuth, async (req, res) => {
    try {
        const category = await MuhuratCategory.findById(req.params.id);
        if (!category) return res.status(404).send('Category not found');
        res.render('muhurat/categoryEdit', { 
            category, 
            username: req.session.username,
            activePage: 'muhurat'
        });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Update category
router.post('/category/edit/:id', requireAuth, async (req, res) => {
    try {
        const { categoryName, imageUrl } = req.body;
        await MuhuratCategory.findByIdAndUpdate(req.params.id, { 
            categoryName, 
            imageUrl: imageUrl || undefined 
        });
        res.redirect('/muhurat');
    } catch (err) {
        res.status(500).send('Error updating category: ' + err.message);
    }
});

// Delete category
router.post('/category/delete/:id', requireAuth, async (req, res) => {
    try {
        const categoryId = req.params.id;
        // Delete all content under this category
        await MuhuratContent.deleteMany({ categoryId });
        // Delete the category
        await MuhuratCategory.findByIdAndDelete(categoryId);
        res.redirect('/muhurat');
    } catch (err) {
        res.status(500).send('Error deleting category: ' + err.message);
    }
});

// ============= CONTENT ROUTES =============

// View content for a category
router.get('/content/:categoryId', requireAuth, async (req, res) => {
    try {
        const category = await MuhuratCategory.findById(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');
        
        const contents = await MuhuratContent.find({ categoryId: req.params.categoryId })
            .sort({ year: -1, date: 1 });
        
        res.render('muhurat/content', {
            username: req.session.username,
            activePage: 'muhurat',
            category,
            contents
        });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Add content form
router.get('/content/:categoryId/add', requireAuth, async (req, res) => {
    try {
        const category = await MuhuratCategory.findById(req.params.categoryId);
        if (!category) return res.status(404).send('Category not found');
        
        res.render('muhurat/contentAdd', {
            username: req.session.username,
            activePage: 'muhurat',
            category
        });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Create content
router.post('/content/:categoryId/add', requireAuth, async (req, res) => {
    try {
        const { year, date, detail } = req.body;
        const categoryId = req.params.categoryId;
        
        await MuhuratContent.create({ 
            categoryId,
            year: year ? parseInt(year) : undefined,
            date: date || undefined,
            detail: detail || undefined
        });
        
        res.redirect(`/muhurat/content/${categoryId}`);
    } catch (err) {
        res.status(500).send('Error creating content: ' + err.message);
    }
});

// Edit content form
router.get('/content/:categoryId/edit/:contentId', requireAuth, async (req, res) => {
    try {
        const category = await MuhuratCategory.findById(req.params.categoryId);
        const content = await MuhuratContent.findById(req.params.contentId);
        
        if (!category || !content) return res.status(404).send('Not found');
        
        res.render('muhurat/contentEdit', { 
            category,
            content,
            username: req.session.username,
            activePage: 'muhurat'
        });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Update content
router.post('/content/:categoryId/edit/:contentId', requireAuth, async (req, res) => {
    try {
        const { year, date, detail } = req.body;
        const { categoryId, contentId } = req.params;
        
        const updateData = {};
        if (year) updateData.year = parseInt(year);
        if (date) updateData.date = date;
        if (detail) updateData.detail = detail;
        
        await MuhuratContent.findByIdAndUpdate(contentId, updateData);
        
        res.redirect(`/muhurat/content/${categoryId}`);
    } catch (err) {
        res.status(500).send('Error updating content: ' + err.message);
    }
});

// Delete content
router.post('/content/:categoryId/delete/:contentId', requireAuth, async (req, res) => {
    try {
        await MuhuratContent.findByIdAndDelete(req.params.contentId);
        res.redirect(`/muhurat/content/${req.params.categoryId}`);
    } catch (err) {
        res.status(500).send('Error deleting content: ' + err.message);
    }
});

// Export Excel for content
router.get('/content/:categoryId/export-excel', requireAuth, async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await MuhuratCategory.findById(categoryId);
        
        if (!category) {
            return res.status(404).send('Category not found');
        }

        const contents = await MuhuratContent.find({ categoryId }).sort({ createdAt: 1 });

        // Create template data with example row
        const templateData = [{
            year: 2025,
            date: '15 Jan',
            detail: 'Example muhurat detail - This is a sample entry'
        }];

        // If there's actual content, use it; otherwise use template
        const dataToExport = contents.length > 0 
            ? contents.map(entry => ({
                year: entry.year || '',
                date: entry.date || '',
                detail: entry.detail || ''
            }))
            : templateData;

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Muhurat Content');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="muhurat_${category.categoryName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting muhurat Excel:', error);
        res.status(500).send('Error exporting Excel file');
    }
});

// Upload Excel for content
router.post('/content/:categoryId/upload-excel', requireAuth, upload.single('excelFile'), async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await MuhuratCategory.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ 
                success: false,
                error: 'Category not found' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded. Please select an Excel file.' 
            });
        }

        console.log('Reading Excel file:', req.file.path);
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log('Excel data rows:', data.length);
        if (data.length > 0) {
            console.log('First row sample:', data[0]);
        }

        // Expected columns: year, date, detail (case-insensitive matching)
        const contents = [];
        for (const row of data) {
            // Skip completely empty rows
            if (!row.year && !row.date && !row.detail && 
                !row.Year && !row.Date && !row.Detail) {
                continue;
            }
            
            // Handle year first (needed for template detection)
            let yearValue = undefined;
            if (row.year !== undefined && row.year !== null && row.year !== '') {
                yearValue = typeof row.year === 'number' ? row.year : parseInt(String(row.year));
                if (isNaN(yearValue)) yearValue = undefined;
            } else if (row.Year !== undefined && row.Year !== null && row.Year !== '') {
                yearValue = typeof row.Year === 'number' ? row.Year : parseInt(String(row.Year));
                if (isNaN(yearValue)) yearValue = undefined;
            }
            
            // Skip template/example rows (rows that contain "Example", "example", "sample" in detail)
            const detailStr = String(row.detail || row.Detail || '').toLowerCase();
            const dateStr = String(row.date || row.Date || '').toLowerCase();
            if (detailStr.includes('example') || detailStr.includes('sample') || 
                dateStr.includes('15 jan') || dateStr === '15 jan') {
                console.log('Skipping template row:', row);
                continue;
            }
            
            // Also skip if year is 2025 and detail contains "muhurat detail" (template pattern)
            if (yearValue === 2025 && detailStr.includes('muhurat detail')) {
                console.log('Skipping template row (2025 pattern):', row);
                continue;
            }

            // Handle date - can be string or Excel serial number
            let dateValue = undefined;
            const rawDate = row.date || row.Date;
            if (rawDate !== undefined && rawDate !== null && rawDate !== '') {
                // Check if it's an Excel serial number (large number like 46003)
                if (typeof rawDate === 'number' && rawDate > 1000 && rawDate < 1000000) {
                    // Excel date serial: days since 1900-01-01
                    // Excel incorrectly treats 1900 as a leap year
                    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                    const dateObj = new Date(excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000);
                    // Format as readable date string (e.g., "15 Jan")
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    dateValue = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
                } else {
                    // It's already a string
                    dateValue = String(rawDate);
                }
            }
            
            // Handle detail - can be string
            const detailValue = row.detail || row.Detail || undefined;

            // Only add if at least one field has a value
            if (yearValue !== undefined || dateValue || detailValue) {
                contents.push({
                    categoryId,
                    year: yearValue,
                    date: dateValue,
                    detail: detailValue ? String(detailValue) : undefined
                });
            }
        }

        if (contents.length === 0) {
            // Clean up uploaded file
            if (req.file && req.file.path) {
                const fs = require('fs');
                try {
                    fs.unlinkSync(req.file.path);
                } catch (err) {
                    console.error('Error deleting uploaded file:', err);
                }
            }
            
            return res.status(400).json({
                success: false,
                error: 'No valid content data found in the Excel file. Please ensure the file has data in year, date, or detail columns.',
                message: 'The Excel file appears to be empty or does not contain valid data.'
            });
        }

        console.log('Inserting', contents.length, 'content items');
        // Use create in loop to avoid AutoIncrement plugin issues with insertMany
        // The AutoIncrement plugin works better with individual creates
        for (const content of contents) {
            await MuhuratContent.create(content);
        }

        // Clean up uploaded file
        if (req.file && req.file.path) {
            const fs = require('fs');
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting uploaded file:', err);
            }
        }

        res.json({
            success: true,
            message: 'Content uploaded successfully',
            count: contents.length
        });
    } catch (error) {
        console.error('Error uploading content:', error);
        console.error('Error stack:', error.stack);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            const fs = require('fs');
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting uploaded file:', err);
            }
        }
        
        res.status(500).json({
            success: false,
            error: 'Error processing Excel file',
            message: error.message || 'Please check the file format and try again.',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;

