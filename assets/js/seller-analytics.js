// Seller Analytics for BuildMart

// DOM Elements
const totalRevenueEl = document.getElementById('totalRevenue');
const totalOrdersEl = document.getElementById('totalOrders');
const topProductEl = document.getElementById('topProduct');
const salesChartEl = document.getElementById('salesChart');
const productsChartEl = document.getElementById('productsChart');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;

// Initialize analytics
function initAnalytics() {
    if (!currentUser || currentUser.userType !== 'seller') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set seller info
    document.getElementById('storeName').textContent = currentUser.storeName || 'Store';
    document.getElementById('sellerName').textContent = currentUser.fullName || 'Seller';

    // Load analytics data
    loadAnalytics();
}

// Load and display analytics data
function loadAnalytics() {
    if (!currentUser.sales || currentUser.sales.length === 0) {
        totalRevenueEl.textContent = '₹0';
        totalOrdersEl.textContent = '0';
        topProductEl.textContent = '-';
        return;
    }

    // Calculate total revenue and orders
    const totalRevenue = currentUser.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = currentUser.sales.length;
    
    // Find top product
    const productSales = {};
    currentUser.sales.forEach(sale => {
        productSales[sale.productName] = (productSales[sale.productName] || 0) + sale.quantity;
    });
    
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
    
    // Update summary cards
    totalRevenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
    totalOrdersEl.textContent = totalOrders;
    topProductEl.textContent = topProduct ? `${topProduct[0]} (${topProduct[1]} sold)` : '-';

    // Prepare data for charts
    const monthlyData = getMonthlySalesData();
    const productData = getProductPerformanceData();

    // Render charts
    renderSalesChart(monthlyData);
    renderProductsChart(productData);
}

// Get monthly sales data
function getMonthlySalesData() {
    const monthlySales = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    currentUser.sales.forEach(sale => {
        const date = new Date(sale.date);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + sale.totalAmount;
    });
    
    return {
        labels: Object.keys(monthlySales),
        data: Object.values(monthlySales)
    };
}

// Get product performance data
function getProductPerformanceData() {
    const productPerformance = {};
    
    currentUser.sales.forEach(sale => {
        productPerformance[sale.productName] = (productPerformance[sale.productName] || 0) + sale.quantity;
    });
    
    const sorted = Object.entries(productPerformance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return {
        labels: sorted.map(item => item[0]),
        data: sorted.map(item => item[1])
    };
}

// Render sales chart
function renderSalesChart(data) {
    new Chart(salesChartEl, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Monthly Sales (₹)',
                data: data.data,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
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

// Render products chart
function renderProductsChart(data) {
    new Chart(productsChartEl, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Units Sold',
                data: data.data,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnalytics);