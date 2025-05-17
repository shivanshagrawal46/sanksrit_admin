const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const util = require('util');
util.isArray = Array.isArray;
const authRoutes = require('./routes/auth');
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
require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://samtaagrawal20:A6cIKbrRdphkrOaL@cluster0.aszthbn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Body parser
app.use(express.urlencoded({ extended: true }));

// Method Override middleware to enable DELETE and PUT methods
app.use(methodOverride('_method'));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie: { 
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV,
      httpOnly: true
    },
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

app.use('/', authRoutes);
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

// Register routes
app.use('/api/aboutTeam', aboutTeamApiRouter);
app.use('/api/aboutUs', aboutUsApiRouter);
app.use('/media', mediaRouter);

// API Routes
app.use('/api/kosh-category', koshCategoryApi);
app.use('/api/kosh-subcategory', koshSubCategoryApi);
app.use('/api/kosh-content', koshContentApi);
app.use('/api/mcq', mcqApiRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 