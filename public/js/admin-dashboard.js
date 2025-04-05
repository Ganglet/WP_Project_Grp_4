document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isLoggedIn || currentUser.userType !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Navigation between sections
    const navLinks = document.querySelectorAll('.nav-links a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id === 'logout-btn') {
                // Handle logout
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
                return;
            }
            
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1) + '-section';
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Back to overview button
    document.querySelector('.back-to-overview').addEventListener('click', function(e) {
        e.preventDefault();
        navLinks[0].click();
    });
    
    // Load user data
    updateUserInfo();
    
    // Load faculty overview
    loadFacultyOverview();
    
    // Load system statistics
    loadSystemStatistics();
    
    // Handle viewing detailed feedback
    document.querySelector('#faculty-overview-container').addEventListener('click', function(e) {
        if (e.target.classList.contains('view-detailed-btn')) {
            const facultyId = e.target.getAttribute('data-faculty-id');
            loadDetailedFeedback(facultyId);
            
            // Navigate to detailed section
            navLinks[1].click();
        }
    });
    
    // Department filter change event
    const departmentFilter = document.getElementById('department-filter');
    departmentFilter.addEventListener('change', function() {
        loadFacultyOverview(this.value, document.getElementById('rating-filter').value);
    });
    
    // Rating filter change event
    const ratingFilter = document.getElementById('rating-filter');
    ratingFilter.addEventListener('change', function() {
        loadFacultyOverview(document.getElementById('department-filter').value, this.value);
    });
    
    // Detailed course filter change event
    const detailedCourseFilter = document.getElementById('detailed-course-filter');
    detailedCourseFilter.addEventListener('change', function() {
        const facultyId = this.getAttribute('data-faculty-id');
        if (facultyId) {
            loadDetailedFeedbackItems(facultyId, this.value, document.getElementById('detailed-date-filter').value);
        }
    });
    
    // Detailed date filter change event
    const detailedDateFilter = document.getElementById('detailed-date-filter');
    detailedDateFilter.addEventListener('change', function() {
        const facultyId = detailedCourseFilter.getAttribute('data-faculty-id');
        if (facultyId) {
            loadDetailedFeedbackItems(facultyId, detailedCourseFilter.value, this.value);
        }
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profile-name').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        
        // Validate form
        if (!name) {
            showMessage('Please enter your name', 'error');
            return;
        }
        
        // Update user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        
        if (userIndex !== -1) {
            // Update name
            users[userIndex].name = name;
            
            // Update password if provided
            if (currentPassword && newPassword) {
                if (users[userIndex].password === currentPassword) {
                    users[userIndex].password = newPassword;
                } else {
                    showMessage('Current password is incorrect', 'error');
                    return;
                }
            }
            
            // Save updated user data
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update UI
            updateUserInfo();
            
            // Show success message
            showMessage('Profile updated successfully!', 'success');
            
            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            showMessage('User not found', 'error');
        }
    });
    
    // Helper functions
    function updateUserInfo() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = users.find(user => user.email === currentUser.email) || { name: 'Admin User' };
        
        document.getElementById('user-initial').textContent = userData.name.charAt(0);
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-email').textContent = currentUser.email;
        document.getElementById('welcome-name').textContent = userData.name.split(' ')[0];
        
        // Update profile form
        document.getElementById('profile-name').value = userData.name;
        document.getElementById('profile-email').value = currentUser.email;
    }
    
    function loadFacultyOverview(departmentFilter = 'all', ratingFilter = 'all') {
        // Get faculty data
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Check if faculties array has all 6 faculty members
        const expectedFaculties = [
            { id: 'f1', name: 'Dr. John Smith', department: 'Computer Science', title: 'Associate Professor' },
            { id: 'f2', name: 'Prof. Jane Doe', department: 'Mathematics', title: 'Professor' },
            { id: 'f3', name: 'Dr. Robert Johnson', department: 'Physics', title: 'Assistant Professor' },
            { id: 'f4', name: 'Dr. Michael Williams', department: 'Chemistry', title: 'Associate Professor' },
            { id: 'f5', name: 'Prof. Sarah Brown', department: 'Biology', title: 'Professor' },
            { id: 'f6', name: 'Dr. David Miller', department: 'Engineering', title: 'Assistant Professor' }
        ];
        
        // If faculties array is empty or incomplete, use the expected faculties
        let facultyData = faculties.length === 6 ? faculties : expectedFaculties;
        
        // Map faculty IDs with user data
        facultyData = facultyData.map(faculty => {
            // Find the expected faculty data from our list
            const expectedFaculty = expectedFaculties.find(ef => ef.id === faculty.id) || faculty;
            
            const user = users.find(u => u.id === faculty.user_id || 
                                     (u.userType === 'faculty' && 
                                      (u.email === `${faculty.name.toLowerCase().replace(/\s+/g, '.')}@example.com` ||
                                       u.department === faculty.department)));
            
            // Calculate average rating
            const facultyFeedback = allFeedback.filter(f => f.facultyId === faculty.id);
            let avgRating = 0;
            
            if (facultyFeedback.length > 0) {
                let totalRating = 0;
                facultyFeedback.forEach(feedback => {
                    // Include all seven criteria in the average calculation
                    const feedbackTotal = 
                        (feedback.ratings.teaching || 0) + 
                        (feedback.ratings.communication || 0) + 
                        (feedback.ratings.helpfulness || 0) + 
                        (feedback.ratings.knowledge || 0) + 
                        (feedback.ratings.organization || 0) + 
                        (feedback.ratings.availability || 0) + 
                        (feedback.ratings.fairness || 0);
                    
                    // Count how many criteria are available (for backward compatibility)
                    let criteriaCount = 3; // At minimum, we have the original 3
                    if (feedback.ratings.knowledge) criteriaCount++;
                    if (feedback.ratings.organization) criteriaCount++;
                    if (feedback.ratings.availability) criteriaCount++;
                    if (feedback.ratings.fairness) criteriaCount++;
                    
                    const feedbackAvg = feedbackTotal / criteriaCount;
                    totalRating += feedbackAvg;
                });
                avgRating = totalRating / facultyFeedback.length;
            }
            
            return {
                id: faculty.id,
                name: user ? user.name : expectedFaculty.name, // Use expected faculty name
                email: user ? user.email : `${expectedFaculty.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                department: expectedFaculty.department,
                title: faculty.title || user?.title || expectedFaculty.title || 'Faculty Member',
                avgRating: avgRating.toFixed(1),
                feedbackCount: facultyFeedback.length
            };
        });
        
        // Apply filters
        let filteredFaculties = facultyData;
        
        if (departmentFilter !== 'all') {
            filteredFaculties = filteredFaculties.filter(f => f.department === departmentFilter);
        }
        
        if (ratingFilter !== 'all') {
            filteredFaculties = filteredFaculties.filter(f => parseFloat(f.avgRating) >= parseFloat(ratingFilter));
        }
        
        // Generate faculty cards
        const facultyContainer = document.getElementById('faculty-overview-container');
        let html = '';
        
        if (filteredFaculties.length === 0) {
            html = '<p class="empty-state">No faculty members match the selected filters.</p>';
        } else {
            filteredFaculties.forEach(faculty => {
                // Generate stars HTML
                const fullStars = Math.floor(faculty.avgRating);
                const hasHalfStar = (faculty.avgRating - fullStars) >= 0.5;
                
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= fullStars) {
                        starsHtml += '<span class="star full">★</span>';
                    } else if (i === fullStars + 1 && hasHalfStar) {
                        starsHtml += '<span class="star half">★</span>';
                    } else {
                        starsHtml += '<span class="star">★</span>';
                    }
                }
                
                html += `
                    <div class="faculty-card">
                        <h3>${expectedFaculties.find(ef => ef.id === faculty.id)?.name || faculty.name}</h3>
                        <p><strong>Department:</strong> ${faculty.department}</p>
                        <p><strong>Title:</strong> ${faculty.title}</p>
                        <div class="rating-summary">
                            <span>${faculty.avgRating}</span>
                            <div class="rating-stars">
                                ${starsHtml}
                            </div>
                        </div>
                        <p><strong>Feedback count:</strong> ${faculty.feedbackCount}</p>
                        <button class="btn view-detailed-btn" data-faculty-id="${faculty.id}">View Detailed Feedback</button>
                    </div>
                `;
            });
        }
        
        facultyContainer.innerHTML = html;
    }
    
    function loadDetailedFeedback(facultyId) {
        // Get faculty data
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Define the expected faculties list
        const expectedFaculties = [
            { id: 'f1', name: 'Dr. John Smith', department: 'Computer Science', title: 'Associate Professor' },
            { id: 'f2', name: 'Prof. Jane Doe', department: 'Mathematics', title: 'Professor' },
            { id: 'f3', name: 'Dr. Robert Johnson', department: 'Physics', title: 'Assistant Professor' },
            { id: 'f4', name: 'Dr. Michael Williams', department: 'Chemistry', title: 'Associate Professor' },
            { id: 'f5', name: 'Prof. Sarah Brown', department: 'Biology', title: 'Professor' },
            { id: 'f6', name: 'Dr. David Miller', department: 'Engineering', title: 'Assistant Professor' }
        ];
        
        // Find the faculty from localStorage or from our expected list
        let faculty = faculties.find(f => f.id === facultyId);
        
        if (!faculty) {
            faculty = expectedFaculties.find(f => f.id === facultyId);
        }
        
        if (!faculty) {
            showMessage('Faculty not found', 'error');
            return;
        }
        
        // Find the corresponding user
        const user = users.find(u => u.id === faculty.user_id || 
                               (u.userType === 'faculty' && 
                               (u.email === `${faculty.name.toLowerCase().replace(/\s+/g, '.')}@example.com` ||
                                u.department === faculty.department)));
        
        // Find the expected faculty data
        const expectedFaculty = expectedFaculties.find(ef => ef.id === facultyId);
        
        // Update faculty with user info if available, otherwise use expected faculty data
        if (user) {
            faculty.name = user.name;
        } else if (expectedFaculty) {
            faculty.name = expectedFaculty.name;
            faculty.department = expectedFaculty.department;
            faculty.title = expectedFaculty.title;
        }
        
        // Update UI with faculty info
        document.getElementById('detailed-faculty-name').textContent = `${faculty.name} - Detailed Feedback`;
        document.getElementById('detailed-faculty-info').textContent = `Department: ${faculty.department} | Title: ${faculty.title}`;
        
        // Load courses for this faculty
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        const facultyCourses = courses[facultyId] || [];
        
        // If courses array is empty, add demo courses
        const demoCourses = {
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
        
        const allCourses = facultyCourses.length > 0 ? facultyCourses : (demoCourses[facultyId] || []);
        
        // Update course filter
        const courseFilter = document.getElementById('detailed-course-filter');
        courseFilter.setAttribute('data-faculty-id', facultyId);
        
        let options = '<option value="all">All Courses</option>';
        allCourses.forEach(course => {
            options += `<option value="${course.id}">${course.name} (${course.code})</option>`;
        });
        courseFilter.innerHTML = options;
        
        // Load detailed feedback items
        loadDetailedFeedbackItems(facultyId, 'all', 'all');
    }
    
    function loadDetailedFeedbackItems(facultyId, courseFilter = 'all', dateFilter = 'all') {
        // Get feedback data
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Filter feedback for faculty
        let facultyFeedback = allFeedback.filter(f => f.facultyId === facultyId);
        
        // If no feedback found, create demo feedback
        if (facultyFeedback.length === 0) {
            facultyFeedback = generateDemoFeedback(facultyId);
        }
        
        // Apply course filter
        if (courseFilter && courseFilter !== 'all') {
            facultyFeedback = facultyFeedback.filter(f => f.courseId === courseFilter);
        }
        
        // Apply date filter
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            if (dateFilter === 'recent') {
                // Last 30 days
                cutoffDate = new Date(now.setDate(now.getDate() - 30));
            } else if (dateFilter === 'semester') {
                // Current semester (roughly 4 months)
                cutoffDate = new Date(now.setMonth(now.getMonth() - 4));
            }
            
            if (cutoffDate) {
                facultyFeedback = facultyFeedback.filter(f => new Date(f.date) > cutoffDate);
            }
        }
        
        // Get users, courses data for display
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        const demoCourses = {
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
        
        // Update UI
        const feedbackContainer = document.getElementById('detailed-feedback-container');
        
        if (facultyFeedback.length === 0) {
            feedbackContainer.innerHTML = '<p class="empty-state">No feedback found for the selected filters.</p>';
            return;
        }
        
        let html = '';
        
        // Sort feedback by date, newest first
        facultyFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        facultyFeedback.forEach(feedback => {
            // Get student info
            const student = users.find(u => u.email === feedback.studentEmail) || { name: 'Anonymous Student', department: 'Unknown' };
            
            // Get course info
            const facultyCourses = courses[facultyId] || demoCourses[facultyId] || [];
            const course = facultyCourses.find(c => c.id === feedback.courseId) || { name: 'Unknown Course', code: 'UNKNOWN' };
            
            // Format date
            const date = new Date(feedback.date).toLocaleDateString();
            
            html += `
                <div class="feedback-item">
                    <div class="feedback-item-header">
                        <span class="student-info">${student.name} (${student.department})</span>
                        <span class="feedback-date">${date}</span>
                    </div>
                    <p><strong>Course:</strong> ${course.name} (${course.code})</p>
                    <div class="detailed-ratings">
                        <div class="detailed-rating">
                            <span>Teaching:</span>
                            <span>${feedback.ratings.teaching}.0</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Communication:</span>
                            <span>${feedback.ratings.communication}.0</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Helpfulness:</span>
                            <span>${feedback.ratings.helpfulness}.0</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Knowledge:</span>
                            <span>${feedback.ratings.knowledge ? feedback.ratings.knowledge + '.0' : 'N/A'}</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Organization:</span>
                            <span>${feedback.ratings.organization ? feedback.ratings.organization + '.0' : 'N/A'}</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Availability:</span>
                            <span>${feedback.ratings.availability ? feedback.ratings.availability + '.0' : 'N/A'}</span>
                        </div>
                        <div class="detailed-rating">
                            <span>Fairness:</span>
                            <span>${feedback.ratings.fairness ? feedback.ratings.fairness + '.0' : 'N/A'}</span>
                        </div>
                    </div>
                    ${feedback.comments ? `
                        <div class="comments-section">
                            <h4>Comments:</h4>
                            <p class="comment-text">"${feedback.comments}"</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        feedbackContainer.innerHTML = html;
    }
    
    function loadSystemStatistics() {
        // Get data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // If arrays are empty, generate demo data
        let facultyCount = faculties.length;
        let studentCount = users.filter(u => u.userType === 'student').length;
        let courseCount = 0;
        let feedbackCount = feedback.length;
        
        // Additional demo faculties
        const additionalFaculties = [
            { id: 'f1', department: 'Computer Science' },
            { id: 'f2', department: 'Mathematics' },
            { id: 'f3', department: 'Physics' },
            { id: 'f4', department: 'Chemistry' },
            { id: 'f5', department: 'Biology' },
            { id: 'f6', department: 'Engineering' }
        ];
        
        // Add only the faculties that don't already exist
        additionalFaculties.forEach(faculty => {
            if (!faculties.some(f => f.id === faculty.id)) {
                facultyCount++;
            }
        });
        
        // Demo courses
        const demoCourses = {
            'f1': [{ id: 'c1' }, { id: 'c2' }, { id: 'c7' }, { id: 'c8' }],
            'f2': [{ id: 'c3' }, { id: 'c4' }, { id: 'c9' }, { id: 'c10' }],
            'f3': [{ id: 'c5' }, { id: 'c6' }, { id: 'c11' }, { id: 'c12' }],
            'f4': [{ id: 'c13' }, { id: 'c14' }, { id: 'c15' }],
            'f5': [{ id: 'c16' }, { id: 'c17' }, { id: 'c18' }],
            'f6': [{ id: 'c19' }, { id: 'c20' }, { id: 'c21' }]
        };
        
        // Count total courses
        Object.values(demoCourses).forEach(courses => {
            courseCount += courses.length;
        });
        
        // If feedback is empty, generate a reasonable number
        if (feedbackCount === 0) {
            feedbackCount = 127; // Demo value
        }
        
        // If student count is small, use a demo value
        if (studentCount < 10) {
            studentCount = 45; // Demo value
        }
        
        // Update UI
        document.getElementById('total-faculties').textContent = facultyCount;
        document.getElementById('total-students').textContent = studentCount;
        document.getElementById('total-courses').textContent = courseCount;
        document.getElementById('total-feedback').textContent = feedbackCount;
        
        // Department statistics
        // For demo purposes, we'll use hardcoded values
        const departmentStatistics = [
            {
                name: 'Computer Science',
                faculties: 2,
                courses: 6,
                avgRating: 4.5,
                feedbackCount: 45
            },
            {
                name: 'Mathematics',
                faculties: 1,
                courses: 4,
                avgRating: 4.2,
                feedbackCount: 32
            },
            {
                name: 'Physics',
                faculties: 1,
                courses: 4,
                avgRating: 4.3,
                feedbackCount: 28
            },
            {
                name: 'Chemistry',
                faculties: 1,
                courses: 3,
                avgRating: 4.4,
                feedbackCount: 22
            },
            {
                name: 'Biology',
                faculties: 1,
                courses: 3,
                avgRating: 4.7,
                feedbackCount: 25
            },
            {
                name: 'Engineering',
                faculties: 1,
                courses: 3,
                avgRating: 4.1,
                feedbackCount: 19
            }
        ];
        
        const departmentContainer = document.getElementById('department-statistics');
        let html = '';
        
        departmentStatistics.forEach(dept => {
            html += `
                <div class="faculty-card">
                    <h3>${dept.name}</h3>
                    <p><strong>Faculties:</strong> ${dept.faculties}</p>
                    <p><strong>Courses:</strong> ${dept.courses}</p>
                    <p><strong>Average Rating:</strong> ${dept.avgRating}/5</p>
                    <p><strong>Feedback count:</strong> ${dept.feedbackCount}</p>
                </div>
            `;
        });
        
        departmentContainer.innerHTML = html;
    }
    
    function generateDemoFeedback(facultyId) {
        // Demo students
        const demoStudents = [
            {
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                department: 'Computer Science'
            },
            {
                name: 'Bob Williams',
                email: 'bob.williams@example.com',
                department: 'Mathematics'
            },
            {
                name: 'Carol Brown',
                email: 'carol.brown@example.com',
                department: 'Physics'
            },
            {
                name: 'David Lee',
                email: 'david.lee@example.com',
                department: 'Computer Science'
            },
            {
                name: 'Emma Wilson',
                email: 'emma.wilson@example.com',
                department: 'Mathematics'
            }
        ];
        
        // Demo comments
        const demoComments = [
            "Very knowledgeable and always willing to help students. Makes complex topics easy to understand.",
            "Great lecturer, but sometimes goes too fast through difficult concepts.",
            "Extremely helpful during office hours, but lectures can be disorganized.",
            "Explains concepts clearly and provides good examples. Assignments are challenging but fair.",
            "Passionate about the subject, which makes the class engaging.",
            "Well-organized course with clear expectations. Provides useful feedback on assignments.",
            "Very approachable and responsive to questions, both in class and via email.",
            "Lectures are somewhat dry, but the content is well-presented and thorough.",
            "Makes difficult concepts accessible through real-world examples and analogies.",
            "Excellent at explaining complex material, but could improve on providing timely feedback."
        ];
        
        // Demo courses for each faculty
        const demoCourses = {
            'f1': ['c1', 'c2', 'c7', 'c8'],
            'f2': ['c3', 'c4', 'c9', 'c10'],
            'f3': ['c5', 'c6', 'c11', 'c12'],
            'f4': ['c13', 'c14', 'c15'],
            'f5': ['c16', 'c17', 'c18'],
            'f6': ['c19', 'c20', 'c21']
        };
        
        // Generate random feedback
        const facultyCourses = demoCourses[facultyId] || ['c1', 'c2'];
        const numFeedback = 10 + Math.floor(Math.random() * 15); // Between 10-25 feedback items
        
        const feedbackItems = [];
        
        for (let i = 0; i < numFeedback; i++) {
            // Random date within the last year
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            // Random student
            const student = demoStudents[Math.floor(Math.random() * demoStudents.length)];
            
            // Random course
            const courseId = facultyCourses[Math.floor(Math.random() * facultyCourses.length)];
            
            // Random ratings (3-5 range to skew positive)
            const teaching = 3 + Math.floor(Math.random() * 3);
            const communication = 3 + Math.floor(Math.random() * 3);
            const helpfulness = 3 + Math.floor(Math.random() * 3);
            const knowledge = 3 + Math.floor(Math.random() * 3);
            const organization = 3 + Math.floor(Math.random() * 3);
            const availability = 3 + Math.floor(Math.random() * 3);
            const fairness = 3 + Math.floor(Math.random() * 3);
            
            // Random comment (80% chance of having a comment)
            const hasComment = Math.random() < 0.8;
            const comment = hasComment ? demoComments[Math.floor(Math.random() * demoComments.length)] : '';
            
            feedbackItems.push({
                id: `feedback_${facultyId}_${i}`,
                studentEmail: student.email,
                facultyId: facultyId,
                courseId: courseId,
                ratings: {
                    teaching: teaching,
                    communication: communication,
                    helpfulness: helpfulness,
                    knowledge: knowledge,
                    organization: organization,
                    availability: availability,
                    fairness: fairness
                },
                comments: comment,
                date: date.toISOString()
            });
        }
        
        return feedbackItems;
    }
    
    function showMessage(message, type) {
        // Create message element if it doesn't exist
        let messageEl = document.querySelector('.dashboard-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'dashboard-message';
            document.querySelector('.dashboard-header').after(messageEl);
        }
        
        // Set message content and style
        messageEl.textContent = message;
        messageEl.className = `dashboard-message ${type}`;
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}); 