const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db, initializeDatabase } = require('../database/db');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// Initialize database
initializeDatabase()
    .then(() => {
        console.log('Database initialized successfully');
    })
    .catch(err => {
        console.error('Error initializing database:', err);
        process.exit(1);
    });

// Routes
// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password, userType } = req.body;
    
    if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find user by email and user type
    db.get(
        'SELECT * FROM users WHERE email = ? AND user_type = ?',
        [email, userType],
        async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Create session
            const sessionId = uuidv4();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
            
            db.run(
                'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
                [sessionId, user.id, expiresAt.toISOString()],
                err => {
                    if (err) {
                        console.error('Error creating session:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    
                    // Return user info and session token
                    res.json({
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                        userType: user.user_type,
                        department: user.department,
                        title: user.title,
                        token: sessionId
                    });
                }
            );
        }
    );
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, userType, department, year, title } = req.body;
    
    if (!name || !email || !password || !userType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (row) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            db.run(
                'INSERT INTO users (name, email, password, user_type, department, title) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, userType, department, title],
                function(err) {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    
                    const userId = this.lastID;
                    
                    // Insert additional user info based on user type
                    if (userType === 'student') {
                        db.run(
                            'INSERT INTO students (user_id, department, year) VALUES (?, ?, ?)',
                            [userId, department, year],
                            err => {
                                if (err) {
                                    console.error('Error inserting student:', err);
                                    return res.status(500).json({ error: 'Internal server error' });
                                }
                                
                                res.status(201).json({ message: 'User registered successfully' });
                            }
                        );
                    } else if (userType === 'faculty') {
                        db.run(
                            'INSERT INTO faculties (user_id, department, title) VALUES (?, ?, ?)',
                            [userId, department, title],
                            err => {
                                if (err) {
                                    console.error('Error inserting faculty:', err);
                                    return res.status(500).json({ error: 'Internal server error' });
                                }
                                
                                res.status(201).json({ message: 'User registered successfully' });
                            }
                        );
                    } else {
                        res.status(201).json({ message: 'User registered successfully' });
                    }
                }
            );
        } catch (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }
    
    // Delete session
    db.run('DELETE FROM sessions WHERE id = ?', [token], err => {
        if (err) {
            console.error('Error deleting session:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.json({ message: 'Logged out successfully' });
    });
});

// Faculty endpoints
app.get('/api/faculties', (req, res) => {
    db.all(
        `SELECT f.id, u.name, f.department, f.title 
         FROM faculties f
         JOIN users u ON f.user_id = u.id
         ORDER BY u.name`,
        (err, faculties) => {
            if (err) {
                console.error('Error fetching faculties:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            res.json(faculties);
        }
    );
});

// Courses endpoints
app.get('/api/courses', (req, res) => {
    const facultyId = req.query.faculty_id;
    
    let query = `
        SELECT c.id, c.code, c.name, f.id as faculty_id, u.name as faculty_name
        FROM courses c
        JOIN faculties f ON c.faculty_id = f.id
        JOIN users u ON f.user_id = u.id
    `;
    
    const params = [];
    
    if (facultyId) {
        query += ' WHERE f.id = ?';
        params.push(facultyId);
    }
    
    query += ' ORDER BY c.code';
    
    db.all(query, params, (err, courses) => {
        if (err) {
            console.error('Error fetching courses:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.json(courses);
    });
});

// Feedback endpoints
app.post('/api/feedback', (req, res) => {
    const { studentId, facultyId, courseId, teachingRating, communicationRating, helpfulnessRating, comments } = req.body;
    
    if (!studentId || !facultyId || !courseId || !teachingRating || !communicationRating || !helpfulnessRating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO feedback 
         (student_id, faculty_id, course_id, teaching_rating, communication_rating, helpfulness_rating, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, facultyId, courseId, teachingRating, communicationRating, helpfulnessRating, comments],
        function(err) {
            if (err) {
                console.error('Error submitting feedback:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            res.status(201).json({ id: this.lastID, message: 'Feedback submitted successfully' });
        }
    );
});

app.get('/api/feedback/student/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    db.all(
        `SELECT f.*, c.name as course_name, c.code as course_code, u.name as faculty_name
         FROM feedback f
         JOIN courses c ON f.course_id = c.id
         JOIN faculties fac ON f.faculty_id = fac.id
         JOIN users u ON fac.user_id = u.id
         WHERE f.student_id = ?
         ORDER BY f.created_at DESC`,
        [studentId],
        (err, feedback) => {
            if (err) {
                console.error('Error fetching student feedback:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            res.json(feedback);
        }
    );
});

app.get('/api/feedback/faculty/:facultyId', (req, res) => {
    const { facultyId } = req.params;
    const courseId = req.query.course_id;
    
    let query = `
        SELECT f.*, c.name as course_name, c.code as course_code
        FROM feedback f
        JOIN courses c ON f.course_id = c.id
        WHERE f.faculty_id = ?
    `;
    
    const params = [facultyId];
    
    if (courseId) {
        query += ' AND f.course_id = ?';
        params.push(courseId);
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    db.all(query, params, (err, feedback) => {
        if (err) {
            console.error('Error fetching faculty feedback:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.json(feedback);
    });
});

app.get('/api/feedback/statistics/:facultyId', (req, res) => {
    const { facultyId } = req.params;
    const courseId = req.query.course_id;
    
    let query = `
        SELECT 
            AVG(teaching_rating) as teaching_avg,
            AVG(communication_rating) as communication_avg,
            AVG(helpfulness_rating) as helpfulness_avg,
            COUNT(*) as feedback_count
        FROM feedback
        WHERE faculty_id = ?
    `;
    
    const params = [facultyId];
    
    if (courseId) {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    
    db.get(query, params, (err, stats) => {
        if (err) {
            console.error('Error fetching feedback statistics:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.json(stats);
    });
});

// User endpoints
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT id, name, email, user_type, department, title FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    });
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, department, title, currentPassword, newPassword } = req.body;
    
    // Start a transaction
    db.run('BEGIN TRANSACTION', async err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        try {
            // Update user basic info
            db.run(
                'UPDATE users SET name = ?, department = ?, title = ? WHERE id = ?',
                [name, department, title, id],
                err => {
                    if (err) throw err;
                    
                    // Update password if provided
                    if (currentPassword && newPassword) {
                        // Verify current password
                        db.get('SELECT password FROM users WHERE id = ?', [id], async (err, user) => {
                            if (err) throw err;
                            
                            if (!user) {
                                throw new Error('User not found');
                            }
                            
                            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
                            if (!passwordMatch) {
                                db.run('ROLLBACK');
                                return res.status(401).json({ error: 'Current password is incorrect' });
                            }
                            
                            // Hash and update new password
                            const hashedPassword = await bcrypt.hash(newPassword, 10);
                            db.run(
                                'UPDATE users SET password = ? WHERE id = ?',
                                [hashedPassword, id],
                                err => {
                                    if (err) throw err;
                                    
                                    // Update related tables
                                    updateRelatedTables(id, department, title)
                                        .then(() => {
                                            db.run('COMMIT', err => {
                                                if (err) throw err;
                                                res.json({ message: 'User updated successfully' });
                                            });
                                        })
                                        .catch(err => {
                                            throw err;
                                        });
                                }
                            );
                        });
                    } else {
                        // Just update related tables without changing password
                        updateRelatedTables(id, department, title)
                            .then(() => {
                                db.run('COMMIT', err => {
                                    if (err) throw err;
                                    res.json({ message: 'User updated successfully' });
                                });
                            })
                            .catch(err => {
                                throw err;
                            });
                    }
                }
            );
        } catch (err) {
            console.error('Error updating user:', err);
            db.run('ROLLBACK');
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// Helper function to update related tables (faculties or students)
function updateRelatedTables(userId, department, title) {
    return new Promise((resolve, reject) => {
        db.get('SELECT user_type FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) return reject(err);
            
            if (user.user_type === 'faculty') {
                db.run(
                    'UPDATE faculties SET department = ?, title = ? WHERE user_id = ?',
                    [department, title, userId],
                    err => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            } else if (user.user_type === 'student') {
                db.run(
                    'UPDATE students SET department = ? WHERE user_id = ?',
                    [department, userId],
                    err => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            } else {
                resolve();
            }
        });
    });
}

// Serve the static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard.html'));
});

app.get('/faculty-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../faculty-dashboard.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 