// Shopping Cart Logic for BuildMart

// DOM Elements
const cartItemsElement = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartCountElement = document.getElementById('cartCount');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let allProducts = [];
let cartItems = [];

// Initialize the cart
function initCart() {
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

    // Load cart items
    loadCartItems();

    // Event listeners
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
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

// Load cart items
function loadCartItems() {
    if (!currentUser.cart || currentUser.cart.length === 0) {
        cartItemsElement.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                Your cart is empty
            </div>
        `;
        checkoutBtn.disabled = true;
        updateOrderSummary(0);
        return;
    }

    cartItems = currentUser.cart.map(item => {
        const product = allProducts[item.productIndex];
        return {
            ...item,
            product,
            totalPrice: product.price * item.quantity
        };
    });

    displayCartItems();
    updateOrderSummary();
}

// Display cart items
function displayCartItems() {
    cartItemsElement.innerHTML = '';

    cartItems.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'p-4 flex flex-col md:flex-row gap-4';
        cartItem.innerHTML = `
            <div class="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                ${item.product.image ? `
                    <img src="${item.product.image}" alt="${item.product.name}" class="h-full w-full object-cover rounded-md">
                ` : `
                    <i class="fas fa-box-open text-2xl text-gray-400"></i>
                `}
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <h4 class="font-medium">${item.product.name}</h4>
                    <span class="font-semibold">₹${item.totalPrice.toLocaleString()}</span>
                </div>
                <p class="text-sm text-gray-500 mb-2">${item.product.sellerName}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center border border-gray-300 rounded-md">
                        <button class="quantity-btn decrease px-3 py-1" data-id="${index}">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="quantity px-3 py-1">${item.quantity}</span>
                        <button class="quantity-btn increase px-3 py-1" data-id="${index}">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <button class="remove-btn text-red-600 hover:text-red-800 text-sm" data-id="${index}">
                        <i class="fas fa-trash mr-1"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItemsElement.appendChild(cartItem);
    });

    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const isIncrease = e.target.closest('button').classList.contains('increase');
            updateQuantity(id, isIncrease);
        });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            removeItem(id);
        });
    });
}

// Update item quantity
function updateQuantity(id, isIncrease) {
    const item = cartItems[id];
    
    if (isIncrease) {
        // Check stock availability
        if (item.quantity >= item.product.stock) {
            showAlert('Cannot add more than available stock', 'error');
            return;
        }
        item.quantity += 1;
    } else {
        if (item.quantity <= 1) return;
        item.quantity -= 1;
    }

    // Update total price
    item.totalPrice = item.product.price * item.quantity;

    // Update in user's cart
    currentUser.cart[id].quantity = item.quantity;

    // Save to localStorage
    saveCartChanges();

    // Update display
    displayCartItems();
    updateOrderSummary();
}

// Remove item from cart
function removeItem(id) {
    cartItems.splice(id, 1);
    currentUser.cart.splice(id, 1);

    // Save to localStorage
    saveCartChanges();

    // Reload cart
    loadCartItems();
    updateCartCount();

    showAlert('Item removed from cart', 'success');
}

// Update order summary
function updateOrderSummary() {
    if (cartItems.length === 0) {
        subtotalElement.textContent = '₹0';
        shippingElement.textContent = '₹0';
        taxElement.textContent = '₹0';
        totalElement.textContent = '₹0';
        checkoutBtn.disabled = true;
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 10000 ? 0 : 500; // Free shipping for orders over ₹10,000
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shipping + tax;

    subtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
    shippingElement.textContent = `₹${shipping.toLocaleString()}`;
    taxElement.textContent = `₹${tax.toLocaleString()}`;
    totalElement.textContent = `₹${total.toLocaleString()}`;
    checkoutBtn.disabled = false;
}

// Save cart changes to localStorage
function saveCartChanges() {
    // Update current user
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
    }

    // Save to localStorage
    localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('buildmart_users', JSON.stringify(allUsers));
}

// Proceed to checkout
function proceedToCheckout() {
    // In a real app, this would redirect to a checkout page
    // For now, we'll simulate creating an order
    createOrder();
}

// Create order from cart items
function createOrder() {
    const order = {
        orderId: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items: cartItems.map(item => ({
            productId: item.productIndex,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            sellerId: item.product.sellerId
        })),
        subtotal: parseFloat(subtotalElement.textContent.replace('₹', '').replace(/,/g, '')),
        shipping: parseFloat(shippingElement.textContent.replace('₹', '').replace(/,/g, '')),
        tax: parseFloat(taxElement.textContent.replace('₹', '').replace(/,/g, '')),
        totalAmount: parseFloat(totalElement.textContent.replace('₹', '').replace(/,/g, '')),
        status: 'Processing',
        shippingAddress: currentUser.shippingAddress || 'Not specified'
    };

    // Add order to user's order history
    if (!currentUser.orders) {
        currentUser.orders = [];
    }
    currentUser.orders.push(order);

    // Clear cart
    currentUser.cart = [];

    // Update sellers' sales records
    updateSellerSales(order);

    // Save changes
    saveCartChanges();

    // Show success message and redirect
    showAlert('Order placed successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1500);
}

// Update sellers' sales records
function updateSellerSales(order) {
    order.items.forEach(item => {
        const seller = allUsers.find(u => u.sellerId === item.sellerId);
        if (seller) {
            if (!seller.sales) {
                seller.sales = [];
            }
            seller.sales.push({
                orderId: order.orderId,
                date: order.date,
                customerName: currentUser.fullName || 'Anonymous',
                productName: item.name,
                quantity: item.quantity,
                totalAmount: item.price * item.quantity,
                status: 'Processing'
            });

            // Update product stock
            const productIndex = seller.products.findIndex(p => p.name === item.name);
            if (productIndex !== -1) {
                seller.products[productIndex].stock -= item.quantity;
            }
        }
    });

    // Save all users
    localStorage.setItem('buildmart_users', JSON.stringify(allUsers));
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

// Initialize the cart when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart);