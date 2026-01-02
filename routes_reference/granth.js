const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const GranthCategory = require('../models/GranthCategory');
const GranthName = require('../models/GranthName');
const GranthChapter = require('../models/GranthChapter');
const GranthContent = require('../models/GranthContent');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/granths';
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

// Main book page - shows all categories
router.get('/', async (req, res) => {
    try {
        const categories = await GranthCategory.find().sort({ createdAt: -1 });
        res.render('granth/index', { 
            categories,
            activePage: 'granth',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Category Routes
router.get('/category', async (req, res) => {
    try {
        const categories = await GranthCategory.find().sort({ createdAt: -1 });
        res.render('granth/category/index', { 
            categories,
            activePage: 'granth',
            activeSection: 'category',
            activeTab: 'category'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Category
router.get('/category/add', (req, res) => {
    res.render('granth/category/add', {
        activePage: 'granth',
        activeSection: 'category'
    });
});

router.post('/category/add', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        let cover_image = '';
        
        if (req.file) {
            cover_image = '/uploads/granths/' + req.file.filename;
        }

        const category = new GranthCategory({
            name,
            cover_image
        });

        await category.save();
        res.redirect('/granth');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving category: ' + err.message);
    }
});

// Edit Category
router.get('/category/edit/:id', async (req, res) => {
    try {
        const category = await GranthCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('granth/category/edit', {
            category,
            activePage: 'granth',
            activeSection: 'category',
            returnPath: req.query.return || '/granth'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/category/edit/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        const returnPath = req.body.return || '/granth';
        const updateData = { name };
        
        if (req.file) {
            updateData.cover_image = '/uploads/granths/' + req.file.filename;
        }

        const category = await GranthCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect(returnPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Category
router.post('/category/delete/:id', async (req, res) => {
    try {
        const category = await GranthCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Check if category has any books
        const hasBooks = await GranthName.exists({ category: req.params.id });
        if (hasBooks) {
            return res.status(400).send('Cannot delete category with existing books');
        }

        await category.deleteOne();
        res.redirect('/granth');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Name Routes
router.get('/name', async (req, res) => {
    try {
        const books = await GranthName.find()
            .populate('category')
            .sort({ createdAt: -1 });
        const categories = await GranthCategory.find();
        res.render('granth/name/index', { 
            books,
            categories,
            activePage: 'granth',
            activeSection: 'name',
            activeTab: 'name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Book
router.get('/name/add', async (req, res) => {
    try {
        const categories = await GranthCategory.find().sort({ name: 1 });
        const selectedCategoryId = req.query.category || null;
        res.render('granth/name/add', {
            categories,
            selectedCategoryId,
            activePage: 'granth',
            activeSection: 'name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/name/add', upload.single('book_image'), async (req, res) => {
    try {
        const { name, category } = req.body;
        let book_image = '';
        
        if (req.file) {
            book_image = '/uploads/granths/' + req.file.filename;
        }

        const book = new GranthName({
            name,
            category,
            book_image
        });

        await book.save();
        // Redirect back to category books page if category is provided
        if (req.body.category) {
            res.redirect(`/granth/category/${req.body.category}`);
        } else {
            res.redirect('/granth/name');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving book: ' + err.message);
    }
});

// Edit Book
router.get('/name/edit/:id', async (req, res) => {
    try {
        const book = await GranthName.findById(req.params.id).populate('category');
        const categories = await GranthCategory.find().sort({ name: 1 });
        
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        res.render('granth/name/edit', {
            book,
            categories,
            activePage: 'granth',
            activeSection: 'name',
            returnPath: req.query.return || '/granth/name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/name/edit/:id', upload.single('book_image'), async (req, res) => {
    try {
        const { name, category } = req.body;
        const returnPath = req.body.return || '/granth/name';
        const updateData = { name, category };
        
        if (req.file) {
            updateData.book_image = '/uploads/granths/' + req.file.filename;
        }

        const book = await GranthName.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!book) {
            return res.status(404).send('Book not found');
        }

        res.redirect(returnPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Book
router.post('/name/delete/:id', async (req, res) => {
    try {
        const book = await GranthName.findById(req.params.id);
        const returnPath = req.body.return || '/granth/name';
        
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Check if book has any chapters
        const hasChapters = await GranthChapter.exists({ book: req.params.id });
        if (hasChapters) {
            return res.status(400).send('Cannot delete book with existing chapters. Please delete all chapters first.');
        }

        await book.deleteOne();
        res.redirect(returnPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Chapter Routes
router.get('/chapter', async (req, res) => {
    try {
        const chapters = await GranthChapter.find()
            .populate('category')
            .populate('book')
            .sort({ createdAt: -1 });
        const categories = await GranthCategory.find();
        const books = await GranthName.find();
        res.render('granth/chapter/index', { 
            chapters,
            categories,
            books,
            activePage: 'granth',
            activeSection: 'chapter',
            activeTab: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Chapter
router.get('/chapter/add', async (req, res) => {
    try {
        const categories = await GranthCategory.find().sort({ name: 1 });
        const books = await GranthName.find().sort({ name: 1 });
        const selectedCategoryId = req.query.category || null;
        const selectedBookId = req.query.book || null;
        res.render('granth/chapter/add', {
            categories,
            books,
            selectedCategoryId,
            selectedBookId,
            activePage: 'granth',
            activeSection: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/chapter/add', async (req, res) => {
    try {
        const { name, category, book } = req.body;

        const chapter = new GranthChapter({
            name,
            category,
            book
        });

        await chapter.save();
        // Redirect back to book chapters page if book is provided
        if (req.body.book && req.body.category) {
            res.redirect(`/granth/category/${req.body.category}/granth/${req.body.book}`);
        } else {
            res.redirect('/granth/chapter');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving chapter: ' + err.message);
    }
});

// Edit Chapter
router.get('/chapter/edit/:id', async (req, res) => {
    try {
        const chapter = await GranthChapter.findById(req.params.id)
            .populate('category')
            .populate('book');
        const categories = await GranthCategory.find().sort({ name: 1 });
        const books = await GranthName.find().sort({ name: 1 });
        
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        
        res.render('granth/chapter/edit', {
            chapter,
            categories,
            books,
            activePage: 'granth',
            activeSection: 'chapter',
            returnPath: req.query.return || '/granth/chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/chapter/edit/:id', async (req, res) => {
    try {
        const { name, category, book } = req.body;
        const returnPath = req.body.return || '/granth/chapter';
        const chapter = await GranthChapter.findByIdAndUpdate(
            req.params.id,
            { name, category, book },
            { new: true }
        );

        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }

        res.redirect(returnPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Chapter
router.post('/chapter/delete/:id', async (req, res) => {
    try {
        const chapter = await GranthChapter.findById(req.params.id);
        const returnPath = req.body.return || '/granth/chapter';
        
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }

        // Check if chapter has any content
        const hasContent = await GranthContent.exists({ chapter: req.params.id });
        if (hasContent) {
            return res.status(400).send('Cannot delete chapter with existing content. Please delete all content first.');
        }

        await chapter.deleteOne();
        res.redirect(returnPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Show all contents for a chapter
router.get('/chapter/:chapterId/contents', async (req, res) => {
    try {
        const contents = await GranthContent.find({ chapter: req.params.chapterId })
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        const chapter = await GranthChapter.findById(req.params.chapterId)
            .populate('category')
            .populate('book');
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        res.render('granth/chapter/contents', {
            contents,
            chapter,
            activePage: 'granth',
            activeSection: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Content Routes
router.get('/content', async (req, res) => {
    try {
        const contents = await GranthContent.find()
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        const categories = await GranthCategory.find();
        const books = await GranthName.find();
        const chapters = await GranthChapter.find();
        res.render('granth/content/index', { 
            contents,
            categories,
            books,
            chapters,
            activePage: 'granth',
            activeSection: 'content',
            activeTab: 'content'
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).send('Server error');
    }
});

// Add Content - SIMPLIFIED VERSION
router.get('/content/add', async (req, res) => {
    console.log('=== ADD CONTENT ROUTE HIT ===');
    console.log('Query:', req.query);
    
    try {
        const { category: categoryId, book: bookId, chapter: chapterId } = req.query;
        
        // ALWAYS use simplified form when context is provided
        if (categoryId && bookId && chapterId) {
            console.log('Context provided, fetching from DB...');
            
            const [category, book, chapter] = await Promise.all([
                GranthCategory.findById(categoryId),
                GranthName.findById(bookId),
                GranthChapter.findById(chapterId)
            ]);
            
            console.log('DB Results:', { 
                category: category ? category.name : 'NOT FOUND',
                book: book ? book.name : 'NOT FOUND', 
                chapter: chapter ? chapter.name : 'NOT FOUND'
            });
            
            if (category && book && chapter) {
                console.log('>>> RENDERING add-simple.ejs <<<');
                return res.render('granth/content/add-simple', { 
                    category,
                    book,
                    chapter,
                    activePage: 'granth',
                    activeSection: 'content'
                });
            } else {
                console.log('Some IDs not found in DB, falling back to full form');
            }
        } else {
            console.log('No context provided, showing full form');
        }
        
        // Fallback to full form if no context
        const categories = await GranthCategory.find().sort({ name: 1 });
        const books = await GranthName.find().populate('category', '_id name').sort({ name: 1 });
        const chapters = await GranthChapter.find().populate('book', '_id name').sort({ name: 1 });
            
        console.log('>>> RENDERING add.ejs (full form) <<<');
        res.render('granth/content/add', { 
            categories, 
            books, 
            chapters,
            selectedCategoryId: categoryId,
            selectedBookId: bookId,
            selectedChapterId: chapterId,
            activePage: 'granth',
            activeSection: 'content'
        });
    } catch (error) {
        console.error('ERROR in add content route:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

router.post('/content/add', upload.array('images', 10), async (req, res) => {
    try {
        const { 
            category, book, chapter, 
            title_hn, title_en, title_hinglish,
            meaning, details, extra, video_links 
        } = req.body;
        
        // Process video links
        const videoLinksArray = video_links ? video_links.split('\n').map(link => link.trim()).filter(link => link) : [];
        
        // Process uploaded images
        const imageLinks = req.files ? req.files.map(file => `/uploads/granths/${file.filename}`) : [];

        // Get max sequence for this chapter to assign next sequence number
        const maxContent = await GranthContent.findOne({ chapter }).sort({ sequence: -1 });
        const nextSequence = maxContent ? maxContent.sequence + 1 : 1;

        const content = new GranthContent({
            category,
            book,
            chapter,
            title_hn,
            title_en,
            title_hinglish,
            meaning,
            details,
            extra,
            images: imageLinks,
            video_links: videoLinksArray,
            sequence: nextSequence
        });

        await content.save();
        // Get book and category to redirect back to chapter page
        const savedChapter = await GranthChapter.findById(chapter).populate('book');
        if (savedChapter && savedChapter.book) {
            const bookCategory = await GranthName.findById(savedChapter.book._id).populate('category');
            if (bookCategory && bookCategory.category) {
                res.redirect(`/granth/category/${bookCategory.category._id}/granth/${bookCategory._id}/chapter/${chapter}`);
                return;
            }
        }
        res.redirect('/granth/content');
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).send('Server error');
    }
});

// Edit Content
router.get('/content/edit/:id', async (req, res) => {
    try {
        const content = await GranthContent.findById(req.params.id);
        const categories = await GranthCategory.find().sort({ name: 1 });
        const books = await GranthName.find()
            .populate('category', '_id name')
            .sort({ name: 1 });
        const chapters = await GranthChapter.find()
            .populate('book', '_id name')
            .sort({ name: 1 });
        
        if (!content) {
            return res.status(404).send('Content not found');
        }
        
        res.render('granth/content/edit', {
            content,
            categories,
            books,
            chapters,
            activePage: 'granth',
            activeSection: 'content'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/content/edit/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { 
            category, book, chapter, 
            title_hn, title_en, title_hinglish,
            meaning, details, extra, video_links 
        } = req.body;

        // Process video links
        const videoLinksArray = video_links ? video_links.split('\n').map(link => link.trim()).filter(link => link) : [];
        
        // Process uploaded images
        const imageLinks = req.files ? req.files.map(file => `/uploads/granths/${file.filename}`) : [];

        const updateData = {
            category,
            book,
            chapter,
            title_hn,
            title_en,
            title_hinglish,
            meaning,
            details,
            extra,
            video_links: videoLinksArray
        };

        // Only update images if new ones were uploaded
        if (imageLinks.length > 0) {
            updateData.images = imageLinks;
        }

        const content = await GranthContent.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!content) {
            return res.status(404).send('Content not found');
        }

        // Redirect back to chapter page
        const updatedContent = await GranthContent.findById(req.params.id).populate('chapter');
        if (updatedContent && updatedContent.chapter) {
            const chapter = await GranthChapter.findById(updatedContent.chapter._id).populate('book');
            if (chapter && chapter.book) {
                const bookCategory = await GranthName.findById(chapter.book._id).populate('category');
                if (bookCategory && bookCategory.category) {
                    res.redirect(`/granth/category/${bookCategory.category._id}/granth/${bookCategory._id}/chapter/${updatedContent.chapter._id}`);
                    return;
                }
            }
        }
        res.redirect('/granth/content');
    } catch (err) {
        console.error('Error updating content:', err);
        // If there's an error, try to redirect to the edit page with error message
        const content = await GranthContent.findById(req.params.id);
        if (content) {
            const categories = await GranthCategory.find().sort({ name: 1 });
            const books = await GranthName.find()
                .populate('category', '_id name')
                .sort({ name: 1 });
            const chapters = await GranthChapter.find()
                .populate('book', '_id name')
                .sort({ name: 1 });
            
            res.render('granth/content/edit', {
                content,
                categories,
                books,
                chapters,
                activePage: 'granth',
                activeSection: 'content',
                error: 'Error updating content. Please try again.'
            });
        } else {
            res.redirect('/granth/content');
        }
    }
});

// Delete Content
router.post('/content/delete/:id', async (req, res) => {
    try {
        const content = await GranthContent.findById(req.params.id);
        if (!content) {
            return res.status(404).send('Content not found');
        }

        const chapterId = content.chapter;
        await content.deleteOne();
        
        // Redirect back to chapter page
        if (chapterId) {
            const chapter = await GranthChapter.findById(chapterId).populate('book');
            if (chapter && chapter.book) {
                const bookCategory = await GranthName.findById(chapter.book._id).populate('category');
                if (bookCategory && bookCategory.category) {
                    res.redirect(`/granth/category/${bookCategory.category._id}/granth/${bookCategory._id}/chapter/${chapterId}`);
                    return;
                }
            }
        }
        res.redirect('/granth/content');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Export Excel for chapters
router.get('/chapter/export-excel', async (req, res) => {
    try {
        const chapters = await GranthChapter.find()
            .populate('category')
            .populate('book')
            .sort({ createdAt: -1 });

        const dataToExport = chapters.map(entry => ({
            Category: entry.category ? entry.category.name : '',
            Book: entry.book ? entry.book.name : '',
            Name: entry.name || ''
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Chapters');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="granth_chapters.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting chapters Excel:', error);
        res.status(500).send('Error exporting Excel file');
    }
});

// Handle Excel upload for chapters
router.post('/chapter/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('granth/chapter/index', {
                chapters: await GranthChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                activePage: 'granth',
                activeSection: 'chapter',
                activeTab: 'chapter',
                error: 'Please upload an Excel file.'
            });
        }

        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const chapters = [];
        for (const row of data) {
            if (!row.Category || !row.Book || !row.Name) {
                continue; // Skip rows with missing required fields
            }

            // Find category and book by name
            const category = await GranthCategory.findOne({ name: row.Category });
            const book = await GranthName.findOne({ name: row.Book });

            if (!category || !book) {
                continue; // Skip if category or book not found
            }

            // Create a new chapter instance to trigger the auto-increment
            const chapter = new GranthChapter({
                category: category._id,
                book: book._id,
                name: row.Name
            });

            chapters.push(chapter);
        }

        if (chapters.length > 0) {
            // Save chapters one by one to ensure proper ID generation
            for (const chapter of chapters) {
                await chapter.save();
            }
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            res.redirect('/granth/chapter');
        } else {
            res.render('granth/chapter/index', {
                chapters: await GranthChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                activePage: 'granth',
                activeSection: 'chapter',
                activeTab: 'chapter',
                error: 'No valid chapter data found in the Excel file.'
            });
        }
    } catch (err) {
        console.error('Error processing Excel file:', err);
        res.render('granth/chapter/index', {
            chapters: await GranthChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
            categories: await GranthCategory.find(),
            books: await GranthName.find(),
            activePage: 'granth',
            activeSection: 'chapter',
            activeTab: 'chapter',
            error: 'Error processing Excel file. Please check the file format.'
        });
    }
});

// Handle Excel upload for content
router.post('/content/upload-excel', upload.single('excelFile'), async (req, res) => {
    try {
        const chapterId = req.body.chapter;
        const categoryId = req.body.category;
        const bookId = req.body.book;
        const hasContext = chapterId && categoryId && bookId;
        
        if (!req.file) {
            // If chapter context is provided, redirect back to chapter page
            if (hasContext) {
                return res.redirect(`/granth/category/${categoryId}/granth/${bookId}/chapter/${chapterId}?error=Please upload an Excel file.`);
            }
            return res.render('granth/content/index', {
                contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                chapters: await GranthChapter.find(),
                activePage: 'granth',
                activeSection: 'content',
                activeTab: 'content',
                error: 'Please upload an Excel file.'
            });
        }

        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            if (hasContext) {
                return res.redirect(`/granth/category/${categoryId}/granth/${bookId}/chapter/${chapterId}?error=Excel file is empty or has no data rows.`);
            }
            return res.render('granth/content/index', {
                contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                chapters: await GranthChapter.find(),
                activePage: 'granth',
                activeSection: 'content',
                activeTab: 'content',
                error: 'Excel file is empty or has no data rows.'
            });
        }

        const contents = [];
        const errors = [];
        let processedRows = 0;

        // Get max sequence for this chapter to continue from where we left off
        let maxSequence = 0;
        if (hasContext && chapterId) {
            const maxContent = await GranthContent.findOne({ chapter: chapterId }).sort({ sequence: -1 });
            maxSequence = maxContent ? maxContent.sequence : 0;
        }

        // If context is provided, use it for all rows (simplified Excel format)
        if (hasContext) {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                
                // Process video links if present
                const videoLinks = row['Video Links'] ? 
                    row['Video Links'].split(',').map(link => link.trim()).filter(link => link) : 
                    [];

                maxSequence++; // Increment sequence for each row (preserves Excel order)
                contents.push({
                    category: categoryId,
                    book: bookId,
                    chapter: chapterId,
                    title_hn: row['Title (Hindi)'] || row['title_hn'] || undefined,
                    title_en: row['Title (English)'] || row['title_en'] || undefined,
                    title_hinglish: row['Title (Hinglish)'] || row['title_hinglish'] || undefined,
                    meaning: row['Meaning'] || row['meaning'] || undefined,
                    details: row['Details'] || row['details'] || undefined,
                    extra: row['Extra'] || row['extra'] || undefined,
                    video_links: videoLinks,
                    sequence: maxSequence // Assign sequence to preserve Excel order
                });
                processedRows++;
            }
        } else {
            // Original logic for Excel without context (requires Category, Book, Chapter columns)
            const requiredHeaders = ['Category', 'Book', 'Chapter'];
            const firstRow = data[0];
            const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));
            
            if (missingHeaders.length > 0) {
                fs.unlinkSync(req.file.path);
                return res.render('granth/content/index', {
                    contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                    categories: await GranthCategory.find(),
                    books: await GranthName.find(),
                    chapters: await GranthChapter.find(),
                    activePage: 'granth',
                    activeSection: 'content',
                    activeTab: 'content',
                    error: `Missing required column headers: ${missingHeaders.join(', ')}. Please ensure your Excel file has the correct headers.`
                });
            }

            // Track sequences per chapter
            const chapterSequences = {};
            
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const rowNumber = i + 2;

                const missingFields = [];
                if (!row.Category) missingFields.push('Category');
                if (!row.Book) missingFields.push('Book');
                if (!row.Chapter) missingFields.push('Chapter');

                if (missingFields.length > 0) {
                    errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
                    continue;
                }

                const category = await GranthCategory.findOne({ name: row.Category });
                const book = await GranthName.findOne({ name: row.Book });
                const chapter = await GranthChapter.findOne({ name: row.Chapter });

                const notFound = [];
                if (!category) notFound.push(`Category: "${row.Category}"`);
                if (!book) notFound.push(`Book: "${row.Book}"`);
                if (!chapter) notFound.push(`Chapter: "${row.Chapter}"`);

                if (notFound.length > 0) {
                    errors.push(`Row ${rowNumber}: Not found in database: ${notFound.join(', ')}`);
                    continue;
                }

                const videoLinks = row['Video Links'] ? 
                    row['Video Links'].split(',').map(link => link.trim()).filter(link => link) : 
                    [];

                // Get or initialize max sequence for this chapter
                if (!chapterSequences[chapter._id.toString()]) {
                    const chapterMaxContent = await GranthContent.findOne({ chapter: chapter._id }).sort({ sequence: -1 });
                    chapterSequences[chapter._id.toString()] = chapterMaxContent ? chapterMaxContent.sequence : 0;
                }
                chapterSequences[chapter._id.toString()]++;
                const currentSequence = chapterSequences[chapter._id.toString()];

                contents.push({
                    category: category._id,
                    book: book._id,
                    chapter: chapter._id,
                    title_hn: row['Title (Hindi)'] || undefined,
                    title_en: row['Title (English)'] || undefined,
                    title_hinglish: row['Title (Hinglish)'] || undefined,
                    meaning: row.Meaning || undefined,
                    details: row.Details || undefined,
                    extra: row.Extra || undefined,
                    video_links: videoLinks,
                    sequence: currentSequence // Assign sequence to preserve Excel order
                });
                processedRows++;
            }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        if (contents.length > 0) {
            await GranthContent.insertMany(contents);
            const successMessage = `Successfully imported ${contents.length} records.`;
            const errorMessage = errors.length > 0 ? ` However, ${errors.length} rows had errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}` : '';
            
            // Redirect back to chapter page if chapter context is provided
            if (chapterId && categoryId && bookId) {
                const message = encodeURIComponent(successMessage + errorMessage);
                return res.redirect(`/granth/category/${categoryId}/granth/${bookId}/chapter/${chapterId}?success=${message}`);
            }
            
            return res.render('granth/content/index', {
                contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                chapters: await GranthChapter.find(),
                activePage: 'granth',
                activeSection: 'content',
                activeTab: 'content',
                success: successMessage + errorMessage
            });
        } else {
            // Redirect back to chapter page if chapter context is provided
            if (chapterId && categoryId && bookId) {
                const errorMsg = encodeURIComponent(`No valid content data found. Errors: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`);
                return res.redirect(`/granth/category/${categoryId}/granth/${bookId}/chapter/${chapterId}?error=${errorMsg}`);
            }
            
            return res.render('granth/content/index', {
                contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await GranthCategory.find(),
                books: await GranthName.find(),
                chapters: await GranthChapter.find(),
                activePage: 'granth',
                activeSection: 'content',
                activeTab: 'content',
                error: `No valid content data found. Errors: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`
            });
        }
    } catch (err) {
        console.error('Error processing Excel file:', err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        const chapterId = req.body.chapter;
        const categoryId = req.body.category;
        const bookId = req.body.book;
        
        // Redirect back to chapter page if chapter context is provided
        if (chapterId && categoryId && bookId) {
            const errorMsg = encodeURIComponent(`Error processing Excel file: ${err.message}. Please check the file format and try again.`);
            return res.redirect(`/granth/category/${categoryId}/granth/${bookId}/chapter/${chapterId}?error=${errorMsg}`);
        }
        
        res.render('granth/content/index', {
            contents: await GranthContent.find().populate('category').populate('book').populate('chapter').sort({ createdAt: -1 }),
            categories: await GranthCategory.find(),
            books: await GranthName.find(),
            chapters: await GranthChapter.find(),
            activePage: 'granth',
            activeSection: 'content',
            activeTab: 'content',
            error: `Error processing Excel file: ${err.message}. Please check the file format and try again.`
        });
    }
});

// Export Excel TEMPLATE for book content (ALWAYS simplified - no Category/Book/Chapter)
router.get('/content/export-excel', async (req, res) => {
    try {
        console.log('=== EXPORT EXCEL TEMPLATE ===');
        console.log('Creating simplified template for upload');
        
        // Create a new workbook
        const workbook = xlsx.utils.book_new();
        
        // ALWAYS export simplified template (since this is only called from chapter page)
        const dataToExport = [{
            'Title (Hindi)': 'यहाँ हिंदी शीर्षक लिखें',
            'Title (English)': 'Enter English title here',
            'Title (Hinglish)': 'Enter Hinglish title here',
            'Meaning': 'यहाँ अर्थ लिखें / Enter meaning here',
            'Details': 'यहाँ विवरण लिखें / Enter details here',
            'Extra': 'अतिरिक्त जानकारी (वैकल्पिक)',
            'Video Links': 'https://youtube.com/video1, https://youtube.com/video2'
        }];

        // Create worksheet
        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        
        // Add the worksheet to workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Content Upload');
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="granth_content_upload_template.xlsx"');
        
        // Write the workbook to response
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
        
    } catch (err) {
        console.error('Error creating Excel template:', err);
        res.status(500).send('Error creating Excel template');
    }
});

// ============= DEBUG ROUTE =============
// Remove this after debugging
router.get('/debug/granths', async (req, res) => {
    try {
        const categories = await GranthCategory.find();
        const books = await GranthName.find().populate('category');
        const chapters = await GranthChapter.find().populate('category').populate('book');
        
        res.json({
            categoriesCount: categories.length,
            categories: categories.map(c => ({ _id: c._id, name: c.name })),
            booksCount: books.length,
            books: books.map(b => ({ 
                _id: b._id, 
                name: b.name, 
                category: b.category ? { _id: b.category._id, name: b.category.name } : b.category,
                categoryRaw: b.category
            })),
            chaptersCount: chapters.length,
            chapters: chapters.map(ch => ({
                _id: ch._id,
                name: ch.name,
                book: ch.book ? ch.book._id : ch.book,
                category: ch.category ? ch.category._id : ch.category
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============= HIERARCHICAL ROUTES =============

// Show books in a category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        console.log('Loading books for category:', categoryId);
        
        const category = await GranthCategory.findById(categoryId);
        if (!category) {
            console.log('Category not found:', categoryId);
            return res.status(404).send('Category not found');
        }
        
        // Use the category's _id directly for the query
        const books = await GranthName.find({ category: category._id })
            .populate('category')
            .sort({ createdAt: -1 });
        
        console.log('Found books:', books.length);
        
        res.render('granth/category/books', {
            category,
            books,
            activePage: 'granth',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error('Error loading books:', err);
        res.status(500).send('Server Error');
    }
});

// Show chapters in a book
router.get('/category/:categoryId/granth/:bookId', async (req, res) => {
    try {
        const category = await GranthCategory.findById(req.params.categoryId);
        const book = await GranthName.findById(req.params.bookId).populate('category');
        
        if (!category || !book) {
            return res.status(404).send('Category or Book not found');
        }
        
        if (book.category._id.toString() !== category._id.toString()) {
            return res.status(400).send('Book does not belong to this category');
        }
        
        const chapters = await GranthChapter.find({ book: req.params.bookId })
            .populate('book')
            .populate('category')
            .sort({ createdAt: -1 });
        
        res.render('granth/granth/chapters', {
            category,
            book,
            chapters,
            activePage: 'granth',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Show content for a chapter
router.get('/category/:categoryId/granth/:bookId/chapter/:chapterId', async (req, res) => {
    try {
        const category = await GranthCategory.findById(req.params.categoryId);
        const book = await GranthName.findById(req.params.bookId).populate('category');
        const chapter = await GranthChapter.findById(req.params.chapterId)
            .populate('book')
            .populate('category');
        
        if (!category || !book || !chapter) {
            return res.status(404).send('Category, Book or Chapter not found');
        }
        
        if (book.category._id.toString() !== category._id.toString() ||
            chapter.book._id.toString() !== book._id.toString()) {
            return res.status(400).send('Invalid hierarchy');
        }
        
        const contents = await GranthContent.find({ chapter: req.params.chapterId })
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        
        res.render('granth/chapter/contents', {
            category,
            book,
            chapter,
            contents,
            activePage: 'granth',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 