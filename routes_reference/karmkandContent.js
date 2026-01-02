const express = require('express');
const KarmkandSubCategory = require('../models/KarmkandSubCategory');
const KarmkandContent = require('../models/KarmkandContent');
const KarmkandCategory = require('../models/KarmkandCategory');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// Show add content form
router.get('/karmkand-subcategory/:subId/add-content', requireAuth, async (req, res) => {
  const subcategory = await KarmkandSubCategory.findById(req.params.subId);
  const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('addKarmkandContent', {
    subcategory,
    error: null,
    username: req.session.username,
    karmkandCategories
  });
});

// Handle add content form
router.post('/karmkand-subcategory/:subId/add-content', requireAuth, upload.single('image'), async (req, res) => {
  const { sequenceNo, hindiWord, englishWord, hinglishWord, meaning, extra, structure, search, youtubeLink } = req.body;
  let image = '';
  if (req.file) image = '/images/' + req.file.filename;
  try {
    await KarmkandContent.create({
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
    const subcategory = await KarmkandSubCategory.findById(req.params.subId);
    res.redirect(`/karmkand-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    const subcategory = await KarmkandSubCategory.findById(req.params.subId);
    res.render('addKarmkandContent', { subcategory, error: 'All required fields must be filled.' });
  }
});

// Show import Excel form
router.get('/karmkand-subcategory/:subId/import-excel', requireAuth, async (req, res) => {
  const subcategory = await KarmkandSubCategory.findById(req.params.subId);
  const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('importKarmkandContentExcel', {
    subcategory,
    error: null,
    success: null,
    username: req.session.username,
    karmkandCategories
  });
});

// Export Excel for subcategory content
router.get('/karmkand-subcategory/:subId/export-excel', requireAuth, async (req, res) => {
  try {
    const subcategory = await KarmkandSubCategory.findById(req.params.subId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found');
    }

    const contents = await KarmkandContent.find({ subCategory: req.params.subId }).sort({ sequenceNo: 1 });

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Karmkand Content');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="karmkand_${subcategory.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting karmkand Excel:', error);
    res.status(500).send('Error exporting Excel file');
  }
});

// Handle import Excel upload
router.post('/karmkand-subcategory/:subId/import-excel', requireAuth, upload.single('excel'), async (req, res) => {
  const subcategory = await KarmkandSubCategory.findById(req.params.subId);
  const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
  
  if (!req.file) {
    return res.render('importKarmkandContentExcel', { 
      subcategory, 
      error: 'No file uploaded.', 
      success: null, 
      username: req.session.username, 
      karmkandCategories 
    });
  }

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.render('importKarmkandContentExcel', {
        subcategory,
        error: 'Excel file is empty.',
        success: null,
        username: req.session.username,
        karmkandCategories
      });
    }

    // Validate required fields
    const requiredFields = ['sequenceNo', 'hindiWord', 'englishWord', 'meaning'];
    const missingFields = rows.some(row => 
      requiredFields.some(field => !row[field] && !row[field.charAt(0).toUpperCase() + field.slice(1)])
    );

    if (missingFields) {
      return res.render('importKarmkandContentExcel', {
        subcategory,
        error: 'Excel file is missing required fields: sequenceNo, hindiWord, englishWord, meaning',
        success: null,
        username: req.session.username,
        karmkandCategories
      });
    }

    // Map and validate the data
    const contents = rows.map((row, index) => {
      const sequenceNo = row.sequenceNo || row.SequenceNo;
      if (!sequenceNo || isNaN(sequenceNo)) {
        throw new Error(`Invalid sequence number in row ${index + 2}`);
      }

      return {
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
      };
    });

    // Insert the data one by one to handle auto-incrementing id
    for (const content of contents) {
      await KarmkandContent.create(content);
    }

    // Clean up the uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.render('importKarmkandContentExcel', {
      subcategory,
      error: null,
      success: `Successfully imported ${contents.length} records!`,
      username: req.session.username,
      karmkandCategories
    });
  } catch (err) {
    console.error('Excel import error:', err);
    res.render('importKarmkandContentExcel', {
      subcategory,
      error: `Error importing Excel file: ${err.message}`,
      success: null,
      username: req.session.username,
      karmkandCategories
    });
  }
});

// Edit content (GET)
router.get('/karmkand-content/:id/edit', requireAuth, async (req, res) => {
  const content = await KarmkandContent.findById(req.params.id);
  const subcategory = await KarmkandSubCategory.findById(content.subCategory);
  const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
  res.render('editKarmkandContent', {
    content,
    subcategory,
    error: null,
    username: req.session.username,
    karmkandCategories
  });
});

// Edit content (POST)
router.post('/karmkand-content/:id/edit', requireAuth, upload.single('image'), async (req, res) => {
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
    const content = await KarmkandContent.findByIdAndUpdate(req.params.id, update, { new: true });
    const subcategory = await KarmkandSubCategory.findById(content.subCategory);
    res.redirect(`/karmkand-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    const content = await KarmkandContent.findById(req.params.id);
    const subcategory = await KarmkandSubCategory.findById(content.subCategory);
    const karmkandCategories = await KarmkandCategory.find().sort({ position: 1 });
    res.render('editKarmkandContent', {
      content,
      subcategory,
      error: 'Error updating content.',
      username: req.session.username,
      karmkandCategories
    });
  }
});

// Delete content
router.post('/karmkand-content/:id/delete', requireAuth, async (req, res) => {
  const content = await KarmkandContent.findById(req.params.id);
  await KarmkandContent.findByIdAndDelete(req.params.id);
  const subcategory = await KarmkandSubCategory.findById(content.subCategory);
  res.redirect(`/karmkand-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
});

module.exports = router; 