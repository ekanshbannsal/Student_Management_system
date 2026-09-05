const Student = require('../models/Student');

// Render Dashboard with Dynamic Statistics
const getDashboard = async (req, res) => {
  try {
    // Aggregation queries for real-time statistics
    const [
      totalStudents,
      maleStudents,
      femaleStudents,
      distinctBranches,
      distinctCourses,
      recentStudents,
      branchStats,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: 'Male' }),
      Student.countDocuments({ gender: 'Female' }),
      Student.distinct('branch'),
      Student.distinct('course'),
      Student.find().sort({ createdAt: -1 }).limit(5),
      Student.aggregate([
        { $group: { _id: '$branch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const otherGenderStudents = totalStudents - (maleStudents + femaleStudents);

    res.render('dashboard', {
      title: 'Dashboard - Student Management System',
      stats: {
        totalStudents,
        maleStudents,
        femaleStudents,
        otherGenderStudents,
        totalBranches: distinctBranches.length,
        totalCourses: distinctCourses.length,
      },
      recentStudents,
      branchStats,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    req.flash('error_msg', 'Could not load dashboard statistics');
    res.render('dashboard', {
      title: 'Dashboard - Student Management System',
      stats: {
        totalStudents: 0,
        maleStudents: 0,
        femaleStudents: 0,
        otherGenderStudents: 0,
        totalBranches: 0,
        totalCourses: 0,
      },
      recentStudents: [],
      branchStats: [],
    });
  }
};

module.exports = {
  getDashboard,
};
