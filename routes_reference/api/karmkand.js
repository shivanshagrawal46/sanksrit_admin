const express = require('express');
const router = express.Router();
const KarmkandCategory = require('../../models/KarmkandCategory');
const KarmkandSubCategory = require('../../models/KarmkandSubCategory');
const KarmkandContent = require('../../models/KarmkandContent');

// ============================================
// CACHING SYSTEM FOR vishesh_suchi
// ============================================
const karmkandVisheshSuchiCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

function getCachedKarmkandVisheshSuchi(subcategoryId) {
    const cached = karmkandVisheshSuchiCache.get(subcategoryId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedKarmkandVisheshSuchi(subcategoryId, data) {
    karmkandVisheshSuchiCache.set(subcategoryId, {
        data,
        timestamp: Date.now()
    });
}

// Clear cache for a subcategory (call this when content is added/updated/deleted)
function clearKarmkandVisheshSuchiCache(subcategoryId) {
    if (subcategoryId) {
        karmkandVisheshSuchiCache.delete(subcategoryId);
    } else {
        karmkandVisheshSuchiCache.clear();
    }
}

// Export cache clearing function for use in content routes
router.clearKarmkandVisheshSuchiCache = clearKarmkandVisheshSuchiCache;

// Hindi alphabet order for sorting (numbers first, then Hindi letters)
const hindiAlphabet = [
    'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
    'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'न',
    'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
    'क्ष', 'ज्ञ', 'ल'
];

// Create a map for quick lookup
const hindiCharOrder = {};
hindiAlphabet.forEach((char, index) => {
    // Add offset of 10 to make room for numbers 0-9
    hindiCharOrder[char] = index + 10;
});

// Function to check if string starts with a number
function startsWithNumber(str) {
    if (!str || typeof str !== 'string' || str.length === 0) return false;
    const trimmed = str.trim();
    const firstChar = trimmed[0];
    return /[0-9०-९]/.test(firstChar); // Check both English and Hindi numerals
}

// Function to get number value from start of string
function getNumberValue(str) {
    if (!str || typeof str !== 'string' || str.length === 0) return null;
    const trimmed = str.trim();
    const firstChar = trimmed[0];
    
    // English numerals
    if (/[0-9]/.test(firstChar)) {
        return parseInt(firstChar, 10);
    }
    
    // Hindi numerals (०-९ map to 0-9)
    const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const index = hindiNumerals.indexOf(firstChar);
    if (index !== -1) {
        return index;
    }
    
    return null;
}

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

// Function to compare two Hindi words (with number support)
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

    // Check if strings start with numbers
    const str1StartsWithNumber = startsWithNumber(str1);
    const str2StartsWithNumber = startsWithNumber(str2);

    // If both start with numbers, compare numbers
    if (str1StartsWithNumber && str2StartsWithNumber) {
        const num1 = getNumberValue(str1);
        const num2 = getNumberValue(str2);
        if (num1 !== num2) {
            return num1 - num2;
        }
        // If numbers are the same, compare the rest
        const remaining1 = str1.substring(1).trim();
        const remaining2 = str2.substring(1).trim();
        if (remaining1.length > 0 && remaining2.length > 0) {
            return compareHindiWords(remaining1, remaining2);
        }
        return remaining1.length - remaining2.length;
    }

    // If only one starts with number, numbers come first
    if (str1StartsWithNumber) return -1;
    if (str2StartsWithNumber) return 1;

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

// GET /api/karmkand/category - Get all categories - OPTIMIZED
router.get('/category', async (req, res) => {
    try {
        const categories = await KarmkandCategory.find()
            .sort({ position: 1 })
            .select('id name position introduction cover_image -_id')
            .lean(); // Use lean() for faster queries

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// GET /api/karmkand/category/:categoryId - Get all subcategories for a category - OPTIMIZED
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if category exists - use lean() for faster queries
        const category = await KarmkandCategory.findOne({ id: categoryId }).lean();
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const subcategories = await KarmkandSubCategory.find({ parentCategory: category._id })
            .sort({ position: 1 })
            .select('id name position introduction cover_image -_id')
            .lean(); // Use lean() for faster queries

        res.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// GET /api/karmkand/category/:categoryId/:subcategoryId - Get all contents for a subcategory with pagination - OPTIMIZED
router.get('/category/:categoryId/:subcategoryId', async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Use lean() for faster queries (returns plain JS objects instead of Mongoose docs)
        const category = await KarmkandCategory.findOne({ id: categoryId }).lean();
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Check if subcategory exists and belongs to the category
        const subcategory = await KarmkandSubCategory.findOne({
            id: subcategoryId,
            parentCategory: category._id
        }).lean();
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                error: 'Subcategory not found'
            });
        }

        const subcategoryIdStr = subcategory._id.toString();

        // ============================================
        // OPTIMIZATION 1: Get vishesh_suchi from cache or compute efficiently
        // ============================================
        let vishesh_suchi = getCachedKarmkandVisheshSuchi(subcategoryIdStr);

        if (!vishesh_suchi) {
            // Use MongoDB aggregation to extract unique search terms efficiently
            const searchTermsResult = await KarmkandContent.aggregate([
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
            setCachedKarmkandVisheshSuchi(subcategoryIdStr, vishesh_suchi);
        }

        // ============================================
        // OPTIMIZATION 2: Get total count efficiently (single count query)
        // ============================================
        const total = await KarmkandContent.countDocuments({ subCategory: subcategory._id });

        // ============================================
        // OPTIMIZATION 3: Get ONLY the paginated contents with Hindi collation sorting
        // ============================================
        let contents;
        try {
            contents = await KarmkandContent.find({ subCategory: subcategory._id })
                .select('id hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image sequenceNo -_id')
                .collation({ locale: 'hi', strength: 1 })
                .sort({ hindiWord: 1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (collationError) {
            // Fallback: If collation fails, use a hybrid approach
            const allContentsForSort = await KarmkandContent.find({ subCategory: subcategory._id })
                .select('id hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image sequenceNo -_id')
                .lean();

            // Sort using custom Hindi sorting
            const sortedContents = sortByHindiWord(allContentsForSort);
            contents = sortedContents.slice(skip, skip + limit);
        }

        res.json({
            success: true,
            data: {
                contents,
                vishesh_suchi,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        console.error('Error in karmkand category/subcategory API:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

module.exports = router; 