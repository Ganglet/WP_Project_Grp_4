document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isLoggedIn || currentUser.userType !== 'student') {
        window.location.href = 'index.html';
        return;
    }
    
    // Get user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(user => user.email === currentUser.email) || { name: 'Student' };
    
    // Update user info in UI
    const userInitial = document.getElementById('user-initial');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const welcomeName = document.getElementById('welcome-name');
    
    if (userData.name) {
        userInitial.textContent = userData.name.charAt(0);
        userName.textContent = userData.name;
        welcomeName.textContent = userData.name.split(' ')[0];
    }
    
    if (currentUser.email) {
        userEmail.textContent = currentUser.email;
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
    
    // Load faculty list
    loadFacultyList();
    
    // Load feedback history
    loadFeedbackHistory();
    
    // Load profile data
    loadProfileData();
    
    // Faculty select change event
    const facultySelect = document.getElementById('faculty-select');
    const courseSelect = document.getElementById('course-select');
    
    facultySelect.addEventListener('change', function() {
        if (this.value) {
            // Enable course select and load courses for selected faculty
            courseSelect.disabled = false;
            loadFacultyCourses(this.value);
        } else {
            // Disable course select if no faculty selected
            courseSelect.disabled = true;
            courseSelect.innerHTML = '<option value="">-- Select a course --</option>';
        }
    });
    
    // Feedback form submission
    const feedbackForm = document.getElementById('feedback-form');
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const facultyId = facultySelect.value;
        const courseId = courseSelect.value;
        
        // Validate form
        if (!facultyId || !courseId) {
            showMessage('Please select a faculty and course', 'error');
            return;
        }
        
        // Get ratings
        const teachingRating = document.querySelector('input[name="teaching"]:checked');
        const communicationRating = document.querySelector('input[name="communication"]:checked');
        const helpfulnessRating = document.querySelector('input[name="helpfulness"]:checked');
        
        if (!teachingRating || !communicationRating || !helpfulnessRating) {
            showMessage('Please provide all ratings', 'error');
            return;
        }
        
        // Get comments
        const comments = document.getElementById('feedback-comments').value;
        
        // Create feedback object
        const feedback = {
            id: generateId(),
            studentEmail: currentUser.email,
            facultyId: facultyId,
            courseId: courseId,
            ratings: {
                teaching: parseInt(teachingRating.value),
                communication: parseInt(communicationRating.value),
                helpfulness: parseInt(helpfulnessRating.value)
            },
            comments: comments,
            date: new Date().toISOString()
        };
        
        // Save feedback
        saveFeedback(feedback);
        
        // Show success message
        showMessage('Feedback submitted successfully!', 'success');
        
        // Reset form
        feedbackForm.reset();
        facultySelect.value = '';
        courseSelect.disabled = true;
        courseSelect.innerHTML = '<option value="">-- Select a course --</option>';
        
        // Reload feedback history
        loadFeedbackHistory();
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profile-name').value;
        const department = document.getElementById('profile-department').value;
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
            // Update name and department
            users[userIndex].name = name;
            users[userIndex].department = department;
            
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
            userName.textContent = name;
            userInitial.textContent = name.charAt(0);
            welcomeName.textContent = name.split(' ')[0];
            
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
    function loadFacultyList() {
        // In a real app, this would fetch from a server
        // For demo, we'll use mock data
        const faculties = [
            { id: 'f1', name: 'Dr. John Smith', department: 'Computer Science' },
            { id: 'f2', name: 'Prof. Jane Doe', department: 'Mathematics' },
            { id: 'f3', name: 'Dr. Robert Johnson', department: 'Physics' }
        ];
        
        // Save to localStorage for demo purposes
        localStorage.setItem('faculties', JSON.stringify(faculties));
        
        // Populate faculty select
        const facultySelect = document.getElementById('faculty-select');
        let options = '<option value="">-- Select a faculty member --</option>';
        
        faculties.forEach(faculty => {
            options += `<option value="${faculty.id}">${faculty.name} (${faculty.department})</option>`;
        });
        
        facultySelect.innerHTML = options;
    }
    
    function loadFacultyCourses(facultyId) {
        // In a real app, this would fetch from a server
        // For demo, we'll use mock data
        const courses = {
            'f1': [
                { id: 'c1', name: 'Introduction to Programming', code: 'CS101' },
                { id: 'c2', name: 'Data Structures', code: 'CS201' }
            ],
            'f2': [
                { id: 'c3', name: 'Calculus I', code: 'MATH101' },
                { id: 'c4', name: 'Linear Algebra', code: 'MATH201' }
            ],
            'f3': [
                { id: 'c5', name: 'Mechanics', code: 'PHY101' },
                { id: 'c6', name: 'Electromagnetism', code: 'PHY201' }
            ]
        };
        
        // Save to localStorage for demo purposes
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Populate course select
        const courseSelect = document.getElementById('course-select');
        let options = '<option value="">-- Select a course --</option>';
        
        if (courses[facultyId]) {
            courses[facultyId].forEach(course => {
                options += `<option value="${course.id}">${course.name} (${course.code})</option>`;
            });
        }
        
        courseSelect.innerHTML = options;
    }
    
    function loadFeedbackHistory() {
        // Get all feedback from localStorage
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Filter for current user's feedback
        const userFeedback = allFeedback.filter(feedback => feedback.studentEmail === currentUser.email);
        
        // Get faculty and course data
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        
        // Update UI
        const feedbackHistory = document.querySelector('.feedback-history');
        
        if (userFeedback.length === 0) {
            feedbackHistory.innerHTML = '<p class="empty-state">No feedback submitted yet.</p>';
            return;
        }
        
        let html = '';
        
        userFeedback.forEach(feedback => {
            // Find faculty and course names
            const faculty = faculties.find(f => f.id === feedback.facultyId) || { name: 'Unknown Faculty' };
            let courseName = 'Unknown Course';
            
            if (courses[feedback.facultyId]) {
                const course = courses[feedback.facultyId].find(c => c.id === feedback.courseId);
                if (course) courseName = `${course.name} (${course.code})`;
            }
            
            // Calculate average rating
            const ratings = feedback.ratings;
            const avgRating = ((ratings.teaching + ratings.communication + ratings.helpfulness) / 3).toFixed(1);
            
            // Format date
            const date = new Date(feedback.date).toLocaleDateString();
            
            html += `
                <div class="comment-card">
                    <div class="comment-header">
                        <h4>${faculty.name}</h4>
                        <span class="rating-value">${avgRating}/5</span>
                    </div>
                    <p class="comment-course">${courseName}</p>
                    <p class="comment-text">${feedback.comments || 'No comments provided.'}</p>
                    <div class="comment-meta">
                        <span class="comment-date">${date}</span>
                    </div>
                </div>
            `;
        });
        
        feedbackHistory.innerHTML = html;
    }
    
    function loadProfileData() {
        // Get user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = users.find(user => user.email === currentUser.email);
        
        if (userData) {
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-email').value = userData.email || '';
            document.getElementById('profile-department').value = userData.department || '';
        }
    }
    
    function saveFeedback(feedback) {
        // Get existing feedback
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Add new feedback
        allFeedback.push(feedback);
        
        // Save to localStorage
        localStorage.setItem('feedback', JSON.stringify(allFeedback));
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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