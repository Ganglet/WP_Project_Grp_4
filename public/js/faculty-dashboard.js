document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isLoggedIn || currentUser.userType !== 'faculty') {
        window.location.href = 'index.html';
        return;
    }
    
    // Get user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(user => user.email === currentUser.email) || { name: 'Faculty' };
    
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
    
    // Load faculty data
    loadFacultyData();
    
    // Load feedback data
    loadFeedbackData();
    
    // Load profile data
    loadProfileData();
    
    // Course filter change event
    const courseFilter = document.getElementById('course-filter');
    courseFilter.addEventListener('change', function() {
        loadFeedbackData(this.value, document.getElementById('date-filter').value);
    });
    
    // Date filter change event
    const dateFilter = document.getElementById('date-filter');
    dateFilter.addEventListener('change', function() {
        loadFeedbackData(document.getElementById('course-filter').value, this.value);
    });
    
    // Set up course view buttons
    document.querySelector('.courses-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') && e.target.textContent === 'View Feedback') {
            const courseId = e.target.getAttribute('data-course-id');
            // Set course filter and navigate to feedback section
            courseFilter.value = courseId;
            // Trigger change event to update the feedback view
            courseFilter.dispatchEvent(new Event('change'));
            // Click on feedback nav link
            navLinks[0].click();
        }
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profile-name').value;
        const department = document.getElementById('profile-department').value;
        const title = document.getElementById('profile-title').value;
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
            // Update name, department, and title
            users[userIndex].name = name;
            users[userIndex].department = department;
            users[userIndex].title = title;
            
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
    function loadFacultyData() {
        // Try to find faculty ID for current user
        const faculties = JSON.parse(localStorage.getItem('faculties') || '[]');
        const facultyEmail = currentUser.email;
        
        let facultyId = null;
        
        // Map faculty emails to their IDs
        const facultyEmails = {
            'john.smith@example.com': 'f1',
            'jane.doe@example.com': 'f2',
            'robert.johnson@example.com': 'f3',
            'michael.williams@example.com': 'f4',
            'sarah.brown@example.com': 'f5',
            'david.miller@example.com': 'f6'
        };
        
        facultyId = facultyEmails[facultyEmail] || 'f1'; // Default to f1 for demo
        
        // Load courses for faculty
        loadFacultyCourses(facultyId);
        
        // Update course filter
        const courseFilter = document.getElementById('course-filter');
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        
        if (courses[facultyId]) {
            let options = '<option value="all">All Courses</option>';
            
            courses[facultyId].forEach(course => {
                options += `<option value="${course.id}">${course.name} (${course.code})</option>`;
            });
            
            courseFilter.innerHTML = options;
        }
    }
    
    function loadFacultyCourses(facultyId) {
        // Get courses for faculty
        const courses = JSON.parse(localStorage.getItem('courses') || '{}');
        const facultyCourses = courses[facultyId] || [];
        
        // Get feedback for counting
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Update UI
        const coursesList = document.querySelector('.courses-list');
        let html = '';
        
        if (facultyCourses.length === 0) {
            coursesList.innerHTML = '<p class="empty-state">No courses found.</p>';
            return;
        }
        
        facultyCourses.forEach(course => {
            // Count feedback for this course
            const courseFeedback = allFeedback.filter(f => f.courseId === course.id);
            
            html += `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p><strong>Code:</strong> ${course.code}</p>
                    <p><strong>Students:</strong> ${35 + Math.floor(Math.random() * 30)}</p>
                    <p><strong>Feedback received:</strong> ${courseFeedback.length}</p>
                    <button class="btn btn-small" data-course-id="${course.id}">View Feedback</button>
                </div>
            `;
        });
        
        coursesList.innerHTML = html;
    }
    
    function loadFeedbackData(courseFilter = 'all', dateFilter = 'all') {
        // Get all feedback
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
        
        // Try to find faculty ID for current user
        const facultyEmail = currentUser.email;
        
        // Map faculty emails to their IDs - ensure consistency with loadFacultyData
        const facultyEmails = {
            'john.smith@example.com': 'f1',
            'jane.doe@example.com': 'f2',
            'robert.johnson@example.com': 'f3',
            'michael.williams@example.com': 'f4',
            'sarah.brown@example.com': 'f5',
            'david.miller@example.com': 'f6'
        };
        
        const facultyId = facultyEmails[facultyEmail] || 'f1'; // Default to f1 for demo
        
        // Filter feedback for faculty
        let facultyFeedback = allFeedback.filter(f => f.facultyId === facultyId);
        
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
        
        // Calculate average ratings
        let teachingTotal = 0;
        let communicationTotal = 0;
        let helpfulnessTotal = 0;
        let knowledgeTotal = 0;
        let organizationTotal = 0;
        let availabilityTotal = 0;
        let fairnessTotal = 0;
        let anonymousComments = [];
        
        facultyFeedback.forEach(feedback => {
            teachingTotal += feedback.ratings.teaching;
            communicationTotal += feedback.ratings.communication;
            helpfulnessTotal += feedback.ratings.helpfulness;
            
            // Add new rating categories
            knowledgeTotal += feedback.ratings.knowledge || 0; // Use 0 as fallback for backward compatibility
            organizationTotal += feedback.ratings.organization || 0;
            availabilityTotal += feedback.ratings.availability || 0;
            fairnessTotal += feedback.ratings.fairness || 0;
            
            if (feedback.comments) {
                // Get course name but keep student anonymous
                const courses = JSON.parse(localStorage.getItem('courses') || '{}');
                let courseName = 'Unknown Course';
                
                if (courses[facultyId]) {
                    const course = courses[facultyId].find(c => c.id === feedback.courseId);
                    if (course) courseName = course.name;
                }
                
                anonymousComments.push({
                    text: feedback.comments,
                    course: courseName,
                    date: new Date(feedback.date).toLocaleDateString()
                });
            }
        });
        
        const feedbackCount = facultyFeedback.length;
        
        // Update stats in UI
        const statsContainer = document.querySelector('.feedback-stats');
        if (feedbackCount === 0) {
            statsContainer.innerHTML = '<p class="empty-state">No feedback available for the selected filters.</p>';
            document.querySelector('.feedback-comments').style.display = 'none';
            return;
        }
        
        document.querySelector('.feedback-comments').style.display = 'block';
        
        const teachingAvg = (teachingTotal / feedbackCount).toFixed(1);
        const communicationAvg = (communicationTotal / feedbackCount).toFixed(1);
        const helpfulnessAvg = (helpfulnessTotal / feedbackCount).toFixed(1);
        const knowledgeAvg = (knowledgeTotal / feedbackCount).toFixed(1);
        const organizationAvg = (organizationTotal / feedbackCount).toFixed(1);
        const availabilityAvg = (availabilityTotal / feedbackCount).toFixed(1);
        const fairnessAvg = (fairnessTotal / feedbackCount).toFixed(1);
        
        // Calculate overall average based on all criteria
        const overallAvg = ((teachingTotal + communicationTotal + helpfulnessTotal + 
                             knowledgeTotal + organizationTotal + availabilityTotal + fairnessTotal) / 
                            (feedbackCount * 7)).toFixed(1);
        
        // Generate stars HTML based on rating
        function getStarsHtml(rating) {
            let starsHtml = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
            const hasFullHalfStar = rating % 1 >= 0.75;
            
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHtml += '<span class="star full">★</span>';
                } else if (i === fullStars + 1 && hasHalfStar) {
                    starsHtml += '<span class="star half">★</span>';
                } else if (i === fullStars + 1 && hasFullHalfStar) {
                    starsHtml += '<span class="star full">★</span>';
                } else {
                    starsHtml += '<span class="star">★</span>';
                }
            }
            
            return starsHtml;
        }
        
        statsContainer.innerHTML = `
            <div class="rating-summary">
                <div class="rating-card overall">
                    <h3>Overall Rating</h3>
                    <div class="rating-value">${overallAvg}</div>
                    <div class="rating-stars">${getStarsHtml(overallAvg)}</div>
                    <p>${feedbackCount} ${feedbackCount === 1 ? 'student' : 'students'} rated your performance</p>
                </div>
                
                <div class="rating-card">
                    <h3>Teaching Quality</h3>
                    <div class="rating-value">${teachingAvg}</div>
                    <div class="rating-stars">${getStarsHtml(teachingAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Communication</h3>
                    <div class="rating-value">${communicationAvg}</div>
                    <div class="rating-stars">${getStarsHtml(communicationAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Helpfulness</h3>
                    <div class="rating-value">${helpfulnessAvg}</div>
                    <div class="rating-stars">${getStarsHtml(helpfulnessAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Knowledge</h3>
                    <div class="rating-value">${knowledgeAvg}</div>
                    <div class="rating-stars">${getStarsHtml(knowledgeAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Organization</h3>
                    <div class="rating-value">${organizationAvg}</div>
                    <div class="rating-stars">${getStarsHtml(organizationAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Availability</h3>
                    <div class="rating-value">${availabilityAvg}</div>
                    <div class="rating-stars">${getStarsHtml(availabilityAvg)}</div>
                </div>
                
                <div class="rating-card">
                    <h3>Fairness</h3>
                    <div class="rating-value">${fairnessAvg}</div>
                    <div class="rating-stars">${getStarsHtml(fairnessAvg)}</div>
                </div>
            </div>
        `;
        
        // Update comments in UI (now anonymized)
        const commentsContainer = document.querySelector('.comments-list');
        
        if (anonymousComments.length === 0) {
            commentsContainer.innerHTML = '<p class="empty-state">No comments available.</p>';
            return;
        }
        
        let commentsHtml = '';
        
        // Sort comments by date, newest first
        anonymousComments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        anonymousComments.forEach(comment => {
            commentsHtml += `
                <div class="anonymous-comment">
                    <p class="anonymous-comment-text">"${comment.text}"</p>
                    <div class="anonymous-meta">
                        <span class="anonymous-course">${comment.course}</span>
                        <span class="anonymous-date">${comment.date}</span>
                    </div>
                </div>
            `;
        });
        
        commentsContainer.innerHTML = commentsHtml;
    }
    
    function loadProfileData() {
        // Get user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = users.find(user => user.email === currentUser.email);
        
        if (userData) {
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-email').value = userData.email || '';
            document.getElementById('profile-department').value = userData.department || '';
            document.getElementById('profile-title').value = userData.title || '';
        }
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