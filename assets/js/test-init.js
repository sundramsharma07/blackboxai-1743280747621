// Test initialization for BuildMart
console.log('Initializing test environment...');

// Test seller account
const testSeller = {
    id: 'test-seller-123',
    fullName: 'Test Seller',
    email: 'seller@buildmart.com',
    password: 'test123',
    userType: 'seller',
    storeName: 'Test Construction Supplies',
    businessAddress: '123 Test Street',
    sellerId: 'SLR-TEST123',
    products: [],
    sales: [],
    dateRegistered: new Date().toISOString()
};

// Initialize test data if not already present
if (!localStorage.getItem('buildmart_users')) {
    console.log('Creating test data...');
    localStorage.setItem('buildmart_users', JSON.stringify([testSeller]));
}

// Auto-login test seller
if (!localStorage.getItem('buildmart_currentUser')) {
    console.log('Auto-logging in test seller...');
    localStorage.setItem('buildmart_currentUser', JSON.stringify(testSeller));
}

console.log('Test initialization complete');