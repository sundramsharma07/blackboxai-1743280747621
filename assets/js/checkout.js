// Checkout Logic for BuildMart

// DOM Elements
const shippingForm = document.getElementById('shippingForm');
const checkoutItems = document.getElementById('checkoutItems');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const cartCountElement = document.getElementById('cartCount');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let allProducts = [];
let cartItems = [];
let orderSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
};

// Initialize the checkout
function initCheckout() {
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
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Payment method toggle
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentMethod);
    });
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

// Load cart items for checkout
function loadCartItems() {
    if (!currentUser.cart || currentUser.cart.length === 0) {
        window.location.href = 'cart.html';
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

    displayCheckoutItems();
    calculateOrderSummary();
}

// Display items in checkout
function displayCheckoutItems() {
    checkoutItems.innerHTML = '';

    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-start border-b border-gray-100 pb-4';
        itemElement.innerHTML = `
            <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                ${item.product.image ? `
                    <img src="${item.product.image}" alt="${item.product.name}" class="h-full w-full object-cover rounded-md">
                ` : `
                    <i class="fas fa-box-open text-xl text-gray-400"></i>
                `}
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <h4 class="font-medium">${item.product.name}</h4>
                    <span class="font-semibold">₹${item.totalPrice.toLocaleString()}</span>
                </div>
                <p class="text-sm text-gray-500 mb-1">${item.product.sellerName}</p>
                <div class="flex justify-between text-sm">
                    <span>Quantity: ${item.quantity}</span>
                    <span>Price: ₹${item.product.price.toLocaleString()} each</span>
                </div>
            </div>
        `;
        checkoutItems.appendChild(itemElement);
    });
}

// Calculate order summary
function calculateOrderSummary() {
    orderSummary.subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    orderSummary.shipping = orderSummary.subtotal > 10000 ? 0 : 500; // Free shipping for orders over ₹10,000
    orderSummary.tax = orderSummary.subtotal * 0.05; // 5% tax
    orderSummary.total = orderSummary.subtotal + orderSummary.shipping + orderSummary.tax;

    // Update UI
    document.getElementById('checkoutSubtotal').textContent = `₹${orderSummary.subtotal.toLocaleString()}`;
    document.getElementById('checkoutShipping').textContent = `₹${orderSummary.shipping.toLocaleString()}`;
    document.getElementById('checkoutTax').textContent = `₹${orderSummary.tax.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `₹${orderSummary.total.toLocaleString()}`;
}

// Toggle payment method visibility
function togglePaymentMethod() {
    const creditCardSelected = document.getElementById('creditCard').checked;
    document.getElementById('creditCardForm').style.display = creditCardSelected ? 'block' : 'none';
}

// Place order
function placeOrder() {
    // Validate shipping form
    if (!shippingForm.checkValidity()) {
        shippingForm.reportValidity();
        return;
    }

    // Validate payment method if credit card is selected
    if (document.getElementById('creditCard').checked) {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        if (!cardNumber || !expiryDate || !cvv) {
            showAlert('Please enter all credit card details', 'error');
            return;
        }

        // Simple validation for demo purposes
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showAlert('Please enter a valid 16-digit card number', 'error');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            showAlert('Please enter a valid expiry date (MM/YY)', 'error');
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            showAlert('Please enter a valid CVV (3 or 4 digits)', 'error');
            return;
        }
    }

    // Create order
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
        subtotal: orderSummary.subtotal,
        shipping: orderSummary.shipping,
        tax: orderSummary.tax,
        totalAmount: orderSummary.total,
        status: 'Processing',
        paymentMethod: document.getElementById('creditCard').checked ? 'Credit Card' : 'Cash on Delivery',
        shippingAddress: document.getElementById('address').value
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
    saveOrderChanges();

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
}

// Save order changes to localStorage
function saveOrderChanges() {
    // Update current user
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
    }

    // Save to localStorage
    localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
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

// Initialize the checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', initCheckout);