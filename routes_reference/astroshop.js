const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const AstroShopCategory = require('../models/AstroShopCategory');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

router.use(bodyParser.urlencoded({ extended: true }));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/astroshop';
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

// Astro Shop main page
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    // Get total count of products
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products for current page
    const products = await Product.find()
      .populate('category')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.render('astroshop/index', {
      products,
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

// Categories page
router.get('/categories', async (req, res) => {
  const categories = await AstroShopCategory.find().sort({ created_at: -1 });
  res.render('astroshop/categories', { categories });
});

// Add Category form
router.get('/categories/add', (req, res) => {
  res.render('astroshop/add-category');
});

// Handle Add Category POST
router.post('/categories/add', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const categoryData = { name };
    
    // Handle image upload
    if (req.file) {
      categoryData.image = '/uploads/astroshop/' + req.file.filename;
    }
    
    const category = new AstroShopCategory(categoryData);
    await category.save();
    res.redirect('/astro-shop/categories');
  } catch (err) {
    res.status(500).send('Error saving category: ' + err.message);
  }
});

// Edit Category form
router.get('/categories/edit/:id', async (req, res) => {
  try {
    const category = await AstroShopCategory.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');
    res.render('astroshop/edit-category', { category });
  } catch (err) {
    res.status(500).send('Error loading category: ' + err.message);
  }
});

// Handle Edit Category POST
router.post('/categories/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, existing_image } = req.body;
    const updateData = { name, updated_at: Date.now() };
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (existing_image) {
        const oldImagePath = path.join(__dirname, '..', 'public', existing_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = '/uploads/astroshop/' + req.file.filename;
    } else if (existing_image) {
      // Keep existing image if no new image uploaded
      updateData.image = existing_image;
    }
    
    const updated = await AstroShopCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).send('Category not found');
    res.redirect('/astro-shop/categories');
  } catch (err) {
    res.status(500).send('Error updating category: ' + err.message);
  }
});

// Handle Delete Category POST
router.post('/categories/delete/:id', async (req, res) => {
  try {
    // Prevent delete if products are attached to this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).send('Cannot delete category with existing products. Move or delete products first.');
    }
    
    // Get category to check for image
    const category = await AstroShopCategory.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');
    
    // Delete image file if exists
    if (category.image) {
      const imagePath = path.join(__dirname, '..', 'public', category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const deleted = await AstroShopCategory.findByIdAndDelete(req.params.id);
    res.redirect('/astro-shop/categories');
  } catch (err) {
    res.status(500).send('Error deleting category: ' + err.message);
  }
});

// Add Product form
router.get('/add', async (req, res) => {
  try {
    const categories = await AstroShopCategory.find().sort({ name: 1 });
    res.render('astroshop/add', { categories });
  } catch (err) {
    console.error('Error loading add product form:', err);
    res.status(500).send('Error loading form: ' + err.message);
  }
});

// Handle Add Product POST
router.post('/add', upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      category,
      short_description,
      full_description,
      price,
      original_price,
      discount_percentage,
      stock_quantity,
      is_active,
      promo_note,
      offers
    } = req.body;

    // Validate required fields
    if (!title || !category || !price) {
      return res.status(400).send('Title, category, and price are required');
    }

    // Images: get file paths
    let imagesArr = [];
    if (req.files && req.files.length > 0) {
      imagesArr = req.files.map(f => '/uploads/astroshop/' + f.filename);
    }

    // Parse offers (array of objects)
    let offersArr = [];
    if (offers) {
      if (Array.isArray(offers)) {
        offersArr = offers;
      } else if (typeof offers === 'object') {
        offersArr = Object.values(offers);
      }
    }
    offersArr = offersArr.map(o => ({
      title: o.title || '',
      description: o.description || '',
      code: o.code || '',
      type: o.type || 'custom'
    }));

    // Generate slug from title (supporting Hindi characters)
    // Remove strict mode to allow Unicode characters
    let slug = slugify(title, { lower: true, replacement: '-' });
    // If slug is empty (all Hindi characters), use timestamp-based slug
    if (!slug || slug.trim() === '' || slug.trim() === '-') {
      slug = 'product-' + Date.now();
    }

    const product = new Product({
      title,
      slug,
      category,
      short_description,
      full_description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      discount_percentage: discount_percentage ? parseFloat(discount_percentage) : undefined,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      is_active: is_active === 'on' || is_active === true,
      promo_note,
      images: imagesArr,
      offers: offersArr
    });

    await product.save();
    console.log('Product saved successfully:', product._id);
    res.redirect('/astro-shop');
  } catch (err) {
    console.error('Error saving product:', err);
    // Re-render the form with error
    const categories = await AstroShopCategory.find().sort({ name: 1 });
    res.render('astroshop/add', { 
      categories, 
      error: 'Error saving product: ' + err.message,
      formData: req.body 
    });
  }
});

// Edit Product form
router.get('/edit/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    const categories = await AstroShopCategory.find().sort({ name: 1 });
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    res.render('astroshop/edit', { product, categories });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Error loading form: ' + err.message);
  }
});

// Handle Edit Product POST
router.post('/edit/:id', upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      category,
      short_description,
      full_description,
      price,
      original_price,
      discount_percentage,
      stock_quantity,
      is_active,
      promo_note,
      offers,
      existing_images
    } = req.body;

    // Validate required fields
    if (!title || !category || !price) {
      return res.status(400).send('Title, category, and price are required');
    }

    // Find existing product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Handle existing images (keep only those that weren't removed)
    let imagesArr = [];
    if (existing_images) {
      if (Array.isArray(existing_images)) {
        imagesArr = existing_images;
      } else {
        imagesArr = [existing_images];
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => '/uploads/astroshop/' + f.filename);
      imagesArr = [...imagesArr, ...newImages];
    }

    // Parse offers
    let offersArr = [];
    if (offers) {
      if (Array.isArray(offers)) {
        offersArr = offers;
      } else if (typeof offers === 'object') {
        offersArr = Object.values(offers);
      }
    }
    offersArr = offersArr.map(o => ({
      title: o.title || '',
      description: o.description || '',
      code: o.code || '',
      type: o.type || 'custom'
    }));

    // Generate new slug if title changed (supporting Hindi characters)
    // Remove strict mode to allow Unicode characters
    let slug = slugify(title, { lower: true, replacement: '-' });
    // If slug is empty (all Hindi characters), use timestamp-based slug
    if (!slug || slug.trim() === '' || slug.trim() === '-') {
      slug = 'product-' + Date.now();
    }

    // Update product
    product.title = title;
    product.slug = slug;
    product.category = category;
    product.short_description = short_description;
    product.full_description = full_description;
    product.price = parseFloat(price);
    product.original_price = original_price ? parseFloat(original_price) : undefined;
    product.discount_percentage = discount_percentage ? parseFloat(discount_percentage) : undefined;
    product.stock_quantity = stock_quantity ? parseInt(stock_quantity) : 0;
    product.is_active = is_active === 'on' || is_active === true;
    product.promo_note = promo_note;
    product.images = imagesArr;
    product.offers = offersArr;
    product.updated_at = Date.now();

    await product.save();
    console.log('Product updated successfully:', product._id);
    res.redirect('/astro-shop');
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Error updating product: ' + err.message);
  }
});

// Delete Product
router.post('/delete/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Delete associated images from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', 'public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log('Product deleted successfully:', req.params.id);
    res.redirect('/astro-shop');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).send('Error deleting product: ' + err.message);
  }
});

module.exports = router; 