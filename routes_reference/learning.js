const express = require('express');
const router = express.Router();
const LearningCategory = require('../models/LearningCategory');
const LearningChapter = require('../models/LearningChapter');
const LearningContent = require('../models/LearningContent');

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

// Main learning page with navigation
router.get('/', requireAuth, (req, res) => {
    res.render('learning/index', { activePage: 'learning' });
});

// Categories Routes
router.get('/categories', requireAuth, async (req, res) => {
    try {
        const categories = await LearningCategory.find().sort({ position: 1 });
        res.render('learning/category/index', { 
            categories,
            activePage: 'learning',
            activeSection: 'category',
            activeTab: 'category'
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});

// Add Category Page
router.get('/categories/add', requireAuth, (req, res) => {
    res.render('learning/category/add', {
        activePage: 'learning',
        activeSection: 'category'
    });
});

// Add Category Action
router.post('/categories/add', requireAuth, async (req, res) => {
    try {
        const { name, fee, plan, demo, introduction, position, isActive } = req.body;
        const category = new LearningCategory({
            name,
            fee,
            plan,
            demo,
            introduction,
            position,
            isActive: isActive === 'on'
        });
        await category.save();
        res.redirect('/learning/categories');
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).send('Error adding category');
    }
});

// Edit Category Page
router.get('/categories/edit/:id', requireAuth, async (req, res) => {
    try {
        const category = await LearningCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('learning/category/edit', {
            category,
            activePage: 'learning',
            activeSection: 'category'
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).send('Error fetching category');
    }
});

// Edit Category Action
router.post('/categories/edit/:id', requireAuth, async (req, res) => {
    try {
        const { name, fee, plan, demo, introduction, position, isActive } = req.body;
        const category = await LearningCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        category.name = name;
        category.fee = fee;
        category.plan = plan;
        category.demo = demo;
        category.introduction = introduction;
        category.position = position;
        category.isActive = isActive === 'on';
        await category.save();
        res.redirect('/learning/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Error updating category');
    }
});

// Delete Category
router.post('/categories/delete/:id', requireAuth, async (req, res) => {
    try {
        await LearningCategory.findByIdAndDelete(req.params.id);
        res.redirect('/learning/categories');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Error deleting category');
    }
});

// Chapters Routes
router.get('/chapters', requireAuth, async (req, res) => {
    try {
        const chapters = await LearningChapter.find()
            .populate({
                path: 'category',
                select: 'name'
            })
            .sort({ position: 1 });

        if (!chapters) {
            return res.render('learning/chapter/index', {
                chapters: [],
                activePage: 'learning',
                activeSection: 'chapter',
                activeTab: 'chapter'
            });
        }

        res.render('learning/chapter/index', {
            chapters,
            activePage: 'learning',
            activeSection: 'chapter',
            activeTab: 'chapter'
        });
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).render('error', { 
            message: 'Error fetching chapters',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Add Chapter Page
router.get('/chapters/add', requireAuth, async (req, res) => {
    try {
        const categories = await LearningCategory.find()
            .select('name')
            .sort({ name: 1 });

        res.render('learning/chapter/add', {
            categories: categories || [],
            selectedCategory: req.query.category || '',
            activePage: 'learning',
            activeSection: 'chapter'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Error loading add chapter page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Get chapters for a specific category
router.get('/chapters/:categoryId', requireAuth, async (req, res) => {
    try {
        const category = await LearningCategory.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).render('error', { 
                message: 'Category not found',
                error: {}
            });
        }

        const chapters = await LearningChapter.find({ category: req.params.categoryId })
            .sort({ position: 1 });

        res.render('learning/chapter/category', {
            category,
            chapters: chapters || [],
            activePage: 'learning',
            activeSection: 'chapter',
            activeTab: 'chapter'
        });
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).render('error', { 
            message: 'Error fetching chapters',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Add Chapter Action
router.post('/chapters/add', requireAuth, async (req, res) => {
    try {
        const { name, position, isActive, category } = req.body;
        const chapter = new LearningChapter({
            name,
            position,
            isActive: isActive === 'on',
            category
        });
        await chapter.save();
        res.redirect('/learning/chapters');
    } catch (error) {
        console.error('Error adding chapter:', error);
        res.status(500).send('Error adding chapter');
    }
});

// Edit Chapter Page
router.get('/chapters/edit/:id', requireAuth, async (req, res) => {
    try {
        const chapter = await LearningChapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        const categories = await LearningCategory.find().sort({ name: 1 });
        res.render('learning/chapter/edit', {
            chapter,
            categories,
            activePage: 'learning',
            activeSection: 'chapter'
        });
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).send('Error fetching chapter');
    }
});

// Edit Chapter Action
router.post('/chapters/edit/:id', requireAuth, async (req, res) => {
    try {
        const { name, position, isActive, category } = req.body;
        const chapter = await LearningChapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        chapter.name = name;
        chapter.position = position;
        chapter.isActive = isActive === 'on';
        chapter.category = category;
        await chapter.save();
        res.redirect('/learning/chapters');
    } catch (error) {
        console.error('Error updating chapter:', error);
        res.status(500).send('Error updating chapter');
    }
});

// Delete Chapter
router.post('/chapters/delete/:id', requireAuth, async (req, res) => {
    try {
        const chapter = await LearningChapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        await LearningChapter.findByIdAndDelete(req.params.id);
        res.redirect('/learning/chapters');
    } catch (error) {
        console.error('Error deleting chapter:', error);
        res.status(500).send('Error deleting chapter');
    }
});

// Contents Routes
router.get('/contents', requireAuth, async (req, res) => {
    try {
        const contents = await LearningContent.find()
            .populate({
                path: 'chapter',
                populate: {
                    path: 'category'
                }
            })
            .sort({ position: 1 });

        res.render('learning/content/index', {
            contents,
            activePage: 'learning',
            activeSection: 'content',
            activeTab: 'content'
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).send('Error fetching contents');
    }
});

// Get contents for a specific chapter
router.get('/contents/:chapterId', requireAuth, async (req, res) => {
    try {
        const chapter = await LearningChapter.findById(req.params.chapterId)
            .populate('category');
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        const contents = await LearningContent.find({ chapter: req.params.chapterId })
            .sort({ position: 1 });
        res.render('learning/content/chapter', { 
            chapter,
            contents,
            activePage: 'learning',
            activeSection: 'content',
            activeTab: 'content'
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).send('Error fetching contents');
    }
});

// Add Content - Select Category and Chapter Page
router.get('/contents/add', requireAuth, async (req, res) => {
    try {
        const categories = await LearningCategory.find().sort({ name: 1 });
        res.render('learning/content/selectChapter', {
            categories,
            activePage: 'learning',
            activeSection: 'content',
            activeTab: 'content',
            selectedCategory: req.query.category || '',
            selectedChapter: req.query.chapter || ''
        });
    } catch (error) {
        console.error('Error loading select chapter page:', error);
        res.status(500).render('error', {
            message: 'Error loading select chapter page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Add Content Page for a specific chapter (must come after the above)
router.get('/contents/add/:chapterId', requireAuth, async (req, res) => {
    try {
        const chapter = await LearningChapter.findById(req.params.chapterId).populate('category');
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        res.render('learning/content/add', {
            chapter,
            activePage: 'learning',
            activeSection: 'content'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error');
    }
});

// Add Content Action
router.post('/contents/add/:chapterId', requireAuth, async (req, res) => {
    try {
        const { title, content, position, isActive } = req.body;
        const learningContent = new LearningContent({
            title,
            content,
            position,
            isActive: isActive === 'on',
            chapter: req.params.chapterId
        });
        await learningContent.save();
        res.redirect(`/learning/contents/${req.params.chapterId}`);
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).send('Error adding content');
    }
});

// Edit Content Page
router.get('/contents/edit/:id', requireAuth, async (req, res) => {
    try {
        const content = await LearningContent.findById(req.params.id);
        if (!content) {
            return res.status(404).send('Content not found');
        }
        const chapter = await LearningChapter.findById(content.chapter)
            .populate('category');
        res.render('learning/content/edit', {
            content,
            chapter,
            activePage: 'learning',
            activeSection: 'content'
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).send('Error fetching content');
    }
});

// Edit Content Action
router.post('/contents/edit/:id', requireAuth, async (req, res) => {
    try {
        const { title, content, position, isActive } = req.body;
        const learningContent = await LearningContent.findById(req.params.id);
        if (!learningContent) {
            return res.status(404).send('Content not found');
        }
        learningContent.title = title;
        learningContent.content = content;
        learningContent.position = position;
        learningContent.isActive = isActive === 'on';
        await learningContent.save();
        res.redirect(`/learning/contents/${learningContent.chapter}`);
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).send('Error updating content');
    }
});

// Delete Content
router.post('/contents/delete/:id', requireAuth, async (req, res) => {
    try {
        const content = await LearningContent.findById(req.params.id);
        if (!content) {
            return res.status(404).send('Content not found');
        }
        await LearningContent.findByIdAndDelete(req.params.id);
        res.redirect(`/learning/contents/${content.chapter}`);
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).send('Error deleting content');
    }
});

// API: Get all categories
router.get('/api/learning/category', requireAuth, async (req, res) => {
    try {
        const categories = await LearningCategory.find().sort({ name: 1 });
        // Remove _id from response
        const categoriesClean = categories.map(cat => {
            const obj = cat.toObject();
            delete obj._id;
            return obj;
        });
        res.json({ success: true, categories: categoriesClean });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories', error });
    }
});

// API: Get all chapters for a category (by custom id)
router.get('/api/learning/category/:categoryId', requireAuth, async (req, res) => {
    try {
        const category = await LearningCategory.findOne({ id: req.params.categoryId });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        const chapters = await LearningChapter.find({ category: category._id }).sort({ position: 1 });
        // Remove _id and category from response, use custom id
        const chaptersClean = chapters.map(chap => {
            const obj = chap.toObject();
            delete obj._id;
            delete obj.category;
            return obj;
        });
        res.json({ success: true, chapters: chaptersClean });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching chapters', error });
    }
});

// API: Get all contents for a chapter in a category (by custom id) with pagination
router.get('/api/learning/category/:categoryId/:chapterId', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const category = await LearningCategory.findOne({ id: req.params.categoryId });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        const chapter = await LearningChapter.findOne({ id: req.params.chapterId, category: category._id });
        if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

        const totalItems = await LearningContent.countDocuments({ chapter: chapter._id });
        const totalPages = Math.ceil(totalItems / limit);
        const contents = await LearningContent.find({ chapter: chapter._id })
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit);
        // Remove _id and chapter from response
        const contentsClean = contents.map(cont => {
            const obj = cont.toObject();
            delete obj._id;
            delete obj.chapter;
            return obj;
        });
        res.json({
            success: true,
            contents: contentsClean,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching contents', error });
    }
});

module.exports = router; 