const express = require('express');
const router = express.Router();
const Festival = require('../models/Festival');
const multer = require('multer');
const xlsx = require('xlsx');

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed!'), false);
        }
    }
});

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// List all festivals
router.get('/festivals', requireAuth, async (req, res) => {
  const festivals = await Festival.find().sort({ sequence: 1 });
  res.render('festivals', {
    festivals,
    username: req.session.username,
    error: null,
    success: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Show add festival form
router.get('/festivals/add', requireAuth, (req, res) => {
  res.render('addFestival', {
    username: req.session.username,
    error: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Handle add festival
router.post('/festivals/add', requireAuth, async (req, res) => {
  try {
    const { date, vrat, festival_name, jyanti, vishesh } = req.body;
    // Get the maximum sequence number and increment
    const maxSequence = await Festival.findOne().sort({ sequence: -1 }).select('sequence');
    const nextSequence = maxSequence && maxSequence.sequence ? maxSequence.sequence + 1 : 1;
    await Festival.create({ date, vrat, festival_name, jyanti, vishesh, sequence: nextSequence });
    res.redirect('/festivals');
  } catch (err) {
    res.render('addFestival', {
      username: req.session.username,
      error: 'All required fields must be filled.',
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});

// Show edit festival form
router.get('/festivals/:id/edit', requireAuth, async (req, res) => {
  const festival = await Festival.findById(req.params.id);
  if (!festival) return res.redirect('/festivals');
  res.render('editFestival', {
    festival,
    username: req.session.username,
    error: null,
    koshCategories: [],
    activeCategory: null,
    mcqCategories: [],
    karmkandCategories: []
  });
});

// Handle edit festival
router.post('/festivals/:id/edit', requireAuth, async (req, res) => {
  try {
    const { date, vrat, festival_name, jyanti, vishesh } = req.body;
    await Festival.findByIdAndUpdate(req.params.id, { date, vrat, festival_name, jyanti, vishesh });
    res.redirect('/festivals');
  } catch (err) {
    const festival = await Festival.findById(req.params.id);
    res.render('editFestival', {
      festival,
      username: req.session.username,
      error: 'All required fields must be filled.',
      koshCategories: [],
      activeCategory: null,
      mcqCategories: [],
      karmkandCategories: []
    });
  }
});

// Handle delete festival
router.post('/festivals/:id/delete', requireAuth, async (req, res) => {
  await Festival.findByIdAndDelete(req.params.id);
  res.redirect('/festivals');
});

// Handle bulk delete festivals
router.post('/festivals/bulk-delete', requireAuth, async (req, res) => {
  try {
    const festivalIds = Array.isArray(req.body.festivalIds) 
      ? req.body.festivalIds 
      : [req.body.festivalIds];
    
    if (festivalIds.length === 0) {
      return res.redirect('/festivals');
    }

    await Festival.deleteMany({ _id: { $in: festivalIds } });
    res.redirect('/festivals');
  } catch (err) {
    console.error('Error deleting festivals:', err);
    res.redirect('/festivals');
  }
});

// Handle delete all festivals
router.post('/festivals/delete-all', requireAuth, async (req, res) => {
  try {
    await Festival.deleteMany({});
    res.redirect('/festivals');
  } catch (err) {
    console.error('Error deleting all festivals:', err);
    res.redirect('/festivals');
  }
});

// Export Excel for festivals
router.get('/festivals/export-excel', requireAuth, async (req, res) => {
    try {
        const Festival = require('../models/Festival');
        const festivals = await Festival.find().sort({ sequence: 1 });

        const dataToExport = festivals.map(entry => ({
            Date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : '',
            Vrat: entry.vrat || '',
            'Festival Name': entry.festival_name || '',
            Jyanti: entry.jyanti || '',
            Vishesh: entry.vishesh || ''
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Festivals');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="festivals.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting festivals Excel:', error);
        res.status(500).send('Error exporting Excel file');
    }
});

// Handle Excel upload
router.post('/festivals/upload-excel', requireAuth, upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('festivals', {
                festivals: await Festival.find().sort({ sequence: 1 }),
                username: req.session.username,
                error: 'Please upload an Excel file.',
                success: null,
                koshCategories: [],
                activeCategory: null,
                mcqCategories: [],
                karmkandCategories: []
            });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Get the maximum sequence number to continue from
        const maxSequence = await Festival.findOne().sort({ sequence: -1 }).select('sequence');
        let currentSequence = maxSequence && maxSequence.sequence ? maxSequence.sequence : 0;

        const festivals = [];
        for (const row of data) {
            // Skip completely empty rows
            if (!row.Date && !row.Vrat && !row['Festival Name'] && !row.Jyanti && !row.Vishesh) {
                continue;
            }
            
            // Increment sequence for each valid row
            currentSequence++;

            // Parse date - support multiple formats including dd-mm-yyyy
            let date = null;
            if (row.Date) {
                let dateValue = row.Date;
                let dateStr = '';
                
                // Handle different input types from Excel
                if (typeof dateValue === 'number') {
                    // Excel date serial number (days since 1900-01-01)
                    // Excel incorrectly treats 1900 as a leap year
                    if (dateValue > 0 && dateValue < 1000000) {
                        const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                        date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
                    } else {
                        // Try as timestamp
                        date = new Date(dateValue);
                    }
                } else if (dateValue instanceof Date) {
                    // Already a Date object
                    date = dateValue;
                } else {
                    // String format
                    dateStr = String(dateValue).trim();
                    
                    // Try dd-mm-yyyy format first (e.g., 11-12-2025)
                    const ddMMyyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
                    if (ddMMyyyyMatch) {
                        const [, day, month, year] = ddMMyyyyMatch;
                        // Ensure day and month are valid
                        const dayNum = parseInt(day);
                        const monthNum = parseInt(month);
                        const yearNum = parseInt(year);
                        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
                            date = new Date(yearNum, monthNum - 1, dayNum);
                        }
                    } else {
                        // Try dd/mm/yyyy format
                        const ddMMyyyySlashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                        if (ddMMyyyySlashMatch) {
                            const [, day, month, year] = ddMMyyyySlashMatch;
                            const dayNum = parseInt(day);
                            const monthNum = parseInt(month);
                            const yearNum = parseInt(year);
                            if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
                                date = new Date(yearNum, monthNum - 1, dayNum);
                            }
                        } else {
                            // Try standard Date parsing for other formats (YYYY-MM-DD, etc.)
                            date = new Date(dateStr);
                        }
                    }
                }
                
                // Validate date - check if it's a valid date and within reasonable range
                if (!date || isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
                    console.error(`Invalid date format: ${row.Date} (parsed as: ${date})`);
                    continue; // Skip invalid dates
                }
            }

            festivals.push({
                date: date || undefined,
                vrat: row.Vrat || undefined,
                festival_name: row['Festival Name'] || undefined,
                jyanti: row.Jyanti || undefined,
                vishesh: row.Vishesh || undefined,
                sequence: currentSequence
            });
        }

        if (festivals.length > 0) {
            await Festival.insertMany(festivals);
            res.redirect('/festivals');
        } else {
            res.render('festivals', {
                festivals: await Festival.find().sort({ sequence: 1 }),
                username: req.session.username,
                error: 'No valid festival data found in the Excel file.',
                success: null,
                koshCategories: [],
                activeCategory: null,
                mcqCategories: [],
                karmkandCategories: []
            });
        }
    } catch (err) {
        console.error('Error processing Excel file:', err);
        res.render('festivals', {
            festivals: await Festival.find().sort({ date: -1 }),
            username: req.session.username,
            error: 'Error processing Excel file. Please check the file format.',
            success: null,
            koshCategories: [],
            activeCategory: null,
            mcqCategories: [],
            karmkandCategories: []
        });
    }
});

module.exports = router; 