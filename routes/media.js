const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');
const fs = require('fs');

// Ensure upload directory exists (recreated automatically if removed)
const MEDIA_UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'media');
if (!fs.existsSync(MEDIA_UPLOAD_DIR)) {
    fs.mkdirSync(MEDIA_UPLOAD_DIR, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, MEDIA_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp).'), false);
        }
        cb(null, true);
    }
});

// List all media files
router.get('/', async (req, res) => {
    try {
        const mediaFiles = await Media.find().sort({ createdAt: -1 });
        res.render('media/list', { 
            mediaFiles,
            activePage: 'media'
        });
    } catch (error) {
        req.flash('error', 'Error fetching media files');
        res.redirect('/dashboard');
    }
});

// Upload new media
router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            console.error('[MEDIA UPLOAD] multer error:', err);
            let msg = err.message || 'Error uploading file';
            if (err.code === 'LIMIT_FILE_SIZE') {
                msg = 'File too large. Maximum size is 25 MB.';
            }
            req.flash('error', msg);
            return res.redirect('/media');
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'Please select a file to upload');
            return res.redirect('/media');
        }

        const media = await Media.create({
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/media/${req.file.filename}`,
            uploadedBy: req.session.userId
        });

        req.flash('success', 'File uploaded successfully');
        res.redirect('/media');
    } catch (error) {
        console.error('[MEDIA UPLOAD] save error:', error);
        req.flash('error', `Error uploading file: ${error.message}`);
        res.redirect('/media');
    }
});

// Delete media
router.delete('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({
                success: false,
                error: 'Media not found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../public', media.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database using findByIdAndDelete
        await Media.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

module.exports = router; 