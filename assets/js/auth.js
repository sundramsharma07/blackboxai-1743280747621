// Authentication Logic for BuildMart

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userTypeSelect = document.getElementById('userType');
const sellerFields = document.getElementById('sellerFields');

// Initialize authentication
function initAuth() {
    // Check if on register page
    if (registerForm) {
        // Show/hide seller fields based on user type selection
        userTypeSelect.addEventListener('change', (e) => {
            sellerFields.classList.toggle('hidden', e.target.value !== 'seller');
            
            // Make seller fields required if seller is selected
            const sellerInputs = sellerFields.querySelectorAll('input, textarea');
            sellerInputs.forEach(input => {
                input.required = e.target.value === 'seller';
            });
        });

        // Handle registration form submission
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Check if on login page
    if (loginForm) {
        // Handle login form submission
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle registration
function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const userData = Object.fromEntries(formData.entries());
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('buildmart_users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
        showAlert('Email already registered', 'error');
        return;
    }

    // Create new user object
    const newUser = {
        id: Date.now().toString(),
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password, // In a real app, this should be hashed
        userType: userData.userType,
        dateRegistered: new Date().toISOString()
    };

    // Add seller-specific fields if applicable
    if (userData.userType === 'seller') {
        newUser.storeName = userData.storeName;
        newUser.businessAddress = userData.businessAddress;
        newUser.sellerId = `SLR-${Date.now().toString().slice(-6)}`;
        newUser.products = [];
        newUser.sales = [];
    } else {
        // Customer-specific fields
        newUser.cart = [];
        newUser.orders = [];
    }

    // Add new user to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('buildmart_users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('buildmart_currentUser', JSON.stringify(newUser));
    
    // Show success message and redirect
    showAlert('Registration successful!', 'success');
    setTimeout(() => {
        window.location.href = userData.userType === 'seller' ? 
            '../seller/dashboard.html' : '../customer/dashboard.html';
    }, 1500);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = Object.fromEntries(formData.entries());
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('buildmart_users')) || [];
    
    // Find user by email
    const user = users.find(u => u.email === credentials.email);
    
    // Check if user exists and password matches
    if (!user || user.password !== credentials.password) {
        showAlert('Invalid email or password', 'error');
        return;
    }
    
    // Set as current user
    localStorage.setItem('buildmart_currentUser', JSON.stringify(user));
    
    // Show success message and redirect
    showAlert('Login successful!', 'success');
    setTimeout(() => {
        window.location.href = user.userType === 'seller' ? 
            '../seller/dashboard.html' : '../customer/dashboard.html';
    }, 1500);
}

// Show alert message
function showAlert(message, type) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    alert.textContent = message;
    
    // Add to DOM
    document.body.appendChild(alert);
    
    // Remove after delay
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);