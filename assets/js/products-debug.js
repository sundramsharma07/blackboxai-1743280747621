// Debug version of products.js
console.log('DEBUG: products.js loaded');

// Enhanced debugging for DOM elements
const addProductBtn = document.getElementById('addProductBtn');
console.log('DEBUG: Add Product Button:', addProductBtn ? 'Found' : 'Not found');

const productModal = document.getElementById('productModal'); 
console.log('DEBUG: Product Modal:', productModal ? 'Found' : 'Not found');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
console.log('DEBUG: Current user:', currentUser);

// Initialize with enhanced debugging
function initProducts() {
    console.log('DEBUG: Initializing products...');
    
    if (!currentUser || currentUser.userType !== 'seller') {
        console.log('DEBUG: Redirecting to login...');
        window.location.href = '../auth/login.html';
        return;
    }

    setupEventListeners();
}

function setupEventListeners() {
    console.log('DEBUG: Setting up event listeners...');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('DEBUG: Add Product clicked');
            
            if (productModal) {
                console.log('DEBUG: Showing modal');
                productModal.classList.remove('hidden');
            } else {
                console.error('DEBUG: Modal not found!');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initProducts);