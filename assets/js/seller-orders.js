// Seller Orders Logic for BuildMart

// DOM Elements
const ordersTable = document.getElementById('ordersTable');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];

// Initialize orders
function initOrders() {
    if (!currentUser || currentUser.userType !== 'seller') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set seller info
    document.getElementById('storeName').textContent = currentUser.storeName || 'Store';
    document.getElementById('sellerName').textContent = currentUser.fullName || 'Seller';

    // Load orders
    loadOrders();
}

// Load orders
function loadOrders() {
    if (!currentUser.sales || currentUser.sales.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">No orders found</td>
            </tr>
        `;
        return;
    }

    ordersTable.innerHTML = '';

    currentUser.sales.forEach((order, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.orderId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customerName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.productName} (${order.quantity})</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${order.totalAmount.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="view-order-btn text-blue-600 hover:text-blue-900" data-id="${index}">
                    View
                </button>
                <button class="update-status-btn text-green-600 hover:text-green-900 ml-2" data-id="${index}">
                    Update
                </button>
            </td>
        `;

        ordersTable.appendChild(row);
    });

    // Add event listeners
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            viewOrderDetails(id);
        });
    });

    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            updateOrderStatus(id);
        });
    });
}

// View order details
function viewOrderDetails(id) {
    const order = currentUser.sales[id];
    const customer = allUsers.find(u => u.fullName === order.customerName);
    
    const details = `
        Order ID: ${order.orderId}
        Customer: ${order.customerName}
        Date: ${new Date(order.date).toLocaleString()}
        Product: ${order.productName}
        Quantity: ${order.quantity}
        Price: ₹${order.totalAmount.toLocaleString()}
        Status: ${order.status}
        Customer Contact: ${customer?.email || 'Not available'}
    `;
    
    alert(details);
}

// Update order status
function updateOrderStatus(id) {
    const order = currentUser.sales[id];
    const newStatus = prompt('Update order status:', order.status);
    
    if (newStatus && newStatus !== order.status) {
        order.status = newStatus;
        
        // Update in allUsers
        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = currentUser;
        }
        
        // Save to localStorage
        localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('buildmart_users', JSON.stringify(allUsers));
        
        // Refresh orders
        loadOrders();
        
        showAlert('Order status updated!', 'success');
    }
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

// Show alert message
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Initialize orders when DOM is loaded
document.addEventListener('DOMContentLoaded', initOrders);