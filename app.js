require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const util = require('util');
util.isArray = Array.isArray;
const authApiRoutes = require('./routes/auth'); // Authentication API routes
const koshCategoryRoutes = require('./routes/koshCategory');
const koshSubCategoryRoutes = require('./routes/koshSubCategory');
const koshContentRoutes = require('./routes/koshContent');
const mcqCategoryRoutes = require('./routes/mcqCategory');
const mcqMasterRoutes = require('./routes/mcqMaster');
const KoshCategory = require('./models/KoshCategory');
const KoshSubCategory = require('./models/KoshSubCategory');
const koshCategoryApi = require('./routes/api/koshCategory');
const koshSubCategoryApi = require('./routes/api/koshSubCategory');
const koshContentApi = require('./routes/api/koshContent');
const flash = require('connect-flash');
const mcqContentRouter = require('./routes/mcqContent');
const mcqApiRouter = require('./routes/api/mcq');
const aboutTeamRouter = require('./routes/aboutTeam');
const aboutUsRouter = require('./routes/aboutUs');
const aboutTeamApiRouter = require('./routes/api/aboutTeam');
const aboutUsApiRouter = require('./routes/api/aboutUs');
const mediaRouter = require('./routes/media');
const bookRouter = require('./routes/book');
const bookApiRouter = require('./routes/api/book');
const geetaRouter = require('./routes/geeta');
const geetaApiRouter = require('./routes/api/geeta');
const divineQuoteRouter = require('./routes/divineQuote');
const divineQuoteApiRouter = require('./routes/api/divineQuote');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Body parser
app.use(express.json()); // Parse JSON bodies (for API routes)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Method Override middleware to enable DELETE and PUT methods
app.use(methodOverride('_method'));

// Trust proxy - Add this before session setup
app.set('trust proxy', 1);

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: true, // Required for HTTPS
      //secure: false,
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    },
    proxy: true // Required for Nginx
  })
);

// Flash messages middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Middleware to fetch categories and subcategories for sidebar
app.use(async (req, res, next) => {
  try {
    const koshCategories = await KoshCategory.find().sort({ position: 1 });
    const koshSubCategories = await KoshSubCategory.find().sort({ position: 1 });
    // Map subcategories by parentCategory
    const koshSubCategoriesMap = {};
    koshCategories.forEach(cat => {
      koshSubCategoriesMap[cat._id] = koshSubCategories.filter(sub => String(sub.parentCategory) === String(cat._id));
    });
    res.locals.koshCategories = koshCategories;
    res.locals.koshSubCategoriesMap = koshSubCategoriesMap;
    next();
  } catch (err) {
    res.locals.koshCategories = [];
    res.locals.koshSubCategoriesMap = {};
    next();
  }
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Placeholder for login route
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Middleware to protect routes
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

app.use('/', koshCategoryRoutes);
app.use('/', koshSubCategoryRoutes);
app.use('/', koshContentRoutes);
app.use('/', mcqCategoryRoutes);
app.use('/', mcqMasterRoutes);

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/kosh-category', require('./routes/koshCategory'));
app.use('/kosh-subcategory', require('./routes/koshSubCategory'));
app.use('/kosh-content', require('./routes/koshContent'));
app.use('/mcq-category', require('./routes/mcqCategory'));
app.use('/mcq-master', require('./routes/mcqMaster'));
app.use('/mcq-content', mcqContentRouter);
app.use('/about-team', aboutTeamRouter);
app.use('/about-us', aboutUsRouter);
app.use('/book', bookRouter);
app.use('/geeta', geetaRouter);
app.use('/divine-quotes', divineQuoteRouter);

// Register routes
app.use('/api/aboutTeam', aboutTeamApiRouter);
app.use('/api/aboutUs', aboutUsApiRouter);
app.use('/api/book', bookApiRouter);
app.use('/api/geeta', geetaApiRouter);
app.use('/api/divine-quotes', divineQuoteApiRouter);
app.use('/media', mediaRouter);

// API Routes
app.use('/api/auth', authApiRoutes); // Authentication API routes
app.use('/api/kosh-category', koshCategoryApi);
app.use('/api/kosh-subcategory', koshSubCategoryApi);
app.use('/api/kosh-content', koshContentApi);
app.use('/api/mcq', mcqApiRouter);
app.use('/api/mcq-content', require('./routes/api/mcqContent'));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 