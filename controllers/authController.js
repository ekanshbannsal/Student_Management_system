const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Render Landing Page
const getLanding = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/landing', { title: 'Welcome to Student Management System' });
};

// Render Login Page
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login - Student Management System',
    formData: {},
  });
};

// Handle Login Submission
const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push({ msg: 'Please enter all fields' });
    return res.status(400).render('auth/login', {
      title: 'Login - Student Management System',
      errors,
      formData: { email },
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      errors.push({ msg: 'Invalid email or password' });
      return res.status(400).render('auth/login', {
        title: 'Login - Student Management System',
        errors,
        formData: { email },
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      errors.push({ msg: 'Invalid email or password' });
      return res.status(400).render('auth/login', {
        title: 'Login - Student Management System',
        errors,
        formData: { email },
      });
    }

    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'An unexpected error occurred during login. Please try again.');
    res.redirect('/login');
  }
};

// Render Signup Page
const getSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Create Account - Student Management System',
    formData: {},
  });
};

// Handle Signup Submission
const postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || !email || !password || !confirmPassword) {
    errors.push({ msg: 'Please fill in all required fields' });
  }

  if (password && password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters long' });
  }

  if (password !== confirmPassword) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    return res.status(400).render('auth/signup', {
      title: 'Create Account - Student Management System',
      errors,
      formData: { name, email },
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      errors.push({ msg: 'An account with this email already exists' });
      return res.status(400).render('auth/signup', {
        title: 'Create Account - Student Management System',
        errors,
        formData: { name, email },
      });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await newUser.save();

    // Auto-login newly registered user
    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    req.flash('success_msg', 'Welcome! Your account has been registered successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Signup error:', err);
    errors.push({ msg: err.message || 'Failed to register account' });
    res.status(500).render('auth/signup', {
      title: 'Create Account - Student Management System',
      errors,
      formData: { name, email },
    });
  }
};

// Handle Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

// Render Profile Page
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select('-password');
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/login');
    }
    res.render('profile', {
      title: 'User Profile - Student Management System',
      user,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    req.flash('error_msg', 'Could not load profile');
    res.redirect('/dashboard');
  }
};

// Handle Change Password
const postChangePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const errors = [];

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    errors.push({ msg: 'Please enter all password fields' });
  }

  if (newPassword && newPassword.length < 6) {
    errors.push({ msg: 'New password must be at least 6 characters long' });
  }

  if (newPassword !== confirmNewPassword) {
    errors.push({ msg: 'New passwords do not match' });
  }

  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash('error_msg', 'Session expired. Please log in again.');
      return res.redirect('/login');
    }

    if (errors.length > 0) {
      return res.render('profile', {
        title: 'User Profile - Student Management System',
        user,
        passwordErrors: errors,
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.render('profile', {
        title: 'User Profile - Student Management System',
        user,
        passwordErrors: [{ msg: 'Current password is incorrect' }],
      });
    }

    user.password = newPassword;
    await user.save();

    req.flash('success_msg', 'Password updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Change password error:', err);
    req.flash('error_msg', 'Failed to update password. Please try again.');
    res.redirect('/profile');
  }
};

module.exports = {
  getLanding,
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  logout,
  getProfile,
  postChangePassword,
};
