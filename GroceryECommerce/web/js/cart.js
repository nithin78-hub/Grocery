// Shopping Cart Management Functions

// Cart operations
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
    }
    
    // Load cart from localStorage
    loadCart() {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    }
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    // Add item to cart
    addItem(productId, quantity = 1) {
        if (!currentUser) {
            showMessage('Please login to add items to cart', 'error');
            window.location.href = 'login.html';
            return false;
        }
        
        const product = this.getProductById(productId);
        if (!product) {
            showMessage('Product not found', 'error');
            return false;
        }
        
        if (product.stockQuantity <= 0) {
            showMessage('Product is out of stock', 'error');
            return false;
        }
        
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                showMessage(`Cannot add more items. Only ${product.stockQuantity} available`, 'error');
                return false;
            }
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > product.stockQuantity) {
                showMessage(`Cannot add ${quantity} items. Only ${product.stockQuantity} available`, 'error');
                return false;
            }
            this.items.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        return true;
    }
    
    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartDisplay();
        showMessage('Item removed from cart', 'success');
    }
    
    // Update item quantity
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const product = this.getProductById(productId);
        if (!product) {
            showMessage('Product not found', 'error');
            return;
        }
        
        if (quantity > product.stockQuantity) {
            showMessage(`Cannot add ${quantity} items. Only ${product.stockQuantity} available`, 'error');
            return;
        }
        
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }
    
    // Clear all items from cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        showMessage('Cart cleared', 'success');
    }
    
    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            const product = this.getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }
    
    // Get cart item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    // Get product by ID (from products array)
    getProductById(productId) {
        return products.find(p => p.id === productId);
    }
    
    // Update cart count in header
    updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            const count = this.getItemCount();
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Update cart display on cart page
    updateCartDisplay() {
        this.updateCartCount();
        
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        
        if (!cartItemsContainer) return;
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'block';
            }
            if (cartSummary) {
                cartSummary.style.display = 'none';
            }
            return;
        }
        
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        if (cartSummary) {
            cartSummary.style.display = 'block';
        }
        
        cartItemsContainer.innerHTML = '';
        
        this.items.forEach(item => {
            const product = this.getProductById(item.productId);
            if (product) {
                const cartItem = this.createCartItemElement(product, item);
                cartItemsContainer.appendChild(cartItem);
            }
        });
        
        this.updateCartSummary();
    }
    
    // Create cart item element
    createCartItemElement(product, cartItem) {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${product.imageUrl}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5JbWFnZTwvdGV4dD4KPC9zdmc+'">
            </div>
            <div class="cart-item-details">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="cart-item-price">$${product.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="cart.updateQuantity(${product.id}, ${cartItem.quantity - 1})" 
                        class="quantity-btn" ${cartItem.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" value="${cartItem.quantity}" min="1" max="${product.stockQuantity}"
                       onchange="cart.updateQuantity(${product.id}, parseInt(this.value))"
                       class="quantity-input">
                <button onclick="cart.updateQuantity(${product.id}, ${cartItem.quantity + 1})" 
                        class="quantity-btn" ${cartItem.quantity >= product.stockQuantity ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-total">
                $${(product.price * cartItem.quantity).toFixed(2)}
            </div>
            <div class="cart-item-actions">
                <button onclick="cart.removeItem(${product.id})" class="remove-btn" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return itemElement;
    }
    
    // Update cart summary
    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const itemCountElement = document.getElementById('itemCount');
        
        const subtotal = this.getTotal();
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        const total = subtotal + tax + shipping;
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (document.getElementById('tax')) document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        if (document.getElementById('shipping')) document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (itemCountElement) itemCountElement.textContent = this.getItemCount();
    }
    
    // Apply coupon code
    applyCoupon(couponCode) {
        const validCoupons = {
            'SAVE10': { discount: 0.1, type: 'percentage', description: '10% off' },
            'FRESH20': { discount: 0.2, type: 'percentage', description: '20% off' },
            'WELCOME5': { discount: 5, type: 'fixed', description: '$5 off' }
        };
        
        const coupon = validCoupons[couponCode.toUpperCase()];
        
        if (!coupon) {
            showMessage('Invalid coupon code', 'error');
            return false;
        }
        
        // Store applied coupon
        localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        showMessage(`Coupon applied: ${coupon.description}`, 'success');
        this.updateCartSummary();
        return true;
    }
    
    // Remove applied coupon
    removeCoupon() {
        localStorage.removeItem('appliedCoupon');
        showMessage('Coupon removed', 'success');
        this.updateCartSummary();
    }
    
    // Validate cart before checkout
    validateCart() {
        if (this.items.length === 0) {
            showMessage('Your cart is empty', 'error');
            return false;
        }
        
        // Check stock availability
        for (const item of this.items) {
            const product = this.getProductById(item.productId);
            if (!product) {
                showMessage(`Product not found: ${item.productId}`, 'error');
                return false;
            }
            
            if (!product.isActive) {
                showMessage(`Product is no longer available: ${product.name}`, 'error');
                return false;
            }
            
            if (product.stockQuantity < item.quantity) {
                showMessage(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`, 'error');
                return false;
            }
        }
        
        return true;
    }
    
    // Get cart data for checkout
    getCartData() {
        return {
            items: this.items.map(item => ({
                ...item,
                product: this.getProductById(item.productId)
            })),
            subtotal: this.getTotal(),
            itemCount: this.getItemCount()
        };
    }
}

// Initialize cart
let cart;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();
    
    // Setup cart page specific functionality
    if (window.location.pathname.includes('cart.html')) {
        setupCartPage();
    }
});

// Setup cart page functionality
function setupCartPage() {
    // Coupon form
    const couponForm = document.getElementById('couponForm');
    if (couponForm) {
        couponForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const couponInput = document.getElementById('couponCode');
            const couponCode = couponInput.value.trim();
            
            if (cart.applyCoupon(couponCode)) {
                couponInput.value = '';
            }
        });
    }
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart.clearCart();
            }
        });
    }
    
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!currentUser) {
                showMessage('Please login to proceed with checkout', 'error');
                window.location.href = 'login.html?redirect=cart.html';
                return;
            }
            
            if (cart.validateCart()) {
                window.location.href = 'checkout.html';
            }
        });
    }
}

// Global function to add item to cart (called from product pages)
function addToCart(productId, quantity = 1) {
    if (!cart) {
        cart = new ShoppingCart();
    }
    
    const success = cart.addItem(productId, quantity);
    
    if (success) {
        showMessage('Product added to cart successfully!', 'success');
        
        // Add visual feedback to button
        const button = event?.target;
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Added!';
            button.style.backgroundColor = '#27ae60';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 1500);
        }
    }
}

// Update global cart count function
function updateCartCount() {
    if (cart) {
        cart.updateCartCount();
    }
}