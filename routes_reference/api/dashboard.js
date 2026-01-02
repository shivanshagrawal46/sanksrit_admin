const express = require('express');
const router = express.Router();

const KoshCategory = require('../../models/KoshCategory');
const KoshSubCategory = require('../../models/KoshSubCategory');
const KoshContent = require('../../models/KoshContent');
const McqCategory = require('../../models/McqCategory');
const McqMaster = require('../../models/McqMaster');
const McqContent = require('../../models/McqContent');
const BookCategory = require('../../models/BookCategory');
const BookName = require('../../models/BookName');
const BookChapter = require('../../models/BookChapter');
const BookContent = require('../../models/BookContent');
const PrashanYantraCategory = require('../../models/PrashanYantraCategory');
const HanumatPrashanwali = require('../../models/HanumatPrashanwali');
const AnkPrashan = require('../../models/AnkPrashan');
const KaryaPrashanYantra = require('../../models/KaryaPrashanYantra');
const TwentyPrashanYantra = require('../../models/TwentyPrashanYantra');
const SixtyFourPrashanYantra = require('../../models/SixtyFourPrashanYantra');
const BeejPrashanYantra = require('../../models/BeejPrashanYantra');
const Pooja = require('../../models/Puja');
const AstroShopCategory = require('../../models/AstroShopCategory');
const Product = require('../../models/Product');

router.get('/summary', async (req, res) => {
    try {
        // Kosh
        const koshCategories = await KoshCategory.countDocuments();
        const koshSubCategories = await KoshSubCategory.countDocuments();
        const koshContents = await KoshContent.countDocuments();
        // MCQ
        const mcqCategories = await McqCategory.countDocuments();
        const mcqMasters = await McqMaster.countDocuments();
        const mcqContents = await McqContent.countDocuments();
        // Book
        const bookCategories = await BookCategory.countDocuments();
        const bookNames = await BookName.countDocuments();
        const bookChapters = await BookChapter.countDocuments();
        const bookContents = await BookContent.countDocuments();
        // Prashan Yantra
        const prashanCategories = await PrashanYantraCategory.countDocuments();
        const hanumatPrashanwali = await HanumatPrashanwali.countDocuments();
        const ankPrashan = await AnkPrashan.countDocuments();
        const karyaPrashanYantra = await KaryaPrashanYantra.countDocuments();
        const twentyPrashanYantra = await TwentyPrashanYantra.countDocuments();
        const sixtyFourPrashanYantra = await SixtyFourPrashanYantra.countDocuments();
        const beejPrashanYantra = await BeejPrashanYantra.countDocuments();
        // Pooja
        const poojas = await Pooja.countDocuments();
        // Astroshop
        const astroshopCategories = await AstroShopCategory.countDocuments();
        const astroshopProducts = await Product.countDocuments();

        res.json({
            kosh: {
                categories: koshCategories,
                subcategories: koshSubCategories,
                contents: koshContents
            },
            mcq: {
                categories: mcqCategories,
                subcategories: mcqMasters,
                contents: mcqContents
            },
            book: {
                categories: bookCategories,
                books: bookNames,
                chapters: bookChapters,
                contents: bookContents
            },
            prashanYantra: {
                categories: prashanCategories,
                hanumatPrashanwali,
                ankPrashan,
                karyaPrashanYantra,
                twentyPrashanYantra,
                sixtyFourPrashanYantra,
                beejPrashanYantra
            },
            pooja: {
                poojas
            },
            astroshop: {
                categories: astroshopCategories,
                products: astroshopProducts
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching dashboard summary', details: err.message });
    }
});

module.exports = router; 