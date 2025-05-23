// Global variables
let currentUser = null;
let categories = [];
let products = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    loadUserSession();
    loadCategories();
    loadFeaturedProducts();
    setupEventListeners();
    updateCartCount();
    updateUserInterface();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (userDropdown) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            subscribeToNewsletter(email);
        });
    }
}

// Load user session from localStorage
function loadUserSession() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

// Update user interface based on login status
function updateUserInterface() {
    const guestMenu = document.getElementById('guestMenu');
    const userMenu = document.getElementById('userMenu');
    const adminMenu = document.getElementById('adminMenu');
    
    if (currentUser) {
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Show admin menu if user is admin
        if (currentUser.role === 'ADMIN' && adminMenu) {
            adminMenu.style.display = 'block';
        }
    } else {
        if (guestMenu) guestMenu.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (adminMenu) adminMenu.style.display = 'none';
    }
}

// Load categories from API/localStorage
function loadCategories() {
    // Simulated categories data - in real app, this would come from API
    categories = [
        { id: 1, name: 'Fruits', description: 'Fresh fruits and seasonal produce', imageUrl: 'images/fruits.jpg' },
        { id: 2, name: 'Vegetables', description: 'Fresh vegetables and greens', imageUrl: 'images/vegetables.jpg' },
        { id: 3, name: 'Dairy', description: 'Milk, cheese, yogurt and dairy products', imageUrl: 'images/dairy.jpg' },
        { id: 4, name: 'Bakery', description: 'Fresh bread, cakes and baked goods', imageUrl: 'images/bakery.jpg' },
        { id: 5, name: 'Beverages', description: 'Drinks, juices and beverages', imageUrl: 'images/beverages.jpg' }
    ];
    
    displayCategories();
}

// Display categories in the grid
function displayCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        categoriesGrid.appendChild(categoryCard);
    });
}

// Create category card element
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => viewCategory(category.id);
    
    card.innerHTML = `
        <img src="${category.imageUrl}" alt="${category.name}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+JHtjYXRlZ29yeS5uYW1lfTwvdGV4dD4KPC9zdmc+'">
        <h3>${category.name}</h3>
    `;
    
    return card;
}

// Load featured products
function loadFeaturedProducts() {
    // Simulated products data - in real app, this would come from API
    products = [
        { id: 1, name: 'Fresh Apples', description: 'Red delicious apples - 1kg', price: 3.99, stockQuantity: 100, categoryId: 1, imageUrl: 'images/apples.jpg' },
        { id: 2, name: 'Bananas', description: 'Fresh bananas - 1kg', price: 2.49, stockQuantity: 150, categoryId: 1, imageUrl: 'images/bananas.jpg' },
        { id: 3, name: 'Carrots', description: 'Fresh carrots - 500g', price: 1.99, stockQuantity: 80, categoryId: 2, imageUrl: 'images/carrots.jpg' },
        { id: 4, name: 'Spinach', description: 'Fresh spinach leaves - 250g', price: 2.99, stockQuantity: 50, categoryId: 2, imageUrl: 'images/spinach.jpg' },
        { id: 5, name: 'Whole Milk', description: 'Fresh whole milk - 1L', price: 2.79, stockQuantity: 200, categoryId: 3, imageUrl: 'images/milk.jpg' },
        { id: 6, name: 'Cheddar Cheese', description: 'Aged cheddar cheese - 200g', price: 4.99, stockQuantity: 30, categoryId: 3, imageUrl: 'images/cheese.jpg' },
        { id: 7, name: 'White Bread', description: 'Fresh white bread loaf', price: 2.49, stockQuantity: 60, categoryId: 4, imageUrl: 'images/bread.jpg' },
        { id: 8, name: 'Orange Juice', description: 'Fresh orange juice - 1L', price: 3.99, stockQuantity: 75, categoryId: 5, imageUrl: 'images/orange_juice.jpg' }
    ];
    
    displayFeaturedProducts();
}

// Display featured products
function displayFeaturedProducts() {
    const featuredProductsGrid = document.getElementById('featuredProducts');
    if (!featuredProductsGrid) return;
    
    featuredProductsGrid.innerHTML = '';
    
    // Show first 6 products as featured
    const featuredProducts = products.slice(0, 6);
    
    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredProductsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEyNSIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPiR7cHJvZHVjdC5uYW1lfTwvdGV4dD4KPC9zdmc+'">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        // Redirect to products page with search query
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

// View category products
function viewCategory(categoryId) {
    window.location.href = `products.html?category=${categoryId}`;
}

// Add product to cart
function addToCart(productId) {
    if (!currentUser) {
        showMessage('Please login to add items to cart', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }
    
    if (product.stockQuantity <= 0) {
        showMessage('Product is out of stock', 'error');
        return;
    }
    
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
            showMessage('Cannot add more items. Stock limit reached', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    showMessage('Product added to cart successfully!', 'success');
    
    // Add visual feedback
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '#3498db';
    }, 1500);
}

// Update cart count in header
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElement.textContent = totalItems;
    
    // Add animation if count changed
    if (totalItems > 0) {
        cartCountElement.style.display = 'flex';
        cartCountElement.classList.add('animate-pulse');
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    currentUser = null;
    
    showMessage('Logged out successfully', 'success');
    updateUserInterface();
    updateCartCount();
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Newsletter subscription
function subscribeToNewsletter(email) {
    // Simulate API call
    setTimeout(() => {
        showMessage('Thank you for subscribing to our newsletter!', 'success');
        document.querySelector('.newsletter-form input').value = '';
    }, 500);
}

// Show message to user
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#f39c12';
            break;
        default:
            messageDiv.style.backgroundColor = '#3498db';
    }
    
    // Style the close button
    const closeBtn = messageDiv.querySelector('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#message-animations')) {
        const style = document.createElement('style');
        style.id = 'message-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}