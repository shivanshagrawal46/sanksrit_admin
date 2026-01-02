const express = require('express');
const router = express.Router();
const KoshContent = require('../../models/KoshContent');
const auth = require('../../middleware/auth');

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

// Get all Kosh Contents with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all contents for sorting
        const allContents = await KoshContent.find()
            .populate('category', 'name')
            .populate('subcategory', 'name');

        // Sort all contents by Hindi word alphabetically
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination after sorting
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
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { keywords: { $regex: query, $options: 'i' } }
            ]
        };

        const contents = await KoshContent.find(searchQuery)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await KoshContent.countDocuments(searchQuery);

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

        // Get all contents for vishesh_suchi and sorting
        const allContents = await KoshContent.find({ category: req.params.categoryId })
            .populate('category', 'name')
            .populate('subcategory', 'name');
        console.log('Category API - Found total contents:', allContents.length);

        // Process search terms
        const searchTermsSet = new Set();
        allContents.forEach((content, index) => {
            console.log(`Category Content ${index + 1} search field: "${content.search}"`);
            if (content.search && typeof content.search === 'string' && content.search.trim() !== '') {
                const terms = content.search.split(',')
                    .map(term => term.trim())
                    .filter(term => term !== '');
                terms.forEach(term => searchTermsSet.add(term));
            }
        });

        // Convert Set to sorted array
        const vishesh_suchi = Array.from(searchTermsSet).sort();

        // Sort all contents by Hindi word alphabetically
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination after sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);

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

        // Get all contents for vishesh_suchi and sorting
        const allContents = await KoshContent.find({ subCategory: req.params.subcategoryId })
            .populate('subCategory', 'name');
        console.log('1. Found total contents for subcategory:', allContents.length);

        // Process search terms
        const searchTermsSet = new Set();
        allContents.forEach((content, index) => {
            console.log(`Content ${index + 1} search field: "${content.search}" (type: ${typeof content.search})`);
            if (content.search && typeof content.search === 'string' && content.search.trim() !== '') {
                const terms = content.search.split(',')
                    .map(term => term.trim())
                    .filter(term => term !== '');
                console.log(`Content ${index + 1} extracted terms:`, terms);
                terms.forEach(term => searchTermsSet.add(term));
            }
        });

        // Convert Set to sorted array
        const vishesh_suchi = Array.from(searchTermsSet).sort();
        console.log('2. Extracted vishesh_suchi:', vishesh_suchi);

        // Sort all contents by Hindi word alphabetically
        const sortedContents = sortByHindiWord(allContents);

        // Apply pagination after sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);

        // Always include vishesh_suchi in response, even if empty
        const response = {
            vishesh_suchi: vishesh_suchi,
            contents: contents,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total
        };

        console.log('3. Final response structure:', Object.keys(response));
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
            .populate('category', 'name')
            .populate('subcategory', 'name');
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
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            subcategory: req.body.subcategory,
            keywords: req.body.keywords ? req.body.keywords.split(',').map(k => k.trim()) : [],
            image: req.body.image,
            isActive: req.body.isActive
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

        content.title = req.body.title;
        content.content = req.body.content;
        content.category = req.body.category;
        content.subcategory = req.body.subcategory;
        content.keywords = req.body.keywords ? req.body.keywords.split(',').map(k => k.trim()) : [];
        content.isActive = req.body.isActive;
        if (req.body.image) {
            content.image = req.body.image;
        }

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
        await content.remove();
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 