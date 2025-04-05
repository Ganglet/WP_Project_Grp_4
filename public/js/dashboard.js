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
        const knowledgeRating = document.querySelector('input[name="knowledge"]:checked');
        const organizationRating = document.querySelector('input[name="organization"]:checked');
        const availabilityRating = document.querySelector('input[name="availability"]:checked');
        const fairnessRating = document.querySelector('input[name="fairness"]:checked');
        
        if (!teachingRating || !communicationRating || !helpfulnessRating || !knowledgeRating || 
            !organizationRating || !availabilityRating || !fairnessRating) {
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
                helpfulness: parseInt(helpfulnessRating.value),
                knowledge: parseInt(knowledgeRating.value),
                organization: parseInt(organizationRating.value),
                availability: parseInt(availabilityRating.value),
                fairness: parseInt(fairnessRating.value)
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
        // Check if facultyData already exists in localStorage
        const existingFaculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        
        // Create the complete faculty list
        const faculties = [
            { id: 'f1', name: 'Dr. John Smith', department: 'Computer Science', title: 'Associate Professor' },
            { id: 'f2', name: 'Prof. Jane Doe', department: 'Mathematics', title: 'Professor' },
            { id: 'f3', name: 'Dr. Robert Johnson', department: 'Physics', title: 'Assistant Professor' },
            { id: 'f4', name: 'Dr. Michael Williams', department: 'Chemistry', title: 'Associate Professor' },
            { id: 'f5', name: 'Prof. Sarah Brown', department: 'Biology', title: 'Professor' },
            { id: 'f6', name: 'Dr. David Miller', department: 'Engineering', title: 'Assistant Professor' }
        ];
        
        // Save to localStorage (always save the complete list)
        localStorage.setItem('faculties', JSON.stringify(faculties));
        
        // Populate faculty select
        populateFacultySelect(faculties);
    }
    
    function populateFacultySelect(faculties) {
        const facultySelect = document.getElementById('faculty-select');
        let options = '<option value="">-- Select a faculty member --</option>';
        
        faculties.forEach(faculty => {
            options += `<option value="${faculty.id}">${faculty.name} (${faculty.department})</option>`;
        });
        
        facultySelect.innerHTML = options;
    }
    
    function loadFacultyCourses(facultyId) {
        // Check if courses already exist in localStorage
        const existingCourses = JSON.parse(localStorage.getItem('courses') || '{}');
        
        if (Object.keys(existingCourses).length > 0) {
            // Use existing data from localStorage (which may have been populated by auth.js)
            populateCourseSelect(facultyId, existingCourses);
        } else {
            // If no data exists, create and save the expanded courses list
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
            
            // Save to localStorage
            localStorage.setItem('courses', JSON.stringify(courses));
            
            // Populate course select
            populateCourseSelect(facultyId, courses);
        }
    }
    
    function populateCourseSelect(facultyId, courses) {
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
        
        // Filter feedback for current student
        const studentFeedback = allFeedback.filter(f => f.studentEmail === currentUser.email);
        
        // Get faculties and courses data for display
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        
        // Update UI
        const historyContainer = document.querySelector('.feedback-history');
        
        if (studentFeedback.length === 0) {
            historyContainer.innerHTML = '<p class="empty-state">No feedback submitted yet.</p>';
            return;
        }
        
        let html = '';
        
        // Sort feedback by date, newest first
        studentFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        studentFeedback.forEach(feedback => {
            // Find faculty name
            const faculty = faculties.find(f => f.id === feedback.facultyId);
            let facultyName = 'Unknown Faculty';
            if (faculty) facultyName = faculty.name;
            
            // Find course name
            let courseName = 'Unknown Course';
            if (courses[feedback.facultyId]) {
                const course = courses[feedback.facultyId].find(c => c.id === feedback.courseId);
                if (course) courseName = `${course.name} (${course.code})`;
            }
            
            // Format date
            const date = new Date(feedback.date).toLocaleDateString();
            
            // Calculate average rating
            const avgRating = (
                (feedback.ratings.teaching + feedback.ratings.communication + feedback.ratings.helpfulness + 
                feedback.ratings.knowledge + feedback.ratings.organization + feedback.ratings.availability + 
                feedback.ratings.fairness) / 7
            ).toFixed(1);
            
            html += `
                <div class="feedback-card">
                    <div class="feedback-header">
                        <h3>${facultyName}</h3>
                        <span class="feedback-date">${date}</span>
                    </div>
                    <p><strong>Course:</strong> ${courseName}</p>
                    <p><strong>Average Rating:</strong> ${avgRating}/5</p>
                    <div class="feedback-ratings">
                        <span><strong>Teaching:</strong> ${feedback.ratings.teaching}/5</span>
                        <span><strong>Communication:</strong> ${feedback.ratings.communication}/5</span>
                        <span><strong>Helpfulness:</strong> ${feedback.ratings.helpfulness}/5</span>
                        <span><strong>Knowledge:</strong> ${feedback.ratings.knowledge}/5</span>
                        <span><strong>Organization:</strong> ${feedback.ratings.organization}/5</span>
                        <span><strong>Availability:</strong> ${feedback.ratings.availability}/5</span>
                        <span><strong>Fairness:</strong> ${feedback.ratings.fairness}/5</span>
                    </div>
                    ${feedback.comments ? `
                        <div class="feedback-comments">
                            <p><strong>Comments:</strong></p>
                            <p>${feedback.comments}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        historyContainer.innerHTML = html;
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
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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