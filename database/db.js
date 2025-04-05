const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'feedback.db'));

// Initialize database
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Read schema SQL file
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        // Run schema SQL in a transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Execute each SQL statement
            const statements = schema.split(';').filter(stmt => stmt.trim());
            statements.forEach(statement => {
                db.run(statement + ';', err => {
                    if (err) {
                        console.error('Error executing schema statement:', err);
                        reject(err);
                    }
                });
            });
            
            // Commit transaction
            db.run('COMMIT', err => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    db.run('ROLLBACK');
                    reject(err);
                } else {
                    console.log('Database schema initialized successfully');
                    
                    // Check if we need to seed initial data
                    checkForInitialData()
                        .then(() => resolve())
                        .catch(err => reject(err));
                }
            });
        });
    });
}

// Check if initial data needs to be seeded
function checkForInitialData() {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
            if (err) {
                console.error('Error checking for initial data:', err);
                reject(err);
                return;
            }
            
            if (row.count === 0) {
                console.log('No users found, adding initial data...');
                seedInitialData()
                    .then(() => resolve())
                    .catch(err => reject(err));
            } else {
                console.log('Database already contains data');
                resolve();
            }
        });
    });
}

// Seed initial data
async function seedInitialData() {
    const saltRounds = 10;
    
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            db.run('BEGIN TRANSACTION');
            
            try {
                // Add admin user
                const adminPassword = await bcrypt.hash('admin123', saltRounds);
                db.run(
                    'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
                    ['Admin User', 'admin@example.com', adminPassword, 'admin']
                );
                
                // Add faculty users
                const facultyData = [
                    {
                        name: 'Dr. John Smith',
                        email: 'john.smith@example.com',
                        password: await bcrypt.hash('faculty123', saltRounds),
                        department: 'Computer Science',
                        title: 'Associate Professor'
                    },
                    {
                        name: 'Prof. Jane Doe',
                        email: 'jane.doe@example.com',
                        password: await bcrypt.hash('faculty123', saltRounds),
                        department: 'Mathematics',
                        title: 'Professor'
                    },
                    {
                        name: 'Dr. Robert Johnson',
                        email: 'robert.johnson@example.com',
                        password: await bcrypt.hash('faculty123', saltRounds),
                        department: 'Physics',
                        title: 'Assistant Professor'
                    }
                ];
                
                for (const faculty of facultyData) {
                    db.run(
                        'INSERT INTO users (name, email, password, user_type, department, title) VALUES (?, ?, ?, ?, ?, ?)',
                        [faculty.name, faculty.email, faculty.password, 'faculty', faculty.department, faculty.title],
                        function(err) {
                            if (err) throw err;
                            
                            const userId = this.lastID;
                            db.run(
                                'INSERT INTO faculties (user_id, department, title) VALUES (?, ?, ?)',
                                [userId, faculty.department, faculty.title]
                            );
                        }
                    );
                }
                
                // Add student users
                const studentData = [
                    {
                        name: 'Alice Johnson',
                        email: 'alice.johnson@example.com',
                        password: await bcrypt.hash('student123', saltRounds),
                        department: 'Computer Science',
                        year: '3rd Year'
                    },
                    {
                        name: 'Bob Williams',
                        email: 'bob.williams@example.com',
                        password: await bcrypt.hash('student123', saltRounds),
                        department: 'Mathematics',
                        year: '2nd Year'
                    },
                    {
                        name: 'Carol Brown',
                        email: 'carol.brown@example.com',
                        password: await bcrypt.hash('student123', saltRounds),
                        department: 'Physics',
                        year: '4th Year'
                    }
                ];
                
                for (const student of studentData) {
                    db.run(
                        'INSERT INTO users (name, email, password, user_type, department) VALUES (?, ?, ?, ?, ?)',
                        [student.name, student.email, student.password, 'student', student.department],
                        function(err) {
                            if (err) throw err;
                            
                            const userId = this.lastID;
                            db.run(
                                'INSERT INTO students (user_id, department, year) VALUES (?, ?, ?)',
                                [userId, student.department, student.year]
                            );
                        }
                    );
                }
                
                // Add courses
                // We'll need to get the faculty IDs first
                db.run('COMMIT', err => {
                    if (err) {
                        console.error('Error committing initial data transaction:', err);
                        db.run('ROLLBACK');
                        reject(err);
                    } else {
                        console.log('Initial data seeded successfully');
                        
                        // Now add courses in a separate transaction
                        addCourses()
                            .then(() => resolve())
                            .catch(err => reject(err));
                    }
                });
            } catch (err) {
                console.error('Error seeding initial data:', err);
                db.run('ROLLBACK');
                reject(err);
            }
        });
    });
}

// Add courses
function addCourses() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Get faculty IDs
            db.all('SELECT id, department FROM faculties', (err, faculties) => {
                if (err) {
                    console.error('Error getting faculty IDs:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                }
                
                const courseData = [
                    // Computer Science courses
                    { code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science' },
                    { code: 'CS201', name: 'Data Structures', department: 'Computer Science' },
                    // Mathematics courses
                    { code: 'MATH101', name: 'Calculus I', department: 'Mathematics' },
                    { code: 'MATH201', name: 'Linear Algebra', department: 'Mathematics' },
                    // Physics courses
                    { code: 'PHY101', name: 'Mechanics', department: 'Physics' },
                    { code: 'PHY201', name: 'Electromagnetism', department: 'Physics' }
                ];
                
                // Insert courses
                for (const course of courseData) {
                    const faculty = faculties.find(f => f.department === course.department);
                    if (faculty) {
                        db.run(
                            'INSERT INTO courses (code, name, faculty_id) VALUES (?, ?, ?)',
                            [course.code, course.name, faculty.id]
                        );
                    }
                }
                
                // Commit transaction
                db.run('COMMIT', err => {
                    if (err) {
                        console.error('Error committing courses transaction:', err);
                        db.run('ROLLBACK');
                        reject(err);
                    } else {
                        console.log('Courses added successfully');
                        resolve();
                    }
                });
            });
        });
    });
}

// Export database and initialization function
module.exports = {
    db,
    initializeDatabase
}; 