const express = require('express');
const router = express.Router();

const EMagazineCategory = require('../../models/EMagazineCategory');
const EMagazineSubject = require('../../models/EMagazineSubject');
const EMagazineWriter = require('../../models/EMagazineWriter');
const EMagazine = require('../../models/EMagazine');

// ============================================
// CACHING SYSTEM - Cache category, subject, writer names
// ============================================
let lookupCache = {
    categories: null,
    subjects: null,
    writers: null,
    timestamp: 0
};
const LOOKUP_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getLookupMaps() {
    // Check if cache is valid
    if (lookupCache.categories && Date.now() - lookupCache.timestamp < LOOKUP_CACHE_TTL) {
        return lookupCache;
    }
    
    // Fetch all lookup data in parallel (very fast - small collections)
    const [categories, subjects, writers] = await Promise.all([
        EMagazineCategory.find().select('_id name').lean(),
        EMagazineSubject.find().select('_id name').lean(),
        EMagazineWriter.find().select('_id name').lean()
    ]);
    
    // Convert to Maps for O(1) lookup
    lookupCache = {
        categories: new Map(categories.map(c => [c._id.toString(), c.name])),
        subjects: new Map(subjects.map(s => [s._id.toString(), s.name])),
        writers: new Map(writers.map(w => [w._id.toString(), w.name])),
        timestamp: Date.now()
    };
    
    return lookupCache;
}

// Clear lookup cache (call when category/subject/writer is added/updated/deleted)
function clearLookupCache() {
    lookupCache = { categories: null, subjects: null, writers: null, timestamp: 0 };
}
router.clearLookupCache = clearLookupCache;

// ============================================
// FAST: Get magazines without $lookup - use cached maps instead
// ============================================
async function getMagazinesFast(matchQuery = {}, skip = 0, limit = null, sort = { createdAt: -1 }) {
    // Get cached lookup maps
    const { categories, subjects, writers } = await getLookupMaps();
    
    // Simple query - no $lookup needed!
    let query = EMagazine.find(matchQuery)
        .sort(sort)
        .skip(skip)
        .lean();
    
    if (limit) {
        query = query.limit(limit);
    }
    
    const magazines = await query;
    
    // Map names using cached data (super fast - O(1) per item)
    return magazines.map(mag => ({
        _id: mag._id,
        language: mag.language,
        category: mag.category ? categories.get(mag.category.toString()) || '' : '',
        subject: mag.subject ? subjects.get(mag.subject.toString()) || '' : '',
        writer: mag.writer ? writers.get(mag.writer.toString()) || '' : '',
        month: mag.month,
        year: mag.year,
        title: mag.title,
        introduction: mag.introduction,
        subPoints: mag.subPoints,
        importance: mag.importance,
        explain: mag.explain,
        summary: mag.summary,
        reference: mag.reference,
        images: mag.images
    }));
}

// ============================================
// Helper function for aggregation with lookups (fallback - single query instead of multiple populates)
// ============================================
async function getMagazinesWithLookup(matchQuery = {}, skip = 0, limit = null, sort = { createdAt: -1 }) {
    const pipeline = [
        { $match: matchQuery },
        { $sort: sort },
        // Use $lookup to join in a single query (much faster than multiple populate)
        {
            $lookup: {
                from: 'emagazinecategories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryData'
            }
        },
        {
            $lookup: {
                from: 'emagazinesubjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subjectData'
            }
        },
        {
            $lookup: {
                from: 'emagazinewriters',
                localField: 'writer',
                foreignField: '_id',
                as: 'writerData'
            }
        },
        // Project to format the output
        {
            $project: {
                _id: 1,
                language: 1,
                category: { $arrayElemAt: ['$categoryData.name', 0] },
                subject: { $arrayElemAt: ['$subjectData.name', 0] },
                writer: { $arrayElemAt: ['$writerData.name', 0] },
                month: 1,
                year: 1,
                title: 1,
                introduction: 1,
                subPoints: 1,
                importance: 1,
                explain: 1,
                summary: 1,
                reference: 1,
                images: 1
            }
        }
    ];

    // Add skip if provided
    if (skip > 0) {
        pipeline.push({ $skip: skip });
    }

    // Add limit if provided
    if (limit) {
        pipeline.push({ $limit: limit });
    }

    return await EMagazine.aggregate(pipeline);
}

// GET all categories - OPTIMIZED
router.get('/category', async (req, res) => {
    try {
        const categories = await EMagazineCategory.find().lean();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all magazines in a category (by category id, not _id) - OPTIMIZED
router.get('/category/:categoryId', async (req, res) => {
    try {
        // Find the category by id field
        const category = await EMagazineCategory.findOne({ id: req.params.categoryId }).lean();
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        // Use fast cached lookup method
        const result = await getMagazinesFast({ category: category._id });
        
        res.json({ success: true, magazines: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all subjects - OPTIMIZED
router.get('/subject', async (req, res) => {
    try {
        const subjects = await EMagazineSubject.find().lean();
        res.json({ success: true, subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all writers - OPTIMIZED
router.get('/writer', async (req, res) => {
    try {
        const writers = await EMagazineWriter.find().lean();
        res.json({ success: true, writers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all magazines for a specific subject (by subject id) - OPTIMIZED
router.get('/subject/:subjectId', async (req, res) => {
    try {
        // Find the subject by id field
        const subject = await EMagazineSubject.findOne({ id: req.params.subjectId }).lean();
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        
        // Use fast cached lookup method
        const result = await getMagazinesFast({ subject: subject._id });
        
        res.json({ success: true, magazines: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all magazines for a specific writer (by writer id) - OPTIMIZED
router.get('/writer/:writerId', async (req, res) => {
    try {
        // Find the writer by id field
        const writer = await EMagazineWriter.findOne({ id: req.params.writerId }).lean();
        if (!writer) {
            return res.status(404).json({ success: false, message: 'Writer not found' });
        }
        
        // Use fast cached lookup method
        const result = await getMagazinesFast({ writer: writer._id });
        
        res.json({ success: true, magazines: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all magazines (irrespective of category, writer, and subjects) with pagination - OPTIMIZED
router.get('/all', async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Fixed limit of 10 per page
        const skip = (page - 1) * limit;

        // Get total count of all magazines (uses index on _id)
        const total = await EMagazine.countDocuments({});

        // Use fast cached lookup method (NO $lookup = much faster!)
        const result = await getMagazinesFast({}, skip, limit, { createdAt: -1 });

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        res.json({ 
            success: true, 
            magazines: result, 
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalMagazines: total,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router; 