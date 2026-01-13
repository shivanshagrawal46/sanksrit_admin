const express = require('express');
const router = express.Router();
const KoshContent = require('../../models/KoshContent');
const auth = require('../../middleware/auth');

console.log('[Kosh Content API] Custom JavaScript Hindi alphabetical sorting enabled');

// Hindi alphabet order for precise sorting
const hindiAlphabet = [
    'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
    'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'न',
    'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
    'क्ष', 'ज्ञ', 'ल'
];

const hindiCharOrder = {};
hindiAlphabet.forEach((char, index) => {
    hindiCharOrder[char] = index;
});

function getHindiCharOrder(char) {
    if (char.length > 1 && hindiCharOrder.hasOwnProperty(char)) {
        return hindiCharOrder[char];
    }
    if (hindiCharOrder.hasOwnProperty(char)) {
        return hindiCharOrder[char];
    }
    return 9999;
}

function isHindiChar(char) {
    if (!char || char.length === 0) return false;
    if (hindiCharOrder.hasOwnProperty(char)) return true;
    const code = char.charCodeAt(0);
    return (code >= 0x0900 && code <= 0x097F);
}

function getFirstHindiChar(str) {
    if (!str || typeof str !== 'string') return '';
    const trimmed = str.trim();
    if (trimmed.length === 0) return '';
    
    let startIndex = 0;
    while (startIndex < trimmed.length && !isHindiChar(trimmed[startIndex])) {
        startIndex++;
    }
    if (startIndex >= trimmed.length) return '';
    
    if (startIndex + 2 <= trimmed.length) {
        const twoChar = trimmed.substring(startIndex, startIndex + 2);
        if (hindiCharOrder.hasOwnProperty(twoChar)) {
            return twoChar;
        }
    }
    return trimmed[startIndex];
}

function findFirstHindiCharIndex(str) {
    if (!str || typeof str !== 'string') return -1;
    const trimmed = str.trim();
    if (trimmed.length === 0) return -1;
    
    for (let i = 0; i < trimmed.length; i++) {
        if (isHindiChar(trimmed[i])) {
            if (i + 1 < trimmed.length) {
                const twoChar = trimmed.substring(i, i + 2);
                if (hindiCharOrder.hasOwnProperty(twoChar)) {
                    return i;
                }
            }
            return i;
        }
    }
    return -1;
}

function compareHindiWords(word1, word2) {
    if (!word1 || !word2) {
        if (!word1 && !word2) return 0;
        if (!word1) return 1;
        return -1;
    }

    const str1 = String(word1).trim();
    const str2 = String(word2).trim();

    if (str1.length === 0 && str2.length === 0) return 0;
    if (str1.length === 0) return 1;
    if (str2.length === 0) return -1;

    const firstChar1 = getFirstHindiChar(str1);
    const firstChar2 = getFirstHindiChar(str2);

    if (!firstChar1 && !firstChar2) {
        return str1.localeCompare(str2, 'hi');
    }
    if (!firstChar1) return 1;
    if (!firstChar2) return -1;

    const order1 = getHindiCharOrder(firstChar1);
    const order2 = getHindiCharOrder(firstChar2);

    if (order1 !== order2) {
        return order1 - order2;
    }

    const index1 = findFirstHindiCharIndex(str1);
    const index2 = findFirstHindiCharIndex(str2);
    
    const skip1 = index1 >= 0 ? index1 + firstChar1.length : str1.length;
    const skip2 = index2 >= 0 ? index2 + firstChar2.length : str2.length;
    
    const remaining1 = str1.substring(skip1).trim();
    const remaining2 = str2.substring(skip2).trim();

    if (remaining1.length > 0 && remaining2.length > 0) {
        return compareHindiWords(remaining1, remaining2);
    }

    return remaining1.length - remaining2.length;
}

function sortByHindiWord(contents) {
    const contentsCopy = [...contents];
    return contentsCopy.sort((a, b) => {
        const hindiWord1 = a.hindiWord || '';
        const hindiWord2 = b.hindiWord || '';
        return compareHindiWords(hindiWord1, hindiWord2);
    });
}

// Get all Kosh Contents with pagination
// NOTE: This route loads ALL content for proper sorting - use subcategory routes instead for better performance
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get ALL contents for proper Hindi alphabetical sorting
        const allContents = await KoshContent.find()
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .lean();

        // Sort using custom Hindi alphabetical order
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination AFTER sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);
        
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

        // Get all search results for proper sorting
        const allContents = await KoshContent.find(searchQuery)
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .lean();

        // Sort using custom Hindi alphabetical order
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination AFTER sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);

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

        // Get ALL contents for this category for proper sorting
        const allContents = await KoshContent.find({ subCategory: { $in: subcategoryIds } })
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .lean();

        // Sort using custom Hindi alphabetical order
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination AFTER sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);

        // Process search terms for vishesh_suchi
        const searchTermsSet = new Set();
        allContents.forEach((content) => {
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

        // Get ALL contents for this subcategory (for proper sorting and vishesh_suchi)
        // This is manageable as it's per-subcategory, not all 5000+ items
        const allContents = await KoshContent.find({ subCategory: req.params.subcategoryId })
            .select('sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt id subCategory')
            .populate('subCategory', 'name')
            .lean();

        // Sort using custom Hindi alphabetical order
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination AFTER sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);

        // Process search terms for vishesh_suchi
        const searchTermsSet = new Set();
        allContents.forEach((content) => {
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
