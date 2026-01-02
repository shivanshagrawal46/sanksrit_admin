const express = require('express');
const multer = require('multer');
const path = require('path');
const KoshSubCategory = require('../models/KoshSubCategory');
const KoshContent = require('../models/KoshContent');
const router = express.Router();
const XLSX = require('xlsx');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all content for a subcategory (with pagination)
router.get('/kosh-subcategory/:subId/contents', requireAuth, async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.subId);
  const requestedPage = parseInt(req.query.page) || 1;
  const limit = 10;
  const total = await KoshContent.countDocuments({ subCategory: req.params.subId });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const contents = await KoshContent.find({ subCategory: req.params.subId })
    .sort({ sequenceNo: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const KoshCategory = require('../models/KoshCategory');
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('koshContents', {
    subcategory,
    contents,
    currentPage: page,
    totalPages,
    koshCategories,
    username: req.session.username
  });
});

// Add content (GET)
router.get('/kosh-subcategory/:subId/add-content', requireAuth, async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.subId);
  const KoshCategory = require('../models/KoshCategory');
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('addKoshContent', {
    subcategory,
    error: null,
    username: req.session.username,
    koshCategories
  });
});

// Add content (POST)
router.post('/kosh-subcategory/:subId/add-content', requireAuth, upload.single('image'), async (req, res) => {
  const { sequenceNo, hindiWord, englishWord, hinglishWord, meaning, extra, structure, search, youtubeLink } = req.body;
  let image = '';
  if (req.file) image = '/images/' + req.file.filename;
  try {
    await KoshContent.create({
      subCategory: req.params.subId,
      sequenceNo,
      hindiWord,
      englishWord,
      hinglishWord,
      meaning,
      extra,
      structure,
      search,
      youtubeLink,
      image
    });
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    res.render('addKoshContent', { subcategory, error: 'All required fields must be filled.' });
  }
});

// Edit content (GET)
router.get('/kosh-content/:id/edit', requireAuth, async (req, res) => {
  const content = await KoshContent.findById(req.params.id);
  const subcategory = await KoshSubCategory.findById(content.subCategory);
  const KoshCategory = require('../models/KoshCategory');
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('editKoshContent', {
    content,
    subcategory,
    error: null,
    username: req.session.username,
    koshCategories
  });
});

// Edit content (POST)
router.post('/kosh-content/:id/edit', requireAuth, upload.single('image'), async (req, res) => {
  const { sequenceNo, hindiWord, englishWord, hinglishWord, meaning, extra, structure, search, youtubeLink } = req.body;
  let update = {
    sequenceNo,
    hindiWord,
    englishWord,
    hinglishWord,
    meaning,
    extra,
    structure,
    search,
    youtubeLink
  };
  if (req.file) update.image = '/images/' + req.file.filename;
  try {
    const content = await KoshContent.findByIdAndUpdate(req.params.id, update, { new: true });
    const subcategory = await KoshSubCategory.findById(content.subCategory);
    res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    const content = await KoshContent.findById(req.params.id);
    const subcategory = await KoshSubCategory.findById(content.subCategory);
    const KoshCategory = require('../models/KoshCategory');
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    res.render('editKoshContent', {
      content,
      subcategory,
      error: 'Error updating content.',
      username: req.session.username,
      koshCategories
    });
  }
});

// Delete content
router.post('/kosh-content/:id/delete', requireAuth, async (req, res) => {
  const content = await KoshContent.findById(req.params.id);
  await KoshContent.findByIdAndDelete(req.params.id);
  const subcategory = await KoshSubCategory.findById(content.subCategory);
  res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
});

// Excel import (GET)
router.get('/kosh-subcategory/:subId/import-excel', requireAuth, async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.subId);
  const KoshCategory = require('../models/KoshCategory');
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  res.render('importKoshContentExcel', { subcategory, error: null, success: null, username: req.session.username, koshCategories });
});

// Export Excel for subcategory content
router.get('/kosh-subcategory/:subId/export-excel', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found');
    }

    const KoshContent = require('../models/KoshContent');
    const contents = await KoshContent.find({ subCategory: req.params.subId }).sort({ sequenceNo: 1 });

    const dataToExport = contents.map(entry => ({
      sequenceNo: entry.sequenceNo,
      hindiWord: entry.hindiWord || '',
      englishWord: entry.englishWord || '',
      hinglishWord: entry.hinglishWord || '',
      meaning: entry.meaning || '',
      extra: entry.extra || '',
      structure: entry.structure || '',
      search: entry.search || '',
      youtubeLink: entry.youtubeLink || '',
      image: entry.image || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kosh Content');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="kosh_${subcategory.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting kosh Excel:', error);
    res.status(500).send('Error exporting Excel file');
  }
});

// Excel import (POST)
router.post('/kosh-subcategory/:subId/import-excel', requireAuth, upload.single('excel'), async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.subId);
  const KoshCategory = require('../models/KoshCategory');
  const koshCategories = await KoshCategory.find().sort({ position: 1 });
  
  if (!req.file) {
    return res.render('importKoshContentExcel', { 
      subcategory, 
      error: 'No file uploaded.', 
      success: null, 
      username: req.session.username, 
      koshCategories 
    });
  }

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.render('importKoshContentExcel', {
        subcategory,
        error: 'Excel file is empty.',
        success: null,
        username: req.session.username,
        koshCategories
      });
    }

    // Check for required headers (only sequenceNo is required)
    const requiredHeaders = ['sequenceNo'];
    const firstRow = rows[0];
    const missingHeaders = requiredHeaders.filter(header => 
      !(header in firstRow) && !(header.charAt(0).toUpperCase() + header.slice(1) in firstRow)
    );

    if (missingHeaders.length > 0) {
      return res.render('importKoshContentExcel', {
        subcategory,
        error: `Missing required column headers: ${missingHeaders.join(', ')}. Please ensure your Excel file has the correct headers.`,
        success: null,
        username: req.session.username,
        koshCategories
      });
    }

    // Map and validate the data
    const contents = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Excel row number (accounting for header row)

      // Check for missing required fields (only sequenceNo is required)
      if (!row.sequenceNo && !row.SequenceNo) {
        errors.push(`Row ${rowNumber}: Missing required field: sequenceNo`);
        continue;
      }

      const sequenceNo = row.sequenceNo || row.SequenceNo;
      if (isNaN(sequenceNo)) {
        errors.push(`Row ${rowNumber}: Invalid sequence number: "${sequenceNo}"`);
        continue;
      }

      contents.push({
        subCategory: req.params.subId,
        sequenceNo: parseInt(sequenceNo),
        hindiWord: row.hindiWord || row.HindiWord || '',
        englishWord: row.englishWord || row.EnglishWord || '',
        hinglishWord: row.hinglishWord || row.HinglishWord || '',
        meaning: row.meaning || row.Meaning || '',
        extra: row.extra || row.Extra || '',
        structure: row.structure || row.Structure || '',
        search: row.search || row.Search || '',
        youtubeLink: row.youtubeLink || row.YouTubeLink || '',
        image: row.image || row.Image || ''
      });
    }

    // Insert the data one by one to handle auto-incrementing id
    for (const content of contents) {
      await KoshContent.create(content);
    }

    // Clean up the uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    if (contents.length > 0) {
      const successMessage = `Successfully imported ${contents.length} records.`;
      const errorMessage = errors.length > 0 ? ` However, ${errors.length} rows had errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}` : '';
      
      res.render('importKoshContentExcel', {
        subcategory,
        error: null,
        success: successMessage + errorMessage,
        username: req.session.username,
        koshCategories
      });
    } else {
      res.render('importKoshContentExcel', {
        subcategory,
        error: `No valid content data found. Errors: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '...' : ''}`,
        success: null,
        username: req.session.username,
        koshCategories
      });
    }
  } catch (err) {
    console.error('Excel import error:', err);
    res.render('importKoshContentExcel', {
      subcategory,
      error: `Error importing Excel file: ${err.message}`,
      success: null,
      username: req.session.username,
      koshCategories
    });
  }
});

// Export Excel template for kosh content
router.get('/kosh-subcategory/:subId/export-excel', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found');
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create sample data with proper headers
    const sampleData = [
      {
        'sequenceNo': 1,
        'hindiWord': 'शब्द',
        'englishWord': 'word',
        'hinglishWord': 'word',
        'meaning': 'This is the meaning of the word',
        'extra': 'Additional information (optional)',
        'structure': 'Word structure (optional)',
        'search': 'Search keywords (optional)',
        'youtubeLink': 'https://youtube.com/video1',
        'image': 'image_url_here (optional)'
      },
      {
        'sequenceNo': 2,
        'hindiWord': 'अर्थ',
        'englishWord': 'meaning',
        'hinglishWord': 'meaning',
        'meaning': 'This is the meaning of the second word',
        'extra': 'Additional information (optional)',
        'structure': 'Word structure (optional)',
        'search': 'Search keywords (optional)',
        'youtubeLink': 'https://youtube.com/video2',
        'image': 'image_url_here (optional)'
      }
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kosh Content Template');
    
    // Set response headers with a safe ASCII filename
    const rawName = (subcategory && subcategory.name ? String(subcategory.name) : 'subcategory');
    const asciiName = rawName
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]+/g, '') // remove non-ASCII
      .replace(/[^a-zA-Z0-9-_ ]/g, '') // remove dangerous punctuation
      .trim()
      .replace(/\s+/g, '_');
    const safeFileName = asciiName && asciiName.length > 0
      ? `kosh_content_${asciiName}_template.xlsx`
      : 'kosh_content_template.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    
    // Write the workbook to response
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
    
  } catch (err) {
    console.error('Error creating Excel template:', err);
    res.status(500).send('Error creating Excel template');
  }
});

module.exports = router; 