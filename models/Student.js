const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
      enum: ['B.Tech', 'BCA', 'B.Sc', 'MCA', 'M.Tech', 'BBA', 'MBA', 'Diploma'],
      default: 'B.Tech',
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
      enum: [
        'Computer Science (CSE)',
        'Information Technology (IT)',
        'Electronics & Communication (ECE)',
        'Mechanical Engineering (ME)',
        'Civil Engineering (CE)',
        'Electrical Engineering (EE)',
        'Artificial Intelligence & Data Science (AI/DS)',
        'Business Administration',
        'Other',
      ],
      default: 'Computer Science (CSE)',
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      default: '1st Year',
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
      default: '1st',
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ branch: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text', email: 'text' });

module.exports = mongoose.model('Student', studentSchema);
