// TEST INITIALIZATION - FIXED VERSION
(function() {
    console.log('[FIXED] Initializing test environment...');
    
    // Clear existing data
    localStorage.clear();
    
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

    // Initialize fresh test data
    console.log('[FIXED] Creating test data...');
    localStorage.setItem('buildmart_users', JSON.stringify([testSeller]));
    localStorage.setItem('buildmart_currentUser', JSON.stringify(testSeller));
    
    console.log('[FIXED] Test initialization complete');
})();