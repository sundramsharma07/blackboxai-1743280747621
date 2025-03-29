// Customer Orders Logic for BuildMart

// DOM Elements
const ordersTable = document.getElementById('ordersTable');
const orderModal = document.getElementById('orderModal');
const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
const cartCountElement = document.getElementById('cartCount');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let allProducts = [];

// Initialize the orders page
function initOrders() {
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

    // Load orders
    loadOrders();

    // Event listeners
    if (closeOrderModalBtn) {
        closeOrderModalBtn.addEventListener('click', closeOrderModal);
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

// Load customer orders
function loadOrders() {
    if (!currentUser.orders || currentUser.orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">No orders found</td>
            </tr>
        `;
        return;
    }

    // Sort orders by date (newest first)
    const sortedOrders = [...currentUser.orders].sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersTable.innerHTML = '';

    sortedOrders.forEach(order => {
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
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="view-order-btn text-blue-600 hover:text-blue-900" data-id="${currentUser.orders.indexOf(order)}">
                    View Details
                </button>
            </td>
        `;

        ordersTable.appendChild(row);
    });

    // Add event listeners to view order buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            viewOrderDetails(id);
        });
    });
}

// View order details
function viewOrderDetails(orderIndex) {
    const order = currentUser.orders[orderIndex];

    // Set order details in modal
    document.getElementById('orderModalTitle').textContent = `Order #${order.orderId}`;
    document.getElementById('modalOrderId').textContent = order.orderId;
    document.getElementById('modalOrderDate').textContent = new Date(order.date).toLocaleString();
    document.getElementById('modalOrderStatus').innerHTML = `
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
            ${order.status}
        </span>
    `;
    document.getElementById('modalShippingAddress').textContent = order.shippingAddress || 'Not specified';

    // Set order items
    const orderItemsElement = document.getElementById('modalOrderItems');
    orderItemsElement.innerHTML = '';

    order.items.forEach(item => {
        const product = allProducts.find(p => p.name === item.name) || {};
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-start border-b border-gray-100 pb-4';
        itemElement.innerHTML = `
            <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                ${product.image ? `
                    <img src="${product.image}" alt="${item.name}" class="h-full w-full object-cover rounded-md">
                ` : `
                    <i class="fas fa-box-open text-xl text-gray-400"></i>
                `}
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <h4 class="font-medium">${item.name}</h4>
                    <span class="font-semibold">₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <p class="text-sm text-gray-500 mb-1">Seller: ${product.sellerName || 'Unknown'}</p>
                <div class="flex justify-between text-sm">
                    <span>Quantity: ${item.quantity}</span>
                    <span>Price: ₹${item.price.toLocaleString()} each</span>
                </div>
            </div>
        `;
        orderItemsElement.appendChild(itemElement);
    });

    // Set order totals
    document.getElementById('modalSubtotal').textContent = `₹${order.subtotal.toLocaleString()}`;
    document.getElementById('modalShipping').textContent = `₹${order.shipping.toLocaleString()}`;
    document.getElementById('modalTax').textContent = `₹${order.tax.toLocaleString()}`;
    document.getElementById('modalTotal').textContent = `₹${order.totalAmount.toLocaleString()}`;

    // Show modal
    orderModal.classList.remove('hidden');
}

// Close order modal
function closeOrderModal() {
    orderModal.classList.add('hidden');
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

// Initialize the orders page when DOM is loaded
document.addEventListener('DOMContentLoaded', initOrders);