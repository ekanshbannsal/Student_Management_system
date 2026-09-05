const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, forwardAuthenticated } = require('../middleware/authMiddleware');

// Landing / Home
router.get('/', authController.getLanding);

// Authentication Routes
router.get('/login', forwardAuthenticated, authController.getLogin);
router.post('/login', forwardAuthenticated, authController.postLogin);

router.get('/signup', forwardAuthenticated, authController.getSignup);
router.post('/signup', forwardAuthenticated, authController.postSignup);

router.get('/logout', authController.logout);

// User Profile & Password Management
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/profile/change-password', isAuthenticated, authController.postChangePassword);

module.exports = router;
