const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const BookCategory = require('../models/BookCategory');
const BookName = require('../models/BookName');
const BookChapter = require('../models/BookChapter');
const BookContent = require('../models/BookContent');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/books';
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
        const categories = await BookCategory.find().sort({ createdAt: -1 });
        res.render('book/index', { 
            categories,
            activePage: 'book',
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
        const categories = await BookCategory.find().sort({ createdAt: -1 });
        res.render('book/category/index', { 
            categories,
            activePage: 'book',
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
    res.render('book/category/add', {
        activePage: 'book',
        activeSection: 'category'
    });
});

router.post('/category/add', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        let cover_image = '';
        
        if (req.file) {
            cover_image = '/uploads/books/' + req.file.filename;
        }

        const category = new BookCategory({
            name,
            cover_image
        });

        await category.save();
        res.redirect('/book');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving category: ' + err.message);
    }
});

// Edit Category
router.get('/category/edit/:id', async (req, res) => {
    try {
        const category = await BookCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('book/category/edit', {
            category,
            activePage: 'book',
            activeSection: 'category',
            returnPath: req.query.return || '/book'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/category/edit/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        const returnPath = req.body.return || '/book';
        const updateData = { name };
        
        if (req.file) {
            updateData.cover_image = '/uploads/books/' + req.file.filename;
        }

        const category = await BookCategory.findByIdAndUpdate(
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
        const category = await BookCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Check if category has any books
        const hasBooks = await BookName.exists({ category: req.params.id });
        if (hasBooks) {
            return res.status(400).send('Cannot delete category with existing books');
        }

        await category.deleteOne();
        res.redirect('/book');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Name Routes
router.get('/name', async (req, res) => {
    try {
        const books = await BookName.find()
            .populate('category')
            .sort({ createdAt: -1 });
        const categories = await BookCategory.find();
        res.render('book/name/index', { 
            books,
            categories,
            activePage: 'book',
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
        const categories = await BookCategory.find().sort({ name: 1 });
        const selectedCategoryId = req.query.category || null;
        res.render('book/name/add', {
            categories,
            selectedCategoryId,
            activePage: 'book',
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
            book_image = '/uploads/books/' + req.file.filename;
        }

        const book = new BookName({
            name,
            category,
            book_image
        });

        await book.save();
        // Redirect back to category books page if category is provided
        if (req.body.category) {
            res.redirect(`/book/category/${req.body.category}`);
        } else {
            res.redirect('/book/name');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving book: ' + err.message);
    }
});

// Edit Book
router.get('/name/edit/:id', async (req, res) => {
    try {
        const book = await BookName.findById(req.params.id).populate('category');
        const categories = await BookCategory.find().sort({ name: 1 });
        
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        res.render('book/name/edit', {
            book,
            categories,
            activePage: 'book',
            activeSection: 'name',
            returnPath: req.query.return || '/book/name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/name/edit/:id', upload.single('book_image'), async (req, res) => {
    try {
        const { name, category } = req.body;
        const returnPath = req.body.return || '/book/name';
        const updateData = { name, category };
        
        if (req.file) {
            updateData.book_image = '/uploads/books/' + req.file.filename;
        }

        const book = await BookName.findByIdAndUpdate(
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
        const book = await BookName.findById(req.params.id);
        const returnPath = req.body.return || '/book/name';
        
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Check if book has any chapters
        const hasChapters = await BookChapter.exists({ book: req.params.id });
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
        const chapters = await BookChapter.find()
            .populate('category')
            .populate('book')
            .sort({ createdAt: -1 });
        const categories = await BookCategory.find();
        const books = await BookName.find();
        res.render('book/chapter/index', { 
            chapters,
            categories,
            books,
            activePage: 'book',
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
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find().sort({ name: 1 });
        const selectedCategoryId = req.query.category || null;
        const selectedBookId = req.query.book || null;
        res.render('book/chapter/add', {
            categories,
            books,
            selectedCategoryId,
            selectedBookId,
            activePage: 'book',
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

        const chapter = new BookChapter({
            name,
            category,
            book
        });

        await chapter.save();
        // Redirect back to book chapters page if book is provided
        if (req.body.book && req.body.category) {
            res.redirect(`/book/category/${req.body.category}/book/${req.body.book}`);
        } else {
            res.redirect('/book/chapter');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving chapter: ' + err.message);
    }
});

// Edit Chapter
router.get('/chapter/edit/:id', async (req, res) => {
    try {
        const chapter = await BookChapter.findById(req.params.id)
            .populate('category')
            .populate('book');
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find().sort({ name: 1 });
        
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        
        res.render('book/chapter/edit', {
            chapter,
            categories,
            books,
            activePage: 'book',
            activeSection: 'chapter',
            returnPath: req.query.return || '/book/chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/chapter/edit/:id', async (req, res) => {
    try {
        const { name, category, book } = req.body;
        const returnPath = req.body.return || '/book/chapter';
        const chapter = await BookChapter.findByIdAndUpdate(
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
        const chapter = await BookChapter.findById(req.params.id);
        const returnPath = req.body.return || '/book/chapter';
        
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }

        // Check if chapter has any content
        const hasContent = await BookContent.exists({ chapter: req.params.id });
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
        const contents = await BookContent.find({ chapter: req.params.chapterId })
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        const chapter = await BookChapter.findById(req.params.chapterId)
            .populate('category')
            .populate('book');
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        res.render('book/chapter/contents', {
            contents,
            chapter,
            activePage: 'book',
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
        const contents = await BookContent.find()
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        const categories = await BookCategory.find();
        const books = await BookName.find();
        const chapters = await BookChapter.find();
        res.render('book/content/index', { 
            contents,
            categories,
            books,
            chapters,
            activePage: 'book',
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
                BookCategory.findById(categoryId),
                BookName.findById(bookId),
                BookChapter.findById(chapterId)
            ]);
            
            console.log('DB Results:', { 
                category: category ? category.name : 'NOT FOUND',
                book: book ? book.name : 'NOT FOUND', 
                chapter: chapter ? chapter.name : 'NOT FOUND'
            });
            
            if (category && book && chapter) {
                console.log('>>> RENDERING add-simple.ejs <<<');
                return res.render('book/content/add-simple', { 
                    category,
                    book,
                    chapter,
                    activePage: 'book',
                    activeSection: 'content'
                });
            } else {
                console.log('Some IDs not found in DB, falling back to full form');
            }
        } else {
            console.log('No context provided, showing full form');
        }
        
        // Fallback to full form if no context
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find().populate('category', '_id name').sort({ name: 1 });
        const chapters = await BookChapter.find().populate('book', '_id name').sort({ name: 1 });
            
        console.log('>>> RENDERING add.ejs (full form) <<<');
        res.render('book/content/add', { 
            categories, 
            books, 
            chapters,
            selectedCategoryId: categoryId,
            selectedBookId: bookId,
            selectedChapterId: chapterId,
            activePage: 'book',
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
        const imageLinks = req.files ? req.files.map(file => `/uploads/books/${file.filename}`) : [];

        // Get max sequence for this chapter to assign next sequence number
        const maxContent = await BookContent.findOne({ chapter }).sort({ sequence: -1 });
        const nextSequence = maxContent ? maxContent.sequence + 1 : 1;

        const content = new BookContent({
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
        const savedChapter = await BookChapter.findById(chapter).populate('book');
        if (savedChapter && savedChapter.book) {
            const bookCategory = await BookName.findById(savedChapter.book._id).populate('category');
            if (bookCategory && bookCategory.category) {
                res.redirect(`/book/category/${bookCategory.category._id}/book/${bookCategory._id}/chapter/${chapter}`);
                return;
            }
        }
        res.redirect('/book/content');
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).send('Server error');
    }
});

// Edit Content
router.get('/content/edit/:id', async (req, res) => {
    try {
        const content = await BookContent.findById(req.params.id);
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find()
            .populate('category', '_id name')
            .sort({ name: 1 });
        const chapters = await BookChapter.find()
            .populate('book', '_id name')
            .sort({ name: 1 });
        
        if (!content) {
            return res.status(404).send('Content not found');
        }
        
        res.render('book/content/edit', {
            content,
            categories,
            books,
            chapters,
            activePage: 'book',
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
        const imageLinks = req.files ? req.files.map(file => `/uploads/books/${file.filename}`) : [];

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

        const content = await BookContent.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!content) {
            return res.status(404).send('Content not found');
        }

        // Redirect back to chapter page
        const updatedContent = await BookContent.findById(req.params.id).populate('chapter');
        if (updatedContent && updatedContent.chapter) {
            const chapter = await BookChapter.findById(updatedContent.chapter._id).populate('book');
            if (chapter && chapter.book) {
                const bookCategory = await BookName.findById(chapter.book._id).populate('category');
                if (bookCategory && bookCategory.category) {
                    res.redirect(`/book/category/${bookCategory.category._id}/book/${bookCategory._id}/chapter/${updatedContent.chapter._id}`);
                    return;
                }
            }
        }
        res.redirect('/book/content');
    } catch (err) {
        console.error('Error updating content:', err);
        // If there's an error, try to redirect to the edit page with error message
        const content = await BookContent.findById(req.params.id);
        if (content) {
            const categories = await BookCategory.find().sort({ name: 1 });
            const books = await BookName.find()
                .populate('category', '_id name')
                .sort({ name: 1 });
            const chapters = await BookChapter.find()
                .populate('book', '_id name')
                .sort({ name: 1 });
            
            res.render('book/content/edit', {
                content,
                categories,
                books,
                chapters,
                activePage: 'book',
                activeSection: 'content',
                error: 'Error updating content. Please try again.'
            });
        } else {
            res.redirect('/book/content');
        }
    }
});

// Delete Content
router.post('/content/delete/:id', async (req, res) => {
    try {
        const content = await BookContent.findById(req.params.id);
        if (!content) {
            return res.status(404).send('Content not found');
        }

        const chapterId = content.chapter;
        await content.deleteOne();
        
        // Redirect back to chapter page
        if (chapterId) {
            const chapter = await BookChapter.findById(chapterId).populate('book');
            if (chapter && chapter.book) {
                const bookCategory = await BookName.findById(chapter.book._id).populate('category');
                if (bookCategory && bookCategory.category) {
                    res.redirect(`/book/category/${bookCategory.category._id}/book/${bookCategory._id}/chapter/${chapterId}`);
                    return;
                }
            }
        }
        res.redirect('/book/content');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Export Excel for chapters
router.get('/chapter/export-excel', async (req, res) => {
    try {
        const chapters = await BookChapter.find()
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
        res.setHeader('Content-Disposition', 'attachment; filename="book_chapters.xlsx"');
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
            return res.render('book/chapter/index', {
                chapters: await BookChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                activePage: 'book',
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
            const category = await BookCategory.findOne({ name: row.Category });
            const book = await BookName.findOne({ name: row.Book });

            if (!category || !book) {
                continue; // Skip if category or book not found
            }

            // Create a new chapter instance to trigger the auto-increment
            const chapter = new BookChapter({
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
            res.redirect('/book/chapter');
        } else {
            res.render('book/chapter/index', {
                chapters: await BookChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                activePage: 'book',
                activeSection: 'chapter',
                activeTab: 'chapter',
                error: 'No valid chapter data found in the Excel file.'
            });
        }
    } catch (err) {
        console.error('Error processing Excel file:', err);
        res.render('book/chapter/index', {
            chapters: await BookChapter.find().populate('category').populate('book').sort({ createdAt: -1 }),
            categories: await BookCategory.find(),
            books: await BookName.find(),
            activePage: 'book',
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
                return res.redirect(`/book/category/${categoryId}/book/${bookId}/chapter/${chapterId}?error=Please upload an Excel file.`);
            }
            return res.render('book/content/index', {
                contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                chapters: await BookChapter.find(),
                activePage: 'book',
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
                return res.redirect(`/book/category/${categoryId}/book/${bookId}/chapter/${chapterId}?error=Excel file is empty or has no data rows.`);
            }
            return res.render('book/content/index', {
                contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                chapters: await BookChapter.find(),
                activePage: 'book',
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
            const maxContent = await BookContent.findOne({ chapter: chapterId }).sort({ sequence: -1 });
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
                return res.render('book/content/index', {
                    contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                    categories: await BookCategory.find(),
                    books: await BookName.find(),
                    chapters: await BookChapter.find(),
                    activePage: 'book',
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

                const category = await BookCategory.findOne({ name: row.Category });
                const book = await BookName.findOne({ name: row.Book });
                const chapter = await BookChapter.findOne({ name: row.Chapter });

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
                    const chapterMaxContent = await BookContent.findOne({ chapter: chapter._id }).sort({ sequence: -1 });
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
            await BookContent.insertMany(contents);
            const successMessage = `Successfully imported ${contents.length} records.`;
            const errorMessage = errors.length > 0 ? ` However, ${errors.length} rows had errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}` : '';
            
            // Redirect back to chapter page if chapter context is provided
            if (chapterId && categoryId && bookId) {
                const message = encodeURIComponent(successMessage + errorMessage);
                return res.redirect(`/book/category/${categoryId}/book/${bookId}/chapter/${chapterId}?success=${message}`);
            }
            
            return res.render('book/content/index', {
                contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                chapters: await BookChapter.find(),
                activePage: 'book',
                activeSection: 'content',
                activeTab: 'content',
                success: successMessage + errorMessage
            });
        } else {
            // Redirect back to chapter page if chapter context is provided
            if (chapterId && categoryId && bookId) {
                const errorMsg = encodeURIComponent(`No valid content data found. Errors: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`);
                return res.redirect(`/book/category/${categoryId}/book/${bookId}/chapter/${chapterId}?error=${errorMsg}`);
            }
            
            return res.render('book/content/index', {
                contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ sequence: 1 }),
                categories: await BookCategory.find(),
                books: await BookName.find(),
                chapters: await BookChapter.find(),
                activePage: 'book',
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
            return res.redirect(`/book/category/${categoryId}/book/${bookId}/chapter/${chapterId}?error=${errorMsg}`);
        }
        
        res.render('book/content/index', {
            contents: await BookContent.find().populate('category').populate('book').populate('chapter').sort({ createdAt: -1 }),
            categories: await BookCategory.find(),
            books: await BookName.find(),
            chapters: await BookChapter.find(),
            activePage: 'book',
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
        res.setHeader('Content-Disposition', 'attachment; filename="book_content_upload_template.xlsx"');
        
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
router.get('/debug/books', async (req, res) => {
    try {
        const categories = await BookCategory.find();
        const books = await BookName.find().populate('category');
        const chapters = await BookChapter.find().populate('category').populate('book');
        
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
        
        const category = await BookCategory.findById(categoryId);
        if (!category) {
            console.log('Category not found:', categoryId);
            return res.status(404).send('Category not found');
        }
        
        // Use the category's _id directly for the query
        const books = await BookName.find({ category: category._id })
            .populate('category')
            .sort({ createdAt: -1 });
        
        console.log('Found books:', books.length);
        
        res.render('book/category/books', {
            category,
            books,
            activePage: 'book',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error('Error loading books:', err);
        res.status(500).send('Server Error');
    }
});

// Show chapters in a book
router.get('/category/:categoryId/book/:bookId', async (req, res) => {
    try {
        const category = await BookCategory.findById(req.params.categoryId);
        const book = await BookName.findById(req.params.bookId).populate('category');
        
        if (!category || !book) {
            return res.status(404).send('Category or Book not found');
        }
        
        if (book.category._id.toString() !== category._id.toString()) {
            return res.status(400).send('Book does not belong to this category');
        }
        
        const chapters = await BookChapter.find({ book: req.params.bookId })
            .populate('book')
            .populate('category')
            .sort({ createdAt: -1 });
        
        res.render('book/book/chapters', {
            category,
            book,
            chapters,
            activePage: 'book',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Show content for a chapter
router.get('/category/:categoryId/book/:bookId/chapter/:chapterId', async (req, res) => {
    try {
        const category = await BookCategory.findById(req.params.categoryId);
        const book = await BookName.findById(req.params.bookId).populate('category');
        const chapter = await BookChapter.findById(req.params.chapterId)
            .populate('book')
            .populate('category');
        
        if (!category || !book || !chapter) {
            return res.status(404).send('Category, Book or Chapter not found');
        }
        
        if (book.category._id.toString() !== category._id.toString() ||
            chapter.book._id.toString() !== book._id.toString()) {
            return res.status(400).send('Invalid hierarchy');
        }
        
        const contents = await BookContent.find({ chapter: req.params.chapterId })
            .populate('category')
            .populate('book')
            .populate('chapter')
            .sort({ sequence: 1 });
        
        res.render('book/chapter/contents', {
            category,
            book,
            chapter,
            contents,
            activePage: 'book',
            username: req.session ? req.session.username : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 