# Faculty Feedback System

A simple web application for students to provide feedback to faculty members.

## Features

- User authentication (Student, Faculty, Admin)
- Students can submit feedback for faculty members
- Faculty members can view feedback statistics and comments
- Profile management
- Course management

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite

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
- Email: john.smith@example.com
- Password: faculty123

- Email: jane.doe@example.com
- Password: faculty123

- Email: robert.johnson@example.com
- Password: faculty123

### Student Accounts
- Email: alice.johnson@example.com
- Password: student123

- Email: bob.williams@example.com
- Password: student123

- Email: carol.brown@example.com
- Password: student123

### Admin Account
- Email: admin@example.com
- Password: admin123

## Project Structure

- `index.html` - Main landing page
- `dashboard.html` - Student dashboard
- `faculty-dashboard.html` - Faculty dashboard
- `public/` - Static assets (CSS, JavaScript, images)
- `server/` - Server-side code
- `database/` - Database schema and setup

## License

This project is open-source and available under the MIT License. 