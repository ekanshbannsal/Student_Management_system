const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const { connectDB, clientPromise } = require('./config/db');
const { setViewLocals } = require('./middleware/authMiddleware');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database & Auto-seed sample records if empty
connectDB().then(async () => {
  console.log('📦 Database initialized and ready.');
  if (process.env.NODE_ENV !== 'test') {
    await seedDatabase(false);
  }
});

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override for PUT & DELETE in HTML forms
app.use(methodOverride('_method'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration with MongoStore
const sessionSecret = process.env.SESSION_SECRET || 'student_management_system_default_secret_key_2026';

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      clientPromise,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Connect Flash for notifications
app.use(flash());

// Global View Locals (currentUser, flash messages, path)
app.use(setViewLocals);

// Mount Application Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/students', studentRoutes);

// 404 Page Handler
app.use((req, res) => {
  res.status(404).render('partials/404', {
    title: '404 - Page Not Found',
    currentUser: req.session ? req.session.user : null,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('partials/500', {
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err,
    currentUser: req.session ? req.session.user : null,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Student Management System server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
