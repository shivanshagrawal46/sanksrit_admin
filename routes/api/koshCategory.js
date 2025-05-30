const express = require('express');
const router = express.Router();
const KoshCategory = require('../../models/KoshCategory');
const auth = require('../../middleware/auth');

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

        // Get all contents for vishesh_suchi
        const allContents = await KoshContent.find({ subCategory: subcategory._id });
        console.log('2. Found total contents:', allContents.length);

        // Process search terms
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

        // Get paginated contents
        const contents = await KoshContent.find({ subCategory: subcategory._id })
            .sort({ sequenceNo: 1 })
            .skip(skip)
            .limit(limit)
            .select('-_id id sequenceNo hindiWord englishWord hinglishWord meaning extra structure search youtubeLink image createdAt')
            .lean();

        const total = await KoshContent.countDocuments({ subCategory: subcategory._id });
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