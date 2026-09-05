const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Protect all student routes
router.use(isAuthenticated);

// Student listing & search/filter
router.get('/', studentController.getStudents);

// Add student form & submission
router.get('/add', studentController.getAddStudent);
router.post('/add', studentController.postAddStudent);

// View individual student profile
router.get('/:id', studentController.getStudentById);

// Edit student form & update
router.get('/:id/edit', studentController.getEditStudent);
router.put('/:id', studentController.putUpdateStudent);
router.post('/:id/update', studentController.putUpdateStudent); // Alternative for non-method-override forms

// Delete student
router.delete('/:id', studentController.deleteStudent);
router.post('/:id/delete', studentController.deleteStudent); // Direct POST delete support

module.exports = router;
