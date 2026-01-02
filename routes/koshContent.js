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

// Function to generate HTML table for Sanskrit grammar fields
function generateTable(fieldLabel, wordsString) {
    const rowHeaders = ['प्रथमपुरुषः', 'मध्यमपुरुषः', 'उत्तमपुरुषः'];
    const colHeaders = ['एकवचनम्', 'द्विवचनम्', 'बहुवचनम्'];
    const words = wordsString.split(';').map(w => w.trim());
    let html = `<h4>${fieldLabel}</h4>`;
    html += '<table border="1" style="border-collapse:collapse;text-align:center;width:auto;">';
    html += '<tr><th>विभक्‍ति</th>';
    colHeaders.forEach(h => html += `<th>${h}</th>`);
    html += '</tr>';
    let idx = 0;
    for (let i = 0; i < 3; i++) {
        html += `<tr><th>${rowHeaders[i]}</th>`;
        for (let j = 0; j < 3; j++) {
            html += `<td>${words[idx] || ''}</td>`;
            idx++;
        }
        html += '</tr>';
    }
    html += '</table><br/>';
    return html;
}

// List all content for a subcategory (with pagination)
router.get('/kosh-subcategory/:subId/contents', requireAuth, async (req, res) => {
  const subcategory = await KoshSubCategory.findById(req.params.subId);
  const requestedPage = parseInt(req.query.page) || 1;
  const limit = 10;
  const total = await KoshContent.countDocuments({ subCategory: req.params.subId });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  
  // Use MongoDB native sorting with Hindi collation
  const contents = await KoshContent.find({ subCategory: req.params.subId })
    .collation({ locale: 'hi', strength: 1 })
    .sort({ hindiWord: 1, englishWord: 1 })
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
    // Use MongoDB native sorting with Hindi collation
    const contents = await KoshContent.find({ subCategory: req.params.subId })
      .collation({ locale: 'hi', strength: 1 })
      .sort({ hindiWord: 1, englishWord: 1 });

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

// Export Excel template (GET)
router.get('/kosh-subcategory/:subId/export-template', requireAuth, async (req, res) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Define the headers for the Excel template
    const headers = [
      'sequenceNo',
      'hindiWord', 
      'englishWord',
      'hinglishWord',
      'meaning',
      'extra',
      'search',
      'youtubeLink',
      'image',
      'lath',
      'lith', 
      'luth',
      'laruth',
      'loth',
      'ladh',
      'vidhilidh',
      'aashirlidh',
      'ludh',
      'laradh'
    ];

    // Create sample data rows with examples
    const sampleData = [
      {
        sequenceNo: 1,
        hindiWord: 'गच्छति',
        englishWord: 'goes',
        hinglishWord: 'jata hai',
        meaning: 'goes (present tense)',
        extra: 'Additional information',
        search: 'गच्छति,goes',
        youtubeLink: 'https://youtube.com/watch?v=example',
        image: 'image_url_or_filename.jpg',
        lath: 'गच्छति;गच्छतः;गच्छन्ति;गच्छसि;गच्छथः;गच्छथ;गच्छामि;गच्छावः;गच्छामः',
        lith: 'जगाम;जगामतुः;जग्मुः;जगमिथ;जगमथुः;जगम;जगाम;जगामिव;जगामिम',
        luth: 'गन्ता;गन्तारौ;गन्तारः;गन्तासि;गन्तास्थः;गन्तास्थ;गन्तास्मि;गन्तास्वः;गन्तास्मः',
        laruth: 'गमिष्यति;गमिष्यतः;गमिष्यन्ति;गमिष्यसि;गमिष्यथः;गमिष्यथ;गमिष्यामि;गमिष्यावः;गमिष्यामः',
        loth: 'गच्छतु;गच्छताम्;गच्छन्तु;गच्छ;गच्छतम्;गच्छत;गच्छानि;गच्छाव;गच्छाम',
        ladh: 'अगच्छत्;अगच्छताम्;अगच्छन्;अगच्छः;अगच्छतम्;अगच्छत;अगच्छम्;अगच्छाव;अगच्छाम',
        vidhilidh: 'गच्छेत्;गच्छेताम्;गच्छेयुः;गच्छेः;गच्छेतम्;गच्छेत;गच्छेयम्;गच्छेव;गच्छेम',
        aashirlidh: 'गच्छेत्;गच्छेताम्;गच्छेयुः;गच्छेः;गच्छेतम्;गच्छेत;गच्छेयम्;गच्छेव;गच्छेम',
        ludh: 'अगमत्;अगमताम्;अगमन्;अगमः;अगमतम्;अगमत;अगमम्;अगमाव;अगमाम',
        laradh: 'अगमिष्यत्;अगमिष्यताम्;अगमिष्यन्;अगमिष्यः;अगमिष्यतम्;अगमिष्यत;अगमिष्यम्;अगमिष्याव;अगमिष्याम'
      },
      {
        sequenceNo: 2,
        hindiWord: '',
        englishWord: '',
        hinglishWord: '',
        meaning: '',
        extra: '',
        search: '',
        youtubeLink: '',
        image: '',
        lath: '',
        lith: '',
        luth: '',
        laruth: '',
        loth: '',
        ladh: '',
        vidhilidh: '',
        aashirlidh: '',
        ludh: '',
        laradh: ''
      },
      {
        sequenceNo: 3,
        hindiWord: 'पठति',
        englishWord: 'reads',
        hinglishWord: '',
        meaning: 'reads (present tense)',
        extra: '',
        search: 'पठति,reads',
        youtubeLink: '',
        image: '',
        lath: '',
        lith: '',
        luth: '',
        laruth: '',
        loth: '',
        ladh: '',
        vidhilidh: '',
        aashirlidh: '',
        ludh: '',
        laradh: ''
      }
    ];

    // Create worksheet with headers and sample data
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // sequenceNo
      { wch: 15 }, // hindiWord
      { wch: 15 }, // englishWord
      { wch: 15 }, // hinglishWord
      { wch: 25 }, // meaning
      { wch: 20 }, // extra
      { wch: 20 }, // search
      { wch: 30 }, // youtubeLink
      { wch: 20 }, // image
      { wch: 80 }, // lath
      { wch: 80 }, // lith
      { wch: 80 }, // luth
      { wch: 80 }, // laruth
      { wch: 80 }, // loth
      { wch: 80 }, // ladh
      { wch: 80 }, // vidhilidh
      { wch: 80 }, // aashirlidh
      { wch: 80 }, // ludh
      { wch: 80 }  // laradh
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kosh Content Template');
    
    // Set response headers for file download
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    const filename = `kosh_content_template_${subcategory.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Generate and send the Excel file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
    
  } catch (error) {
    console.error('Error generating Excel template:', error);
    res.status(500).send('Error generating Excel template');
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
    const fields = [
        { key: 'lath', label: 'लट् (वर्तमान)' },
        { key: 'lith', label: 'लिट् (परोक्ष)' },
        { key: 'luth', label: 'लुट् (अनद्यतन भविष्यत्)' },
        { key: 'laruth', label: 'लृट् (अद्यतन भविष्यत्)' },
        { key: 'loth', label: 'लोट् (आज्ञार्थ)' },
        { key: 'ladh', label: 'लङ् (अनद्यतन भूत)' },
        { key: 'vidhilidh', label: 'विधिलिङ्' },
        { key: 'aashirlidh', label: 'आशीर्लिङ्' },
        { key: 'ludh', label: 'लुङ् (अद्यतन भूत)' },
        { key: 'laradh', label: 'लृङ् (भविष्यत्)' }
    ];

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

      // Generate structure HTML from Sanskrit grammar fields
      let structureHtml = '';
      fields.forEach(field => {
        const value = row[field.key] || row[field.key.charAt(0).toUpperCase() + field.key.slice(1)];
        if (value) {
          structureHtml += generateTable(field.label, value);
        }
      });

      contents.push({
        subCategory: req.params.subId,
        sequenceNo: parseInt(sequenceNo),
        hindiWord: row.hindiWord || row.HindiWord || '',
        englishWord: row.englishWord || row.EnglishWord || '',
        hinglishWord: row.hinglishWord || row.HinglishWord || '',
        meaning: row.meaning || row.Meaning || '',
        extra: row.extra || row.Extra || '',
        structure: structureHtml,
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

module.exports = router; 