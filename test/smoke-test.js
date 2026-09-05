const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test_smoke_secret';

const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

let server;
let port;
let cookieJar = '';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      ...(cookieJar ? { Cookie: cookieJar } : {}),
      ...(postData ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    };

    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      // Capture cookies
      const setCookies = res.headers['set-cookie'];
      if (setCookies) {
        cookieJar = setCookies.map(c => c.split(';')[0]).join('; ');
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Starting Student Management System Smoke Tests...\n');

  // Start HTTP server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`📡 Test server running on http://127.0.0.1:${port}`);
      resolve();
    });
  });

  // Wait a moment for DB connection if still initializing
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Landing Page
    console.log('\n1️⃣ Testing Public Pages:');
    let res = await makeRequest({ path: '/', method: 'GET' });
    assert(res.statusCode === 200, 'GET / returns 200 OK');
    assert(res.body.includes('CampusFlow') || res.body.includes('Student Management'), 'Landing page contains system branding');

    res = await makeRequest({ path: '/login', method: 'GET' });
    assert(res.statusCode === 200, 'GET /login returns 200 OK');

    res = await makeRequest({ path: '/signup', method: 'GET' });
    assert(res.statusCode === 200, 'GET /signup returns 200 OK');

    // 2. Protected Route Redirect
    console.log('\n2️⃣ Testing Route Protection (Unauthenticated):');
    cookieJar = ''; // Clear cookies
    res = await makeRequest({ path: '/dashboard', method: 'GET' });
    assert(res.statusCode === 302, 'GET /dashboard without session redirects (302)');
    assert(res.headers.location === '/login', 'Redirect destination is /login');

    res = await makeRequest({ path: '/students', method: 'GET' });
    assert(res.statusCode === 302, 'GET /students redirects unauthenticated requests');

    // 3. User Registration
    console.log('\n3️⃣ Testing User Registration:');
    const testUid = Date.now();
    const testEmail = `tester_${testUid}@college.edu`;
    const testRoll = `SMOKE-${testUid.toString().slice(-4)}`;
    const signupData = new URLSearchParams({
      name: 'Test Administrator',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
    }).toString();

    res = await makeRequest({ path: '/signup', method: 'POST' }, signupData);
    assert(res.statusCode === 302, 'POST /signup returns 302 redirect on successful registration');
    assert(res.headers.location === '/dashboard', 'Redirects to /dashboard after signup');

    // 4. Access Dashboard With Session
    console.log('\n4️⃣ Testing Dashboard Access (Authenticated):');
    res = await makeRequest({ path: '/dashboard', method: 'GET' });
    assert(res.statusCode === 200, 'GET /dashboard returns 200 OK with active session');
    assert(res.body.includes('Test Administrator') || res.body.includes('Overview'), 'Dashboard renders user context');

    // 5. Create Student Record
    console.log('\n5️⃣ Testing Student Creation:');
    const newStudentData = new URLSearchParams({
      name: 'Smoke Test Student',
      rollNumber: testRoll,
      email: `smoke_${testUid}@example.com`,
      phone: '9988776655',
      course: 'B.Tech',
      branch: 'Computer Science (CSE)',
      year: '3rd Year',
      semester: '5th',
      gender: 'Male',
      dateOfBirth: '2004-03-15',
      address: '123 Test Boulevard, Tech City',
    }).toString();

    res = await makeRequest({ path: '/students/add', method: 'POST' }, newStudentData);
    assert(res.statusCode === 302, 'POST /students/add redirects to student list');

    // Find student in DB
    const student = await Student.findOne({ rollNumber: testRoll });
    assert(student !== null, `Student ${testRoll} saved in MongoDB`);
    assert(student.name === 'Smoke Test Student', 'Student name matches input');

    // 6. View Student List & Detail
    console.log('\n6️⃣ Testing Student Directory & Profile:');
    res = await makeRequest({ path: '/students', method: 'GET' });
    assert(res.statusCode === 200, 'GET /students returns 200 OK');
    assert(res.body.includes(testRoll), `Student table includes ${testRoll}`);

    res = await makeRequest({ path: `/students/${student._id}`, method: 'GET' });
    assert(res.statusCode === 200, `GET /students/${student._id} returns 200 OK`);
    assert(res.body.includes('Smoke Test Student'), 'Student profile renders correct name');

    // 7. Edit Student
    console.log('\n7️⃣ Testing Student Edit / Update:');
    const updateData = new URLSearchParams({
      name: 'Smoke Test Student Updated',
      rollNumber: testRoll,
      email: 'smoke.updated@example.com',
      phone: '9988776655',
      course: 'B.Tech',
      branch: 'Artificial Intelligence & Data Science (AI/DS)',
      year: '4th Year',
      semester: '7th',
      gender: 'Male',
      dateOfBirth: '2004-03-15',
      address: '456 Updated Boulevard',
    }).toString();

    res = await makeRequest({ path: `/students/${student._id}?_method=PUT`, method: 'POST' }, updateData);
    assert(res.statusCode === 302, 'PUT /students/:id updates record and redirects');

    const updatedStudent = await Student.findById(student._id);
    assert(updatedStudent.name === 'Smoke Test Student Updated', 'Student name updated in database');
    assert(updatedStudent.year === '4th Year', 'Student year updated in database');

    // 8. Delete Student
    console.log('\n8️⃣ Testing Student Deletion:');
    res = await makeRequest({ path: `/students/${student._id}?_method=DELETE`, method: 'POST' });
    assert(res.statusCode === 302, 'DELETE /students/:id removes student and redirects');

    const deletedStudent = await Student.findById(student._id);
    assert(deletedStudent === null, 'Student successfully deleted from MongoDB');

    // 9. Profile & Password Change
    console.log('\n9️⃣ Testing Profile Management:');
    res = await makeRequest({ path: '/profile', method: 'GET' });
    assert(res.statusCode === 200, 'GET /profile returns 200 OK');

    const pwdData = new URLSearchParams({
      currentPassword: 'password123',
      newPassword: 'newpassword456',
      confirmNewPassword: 'newpassword456',
    }).toString();

    res = await makeRequest({ path: '/profile/change-password', method: 'POST' }, pwdData);
    assert(res.statusCode === 302, 'POST /profile/change-password updates password and redirects');

    // 10. Logout & Re-login with new password
    console.log('\n🔟 Testing Logout & Re-Authentication:');
    res = await makeRequest({ path: '/logout', method: 'GET' });
    assert(res.statusCode === 302, 'GET /logout terminates session and redirects');

    const reloginData = new URLSearchParams({
      email: 'tester@college.edu',
      password: 'newpassword456',
    }).toString();

    res = await makeRequest({ path: '/login', method: 'POST' }, reloginData);
    assert(res.statusCode === 302, 'Login succeeds with new password');
    assert(res.headers.location === '/dashboard', 'Redirects to /dashboard after login');

    console.log('\n🎉 ALL 10 SMOKE TEST SUITES PASSED SUCCESSFULLY!\n');
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Smoke test encountered an error:', err);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
