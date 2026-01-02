const express = require('express');
const router = express.Router();
const KoshContent = require('../../models/KoshContent');
const auth = require('../../middleware/auth');

console.log('[Kosh Content API] MongoDB native Hindi sorting with collation enabled');

// Get all Kosh Contents with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const total = await KoshContent.countDocuments();

        // Get paginated contents with MongoDB native sorting
        const contents = await KoshContent.find()
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .collation({ locale: 'hi', strength: 1 })
            .sort({ hindiWord: 1, englishWord: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        res.json({
            contents,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search Kosh Contents
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = {
            $or: [
                { hindiWord: { $regex: query, $options: 'i' } },
                { englishWord: { $regex: query, $options: 'i' } },
                { hinglishWord: { $regex: query, $options: 'i' } },
                { meaning: { $regex: query, $options: 'i' } }
            ]
        };

        // Get total count
        const total = await KoshContent.countDocuments(searchQuery);

        // Get paginated contents with MongoDB native sorting
        const contents = await KoshContent.find(searchQuery)
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .collation({ locale: 'hi', strength: 1 })
            .sort({ hindiWord: 1, englishWord: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            contents,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get contents by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get subcategories for this category
        const KoshSubCategory = require('../../models/KoshSubCategory');
        const subcategories = await KoshSubCategory.find({ parentCategory: req.params.categoryId });
        const subcategoryIds = subcategories.map(sub => sub._id);

        // Get total count
        const total = await KoshContent.countDocuments({ subCategory: { $in: subcategoryIds } });

        // Get paginated contents with MongoDB native sorting
        const contents = await KoshContent.find({ subCategory: { $in: subcategoryIds } })
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .collation({ locale: 'hi', strength: 1 })
            .sort({ hindiWord: 1, englishWord: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get all search fields for vishesh_suchi (only search field, not full content)
        const allSearchFields = await KoshContent.find({ subCategory: { $in: subcategoryIds } })
            .select('search')
            .lean();

        // Process search terms efficiently
        const searchTermsSet = new Set();
        allSearchFields.forEach((content) => {
            if (content.search && typeof content.search === 'string' && content.search.trim() !== '') {
                const terms = content.search.split(',')
                    .map(term => term.trim())
                    .filter(term => term !== '');
                terms.forEach(term => searchTermsSet.add(term));
            }
        });

        // Convert Set to sorted array
        const vishesh_suchi = Array.from(searchTermsSet).sort();

        res.json({
            vishesh_suchi: vishesh_suchi,
            contents,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get contents by subcategory
router.get('/subcategory/:subcategoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const total = await KoshContent.countDocuments({ subCategory: req.params.subcategoryId });

        // Get paginated contents with MongoDB native sorting (much more efficient!)
        const contents = await KoshContent.find({ subCategory: req.params.subcategoryId })
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .collation({ locale: 'hi', strength: 1 })  // Hindi collation for proper sorting
            .sort({ hindiWord: 1, englishWord: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get all contents ONLY for vishesh_suchi (just search field, not full content)
        const allSearchFields = await KoshContent.find({ subCategory: req.params.subcategoryId })
            .select('search')
            .lean();

        // Process search terms efficiently
        const searchTermsSet = new Set();
        allSearchFields.forEach((content) => {
            if (content.search && typeof content.search === 'string' && content.search.trim() !== '') {
                const terms = content.search.split(',')
                    .map(term => term.trim())
                    .filter(term => term !== '');
                terms.forEach(term => searchTermsSet.add(term));
            }
        });

        // Convert Set to sorted array
        const vishesh_suchi = Array.from(searchTermsSet).sort();

        // Build response
        const response = {
            vishesh_suchi: vishesh_suchi,
            contents: contents,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        };

        res.json(response);
    } catch (error) {
        console.error('Error in subcategory API:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single Kosh Content
router.get('/:id', async (req, res) => {
    try {
        const content = await KoshContent.findById(req.params.id)
            .populate('subCategory', 'name');
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Kosh Content (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const content = new KoshContent({
            subCategory: req.body.subCategory,
            sequenceNo: req.body.sequenceNo,
            hindiWord: req.body.hindiWord,
            englishWord: req.body.englishWord,
            hinglishWord: req.body.hinglishWord,
            meaning: req.body.meaning,
            extra: req.body.extra,
            structure: req.body.structure,
            search: req.body.search,
            youtubeLink: req.body.youtubeLink,
            image: req.body.image
        });
        const newContent = await content.save();
        res.status(201).json(newContent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a Kosh Content (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const content = await KoshContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        if (req.body.subCategory !== undefined) content.subCategory = req.body.subCategory;
        if (req.body.sequenceNo !== undefined) content.sequenceNo = req.body.sequenceNo;
        if (req.body.hindiWord !== undefined) content.hindiWord = req.body.hindiWord;
        if (req.body.englishWord !== undefined) content.englishWord = req.body.englishWord;
        if (req.body.hinglishWord !== undefined) content.hinglishWord = req.body.hinglishWord;
        if (req.body.meaning !== undefined) content.meaning = req.body.meaning;
        if (req.body.extra !== undefined) content.extra = req.body.extra;
        if (req.body.structure !== undefined) content.structure = req.body.structure;
        if (req.body.search !== undefined) content.search = req.body.search;
        if (req.body.youtubeLink !== undefined) content.youtubeLink = req.body.youtubeLink;
        if (req.body.image !== undefined) content.image = req.body.image;

        const updatedContent = await content.save();
        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a Kosh Content (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const content = await KoshContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        await KoshContent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
