const express = require('express');
const router = express.Router();
const Puja = require('../models/Puja');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/puja';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Main page - List all pujas with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Items per page
        const skip = (page - 1) * limit;

        // Get total count of pujas
        const totalPujas = await Puja.countDocuments();
        const totalPages = Math.ceil(totalPujas / limit);

        // Get pujas for current page
        const pujas = await Puja.find()
            .sort({ puja_date: -1 })
            .skip(skip)
            .limit(limit);

        res.render('puja/index', {
            pujas,
            pagination: {
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Puja form
router.get('/add', (req, res) => {
    res.render('puja/add');
});

// Handle Add Puja POST
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            tagline,
            temple_name,
            temple_location,
            puja_date,
            puja_day,
            description,
            banner_text,
            total_slots,
            countdown_time,
            is_last_day,
            is_active,
            whatsapp_link,
            price
        } = req.body;

        // Validate only title is required
        if (!title || title.trim() === '') {
            return res.status(400).send('Title is required');
        }

        // Generate slug from title (supporting Hindi characters)
        // Remove strict mode to allow Unicode characters
        let slug = slugify(title, { lower: true, replacement: '-' });
        // If slug is empty (all Hindi characters), use timestamp-based slug
        if (!slug || slug.trim() === '' || slug.trim() === '-') {
            slug = 'puja-' + Date.now();
        }

        // Handle image upload
        let image_url = '';
        if (req.file) {
            image_url = '/uploads/puja/' + req.file.filename;
        }

        // Parse price if provided, otherwise use default (0)
        const priceValue = price && price.toString().trim() !== '' ? parseFloat(price) : undefined;
        
        // Parse dates if provided
        const pujaDateValue = puja_date && puja_date.toString().trim() !== '' ? new Date(puja_date) : undefined;
        const countdownTimeValue = countdown_time && countdown_time.toString().trim() !== '' ? new Date(countdown_time) : undefined;
        
        // Parse total_slots if provided
        const totalSlotsValue = total_slots && total_slots.toString().trim() !== '' ? parseInt(total_slots) : undefined;

        const puja = new Puja({
            title,
            slug,
            tagline: tagline && tagline.trim() !== '' ? tagline : undefined,
            temple_name: temple_name && temple_name.trim() !== '' ? temple_name : undefined,
            temple_location: temple_location && temple_location.trim() !== '' ? temple_location : undefined,
            puja_date: pujaDateValue,
            puja_day: puja_day && puja_day.trim() !== '' ? puja_day : undefined,
            description: description && description.trim() !== '' ? description : undefined,
            image_url: image_url && image_url.trim() !== '' ? image_url : undefined,
            banner_text: banner_text && banner_text.trim() !== '' ? banner_text : undefined,
            total_slots: totalSlotsValue,
            countdown_time: countdownTimeValue,
            is_last_day: is_last_day === 'on',
            is_active: is_active === 'on',
            whatsapp_link: whatsapp_link && whatsapp_link.trim() !== '' ? whatsapp_link : undefined,
            price: priceValue
        });

        await puja.save();
        res.redirect('/puja');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving puja: ' + err.message);
    }
});

// Edit Puja form
router.get('/edit/:id', async (req, res) => {
    try {
        const puja = await Puja.findById(req.params.id);
        
        if (!puja) {
            return res.status(404).send('Puja not found');
        }
        
        res.render('puja/edit', { puja });
    } catch (err) {
        console.error('Error loading edit form:', err);
        res.status(500).send('Error loading form: ' + err.message);
    }
});

// Handle Edit Puja POST
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            tagline,
            temple_name,
            temple_location,
            puja_date,
            puja_day,
            description,
            banner_text,
            total_slots,
            countdown_time,
            is_last_day,
            is_active,
            whatsapp_link,
            price
        } = req.body;

        // Find existing puja
        const puja = await Puja.findById(req.params.id);
        if (!puja) {
            return res.status(404).send('Puja not found');
        }

        // Handle image upload
        let image_url = puja.image_url; // Keep existing image
        if (req.file) {
            // Delete old image if exists
            if (puja.image_url) {
                const oldImagePath = path.join(__dirname, '..', 'public', puja.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image_url = '/uploads/puja/' + req.file.filename;
        }

        // Generate new slug if title changed (supporting Hindi characters)
        // Remove strict mode to allow Unicode characters
        let slug = slugify(title, { lower: true, replacement: '-' });
        // If slug is empty (all Hindi characters), use timestamp-based slug
        if (!slug || slug.trim() === '' || slug.trim() === '-') {
            slug = 'puja-' + Date.now();
        }

        // Validate only title is required
        if (!title || title.trim() === '') {
            return res.status(400).send('Title is required');
        }

        // Parse price if provided
        const priceValue = price && price.toString().trim() !== '' ? parseFloat(price) : undefined;
        
        // Parse dates if provided
        const pujaDateValue = puja_date && puja_date.toString().trim() !== '' ? new Date(puja_date) : undefined;
        const countdownTimeValue = countdown_time && countdown_time.toString().trim() !== '' ? new Date(countdown_time) : undefined;
        
        // Parse total_slots if provided
        const totalSlotsValue = total_slots && total_slots.toString().trim() !== '' ? parseInt(total_slots) : undefined;

        // Update puja
        puja.title = title;
        puja.slug = slug;
        puja.tagline = tagline && tagline.trim() !== '' ? tagline : undefined;
        puja.temple_name = temple_name && temple_name.trim() !== '' ? temple_name : undefined;
        puja.temple_location = temple_location && temple_location.trim() !== '' ? temple_location : undefined;
        puja.puja_date = pujaDateValue;
        puja.puja_day = puja_day && puja_day.trim() !== '' ? puja_day : undefined;
        puja.description = description && description.trim() !== '' ? description : undefined;
        puja.image_url = image_url && image_url.trim() !== '' ? image_url : undefined;
        puja.banner_text = banner_text && banner_text.trim() !== '' ? banner_text : undefined;
        puja.total_slots = totalSlotsValue;
        puja.countdown_time = countdownTimeValue;
        puja.is_last_day = is_last_day === 'on';
        puja.is_active = is_active === 'on';
        puja.whatsapp_link = whatsapp_link && whatsapp_link.trim() !== '' ? whatsapp_link : undefined;
        puja.price = priceValue;
        puja.updated_at = Date.now();

        await puja.save();
        console.log('Puja updated successfully:', puja._id);
        res.redirect('/puja');
    } catch (err) {
        console.error('Error updating puja:', err);
        res.status(500).send('Error updating puja: ' + err.message);
    }
});

// Delete Puja
router.post('/delete/:id', async (req, res) => {
    try {
        const puja = await Puja.findById(req.params.id);
        if (!puja) {
            return res.status(404).send('Puja not found');
        }

        // Delete associated image from filesystem
        if (puja.image_url) {
            const imagePath = path.join(__dirname, '..', 'public', puja.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Puja.findByIdAndDelete(req.params.id);
        console.log('Puja deleted successfully:', req.params.id);
        res.redirect('/puja');
    } catch (err) {
        console.error('Error deleting puja:', err);
        res.status(500).send('Error deleting puja: ' + err.message);
    }
});

module.exports = router; 