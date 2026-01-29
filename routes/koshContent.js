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

// Delete content (single)
router.post('/kosh-content/:id/delete', requireAuth, async (req, res) => {
  const content = await KoshContent.findById(req.params.id);
  await KoshContent.findByIdAndDelete(req.params.id);
  const subcategory = await KoshSubCategory.findById(content.subCategory);
  res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
});

// Delete all content for a subcategory
router.post('/kosh-subcategory/:subId/delete-all-content', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found');
    }
    
    // Delete all content for this subcategory
    const result = await KoshContent.deleteMany({ subCategory: req.params.subId });
    console.log(`Deleted ${result.deletedCount} content items from subcategory: ${subcategory.name}`);
    
    res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    console.error('Error deleting all content:', err);
    res.status(500).send('Error deleting content');
  }
});

// Bulk delete selected content
router.post('/kosh-subcategory/:subId/delete-selected', requireAuth, async (req, res) => {
  try {
    const subcategory = await KoshSubCategory.findById(req.params.subId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found');
    }
    
    // Get selected content IDs from form data
    const selectedIds = req.body.selectedContent;
    if (!selectedIds || (Array.isArray(selectedIds) && selectedIds.length === 0)) {
      return res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
    }
    
    // Ensure selectedIds is an array
    const idsArray = Array.isArray(selectedIds) ? selectedIds : [selectedIds];
    
    // Delete selected content
    const result = await KoshContent.deleteMany({ _id: { $in: idsArray } });
    console.log(`Deleted ${result.deletedCount} selected content items`);
    
    res.redirect(`/kosh-subcategories/${subcategory.parentCategory}?sub=${subcategory._id}`);
  } catch (err) {
    console.error('Error deleting selected content:', err);
    res.status(500).send('Error deleting content');
  }
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
      // Vibhakti columns for word forms (शब्द रूप)
      '1_ekvachan', '1_dvivachan', '1_bahuvachan',  // प्रथमा
      '2_ekvachan', '2_dvivachan', '2_bahuvachan',  // द्वितीया
      '3_ekvachan', '3_dvivachan', '3_bahuvachan',  // तृतीया
      '4_ekvachan', '4_dvivachan', '4_bahuvachan',  // चतुर्थी
      '5_ekvachan', '5_dvivachan', '5_bahuvachan',  // पंचमी
      '6_ekvachan', '6_dvivachan', '6_bahuvachan',  // षष्ठी
      '7_ekvachan', '7_dvivachan', '7_bahuvachan',  // सप्तमी
      '8_ekvachan', '8_dvivachan', '8_bahuvachan',  // सम्बोधन
      // Verb conjugation fields
      'lath',
      'lith', 
      'luth',
      'laruth',
      'loth',
      'ladh',
      'vidhilidh',
      'aashirlidh',
      'ludh',
      'laradh',
      'lath1',
      'lith1',
      'luth1',
      'laruth1',
      'loth1',
      'ladh1',
      'vidhilidh1',
      'aashirlidh1',
      'ludh1',
      'laradh1'
    ];

    // Create sample data rows with examples
    const sampleData = [
      {
        sequenceNo: 1,
        hindiWord: 'बालक',
        englishWord: 'boy',
        hinglishWord: 'balak',
        meaning: 'boy (masculine noun)',
        extra: 'Additional information',
        search: 'बालक,boy',
        youtubeLink: 'https://youtube.com/watch?v=example',
        image: 'image_url_or_filename.jpg',
        // Sample vibhakti data (बालक word forms)
        '1_ekvachan': 'बालकः', '1_dvivachan': 'बालकौ', '1_bahuvachan': 'बालकाः',
        '2_ekvachan': 'बालकम्', '2_dvivachan': 'बालकौ', '2_bahuvachan': 'बालकान्',
        '3_ekvachan': 'बालकेन', '3_dvivachan': 'बालकाभ्याम्', '3_bahuvachan': 'बालकैः',
        '4_ekvachan': 'बालकाय', '4_dvivachan': 'बालकाभ्याम्', '4_bahuvachan': 'बालकेभ्यः',
        '5_ekvachan': 'बालकात्', '5_dvivachan': 'बालकाभ्याम्', '5_bahuvachan': 'बालकेभ्यः',
        '6_ekvachan': 'बालकस्य', '6_dvivachan': 'बालकयोः', '6_bahuvachan': 'बालकानाम्',
        '7_ekvachan': 'बालके', '7_dvivachan': 'बालकयोः', '7_bahuvachan': 'बालकेषु',
        '8_ekvachan': 'हे बालक!', '8_dvivachan': 'हे बालकौ!', '8_bahuvachan': 'हे बालकाः!',
        // Verb conjugation (use for verbs)
        lath: 'गच्छति;गच्छतः;गच्छन्ति;गच्छसि;गच्छथः;गच्छथ;गच्छामि;गच्छावः;गच्छामः',
        lith: 'जगाम;जगामतुः;जग्मुः;जगमिथ;जगमथुः;जगम;जगाम;जगामिव;जगामिम',
        luth: 'गन्ता;गन्तारौ;गन्तारः;गन्तासि;गन्तास्थः;गन्तास्थ;गन्तास्मि;गन्तास्वः;गन्तास्मः',
        laruth: 'गमिष्यति;गमिष्यतः;गमिष्यन्ति;गमिष्यसि;गमिष्यथः;गमिष्यथ;गमिष्यामि;गमिष्यावः;गमिष्यामः',
        loth: 'गच्छतु;गच्छताम्;गच्छन्तु;गच्छ;गच्छतम्;गच्छत;गच्छानि;गच्छाव;गच्छाम',
        ladh: 'अगच्छत्;अगच्छताम्;अगच्छन्;अगच्छः;अगच्छतम्;अगच्छत;अगच्छम्;अगच्छाव;अगच्छाम',
        vidhilidh: 'गच्छेत्;गच्छेताम्;गच्छेयुः;गच्छेः;गच्छेतम्;गच्छेत;गच्छेयम्;गच्छेव;गच्छेम',
        aashirlidh: 'गच्छेत्;गच्छेताम्;गच्छेयुः;गच्छेः;गच्छेतम्;गच्छेत;गच्छेयम्;गच्छेव;गच्छेम',
        ludh: 'अगमत्;अगमताम्;अगमन्;अगमः;अगमतम्;अगमत;अगमम्;अगमाव;अगमाम',
        laradh: 'अगमिष्यत्;अगमिष्यताम्;अगमिष्यन्;अगमिष्यः;अगमिष्यतम्;अगमिष्यत;अगमिष्यम्;अगमिष्याव;अगमिष्याम',
        lath1: '',
        lith1: '',
        luth1: '',
        laruth1: '',
        loth1: '',
        ladh1: '',
        vidhilidh1: '',
        aashirlidh1: '',
        ludh1: '',
        laradh1: ''
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
        '1_ekvachan': '', '1_dvivachan': '', '1_bahuvachan': '',
        '2_ekvachan': '', '2_dvivachan': '', '2_bahuvachan': '',
        '3_ekvachan': '', '3_dvivachan': '', '3_bahuvachan': '',
        '4_ekvachan': '', '4_dvivachan': '', '4_bahuvachan': '',
        '5_ekvachan': '', '5_dvivachan': '', '5_bahuvachan': '',
        '6_ekvachan': '', '6_dvivachan': '', '6_bahuvachan': '',
        '7_ekvachan': '', '7_dvivachan': '', '7_bahuvachan': '',
        '8_ekvachan': '', '8_dvivachan': '', '8_bahuvachan': '',
        lath: '',
        lith: '',
        luth: '',
        laruth: '',
        loth: '',
        ladh: '',
        vidhilidh: '',
        aashirlidh: '',
        ludh: '',
        laradh: '',
        lath1: '',
        lith1: '',
        luth1: '',
        laruth1: '',
        loth1: '',
        ladh1: '',
        vidhilidh1: '',
        aashirlidh1: '',
        ludh1: '',
        laradh1: ''
      },
      {
        sequenceNo: 3,
        hindiWord: 'गच्छति',
        englishWord: 'goes',
        hinglishWord: 'jata hai',
        meaning: 'goes (verb - present tense)',
        extra: '',
        search: 'गच्छति,goes',
        youtubeLink: '',
        image: '',
        '1_ekvachan': '', '1_dvivachan': '', '1_bahuvachan': '',
        '2_ekvachan': '', '2_dvivachan': '', '2_bahuvachan': '',
        '3_ekvachan': '', '3_dvivachan': '', '3_bahuvachan': '',
        '4_ekvachan': '', '4_dvivachan': '', '4_bahuvachan': '',
        '5_ekvachan': '', '5_dvivachan': '', '5_bahuvachan': '',
        '6_ekvachan': '', '6_dvivachan': '', '6_bahuvachan': '',
        '7_ekvachan': '', '7_dvivachan': '', '7_bahuvachan': '',
        '8_ekvachan': '', '8_dvivachan': '', '8_bahuvachan': '',
        lath: 'गच्छति;गच्छतः;गच्छन्ति;गच्छसि;गच्छथः;गच्छथ;गच्छामि;गच्छावः;गच्छामः',
        lith: '',
        luth: '',
        laruth: '',
        loth: '',
        ladh: '',
        vidhilidh: '',
        aashirlidh: '',
        ludh: '',
        laradh: '',
        lath1: '',
        lith1: '',
        luth1: '',
        laruth1: '',
        loth1: '',
        ladh1: '',
        vidhilidh1: '',
        aashirlidh1: '',
        ludh1: '',
        laradh1: ''
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
      // Vibhakti columns
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 1 - प्रथमा
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 2 - द्वितीया
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 3 - तृतीया
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 4 - चतुर्थी
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 5 - पंचमी
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 6 - षष्ठी
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 7 - सप्तमी
      { wch: 18 }, { wch: 18 }, { wch: 18 }, // 8 - सम्बोधन
      // Verb conjugation columns
      { wch: 80 }, // lath
      { wch: 80 }, // lith
      { wch: 80 }, // luth
      { wch: 80 }, // laruth
      { wch: 80 }, // loth
      { wch: 80 }, // ladh
      { wch: 80 }, // vidhilidh
      { wch: 80 }, // aashirlidh
      { wch: 80 }, // ludh
      { wch: 80 }, // laradh
      { wch: 80 }, // lath1
      { wch: 80 }, // lith1
      { wch: 80 }, // luth1
      { wch: 80 }, // laruth1
      { wch: 80 }, // loth1
      { wch: 80 }, // ladh1
      { wch: 80 }, // vidhilidh1
      { wch: 80 }, // aashirlidh1
      { wch: 80 }, // ludh1
      { wch: 80 }  // laradh1
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
        { key: 'laradh', label: 'लृङ् (भविष्यत्)' },
        { key: 'lath1', label: 'लट् (वर्तमान) ' },
        { key: 'lith1', label: 'लिट् (परोक्ष) ' },
        { key: 'luth1', label: 'लुट् (अनद्यतन भविष्यत्) ' },
        { key: 'laruth1', label: 'लृट् (अद्यतन भविष्यत्) ' },
        { key: 'loth1', label: 'लोट् (आज्ञार्थ) ' },
        { key: 'ladh1', label: 'लङ् (अनद्यतन भूत)' },
        { key: 'vidhilidh1', label: 'विधिलिङ् ' },
        { key: 'aashirlidh1', label: 'आशीर्लिङ् ' },
        { key: 'ludh1', label: 'लुङ् (अद्यतन भूत) ' },
        { key: 'laradh1', label: 'लृङ् (भविष्यत्) ' }
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
      
      // Check for vibhakti-based columns (1_ekvachan, 1_dvivachan, etc.)
      const vibhaktiRows = [
        { num: '1', label: 'प्रथमा' },
        { num: '2', label: 'द्वितीया' },
        { num: '3', label: 'तृतीया' },
        { num: '4', label: 'चतुर्थी' },
        { num: '5', label: 'पंचमी' },
        { num: '6', label: 'षष्ठी' },
        { num: '7', label: 'सप्तमी' },
        { num: '8', label: 'सम्बोधन' }
      ];
      
      // Check if any vibhakti columns exist
      let hasVibhaktiData = false;
      for (const vib of vibhaktiRows) {
        if (row[`${vib.num}_ekvachan`] || row[`${vib.num}_dvivachan`] || row[`${vib.num}_bahuvachan`]) {
          hasVibhaktiData = true;
          break;
        }
      }
      
      // Generate vibhakti table if data exists
      if (hasVibhaktiData) {
        structureHtml += '<h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 15px; border-bottom: 2px solid #e67e22; padding-bottom: 5px;">शब्द रूप (Word Forms)</h3>';
        structureHtml += '<table border="1" style="border-collapse:collapse;width:100%;text-align:center;margin-bottom:20px;">';
        structureHtml += '<thead><tr style="background-color:#f39c12;color:white;">';
        structureHtml += '<th style="padding:10px;font-weight:bold;">विभक्ति</th>';
        structureHtml += '<th style="padding:10px;font-weight:bold;">एकवचन</th>';
        structureHtml += '<th style="padding:10px;font-weight:bold;">द्विवचन</th>';
        structureHtml += '<th style="padding:10px;font-weight:bold;">बहुवचन</th>';
        structureHtml += '</tr></thead><tbody>';
        
        vibhaktiRows.forEach((vib, idx) => {
          const bgColor = idx % 2 === 0 ? '#fff3e0' : '#ffffff';
          const ekvachan = row[`${vib.num}_ekvachan`] || '';
          const dvivachan = row[`${vib.num}_dvivachan`] || '';
          const bahuvachan = row[`${vib.num}_bahuvachan`] || '';
          
          structureHtml += `<tr style="background-color:${bgColor};">`;
          structureHtml += `<td style="padding:8px;font-weight:600;color:#e67e22;">${vib.label}</td>`;
          structureHtml += `<td style="padding:8px;">${ekvachan}</td>`;
          structureHtml += `<td style="padding:8px;">${dvivachan}</td>`;
          structureHtml += `<td style="padding:8px;">${bahuvachan}</td>`;
          structureHtml += '</tr>';
        });
        
        structureHtml += '</tbody></table>';
      }
      
      // Split fields into two groups: परस्मै पद (first 10) and आत्मनेपद (next 10)
      const parasmaipada_fields = fields.slice(0, 10);
      const atmaneapada_fields = fields.slice(10, 20);
      
      // Check if any परस्मै पद fields have values
      let parasmaipada_html = '';
      parasmaipada_fields.forEach(field => {
        const value = row[field.key] || row[field.key.charAt(0).toUpperCase() + field.key.slice(1)];
        if (value) {
          parasmaipada_html += generateTable(field.label, value);
        }
      });
      
      // Add परस्मै पद section if there are tables
      if (parasmaipada_html) {
        structureHtml += '<h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">परस्मै पद</h3>';
        structureHtml += parasmaipada_html;
      }
      
      // Check if any आत्मनेपद fields have values
      let atmaneapada_html = '';
      atmaneapada_fields.forEach(field => {
        const value = row[field.key] || row[field.key.charAt(0).toUpperCase() + field.key.slice(1)];
        if (value) {
          atmaneapada_html += generateTable(field.label, value);
        }
      });
      
      // Add आत्मनेपद section if there are tables
      if (atmaneapada_html) {
        structureHtml += '<h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 15px; border-bottom: 2px solid #e74c3c; padding-bottom: 5px;">आत्मनेपद</h3>';
        structureHtml += atmaneapada_html;
      }

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