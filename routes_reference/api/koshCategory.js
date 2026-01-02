const express = require('express');
const router = express.Router();
const KoshCategory = require('../../models/KoshCategory');
const auth = require('../../middleware/auth');

// ============================================
// CACHING SYSTEM FOR vishesh_suchi
// ============================================
const visheshSuchiCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

function getCachedVisheshSuchi(subcategoryId) {
    const cached = visheshSuchiCache.get(subcategoryId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedVisheshSuchi(subcategoryId, data) {
    visheshSuchiCache.set(subcategoryId, {
        data,
        timestamp: Date.now()
    });
}

// Clear cache for a subcategory (call this when content is added/updated/deleted)
function clearVisheshSuchiCache(subcategoryId) {
    if (subcategoryId) {
        visheshSuchiCache.delete(subcategoryId);
    } else {
        visheshSuchiCache.clear();
    }
}

// Export cache clearing function for use in content routes
router.clearVisheshSuchiCache = clearVisheshSuchiCache;

// Hindi alphabet order for sorting
const hindiAlphabet = [
    'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
    'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'न',
    'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
    'क्ष', 'ज्ञ', 'ल'
];

// Create a map for quick lookup
const hindiCharOrder = {};
hindiAlphabet.forEach((char, index) => {
    hindiCharOrder[char] = index;
});

// Function to get Hindi character order index
function getHindiCharOrder(char) {
    // Check for compound characters first (क्ष, ज्ञ)
    if (char.length > 1) {
        if (hindiCharOrder.hasOwnProperty(char)) {
            return hindiCharOrder[char];
        }
    }
    // Check single character
    if (hindiCharOrder.hasOwnProperty(char)) {
        return hindiCharOrder[char];
    }
    // If character not found, return a high number to push it to the end
    return 9999;
}

// Function to check if a character is a Hindi character
function isHindiChar(char) {
    if (!char || char.length === 0) return false;
    // First check if it's in our alphabet (most reliable)
    if (hindiCharOrder.hasOwnProperty(char)) return true;
    // Also check if character is in Devanagari Unicode range (0900-097F)
    const code = char.charCodeAt(0);
    return (code >= 0x0900 && code <= 0x097F);
}

// Function to get the first Hindi character from a string
function getFirstHindiChar(str) {
    if (!str || typeof str !== 'string') return '';
    
    const trimmed = str.trim();
    if (trimmed.length === 0) return '';
    
    // Find the first Hindi character (skip spaces, hyphens, etc.)
    let startIndex = 0;
    while (startIndex < trimmed.length && !isHindiChar(trimmed[startIndex])) {
        startIndex++;
    }
    
    if (startIndex >= trimmed.length) return '';
    
    // Check for compound characters first (क्ष, ज्ञ) - look at first 2 characters from start
    if (startIndex + 2 <= trimmed.length) {
        const twoChar = trimmed.substring(startIndex, startIndex + 2);
        if (hindiCharOrder.hasOwnProperty(twoChar)) {
            return twoChar;
        }
    }
    
    // Return first single Hindi character
    return trimmed[startIndex];
}

// Function to find the start index of the first Hindi character
function findFirstHindiCharIndex(str) {
    if (!str || typeof str !== 'string') return -1;
    
    const trimmed = str.trim();
    if (trimmed.length === 0) return -1;
    
    // Find the first Hindi character (skip spaces, hyphens, etc.)
    for (let i = 0; i < trimmed.length; i++) {
        if (isHindiChar(trimmed[i])) {
            // Check if it's part of a compound character
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

// Function to compare two Hindi words
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

    // Get first Hindi characters
    const firstChar1 = getFirstHindiChar(str1);
    const firstChar2 = getFirstHindiChar(str2);

    // If we can't find Hindi characters, compare as strings
    if (!firstChar1 && !firstChar2) {
        return str1.localeCompare(str2, 'hi');
    }
    if (!firstChar1) return 1;
    if (!firstChar2) return -1;

    // Compare first characters
    const order1 = getHindiCharOrder(firstChar1);
    const order2 = getHindiCharOrder(firstChar2);

    if (order1 !== order2) {
        return order1 - order2;
    }

    // If first characters are the same, compare the rest of the string
    // Find where the first Hindi character starts
    const index1 = findFirstHindiCharIndex(str1);
    const index2 = findFirstHindiCharIndex(str2);
    
    const skip1 = index1 >= 0 ? index1 + firstChar1.length : str1.length;
    const skip2 = index2 >= 0 ? index2 + firstChar2.length : str2.length;
    
    const remaining1 = str1.substring(skip1).trim();
    const remaining2 = str2.substring(skip2).trim();

    // If both have remaining characters, compare them
    if (remaining1.length > 0 && remaining2.length > 0) {
        return compareHindiWords(remaining1, remaining2);
    }

    // If one is empty, shorter comes first
    return remaining1.length - remaining2.length;
}

// Function to sort contents by Hindi word
function sortByHindiWord(contents) {
    // Create a copy to avoid mutating the original array
    const contentsCopy = [...contents];
    return contentsCopy.sort((a, b) => {
        const hindiWord1 = a.hindiWord || '';
        const hindiWord2 = b.hindiWord || '';
        const result = compareHindiWords(hindiWord1, hindiWord2);
        return result;
    });
}

// Get all Kosh Categories with pagination (integer id)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const categories = await KoshCategory.find()
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit)
            .select('-_id id name position introduction createdAt');

        const total = await KoshCategory.countDocuments();

        res.json({
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all subcategories in a category (by integer id, paginated)
router.get('/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const KoshSubCategory = require('../../models/KoshSubCategory');
        const category = await KoshCategory.findOne({ id: parseInt(req.params.categoryId) });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        const subcategories = await KoshSubCategory.find({ parentCategory: category._id })
            .sort({ position: 1 })
            .skip(skip)
            .limit(limit)
            .select('-_id id name position introduction cover_image createdAt');
        const total = await KoshSubCategory.countDocuments({ parentCategory: category._id });
        res.json({
            subcategories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSubcategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all content in a subcategory (by integer id, paginated) - OPTIMIZED
router.get('/:categoryId/:subCategoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const KoshSubCategory = require('../../models/KoshSubCategory');
        const KoshContent = require('../../models/KoshContent');
        
        // Use lean() for faster queries (returns plain JS objects instead of Mongoose docs)
        const category = await KoshCategory.findOne({ id: parseInt(req.params.categoryId) }).lean();
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        const subcategory = await KoshSubCategory.findOne({ 
            id: parseInt(req.params.subCategoryId), 
            parentCategory: category._id 
        }).lean();
        if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });
        
        const subcategoryId = subcategory._id.toString();
        
        // ============================================
        // OPTIMIZATION 1: Get vishesh_suchi from cache or compute efficiently
        // ============================================
        let vishesh_suchi = getCachedVisheshSuchi(subcategoryId);
        
        if (!vishesh_suchi) {
            // Use MongoDB aggregation to extract unique search terms efficiently
            const searchTermsResult = await KoshContent.aggregate([
                { $match: { subCategory: subcategory._id } },
                { $match: { search: { $exists: true, $ne: null, $ne: '' } } },
                { $project: { search: 1 } },
                { $group: { _id: null, allSearchTerms: { $push: '$search' } } }
            ]);
            
            const searchTermsSet = new Set();
            if (searchTermsResult.length > 0 && searchTermsResult[0].allSearchTerms) {
                searchTermsResult[0].allSearchTerms.forEach(searchStr => {
                    if (searchStr && typeof searchStr === 'string') {
                        const terms = searchStr.split(',')
                            .map(term => term.trim())
                            .filter(term => term !== '');
                        terms.forEach(term => searchTermsSet.add(term));
                    }
                });
            }
            vishesh_suchi = Array.from(searchTermsSet).sort();
            
            // Cache for future requests
            setCachedVisheshSuchi(subcategoryId, vishesh_suchi);
        }
        
        // ============================================
        // OPTIMIZATION 2: Get total count efficiently (single count query)
        // ============================================
        const total = await KoshContent.countDocuments({ subCategory: subcategory._id });
        
        // ============================================
        // OPTIMIZATION 3: Get ONLY the paginated contents with Hindi collation sorting
        // ============================================
        // First try MongoDB's Hindi collation for sorting
        let contents;
        try {
            contents = await KoshContent.find({ subCategory: subcategory._id })
                .select('-_id id sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt')
                .collation({ locale: 'hi', strength: 1 })
                .sort({ hindiWord: 1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (collationError) {
            // Fallback: If collation fails, use a hybrid approach
            // Get slightly more than needed, sort in memory, then slice
            const batchSize = Math.min(total, 500); // Get max 500 for sorting
            const allContentsForSort = await KoshContent.find({ subCategory: subcategory._id })
                .select('-_id id sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt')
                .lean();
            
            // Sort using custom Hindi sorting
            const sortedContents = sortByHindiWord(allContentsForSort);
            contents = sortedContents.slice(skip, skip + limit);
        }
        
        res.json({
            contents,
            vishesh_suchi: vishesh_suchi,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        });
    } catch (error) {
        console.error('Error in category/subcategory API:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single Kosh Category
router.get('/:id', async (req, res) => {
    try {
        const category = await KoshCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new Kosh Category (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const category = new KoshCategory({
            name: req.body.name,
            description: req.body.description,
            position: req.body.position,
            isActive: req.body.isActive
        });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a Kosh Category (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const category = await KoshCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = req.body.name;
        category.description = req.body.description;
        category.position = req.body.position;
        category.isActive = req.body.isActive;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a Kosh Category (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await KoshCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await category.remove();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 