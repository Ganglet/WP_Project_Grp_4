# Faculty Feedback System

A comprehensive web application for students to provide feedback to faculty members, with department-wide analytics and privacy protections.

## Features

- User authentication with three roles (Student, Faculty, Admin)
- Privacy-focused feedback system with anonymized student data
- Students can submit detailed feedback for faculty members across multiple courses
- Faculty members can view aggregated feedback statistics and anonymous comments
- Administrators can access detailed feedback data and system-wide statistics
- Department and course-specific analytics
- Profile management for all user types
- Quick login with demo accounts
- Comprehensive review criteria including:
  - Teaching Quality
  - Communication Skills
  - Helpfulness
  - Knowledge of Subject Matter
  - Course Content Organization
  - Availability Outside Class
  - Fairness in Grading

## New Features and Improvements

- **Enhanced UI**: Improved design and user experience with Google Fonts (Poppins) integration
- **Modernized Interface**: Consistent typography and styling across all pages
- **Responsive Design**: Better mobile and tablet compatibility
- **Anonymized Feedback**: Faculty members only see aggregate ratings without student identifiers
- **Admin Dashboard**: Comprehensive view of all faculty feedback with detailed statistics
- **Expanded Faculty Database**: Six faculty members across different departments
- **Expanded Course Catalog**: Multiple courses per faculty member
- **Quick Login**: Direct access via demo accounts for testing purposes
- **Comprehensive Rating System**: Seven detailed criteria for thorough faculty evaluation

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **UI/UX**: Google Fonts (Poppins), Responsive Design
- **Backend**: Node.js, Express.js
- **Database**: SQLite (with client-side localStorage for demo purposes)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd faculty-feedback-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Initialize the database:
   ```
   npm run init-db
   ```

4. Start the server:
   ```
   npm start
   ```

5. Access the application:
   Open your browser and visit `http://localhost:3000`

### Development Mode

To run the application in development mode with auto-restart:
```
npm run dev
```

## Demo Accounts

The application comes with pre-configured demo accounts:

### Faculty Accounts
- **Dr. John Smith** (Computer Science)
  - Email: john.smith@example.com
  - Password: faculty123

- **Prof. Jane Doe** (Mathematics)
  - Email: jane.doe@example.com
  - Password: faculty123

- **Dr. Robert Johnson** (Physics)
  - Email: robert.johnson@example.com
  - Password: faculty123

- **Dr. Michael Williams** (Chemistry)
  - Email: michael.williams@example.com
  - Password: faculty123

- **Prof. Sarah Brown** (Biology)
  - Email: sarah.brown@example.com
  - Password: faculty123

- **Dr. David Miller** (Engineering)
  - Email: david.miller@example.com
  - Password: faculty123

### Student Accounts
- **Alice Johnson** (Computer Science)
  - Email: alice.johnson@example.com
  - Password: student123

- **Bob Williams** (Mathematics)
  - Email: bob.williams@example.com
  - Password: student123

- **Carol Brown** (Physics)
  - Email: carol.brown@example.com
  - Password: student123

- **David Lee** (Computer Science)
  - Email: david.lee@example.com
  - Password: student123

- **Emma Wilson** (Mathematics)
  - Email: emma.wilson@example.com
  - Password: student123

### Admin Account
- **Admin User**
  - Email: admin@example.com
  - Password: admin123

## Project Structure

- `index.html` - Main landing page with quick login options
- `dashboard.html` - Student dashboard for submitting feedback
- `faculty-dashboard.html` - Faculty dashboard with anonymized feedback
- `admin-dashboard.html` - Admin dashboard with comprehensive analytics
- `public/` - Static assets
  - `css/` - Stylesheet files
    - `style.css` - Core styles for the application
    - `login.css` - Styles for the login and registration forms
    - `dashboard.css` - Styles for student and faculty dashboards
    - `admin-dashboard.css` - Styles for the admin dashboard
    - `main.css` - Additional styles to enhance UI/UX across all pages
  - `js/` - JavaScript files
  - `img/` - Image assets
- `server/` - Server-side code
- `database/` - Database schema and setup

## UI/UX Improvements

- **Typography**: Implemented Google Fonts (Poppins) for a modern, clean look
- **Consistent Styling**: Unified design language across all pages
- **Interactive Elements**: Enhanced buttons, form inputs, and navigation items
- **Visual Hierarchy**: Improved readability and information organization
- **Responsive Layout**: Better adaptation to different screen sizes
- **Animation Effects**: Subtle transitions and hover effects for better user feedback
- **Form Styling**: Consistent and user-friendly form elements

## User Workflows

### Student Workflow
1. Login as a student
2. Select a faculty member and course
3. Provide ratings and comments
4. View feedback history

### Faculty Workflow
1. Login as a faculty member
2. View aggregate feedback statistics
3. Read anonymous student comments
4. Filter feedback by course or date

### Admin Workflow
1. Login as an admin
2. View faculty overview with ratings
3. Access detailed feedback for any faculty member
4. View system-wide statistics

## License

This project is open-source and available under the MIT License. 