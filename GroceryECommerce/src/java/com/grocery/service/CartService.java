package com.grocery.service;

import com.grocery.dao.CartDAO;
import com.grocery.dao.ProductDAO;
import com.grocery.dao.UserDAO;
import com.grocery.model.CartItem;
import com.grocery.model.Product;
import com.grocery.model.User;
import java.math.BigDecimal;
import java.util.List;

public class CartService {
    private CartDAO cartDAO;
    private ProductDAO productDAO;
    private UserDAO userDAO;
    
    public CartService() {
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO();
        this.userDAO = new UserDAO();
    }
    
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        User user = userDAO.getUserById(userId);
        Product product = productDAO.getProductById(productId);
        
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        if (product == null || !product.getIsActive()) {
            throw new RuntimeException("Product not found or not available");
        }
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        CartItem cartItem = new CartItem(user, product, quantity);
        return cartDAO.addToCart(cartItem);
    }
    
    public List<CartItem> getCartItems(Long userId) {
        return cartDAO.getCartItems(userId);
    }
    
    public CartItem updateCartItemQuantity(Long cartItemId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        
        // Get current cart item to validate stock
        CartItem cartItem = getCartItemById(cartItemId);
        if (cartItem == null) {
            throw new RuntimeException("Cart item not found");
        }
        
        if (cartItem.getProduct().getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + 
                                     cartItem.getProduct().getStockQuantity());
        }
        
        cartItem.setQuantity(quantity);
        return cartDAO.updateCartItem(cartItem);
    }
    
    public boolean removeFromCart(Long cartItemId) {
        return cartDAO.removeFromCart(cartItemId);
    }
    
    public boolean clearCart(Long userId) {
        return cartDAO.clearCart(userId);
    }
    
    public int getCartItemCount(Long userId) {
        return cartDAO.getCartItemCount(userId);
    }
    
    public BigDecimal getCartTotal(Long userId) {
        List<CartItem> cartItems = getCartItems(userId);
        BigDecimal total = BigDecimal.ZERO;
        
        if (cartItems != null) {
            for (CartItem item : cartItems) {
                BigDecimal itemTotal = item.getProduct().getPrice()
                                         .multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
            }
        }
        
        return total;
    }
    
    private CartItem getCartItemById(Long cartItemId) {
        // This method would need to be added to CartDAO
        List<CartItem> allItems = cartDAO.getCartItems(null); // This is not ideal
        // Better implementation would be to add getCartItemById to CartDAO
        return null; // Placeholder - implement proper method in CartDAO
    }
}