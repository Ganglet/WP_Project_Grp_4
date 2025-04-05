document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and registration forms
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form-container form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and forms
            tabBtns.forEach(b => b.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked button and its form
            this.classList.add('active');
            const targetFormId = this.getAttribute('data-target');
            document.getElementById(targetFormId).classList.add('active');
        });
    });
    
    // Quick login with demo accounts
    const accountOptions = document.querySelectorAll('.account-option');
    
    accountOptions.forEach(option => {
        option.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');
            const userType = this.getAttribute('data-type');
            
            // Fill in login form
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = password;
            document.getElementById('user-type').value = userType;
            
            // Show a message
            showMessage(`Demo account selected. Click Login to continue.`, 'success');
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const userType = document.getElementById('user-type').value;
        
        // Validate form
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // For demonstration, we'll use localStorage to simulate user login
        // In a real application, you would send this to a server for authentication
        
        // Check if it's a demo account for direct login
        const isDemoAccount = checkDemoAccount(email, password, userType);
        
        if (isDemoAccount) {
            // Create user session directly
            const userData = {
                email: email,
                userType: userType,
                isLoggedIn: true
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // If this is the first time, populate the users array with demo data
            if (!localStorage.getItem('users')) {
                initializeDemoData();
            }
            
            // Redirect based on user type
            redirectBasedOnUserType(userType);
        } else {
            // Check if the email and password match a registered user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password && u.userType === userType);
            
            if (user) {
                // Create user session
                const userData = {
                    email: email,
                    userType: userType,
                    isLoggedIn: true
                };
                
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Redirect based on user type
                redirectBasedOnUserType(userType);
            } else {
                showMessage('Invalid credentials. Try a demo account or register a new account.', 'error');
            }
        }
    });
    
    // Registration form submission
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const userType = document.getElementById('register-user-type').value;
        
        // Validate form
        if (!name || !email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // For demonstration, we'll use localStorage to store user data
        // In a real application, you would send this to a server for registration
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(user => user.email === email)) {
            showMessage('Email already registered', 'error');
            return;
        }
        
        // Add new user
        users.push({
            name: name,
            email: email,
            // In a real app, passwords should be hashed
            password: password,
            userType: userType,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage('Registration successful! You can now login.', 'success');
        
        // Reset form and switch to login tab
        registerForm.reset();
        tabBtns[0].click();
    });
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isLoggedIn) {
        // Redirect based on user type
        redirectBasedOnUserType(currentUser.userType);
    }
    
    // Function to redirect based on user type
    function redirectBasedOnUserType(userType) {
        if (userType === 'student') {
            window.location.href = 'dashboard.html';
        } else if (userType === 'faculty') {
            window.location.href = 'faculty-dashboard.html';
        } else if (userType === 'admin') {
            window.location.href = 'admin-dashboard.html';
        }
    }
    
    // Function to check if the credentials match a demo account
    function checkDemoAccount(email, password, userType) {
        const demoAccounts = [
            { email: 'john.smith@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'jane.doe@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'robert.johnson@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'michael.williams@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'sarah.brown@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'david.miller@example.com', password: 'faculty123', userType: 'faculty' },
            { email: 'alice.johnson@example.com', password: 'student123', userType: 'student' },
            { email: 'bob.williams@example.com', password: 'student123', userType: 'student' },
            { email: 'carol.brown@example.com', password: 'student123', userType: 'student' },
            { email: 'david.lee@example.com', password: 'student123', userType: 'student' },
            { email: 'emma.wilson@example.com', password: 'student123', userType: 'student' },
            { email: 'admin@example.com', password: 'admin123', userType: 'admin' }
        ];
        
        return demoAccounts.some(account => 
            account.email === email && 
            account.password === password && 
            account.userType === userType
        );
    }
    
    // Function to initialize demo data if this is the first time
    function initializeDemoData() {
        const faculties = [
            { id: 'f1', name: 'Dr. John Smith', department: 'Computer Science', title: 'Associate Professor' },
            { id: 'f2', name: 'Prof. Jane Doe', department: 'Mathematics', title: 'Professor' },
            { id: 'f3', name: 'Dr. Robert Johnson', department: 'Physics', title: 'Assistant Professor' },
            { id: 'f4', name: 'Dr. Michael Williams', department: 'Chemistry', title: 'Associate Professor' },
            { id: 'f5', name: 'Prof. Sarah Brown', department: 'Biology', title: 'Professor' },
            { id: 'f6', name: 'Dr. David Miller', department: 'Engineering', title: 'Assistant Professor' }
        ];
        
        const courses = {
            'f1': [
                { id: 'c1', name: 'Introduction to Programming', code: 'CS101' },
                { id: 'c2', name: 'Data Structures', code: 'CS201' },
                { id: 'c7', name: 'Software Engineering', code: 'CS301' },
                { id: 'c8', name: 'Algorithms', code: 'CS202' }
            ],
            'f2': [
                { id: 'c3', name: 'Calculus I', code: 'MATH101' },
                { id: 'c4', name: 'Linear Algebra', code: 'MATH201' },
                { id: 'c9', name: 'Differential Equations', code: 'MATH301' },
                { id: 'c10', name: 'Statistics', code: 'MATH202' }
            ],
            'f3': [
                { id: 'c5', name: 'Mechanics', code: 'PHY101' },
                { id: 'c6', name: 'Electromagnetism', code: 'PHY201' },
                { id: 'c11', name: 'Quantum Physics', code: 'PHY301' },
                { id: 'c12', name: 'Thermodynamics', code: 'PHY202' }
            ],
            'f4': [
                { id: 'c13', name: 'General Chemistry', code: 'CHEM101' },
                { id: 'c14', name: 'Organic Chemistry', code: 'CHEM201' },
                { id: 'c15', name: 'Biochemistry', code: 'CHEM301' }
            ],
            'f5': [
                { id: 'c16', name: 'Cell Biology', code: 'BIO101' },
                { id: 'c17', name: 'Molecular Biology', code: 'BIO201' },
                { id: 'c18', name: 'Genetics', code: 'BIO301' }
            ],
            'f6': [
                { id: 'c19', name: 'Statics', code: 'ENG101' },
                { id: 'c20', name: 'Dynamics', code: 'ENG201' },
                { id: 'c21', name: 'Fluid Mechanics', code: 'ENG301' }
            ]
        };
        
        // Add demo feedback data
        const feedbackData = [
            {
                id: 'fb1',
                studentEmail: 'alice.johnson@example.com',
                facultyId: 'f1',
                courseId: 'c1',
                ratings: {
                    teaching: 5,
                    communication: 4,
                    helpfulness: 5
                },
                comments: 'Very knowledgeable and always willing to help students.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
            },
            {
                id: 'fb2',
                studentEmail: 'bob.williams@example.com',
                facultyId: 'f1',
                courseId: 'c2',
                ratings: {
                    teaching: 4,
                    communication: 5,
                    helpfulness: 4
                },
                comments: 'Explains complex topics in an understandable way.',
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            },
            {
                id: 'fb3',
                studentEmail: 'carol.brown@example.com',
                facultyId: 'f2',
                courseId: 'c3',
                ratings: {
                    teaching: 5,
                    communication: 5,
                    helpfulness: 4
                },
                comments: 'Excellent teaching methods, makes math interesting.',
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
            },
            {
                id: 'fb4',
                studentEmail: 'david.lee@example.com',
                facultyId: 'f3',
                courseId: 'c5',
                ratings: {
                    teaching: 4,
                    communication: 3,
                    helpfulness: 5
                },
                comments: 'Great with practical examples, but sometimes lectures are hard to follow.',
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
            },
            {
                id: 'fb5',
                studentEmail: 'emma.wilson@example.com',
                facultyId: 'f4',
                courseId: 'c13',
                ratings: {
                    teaching: 5,
                    communication: 4,
                    helpfulness: 5
                },
                comments: 'Very organized and clear in explanations.',
                date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago
            },
            {
                id: 'fb6',
                studentEmail: 'alice.johnson@example.com',
                facultyId: 'f5',
                courseId: 'c16',
                ratings: {
                    teaching: 5,
                    communication: 5,
                    helpfulness: 5
                },
                comments: 'Passionate about the subject, makes biology fascinating.',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
            },
            {
                id: 'fb7',
                studentEmail: 'bob.williams@example.com',
                facultyId: 'f6',
                courseId: 'c19',
                ratings: {
                    teaching: 4,
                    communication: 4,
                    helpfulness: 4
                },
                comments: 'Good teaching techniques, but assignments can be challenging.',
                date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // 35 days ago
            },
            {
                id: 'fb8',
                studentEmail: 'carol.brown@example.com',
                facultyId: 'f3',
                courseId: 'c6',
                ratings: {
                    teaching: 5,
                    communication: 4,
                    helpfulness: 4
                },
                comments: 'Explains difficult physics concepts clearly with good examples.',
                date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
            },
            {
                id: 'fb9',
                studentEmail: 'david.lee@example.com',
                facultyId: 'f2',
                courseId: 'c4',
                ratings: {
                    teaching: 4,
                    communication: 5,
                    helpfulness: 5
                },
                comments: 'Always available to help outside of class.',
                date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
            },
            {
                id: 'fb10',
                studentEmail: 'emma.wilson@example.com',
                facultyId: 'f1',
                courseId: 'c8',
                ratings: {
                    teaching: 5,
                    communication: 4,
                    helpfulness: 5
                },
                comments: 'Excellent at breaking down complex algorithms.',
                date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() // 50 days ago
            }
        ];
        
        // Add demo users
        const users = [
            // Faculty users
            {
                name: 'Dr. John Smith',
                email: 'john.smith@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Computer Science',
                title: 'Associate Professor',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Prof. Jane Doe',
                email: 'jane.doe@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Mathematics',
                title: 'Professor',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Dr. Robert Johnson',
                email: 'robert.johnson@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Physics',
                title: 'Assistant Professor',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Dr. Michael Williams',
                email: 'michael.williams@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Chemistry',
                title: 'Associate Professor',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Prof. Sarah Brown',
                email: 'sarah.brown@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Biology',
                title: 'Professor',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Dr. David Miller',
                email: 'david.miller@example.com',
                password: 'faculty123',
                userType: 'faculty',
                department: 'Engineering',
                title: 'Assistant Professor',
                createdAt: new Date().toISOString()
            },
            // Student users
            {
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                password: 'student123',
                userType: 'student',
                department: 'Computer Science',
                year: '3rd Year',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Bob Williams',
                email: 'bob.williams@example.com',
                password: 'student123',
                userType: 'student',
                department: 'Mathematics',
                year: '2nd Year',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Carol Brown',
                email: 'carol.brown@example.com',
                password: 'student123',
                userType: 'student',
                department: 'Physics',
                year: '4th Year',
                createdAt: new Date().toISOString()
            },
            {
                name: 'David Lee',
                email: 'david.lee@example.com',
                password: 'student123',
                userType: 'student',
                department: 'Computer Science',
                year: '3rd Year',
                createdAt: new Date().toISOString()
            },
            {
                name: 'Emma Wilson',
                email: 'emma.wilson@example.com',
                password: 'student123',
                userType: 'student',
                department: 'Mathematics',
                year: '2nd Year',
                createdAt: new Date().toISOString()
            },
            // Admin user
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                userType: 'admin',
                department: 'Administration',
                createdAt: new Date().toISOString()
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('faculties', JSON.stringify(faculties));
        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('feedback', JSON.stringify(feedbackData));
    }
    
    // Function to show messages
    function showMessage(message, type) {
        // Create message element if it doesn't exist
        let messageEl = document.querySelector('.message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message';
            document.querySelector('.auth-container').prepend(messageEl);
        }
        
        // Set message content and style
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}); 