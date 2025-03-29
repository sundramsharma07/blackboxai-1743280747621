// Seller Dashboard Logic for BuildMart

// DOM Elements
const storeNameElement = document.getElementById('storeName');
const sellerNameElement = document.getElementById('sellerName');
const totalProductsElement = document.getElementById('totalProducts');
const totalOrdersElement = document.getElementById('totalOrders');
const totalRevenueElement = document.getElementById('totalRevenue');
const recentOrdersElement = document.getElementById('recentOrders');
const logoutBtn = document.getElementById('logoutBtn');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];

// Initialize the dashboard
function initDashboard() {
    if (!currentUser || currentUser.userType !== 'seller') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set seller info
    storeNameElement.textContent = currentUser.storeName || 'My Store';
    sellerNameElement.textContent = currentUser.fullName || 'Seller';

    // Load dashboard stats
    loadDashboardStats();

    // Load recent orders
    loadRecentOrders();

    // Initialize sales chart
    initSalesChart();

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    // Count products
    const productCount = currentUser.products ? currentUser.products.length : 0;
    totalProductsElement.textContent = productCount;

    // Count orders and calculate revenue
    let orderCount = 0;
    let revenue = 0;

    if (currentUser.sales && currentUser.sales.length > 0) {
        orderCount = currentUser.sales.length;
        revenue = currentUser.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    }

    totalOrdersElement.textContent = orderCount;
    totalRevenueElement.textContent = `₹${revenue.toLocaleString()}`;
}

// Load recent orders (last 5)
function loadRecentOrders() {
    if (!currentUser.sales || currentUser.sales.length === 0) {
        return;
    }

    // Sort by date (newest first)
    const sortedSales = [...currentUser.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentSales = sortedSales.slice(0, 5);

    recentOrdersElement.innerHTML = '';

    recentSales.forEach(sale => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.orderId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.customerName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(sale.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${sale.totalAmount.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sale.status)}">
                    ${sale.status}
                </span>
            </td>
        `;

        recentOrdersElement.appendChild(row);
    });
}

// Get status badge class
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Initialize sales chart
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Sample data - in a real app, this would come from the API
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [12000, 19000, 3000, 5000, 2000, 3000];

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Sales (₹)',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('buildmart_currentUser');
    window.location.href = '../auth/login.html';
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);