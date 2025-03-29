// Customer Products Browsing Logic for BuildMart

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const productsGrid = document.getElementById('productsGrid');
const cartCountElement = document.getElementById('cartCount');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let allProducts = [];
let filteredProducts = [];

// Initialize the products page
function initProducts() {
    if (!currentUser || currentUser.userType !== 'customer') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set customer info
    document.getElementById('customerName').textContent = currentUser.fullName || 'Customer';
    document.getElementById('customerNameHeader').textContent = currentUser.fullName || 'Customer';

    // Update cart count
    updateCartCount();

    // Load all products
    loadAllProducts();

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    if (sortBy) {
        sortBy.addEventListener('change', sortProducts);
    }
}

// Update cart count display
function updateCartCount() {
    const cartCount = currentUser.cart ? currentUser.cart.length : 0;
    cartCountElement.textContent = cartCount;
    
    // Show/hide notification badge
    const badge = cartCountElement.nextElementSibling;
    if (cartCount > 0) {
        badge.classList.remove('hidden');
        badge.textContent = cartCount;
    } else {
        badge.classList.add('hidden');
    }
}

// Load all products from all sellers
function loadAllProducts() {
    allProducts = [];
    allUsers.forEach(user => {
        if (user.userType === 'seller' && user.products) {
            user.products.forEach(product => {
                allProducts.push({
                    ...product,
                    sellerName: user.storeName || 'Unknown Seller',
                    sellerId: user.sellerId
                });
            });
        }
    });

    filteredProducts = [...allProducts];
    displayProducts();
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.sellerName.toLowerCase().includes(searchTerm);
        
        const matchesCategory = category === '' || product.category === category;
        
        return matchesSearch && matchesCategory;
    });

    // Apply current sorting
    sortProducts();
}

// Sort products based on selected option
function sortProducts() {
    const sortOption = sortBy.value;

    switch(sortOption) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        default:
            // Default sorting (by relevance or no sorting)
            break;
    }

    displayProducts();
}

// Display products in the grid
function displayProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow text-center col-span-3">
                <p class="text-gray-500">No products found matching your criteria</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = '';

    filteredProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow';
        productCard.innerHTML = `
            <div class="h-48 bg-gray-200 flex items-center justify-center">
                ${product.image ? `
                    <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover">
                ` : `
                    <i class="fas fa-box-open text-4xl text-gray-400"></i>
                `}
            </div>
            <div class="p-4">
                <h4 class="font-semibold text-lg mb-1 truncate">${product.name}</h4>
                <p class="text-gray-500 text-sm mb-2">${product.sellerName}</p>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description || 'No description available'}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-600">₹${product.price.toLocaleString()}</span>
                    <span class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                <button class="add-to-cart-btn mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    data-id="${index}"
                    ${product.stock > 0 ? '' : 'disabled'}>
                    Add to Cart
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            addToCart(id);
        });
    });
}

// Add product to cart
function addToCart(productIndex) {
    if (!currentUser.cart) {
        currentUser.cart = [];
    }

    // Check if product already in cart
    const existingItem = currentUser.cart.find(item => item.productIndex === productIndex);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentUser.cart.push({
            productIndex,
            quantity: 1
        });
    }

    // Update current user
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
    }

    // Save to localStorage
    localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('buildmart_users', JSON.stringify(allUsers));

    // Update cart count
    updateCartCount();

    showAlert('Product added to cart!', 'success');
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

// Initialize the products page when DOM is loaded
document.addEventListener('DOMContentLoaded', initProducts);