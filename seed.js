const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

const sampleStudents = [
  {
    name: 'Rahul Sharma',
    rollNumber: '1023',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    course: 'B.Tech',
    branch: 'Computer Science (CSE)',
    year: '2nd Year',
    semester: '4th',
    gender: 'Male',
    dateOfBirth: new Date('2005-05-12'),
    address: '42 Lotus Colony, New Delhi, Delhi 110001',
  },
  {
    name: 'Priya Patel',
    rollNumber: '1024',
    email: 'priya.patel@example.com',
    phone: '9876543211',
    course: 'B.Tech',
    branch: 'Artificial Intelligence & Data Science (AI/DS)',
    year: '1st Year',
    semester: '2nd',
    gender: 'Female',
    dateOfBirth: new Date('2006-03-24'),
    address: '15 Gandhi Marg, Ahmedabad, Gujarat 380009',
  },
  {
    name: 'Amit Verma',
    rollNumber: '1025',
    email: 'amit.verma@example.com',
    phone: '9876543212',
    course: 'B.Tech',
    branch: 'Electronics & Communication (ECE)',
    year: '3rd Year',
    semester: '6th',
    gender: 'Male',
    dateOfBirth: new Date('2004-11-08'),
    address: '88 Civil Lines, Jaipur, Rajasthan 302006',
  },
  {
    name: 'Sneha Gupta',
    rollNumber: '1026',
    email: 'sneha.gupta@example.com',
    phone: '9876543213',
    course: 'B.Tech',
    branch: 'Information Technology (IT)',
    year: '2nd Year',
    semester: '3rd',
    gender: 'Female',
    dateOfBirth: new Date('2005-08-19'),
    address: '12 Park Street, Kolkata, West Bengal 700016',
  },
  {
    name: 'Rohan Mehta',
    rollNumber: '1027',
    email: 'rohan.mehta@example.com',
    phone: '9876543214',
    course: 'B.Tech',
    branch: 'Mechanical Engineering (ME)',
    year: '4th Year',
    semester: '7th',
    gender: 'Male',
    dateOfBirth: new Date('2003-09-14'),
    address: '504 Marine Drive, Mumbai, Maharashtra 400020',
  },
  {
    name: 'Ananya Singh',
    rollNumber: '1028',
    email: 'ananya.singh@example.com',
    phone: '9876543215',
    course: 'B.Tech',
    branch: 'Computer Science (CSE)',
    year: '1st Year',
    semester: '1st',
    gender: 'Female',
    dateOfBirth: new Date('2006-07-30'),
    address: '23 Gomti Nagar, Lucknow, Uttar Pradesh 226010',
  },
  {
    name: 'Vikram Reddy',
    rollNumber: '1029',
    email: 'vikram.reddy@example.com',
    phone: '9876543216',
    course: 'B.Tech',
    branch: 'Civil Engineering (CE)',
    year: '3rd Year',
    semester: '5th',
    gender: 'Male',
    dateOfBirth: new Date('2004-02-18'),
    address: '77 Jubilee Hills, Hyderabad, Telangana 500033',
  },
  {
    name: 'Pooja Joshi',
    rollNumber: '1030',
    email: 'pooja.joshi@example.com',
    phone: '9876543217',
    course: 'B.Tech',
    branch: 'Electrical Engineering (EE)',
    year: '2nd Year',
    semester: '4th',
    gender: 'Female',
    dateOfBirth: new Date('2005-12-05'),
    address: '31 Deccan Gymkhana, Pune, Maharashtra 411004',
  },
  {
    name: 'Rajesh Nair',
    rollNumber: '1031',
    email: 'rajesh.nair@example.com',
    phone: '9876543218',
    course: 'BCA',
    branch: 'Information Technology (IT)',
    year: '1st Year',
    semester: '2nd',
    gender: 'Male',
    dateOfBirth: new Date('2006-01-15'),
    address: '9 MG Road, Kochi, Kerala 682016',
  },
  {
    name: 'Kavita Sen',
    rollNumber: '1032',
    email: 'kavita.sen@example.com',
    phone: '9876543219',
    course: 'MCA',
    branch: 'Computer Science (CSE)',
    year: '2nd Year',
    semester: '3rd',
    gender: 'Female',
    dateOfBirth: new Date('2002-10-22'),
    address: '14 Salt Lake, Sector 5, Kolkata 700091',
  },
  {
    name: 'Karan Malhotra',
    rollNumber: '1033',
    email: 'karan.malhotra@example.com',
    phone: '9876543220',
    course: 'BBA',
    branch: 'Business Administration',
    year: '3rd Year',
    semester: '5th',
    gender: 'Male',
    dateOfBirth: new Date('2004-06-11'),
    address: '29 Sector 17, Chandigarh 160017',
  },
  {
    name: 'Neha Choudhury',
    rollNumber: '1034',
    email: 'neha.choudhury@example.com',
    phone: '9876543221',
    course: 'MBA',
    branch: 'Business Administration',
    year: '1st Year',
    semester: '1st',
    gender: 'Female',
    dateOfBirth: new Date('2001-04-09'),
    address: '101 Indiranagar, Bengaluru, Karnataka 560038',
  },
  {
    name: 'Arjun Das',
    rollNumber: '1035',
    email: 'arjun.das@example.com',
    phone: '9876543222',
    course: 'B.Tech',
    branch: 'Artificial Intelligence & Data Science (AI/DS)',
    year: '2nd Year',
    semester: '3rd',
    gender: 'Male',
    dateOfBirth: new Date('2005-09-02'),
    address: '67 Anna Nagar, Chennai, Tamil Nadu 600040',
  },
  {
    name: 'Divya Menon',
    rollNumber: '1036',
    email: 'divya.menon@example.com',
    phone: '9876543223',
    course: 'B.Tech',
    branch: 'Electronics & Communication (ECE)',
    year: '4th Year',
    semester: '8th',
    gender: 'Female',
    dateOfBirth: new Date('2003-08-16'),
    address: '19 Panampilly Nagar, Ernakulam, Kerala 682036',
  },
  {
    name: 'Siddharth Rao',
    rollNumber: '1037',
    email: 'siddharth.rao@example.com',
    phone: '9876543224',
    course: 'B.Tech',
    branch: 'Information Technology (IT)',
    year: '3rd Year',
    semester: '6th',
    gender: 'Male',
    dateOfBirth: new Date('2004-12-28'),
    address: '55 Banjara Hills, Hyderabad, Telangana 500034',
  },
  {
    name: 'Shreya Iyer',
    rollNumber: '1038',
    email: 'shreya.iyer@example.com',
    phone: '9876543225',
    course: 'B.Tech',
    branch: 'Computer Science (CSE)',
    year: '4th Year',
    semester: '8th',
    gender: 'Female',
    dateOfBirth: new Date('2003-05-04'),
    address: '8 Alwarpet, Chennai, Tamil Nadu 600018',
  },
];

const seedDatabase = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      console.log('🌱 Connecting to database for seeding...');
      await connectDB();
    }

    const studentCount = await Student.countDocuments();
    if (!isStandalone && studentCount > 0) {
      return; // Already populated
    }

    if (isStandalone) {
      console.log('🧹 Clearing existing collections...');
      await User.deleteMany({});
      await Student.deleteMany({});
    }

    console.log('👤 Creating default Administrator user...');
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@college.edu',
      password: 'admin123',
    });
    await adminUser.save();
    console.log(`✅ Admin user created: ${adminUser.email} (Password: admin123)`);

    console.log(`📚 Inserting ${sampleStudents.length} sample student records...`);
    const insertedStudents = await Student.insertMany(sampleStudents);
    console.log(`✅ Successfully seeded ${insertedStudents.length} students across branches!`);

    if (isStandalone) {
      console.log('\n📊 Seeding Summary:');
      console.log(`- Total Students: ${insertedStudents.length}`);
      console.log(`- Default Login: admin@college.edu / admin123`);
      console.log('🚀 Ready to start the application with: npm start\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (isStandalone) process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase, sampleStudents };

