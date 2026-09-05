const mongoose = require('mongoose');
const Student = require('../models/Student');

// List Students with Search, Filters, and Pagination
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, course, branch, year, semester, gender } = req.query;

    const query = {};

    // Free text search across Name, Roll Number, Email, Branch
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
        { branch: searchRegex },
      ];
    }

    // Dropdown filters
    if (course && course !== 'All') {
      query.course = course;
    }
    if (branch && branch !== 'All') {
      query.branch = branch;
    }
    if (year && year !== 'All') {
      query.year = year;
    }
    if (semester && semester !== 'All') {
      query.semester = semester;
    }
    if (gender && gender !== 'All') {
      query.gender = gender;
    }

    // Execute queries in parallel
    const [students, totalStudents, availableCourses, availableBranches] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(query),
      Student.distinct('course'),
      Student.distinct('branch'),
    ]);

    const totalPages = Math.ceil(totalStudents / limit) || 1;

    res.render('students/index', {
      title: 'All Students - Student Management System',
      students,
      page,
      totalPages,
      totalStudents,
      limit,
      filters: {
        search: search || '',
        course: course || 'All',
        branch: branch || 'All',
        year: year || 'All',
        semester: semester || 'All',
        gender: gender || 'All',
      },
      availableCourses,
      availableBranches,
    });
  } catch (err) {
    console.error('Fetch students error:', err);
    req.flash('error_msg', 'Failed to retrieve students records');
    res.redirect('/dashboard');
  }
};

// Render Add Student Form
const getAddStudent = (req, res) => {
  res.render('students/add', {
    title: 'Add New Student - Student Management System',
    formData: {},
    errors: [],
  });
};

// Handle Add Student Submission
const postAddStudent = async (req, res) => {
  const {
    name,
    rollNumber,
    email,
    phone,
    course,
    branch,
    year,
    semester,
    gender,
    dateOfBirth,
    address,
  } = req.body;

  const errors = [];

  if (!name || !rollNumber || !email || !phone || !course || !branch || !year || !semester || !gender || !dateOfBirth || !address) {
    errors.push({ msg: 'Please complete all required fields' });
  }

  // Check duplicate Roll Number
  if (rollNumber) {
    const existingRoll = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });
    if (existingRoll) {
      errors.push({ msg: `A student with Roll Number "${rollNumber}" already exists` });
    }
  }

  // Check duplicate Email
  if (email) {
    const existingEmail = await Student.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingEmail) {
      errors.push({ msg: `A student with Email "${email}" already exists` });
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('students/add', {
      title: 'Add New Student - Student Management System',
      formData: req.body,
      errors,
    });
  }

  try {
    const newStudent = new Student({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      course: course.trim(),
      branch: branch.trim(),
      year: year.trim(),
      semester: semester.trim(),
      gender: gender.trim(),
      dateOfBirth: new Date(dateOfBirth),
      address: address.trim(),
    });

    await newStudent.save();
    req.flash('success_msg', `Student "${newStudent.name}" enrolled successfully!`);
    res.redirect('/students');
  } catch (err) {
    console.error('Add student error:', err);
    res.status(500).render('students/add', {
      title: 'Add New Student - Student Management System',
      formData: req.body,
      errors: [{ msg: err.message || 'Error saving student record' }],
    });
  }
};

// View Single Student Profile
const getStudentById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error_msg', 'Invalid student ID');
    return res.redirect('/students');
  }

  try {
    const student = await Student.findById(id);
    if (!student) {
      req.flash('error_msg', 'Student record not found');
      return res.redirect('/students');
    }

    res.render('students/show', {
      title: `${student.name} - Profile | Student Management System`,
      student,
    });
  } catch (err) {
    console.error('Fetch student error:', err);
    req.flash('error_msg', 'Error retrieving student details');
    res.redirect('/students');
  }
};

// Render Edit Student Form
const getEditStudent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error_msg', 'Invalid student ID');
    return res.redirect('/students');
  }

  try {
    const student = await Student.findById(id);
    if (!student) {
      req.flash('error_msg', 'Student not found');
      return res.redirect('/students');
    }

    res.render('students/edit', {
      title: `Edit ${student.name} - Student Management System`,
      student,
      errors: [],
    });
  } catch (err) {
    console.error('Edit student error:', err);
    req.flash('error_msg', 'Error loading student for edit');
    res.redirect('/students');
  }
};

// Handle Update Student
const putUpdateStudent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error_msg', 'Invalid student ID');
    return res.redirect('/students');
  }

  const {
    name,
    rollNumber,
    email,
    phone,
    course,
    branch,
    year,
    semester,
    gender,
    dateOfBirth,
    address,
  } = req.body;

  const errors = [];

  if (!name || !rollNumber || !email || !phone || !course || !branch || !year || !semester || !gender || !dateOfBirth || !address) {
    errors.push({ msg: 'Please complete all required fields' });
  }

  try {
    // Check if another student has the same roll number
    if (rollNumber) {
      const duplicateRoll = await Student.findOne({
        rollNumber: rollNumber.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicateRoll) {
        errors.push({ msg: `Roll Number "${rollNumber}" is already in use by another student` });
      }
    }

    // Check if another student has the same email
    if (email) {
      const duplicateEmail = await Student.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (duplicateEmail) {
        errors.push({ msg: `Email "${email}" is already in use by another student` });
      }
    }

    if (errors.length > 0) {
      return res.status(400).render('students/edit', {
        title: 'Edit Student - Student Management System',
        student: { ...req.body, _id: id },
        errors,
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        course: course.trim(),
        branch: branch.trim(),
        year: year.trim(),
        semester: semester.trim(),
        gender: gender.trim(),
        dateOfBirth: new Date(dateOfBirth),
        address: address.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      req.flash('error_msg', 'Student record not found to update');
      return res.redirect('/students');
    }

    req.flash('success_msg', `Student "${updatedStudent.name}" updated successfully!`);
    res.redirect(`/students/${id}`);
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).render('students/edit', {
      title: 'Edit Student - Student Management System',
      student: { ...req.body, _id: id },
      errors: [{ msg: err.message || 'Failed to update student' }],
    });
  }
};

// Handle Delete Student
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error_msg', 'Invalid student ID');
    return res.redirect('/students');
  }

  try {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      req.flash('error_msg', 'Student record not found');
      return res.redirect('/students');
    }

    req.flash('success_msg', `Student "${student.name}" (Roll: ${student.rollNumber}) deleted successfully.`);
    res.redirect('/students');
  } catch (err) {
    console.error('Delete student error:', err);
    req.flash('error_msg', 'Error occurred while deleting student');
    res.redirect('/students');
  }
};

module.exports = {
  getStudents,
  getAddStudent,
  postAddStudent,
  getStudentById,
  getEditStudent,
  putUpdateStudent,
  deleteStudent,
};
