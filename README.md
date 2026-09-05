# 🎓 Student Management System

A full-stack, responsive, and secure **Student Management System** designed for colleges and universities. Built with **Node.js**, **Express.js**, **EJS**, **MongoDB (Mongoose)**, **Express-Session**, and **Bootstrap 5**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express.js-4.19-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
* User registration (`/signup`) with full validation.
* Secure login (`/login`) with **bcrypt** password hashing.
* Session management with `express-session` backed by MongoDB via `connect-mongo`.
* Route protection middleware for all dashboard and student management actions.
* User Profile page with secure password change functionality.

### 📊 2. College Administration Dashboard
* **Real-time KPI Cards:** Total Students, Active Degrees, Branches, and Enrolled Counts.
* **Branch Distribution Analytics:** Interactive doughnut chart powered by **Chart.js**.
* **Recent Registrations:** Quick overview of the latest enrolled students with direct action links.

### 📚 3. Complete Student CRUD
* **Add Student:** Multi-section form (Academic Details, Personal Info, Contact Information) with validation and unique roll number checks.
* **Student Directory:**
  * Real-time search by **Name**, **Roll Number**, **Email**, or **Branch**.
  * Multi-criteria filtering by **Course**, **Branch**, **Year**, and **Gender**.
  * Server-side pagination with custom records-per-page.
* **Student Profile Card:** Clean profile view showing personal, contact, and academic details.
* **Edit Student:** Pre-populated edit form with PUT method support (`method-override`).
* **Delete Student:** Confirmation modal dialog to prevent accidental deletion.

### ⚡ 4. Resilient Database Engine
* Connects seamlessly to **MongoDB Atlas** or local MongoDB.
* Transparent in-memory fallback (`mongodb-memory-server`) if no local MongoDB instance is detected, ensuring zero configuration errors during testing or development.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **View Engine** | EJS (Embedded JavaScript Templates) with partial layouts |
| **Database** | MongoDB with Mongoose ODM |
| **Session Store** | Connect-Mongo |
| **Authentication** | Express-Session & Bcrypt |
| **Styling** | Bootstrap 5, Custom Modern CSS, Font Awesome 6 Icons |
| **Data Visualization** | Chart.js |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [npm](https://www.npmjs.com/)
* A MongoDB instance (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ekanshbannsal/Student_Management_system.git
   cd Student_Management_system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure your connection string:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_super_secret_session_key
   USE_IN_MEMORY_DB=false
   ```

4. **Seed Sample Data (Optional):**
   ```bash
   npm run seed
   ```
   *Pre-populates an Administrator account and 16 realistic student records.*

5. **Start the application:**
   * For production:
     ```bash
     npm start
     ```
   * For development (with nodemon hot-reload):
     ```bash
     npm run dev
     ```

6. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `admin123` |

*(You can also register a new account anytime at `/signup`.)*

---

## 🧪 Running Tests

Run the automated smoke test suite:
```bash
npm test
```
*Executes all 10 test suites covering public pages, route protection, user registration, dashboard metrics, student CRUD, profile updates, and re-authentication.*

---

## 📁 Project Structure

```
Student_Management_system/
├── app.js                 # Express application entry point & middleware
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── .gitignore             # Ignored files (node_modules, .env)
├── README.md              # Project documentation
├── config/
│   └── db.js              # Resilient MongoDB connector
├── models/
│   ├── User.js            # User model with bcrypt pre-save hook
│   └── Student.js         # Student schema with validation & compound text index
├── controllers/
│   ├── authController.js       # Signup, login, logout, profile
│   ├── dashboardController.js  # Dashboard stats & branch chart
│   └── studentController.js    # Student CRUD, search, filter, pagination
├── middleware/
│   └── authMiddleware.js  # Route protection middleware
├── routes/
│   ├── authRoutes.js      # Auth & profile routes
│   ├── dashboardRoutes.js # Dashboard view route
│   └── studentRoutes.js   # Student CRUD routes
├── public/
│   ├── css/style.css      # Custom SaaS dashboard stylesheet
│   └── js/script.js       # Client interactions, Chart.js, confirmation modals
├── views/
│   ├── partials/          # Header, footer, navbar, sidebar, flash messages
│   ├── students/          # Student index, add, edit, show views
│   ├── dashboard.ejs      # Admin dashboard & analytics
│   ├── login.ejs          # Login page
│   ├── signup.ejs         # Registration page
│   ├── profile.ejs        # User profile & password reset
│   └── landing.ejs        # Public landing portal
└── test/
    └── smoke-test.js      # Comprehensive end-to-end smoke test suite
```

---

## 📄 License

This project is licensed under the MIT License.
