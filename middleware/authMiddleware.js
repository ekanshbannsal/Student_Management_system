// Check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/login');
};

// Redirect logged-in users away from auth pages (login/signup)
const forwardAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

// Expose session user and flash notifications to all EJS templates
const setViewLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
};

module.exports = {
  isAuthenticated,
  forwardAuthenticated,
  setViewLocals,
};
