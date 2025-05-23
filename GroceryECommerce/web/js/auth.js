// Authentication related functions

// Login user
function loginUser(username, password) {
    // Simulate API call - in real app, this would be an AJAX request to your Java backend
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulated user data - in production, this comes from your UserService
            const users = [
                { id: 1, username: 'admin', email: 'admin@grocery.com', password: 'admin123', fullName: 'System Administrator', role: 'ADMIN' },
                { id: 2, username: 'john_doe', email: 'john@email.com', password: 'password123', fullName: 'John Doe', role: 'USER' },
                { id: 3, username: 'jane_smith', email: 'jane@email.com', password: 'password123', fullName: 'Jane Smith', role: 'USER' }
            ];
            
            const user = users.find(u => 
                (u.username === username || u.email === username) && u.password === password
            );
            
            if (user) {
                // Remove password from user object before storing
                const userSession = { ...user };
                delete userSession.password;
                
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(userSession));
                currentUser = userSession;
                
                resolve(userSession);
            } else {
                reject(new Error('Invalid username or password'));
            }
        }, 1000); // Simulate network delay
    });
}

// Register new user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Validate input
            if (!userData.username || !userData.email || !userData.password || !userData.fullName) {
                reject(new Error('All fields are required'));
                return;
            }
            
            if (userData.password.length < 6) {
                reject(new Error('Password must be at least 6 characters long'));
                return;
            }
            
            // Check if username or email already exists (simulated)
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            const userExists = existingUsers.some(u => 
                u.username === userData.username || u.email === userData.email
            );
            
            if (userExists) {
                reject(new Error('Username or email already exists'));
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(), // Simple ID generation
                username: userData.username,
                email: userData.email,
                fullName: userData.fullName,
                phone: userData.phone || '',
                address: userData.address || '',
                role: 'USER',
                createdAt: new Date().toISOString()
            };
            
            // Store user (in real app, this would be saved to database via your UserService)
            existingUsers.push({ ...newUser, password: userData.password });
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            
            // Auto-login after registration
            const userSession = { ...newUser };
            localStorage.setItem('currentUser', JSON.stringify(userSession));
            currentUser = userSession;
            
            resolve(userSession);
        }, 1000);
    });
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'ADMIN';
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Update user profile
function updateUserProfile(profileData) {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            reject(new Error('User not authenticated'));
            return;
        }
        
        setTimeout(() => {
            // Update current user data
            currentUser.fullName = profileData.fullName || currentUser.fullName;
            currentUser.phone = profileData.phone || currentUser.phone;
            currentUser.address = profileData.address || currentUser.address;
            currentUser.updatedAt = new Date().toISOString();
            
            // Update in localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update in registered users list
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...currentUser };
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
            
            resolve(currentUser);
        }, 500);
    });
}

// Change password
function changePassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            reject(new Error('User not authenticated'));
            return;
        }
        
        setTimeout(() => {
            // Get registered users to verify old password
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u.id === currentUser.id);
            
            if (!user || user.password !== oldPassword) {
                reject(new Error('Current password is incorrect'));
                return;
            }
            
            if (newPassword.length < 6) {
                reject(new Error('New password must be at least 6 characters long'));
                return;
            }
            
            // Update password
            user.password = newPassword;
            user.updatedAt = new Date().toISOString();
            
            // Save updated users list
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            resolve('Password changed successfully');
        }, 500);
    });
}

// Request password reset (simulated)
function requestPasswordReset(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u.email === email);
            
            if (!user) {
                reject(new Error('Email address not found'));
                return;
            }
            
            // In real app, this would send an email
            // For demo, we'll just show a success message
            resolve('Password reset instructions have been sent to your email');
        }, 1000);
    });
}

// Validate session on page load
function validateSession() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            return true;
        } catch (error) {
            localStorage.removeItem('currentUser');
            currentUser = null;
            return false;
        }
    }
    return false;
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    currentUser = null;
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Redirect if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect if not admin
function requireAdmin() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!isAdmin()) {
        showMessage('Access denied. Admin privileges required.', 'error');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Hash password (simple implementation - in production use proper hashing)
function hashPassword(password) {
    // This is a very basic hash function for demo purposes
    // In production, use bcrypt or similar on the server side
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate username format
function validateUsername(username) {
    // Username should be 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    validateSession();
});