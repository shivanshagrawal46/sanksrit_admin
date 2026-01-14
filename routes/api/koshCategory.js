const express = require('express');
const router = express.Router();
const KoshCategory = require('../../models/KoshCategory');
const auth = require('../../middleware/auth');

console.log('[Kosh Category API] Custom JavaScript Hindi alphabetical sorting enabled');

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
            .select('-_id id name position introduction cover_image createdAt')
            .lean();

        // Ensure cover_image is included even if empty
        const formattedCategories = categories.map(category => ({
            ...category,
            cover_image: category.cover_image || ''
        }));

        const total = await KoshCategory.countDocuments();

        res.json({
            categories: formattedCategories,
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
            .select('-_id id name position introduction cover_image createdAt')
            .lean();

        // Ensure cover_image is included even if empty
        const formattedSubcategories = subcategories.map(subcategory => ({
            ...subcategory,
            cover_image: subcategory.cover_image || ''
        }));

        const total = await KoshSubCategory.countDocuments({ parentCategory: category._id });
        res.json({
            subcategories: formattedSubcategories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalSubcategories: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all content in a subcategory (by integer id, paginated)
router.get('/:categoryId/:subCategoryId', async (req, res) => {
    try {
        console.log('1. Starting subcategory content route for category:', req.params.categoryId, 'subcategory:', req.params.subCategoryId);
        
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const KoshSubCategory = require('../../models/KoshSubCategory');
        const KoshContent = require('../../models/KoshContent');
        
        const category = await KoshCategory.findOne({ id: parseInt(req.params.categoryId) });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        const subcategory = await KoshSubCategory.findOne({ 
            id: parseInt(req.params.subCategoryId), 
            parentCategory: category._id 
        }).lean();
        if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });

        // Ensure cover_image is included even if empty
        subcategory.cover_image = subcategory.cover_image || '';

        // Get ALL contents for proper Hindi alphabetical sorting AND vishesh_suchi
        const allContents = await KoshContent.find({ subCategory: subcategory._id })
            .select('-_id id sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt')
            .lean();
        console.log('2. Found total contents:', allContents.length);

        // Sort using custom Hindi alphabetical order
        const sortedContents = sortByHindiWord(allContents);
        console.log('2.5. Contents sorted by Hindi alphabetical order');

        // Process search terms for vishesh_suchi
        const searchTermsSet = new Set();
        allContents.forEach(content => {
            if (content.search && typeof content.search === 'string' && content.search.trim() !== '') {
                const terms = content.search.split(',')
                    .map(term => term.trim())
                    .filter(term => term !== '');
                terms.forEach(term => searchTermsSet.add(term));
            }
        });

        // Convert Set to sorted array
        const vishesh_suchi = Array.from(searchTermsSet).sort();
        console.log('3. Extracted vishesh_suchi:', vishesh_suchi);

        // Apply pagination AFTER sorting
        const total = sortedContents.length;
        const contents = sortedContents.slice(skip, skip + limit);
        console.log('4. Found paginated contents:', contents.length);

        // Construct response with vishesh_suchi between contents and currentPage
        const response = {
            contents: contents,
            vishesh_suchi: vishesh_suchi,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContents: total,
            subcategory: subcategory
        };

        console.log('5. Sending response with vishesh_suchi length:', response.vishesh_suchi.length);
        return res.json(response);

    } catch (error) {
        console.error('Error in subcategory content route:', error);
        return res.status(500).json({ message: error.message });
    }
});

// Get a single Kosh Category
router.get('/:id', async (req, res) => {
    try {
        const category = await KoshCategory.findById(req.params.id)
            .select('-_id id name position introduction cover_image createdAt');
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
            position: req.body.position,
            introduction: req.body.introduction,
            cover_image: req.body.cover_image || ''
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
        category.position = req.body.position;
        category.introduction = req.body.introduction;
        if (req.body.cover_image !== undefined) {
            category.cover_image = req.body.cover_image;
        }

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