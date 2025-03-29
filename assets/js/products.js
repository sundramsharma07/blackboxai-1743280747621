// Seller Products Management for BuildMart

// DOM Elements
const addProductBtn = document.getElementById('addProductBtn');
const productsTable = document.getElementById('productsTable');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const categoryBtns = document.querySelectorAll('.category-btn');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('buildmart_currentUser')) || null;
let allUsers = JSON.parse(localStorage.getItem('buildmart_users')) || [];
let currentProducts = [];
let currentCategory = 'All';

// Initialize products page
function initProducts() {
    if (!currentUser || currentUser.userType !== 'seller') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Load current products
    currentProducts = currentUser.products || [];
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial products
    loadProducts();
}

function setupEventListeners() {
    // Add product button
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            productForm.reset();
            productForm.removeAttribute('data-edit-id');
            modalTitle.textContent = 'Add New Product';
            productModal.classList.remove('hidden');
        });
    }

    // Modal buttons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            productModal.classList.add('hidden');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            productModal.classList.add('hidden');
        });
    }

    // Form submission
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Category filter buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active category styling
            categoryBtns.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-gray-200');
            });
            btn.classList.remove('bg-gray-200');
            btn.classList.add('bg-blue-600', 'text-white');
            
            // Set current category and reload products
            currentCategory = btn.textContent.trim();
            loadProducts();
        });
    });
}

// Load products into table
function loadProducts() {
    if (!productsTable) return;
    
    productsTable.innerHTML = '';

    // Filter products by category if needed
    const filteredProducts = currentCategory === 'All' 
        ? [...currentProducts]
        : currentProducts.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        productsTable.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    No products found${currentCategory !== 'All' ? ` in ${currentCategory} category` : ''}
                </td>
            </tr>
        `;
        return;
    }

    // Display products
    filteredProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    ${product.image ? `
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-md object-cover" src="${product.image}" alt="${product.name}">
                        </div>
                    ` : `
                        <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <i class="fas fa-box text-gray-400"></i>
                        </div>
                    `}
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹${product.price.toLocaleString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${product.stock}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${index}">
                    Edit
                </button>
                <button class="delete-btn text-red-600 hover:text-red-900" data-id="${index}">
                    Delete
                </button>
            </td>
        `;

        productsTable.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            editProduct(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteProduct(id);
        });
    });
}

// Edit product
function editProduct(id) {
    const product = currentProducts[id];
    
    // Populate form
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image || '';
    
    // Set edit mode
    productForm.setAttribute('data-edit-id', id);
    modalTitle.textContent = 'Edit Product';
    productModal.classList.remove('hidden');
}

// Handle form submission
function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!productData.productName || !productData.productCategory || 
        !productData.productPrice || !productData.productStock) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    // Convert to proper types
    productData.price = parseFloat(productData.productPrice);
    productData.stock = parseInt(productData.productStock);
    
    // Create product object
    const product = {
        name: productData.productName,
        category: productData.productCategory,
        description: productData.productDescription || '',
        price: productData.price,
        stock: productData.stock,
        image: productData.productImage || null,
        dateAdded: new Date().toISOString()
    };

    const editId = productForm.getAttribute('data-edit-id');
    
    if (editId) {
        // Update existing product
        currentProducts[editId] = product;
    } else {
        // Add new product
        currentProducts.push(product);
    }
    
    // Update user data
    currentUser.products = currentProducts;
    
    // Update in all users
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
    }
    
    // Save to localStorage
    localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('buildmart_users', JSON.stringify(allUsers));
    
    // Refresh UI
    loadProducts();
    productModal.classList.add('hidden');
    
    showAlert(`Product ${editId ? 'updated' : 'added'} successfully!`, 'success');
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
        currentProducts.splice(id, 1);
        
        // Update user data
        currentUser.products = currentProducts;
        
        // Update in all users
        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = currentUser;
        }
        
        // Save to localStorage
        localStorage.setItem('buildmart_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('buildmart_users', JSON.stringify(allUsers));
        
        // Refresh UI
        loadProducts();
        
        showAlert('Product deleted successfully!', 'success');
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

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        initProducts();
        console.log('Products module initialized successfully');
    } catch (error) {
        console.error('Error initializing products:', error);
        showAlert('Failed to initialize product management. Please refresh the page.', 'error');
    }
});

// Debug function to check element existence
function checkElements() {
    const elements = {
        addProductBtn: document.getElementById('addProductBtn'),
        productModal: document.getElementById('productModal'),
        productForm: document.getElementById('productForm')
    };
    
    console.log('Element check:', elements);
    return elements;
}
