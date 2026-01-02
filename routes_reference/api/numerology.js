const express = require('express');
const router = express.Router();
const NumerologyMonthly = require('../../models/NumerologyMonthly');
const NumerologyMonthlyYear = require('../../models/NumerologyMonthlyYear');
const NumerologyYearly = require('../../models/NumerologyYearly');
const NumerologyYearlyYear = require('../../models/NumerologyYearlyYear');
const NumerologyDailyDate = require('../../models/NumerologyDailyDate');
const NumerologyDailyContent = require('../../models/NumerologyDailyContent');

// Helper: resolve numeric dateId (1-based) to actual date document (_id)
async function resolveDateByParam(dateIdParam) {
    // If numeric like '1', map based on the same ordering used in list (createdAt desc)
    if (/^\d+$/.test(String(dateIdParam))) {
        const index = parseInt(dateIdParam);
        if (index < 1) return null;
        const dates = await NumerologyDailyDate.find().sort({ sequence: 1, createdAt: 1 });
        if (index > dates.length) return null;
        return dates[index - 1];
    }
    // Otherwise try to fetch by ObjectId directly
    try {
        const date = await NumerologyDailyDate.findById(dateIdParam);
        return date;
    } catch (_) {
        return null;
    }
}

// Helper: get all months with IDs
const MONTHS = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
];

// Get all daily numerology with sequential IDs
router.get('/daily', async (req, res) => {
    try {
        // Return all admin-created dates with sequential numeric IDs (1, 2, 3...)
        // Sort by sequence first (Excel upload order), then by createdAt for dates without sequence
        const dates = await NumerologyDailyDate.find().sort({ sequence: 1, createdAt: 1 });
        const datesWithIds = dates.map((date, index) => ({
            id: index + 1,
            ...date.toObject()
        }));
        res.json({ success: true, data: datesWithIds });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching daily dates' });
    }
});

// Get specific daily numerology by ID
// Create a new date
router.post('/daily', async (req, res) => {
    try {
        const { dateLabel, dateISO, notes } = req.body;
        if (!dateLabel) return res.status(400).json({ success: false, error: 'dateLabel is required' });
        
        // Get the maximum sequence number and add 1 for new date
        const maxSequence = await NumerologyDailyDate.findOne().sort({ sequence: -1 }).select('sequence');
        const sequence = maxSequence && maxSequence.sequence ? maxSequence.sequence + 1 : 1;
        
        const created = await NumerologyDailyDate.create({ dateLabel, dateISO, notes, sequence });
        res.json({ success: true, data: created });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error creating date' });
    }
});

// Update a date
router.put('/daily/:dateId', async (req, res) => {
    try {
        const { dateId } = req.params;
        const dateDoc = await resolveDateByParam(dateId);
        if (!dateDoc) return res.status(404).json({ success: false, error: 'Date not found' });
        const updated = await NumerologyDailyDate.findByIdAndUpdate(dateDoc._id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'Date not found' });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating date' });
    }
});

// Delete a date (and cascade delete its contents)
router.delete('/daily/:dateId', async (req, res) => {
    try {
        const { dateId } = req.params;
        const dateDoc = await resolveDateByParam(dateId);
        if (!dateDoc) return res.status(404).json({ success: false, error: 'Date not found' });
        const date = await NumerologyDailyDate.findByIdAndDelete(dateDoc._id);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        await NumerologyDailyContent.deleteMany({ dateRef: dateDoc._id });
        res.json({ success: true, message: 'Date and its contents deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error deleting date' });
    }
});

// Bulk delete daily dates
router.delete('/daily', async (req, res) => {
    try {
        const { dateIds } = req.body;
        if (!dateIds || !Array.isArray(dateIds) || dateIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Date IDs array is required' });
        }

        // Resolve all date IDs to actual ObjectIds
        const dates = await NumerologyDailyDate.find({ _id: { $in: dateIds } });
        const dateObjectIds = dates.map(d => d._id);

        if (dateObjectIds.length === 0) {
            return res.status(404).json({ success: false, error: 'No valid dates found' });
        }

        // Delete all associated content first
        await NumerologyDailyContent.deleteMany({ dateRef: { $in: dateObjectIds } });
        
        // Delete the dates
        const result = await NumerologyDailyDate.deleteMany({ _id: { $in: dateObjectIds } });

        res.json({ 
            success: true, 
            message: `${result.deletedCount} date(s) and their contents deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error deleting dates: ' + error.message });
    }
});

// Get all contents for a date
router.get('/daily/:dateId', async (req, res) => {
    try {
        const { dateId } = req.params;
        const date = await resolveDateByParam(dateId);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
        const contentsWithIds = contents.map((c, idx) => ({ id: idx + 1, ...c.toObject() }));
        // Return only content list, no date object per requirement
        res.json({ success: true, data: contentsWithIds });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching contents for date' });
    }
});

// Create a single content under a date
router.post('/daily/:dateId', async (req, res) => {
    try {
        const { dateId } = req.params;
        const date = await resolveDateByParam(dateId);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        const { sequence, title_hn, title_en, details_hn, details_en, images } = req.body;
        const created = await NumerologyDailyContent.create({
            dateRef: date._id,
            sequence: sequence || 0,
            title_hn,
            title_en,
            details_hn,
            details_en,
            images: Array.isArray(images) ? images : (images ? String(images).split(',').map(s => s.trim()) : [])
        });
        res.json({ success: true, data: created });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error creating content' });
    }
});

// Get a specific content under a date
router.get('/daily/:dateId/:contentId', async (req, res) => {
    try {
        const { dateId, contentId } = req.params;
        const date = await resolveDateByParam(dateId);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        let contentDoc = null;
        if (/^\d+$/.test(String(contentId))) {
            const idx = parseInt(contentId);
            if (idx < 1) return res.status(404).json({ success: false, error: 'Content not found' });
            const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
            if (idx > contents.length) return res.status(404).json({ success: false, error: 'Content not found' });
            contentDoc = contents[idx - 1];
            return res.json({ success: true, data: { id: idx, ...contentDoc.toObject() } });
        } else {
            contentDoc = await NumerologyDailyContent.findOne({ _id: contentId, dateRef: date._id });
            if (!contentDoc) return res.status(404).json({ success: false, error: 'Content not found' });
            // compute its numeric position
            const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
            const idx = contents.findIndex(c => String(c._id) === String(contentDoc._id)) + 1;
            return res.json({ success: true, data: { id: idx, ...contentDoc.toObject() } });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching content' });
    }
});

// Update a specific content under a date
router.put('/daily/:dateId/:contentId', async (req, res) => {
    try {
        const { dateId, contentId } = req.params;
        const date = await resolveDateByParam(dateId);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        const updatePayload = { ...req.body };
        if (updatePayload.images && !Array.isArray(updatePayload.images)) {
            updatePayload.images = String(updatePayload.images).split(',').map(s => s.trim());
        }
        let updated = null;
        if (/^\d+$/.test(String(contentId))) {
            const idx = parseInt(contentId);
            if (idx < 1) return res.status(404).json({ success: false, error: 'Content not found' });
            const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
            if (idx > contents.length) return res.status(404).json({ success: false, error: 'Content not found' });
            const targetId = contents[idx - 1]._id;
            updated = await NumerologyDailyContent.findOneAndUpdate({ _id: targetId, dateRef: date._id }, updatePayload, { new: true });
        } else {
            updated = await NumerologyDailyContent.findOneAndUpdate({ _id: contentId, dateRef: date._id }, updatePayload, { new: true });
        }
        if (!updated) return res.status(404).json({ success: false, error: 'Content not found' });
        // include numeric id in response
        const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
        const idx = contents.findIndex(c => String(c._id) === String(updated._id)) + 1;
        res.json({ success: true, data: { id: idx, ...updated.toObject() } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating content' });
    }
});

// Delete a specific content under a date
router.delete('/daily/:dateId/:contentId', async (req, res) => {
    try {
        const { dateId, contentId } = req.params;
        const date = await resolveDateByParam(dateId);
        if (!date) return res.status(404).json({ success: false, error: 'Date not found' });
        let deleted = null;
        if (/^\d+$/.test(String(contentId))) {
            const idx = parseInt(contentId);
            if (idx < 1) return res.status(404).json({ success: false, error: 'Content not found' });
            const contents = await NumerologyDailyContent.find({ dateRef: date._id }).sort({ sequence: 1, createdAt: 1 });
            if (idx > contents.length) return res.status(404).json({ success: false, error: 'Content not found' });
            const targetId = contents[idx - 1]._id;
            deleted = await NumerologyDailyContent.findOneAndDelete({ _id: targetId, dateRef: date._id });
        } else {
            deleted = await NumerologyDailyContent.findOneAndDelete({ _id: contentId, dateRef: date._id });
        }
        if (!deleted) return res.status(404).json({ success: false, error: 'Content not found' });
        res.json({ success: true, message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error deleting content' });
    }
});

// Get all years (monthly numerology years)
router.get('/months', async (req, res) => {
    try {
        const years = await NumerologyMonthlyYear.find().sort({ year: -1 });
        
        // Map to include sequential IDs
        const yearsWithIds = years.map((year, index) => ({
            id: year.id || index + 1,
            year: year.year,
            description: year.description,
            _id: year._id,
            createdAt: year.createdAt,
            updatedAt: year.updatedAt
        }));
        
        res.json({
            success: true,
            data: yearsWithIds
        });
    } catch (error) {
        console.error('Error fetching years:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching years'
        });
    }
});

// Get all 12 months for a specific year ID
router.get('/months/:yearId', async (req, res) => {
    try {
        const { yearId } = req.params;
        
        // Find year by ID (can be numeric id or MongoDB _id)
        let yearDoc;
        if (/^\d+$/.test(yearId)) {
            // If numeric, find by id field
            yearDoc = await NumerologyMonthlyYear.findOne({ id: parseInt(yearId) });
        } else {
            // Otherwise find by _id
            yearDoc = await NumerologyMonthlyYear.findById(yearId);
        }
        
        if (!yearDoc) {
            return res.status(404).json({
                success: false,
                error: 'Year not found'
            });
        }
        
        // Return all 12 months with their data
        const monthsData = [];
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        for (let i = 0; i < monthNames.length; i++) {
            const monthName = monthNames[i];
            const contents = await NumerologyMonthly.find({ 
                yearRef: yearDoc._id, 
                month: monthName 
            }).sort({ sequence: 1 });
            
            monthsData.push({
                id: i + 1,
                name: monthName,
                contentCount: contents.length
            });
        }
        
        res.json({
            success: true,
            year: {
                id: yearDoc.id,
                year: yearDoc.year,
                description: yearDoc.description
            },
            data: monthsData
        });
    } catch (error) {
        console.error('Error fetching months for year:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching months'
        });
    }
});

// Get specific month data for a year (e.g., /months/1/January or /months/1/1)
router.get('/months/:yearId/:month', async (req, res) => {
    try {
        const { yearId, month } = req.params;
        
        // Find year by ID
        let yearDoc;
        if (/^\d+$/.test(yearId)) {
            yearDoc = await NumerologyMonthlyYear.findOne({ id: parseInt(yearId) });
        } else {
            yearDoc = await NumerologyMonthlyYear.findById(yearId);
        }
        
        if (!yearDoc) {
            return res.status(404).json({
                success: false,
                error: 'Year not found'
            });
        }
        
        // Determine month name
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let monthName;
        if (/^\d+$/.test(month)) {
            const monthIndex = parseInt(month);
            if (monthIndex < 1 || monthIndex > 12) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid month'
            });
        }
            monthName = monthNames[monthIndex - 1];
        } else {
            monthName = month;
            if (!monthNames.includes(monthName)) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid month name'
                });
            }
        }
        
        // Get contents for this month and year
        const contents = await NumerologyMonthly.find({ 
            yearRef: yearDoc._id, 
            month: monthName 
        }).sort({ sequence: 1 });
        
        // Add sequential IDs
        const contentsWithIds = contents.map((content, index) => ({
            id: index + 1,
            ...content.toObject()
        }));
        
        res.json({
            success: true,
            year: {
                id: yearDoc.id,
                year: yearDoc.year
            },
            month: monthName,
            data: contentsWithIds
        });
    } catch (error) {
        console.error('Error fetching monthly numerology:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching monthly numerology'
        });
    }
});

// Get specific content item from a month
router.get('/months/:yearId/:month/:contentId', async (req, res) => {
    try {
        const { yearId, month, contentId } = req.params;
        
        // Find year
        let yearDoc;
        if (/^\d+$/.test(yearId)) {
            yearDoc = await NumerologyMonthlyYear.findOne({ id: parseInt(yearId) });
        } else {
            yearDoc = await NumerologyMonthlyYear.findById(yearId);
        }
        
        if (!yearDoc) {
            return res.status(404).json({
                success: false,
                error: 'Year not found'
            });
        }
        
        // Determine month name
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let monthName;
        if (/^\d+$/.test(month)) {
            const monthIndex = parseInt(month);
            if (monthIndex < 1 || monthIndex > 12) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid month'
            });
        }
            monthName = monthNames[monthIndex - 1];
        } else {
            monthName = month;
        }
        
        // Get all contents for this month
        const contents = await NumerologyMonthly.find({ 
            yearRef: yearDoc._id, 
            month: monthName 
        }).sort({ sequence: 1 });
        
        // Find specific content
        let content;
        if (/^\d+$/.test(contentId)) {
            const idx = parseInt(contentId);
            if (idx < 1 || idx > contents.length) {
                return res.status(404).json({
                    success: false,
                    error: 'Content not found'
                });
            }
            content = contents[idx - 1];
        } else {
            content = await NumerologyMonthly.findById(contentId);
            if (!content || String(content.yearRef) !== String(yearDoc._id) || content.month !== monthName) {
            return res.status(404).json({
                success: false,
                    error: 'Content not found'
            });
            }
        }
        
        res.json({
            success: true,
            year: {
                id: yearDoc.id,
                year: yearDoc.year
            },
            month: monthName,
            data: content.toObject()
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching content'
        });
    }
});

// Get all yearly numerology with sequential IDs
// Get all yearly years
router.get('/yearly', async (req, res) => {
    try {
        const years = await NumerologyYearlyYear.find()
            .select('id year description -_id')
            .sort({ year: -1 });
        
        res.json({
            success: true,
            data: years
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching yearly years'
        });
    }
});

// Get all yearly content for a specific year
router.get('/yearly/:yearId', async (req, res) => {
    try {
        const { yearId } = req.params;
        
        // Find year by id or _id
        let year;
        if (yearId.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId
            year = await NumerologyYearlyYear.findById(yearId);
        } else {
            // Numeric id
            year = await NumerologyYearlyYear.findOne({ id: parseInt(yearId) });
        }
        
        if (!year) {
            return res.status(404).json({
                success: false,
                error: 'Year not found'
            });
        }
        
        const yearlyContent = await NumerologyYearly.find({ yearRef: year._id })
            .select('id sequence title_hn title_en date details_hn details_en images -_id')
            .sort({ sequence: 1 });
        
        // Add sequential numeric IDs
        const contentWithIds = yearlyContent.map((content, index) => ({
            id: index + 1,
            ...content.toObject()
        }));
        
        res.json({
            success: true,
            year: {
                id: year.id,
                year: year.year,
                description: year.description
            },
            data: contentWithIds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching yearly content'
        });
    }
});

module.exports = router; 