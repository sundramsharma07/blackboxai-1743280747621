// Customer Dashboard Logic for BuildMart

// DOM Elements
const customerNameElement = document.getElementById('customerName');
const customerNameHeader = document.getElementById('customerNameHeader');
const cartCountElement = document.getElementById('cartCount');
const featuredProductsElement = document.getElementById('featuredProducts');
const recentOrdersElement = document.getElementById('recentOrders');
const logoutBtn = document.getElementById('logoutBtn');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let allProducts = [];

// Initialize the dashboard
function initDashboard() {
    if (!currentUser || currentUser.userType !== 'customer') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set customer info
    customerNameElement.textContent = currentUser.fullName || 'Customer';
    customerNameHeader.textContent = currentUser.fullName || 'Customer';

    // Load cart count
    updateCartCount();

    // Load all products from all sellers
    loadAllProducts();

    // Load featured products
    loadFeaturedProducts();

    // Load recent orders
    loadRecentOrders();

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
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
}

// Load featured products (first 6 products)
function loadFeaturedProducts() {
    if (allProducts.length === 0) {
        featuredProductsElement.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow text-center col-span-3">
                <p class="text-gray-500">No products available at the moment</p>
            </div>
        `;
        return;
    }

    // Shuffle products and take first 6
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 6);

    featuredProductsElement.innerHTML = '';

    featured.forEach(product => {
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
                <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-600">₹${product.price.toLocaleString()}</span>
                    <span class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                <button class="add-to-cart-btn mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    data-id="${allProducts.indexOf(product)}"
                    ${product.stock > 0 ? '' : 'disabled'}>
                    Add to Cart
                </button>
            </div>
        `;
        featuredProductsElement.appendChild(productCard);
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

// Load recent orders (last 3)
function loadRecentOrders() {
    if (!currentUser.orders || currentUser.orders.length === 0) {
        return;
    }

    // Sort by date (newest first)
    const sortedOrders = [...currentUser.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentOrders = sortedOrders.slice(0, 3);

    recentOrdersElement.innerHTML = '';

    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.orderId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.items.length} items</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${order.totalAmount.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
        `;

        recentOrdersElement.appendChild(row);
    });
}

// Get status badge class
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'shipped':
            return 'bg-blue-100 text-blue-800';
        case 'processing':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('buildmart_currentUser');
    window.location.href = '../auth/login.html';
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

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);