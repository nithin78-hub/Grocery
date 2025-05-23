package com.grocery.service;

import com.grocery.dao.OrderDAO;
import com.grocery.dao.ProductDAO;
import com.grocery.model.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OrderService {
    private OrderDAO orderDAO;
    private CartService cartService;
    private ProductDAO productDAO;
    
    public OrderService() {
        this.orderDAO = new OrderDAO();
        this.cartService = new CartService();
        this.productDAO = new ProductDAO();
    }
    
    public Order createOrder(Long userId, String shippingAddress, String paymentMethod) {
        List<CartItem> cartItems = cartService.getCartItems(userId);
        
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Validate stock availability
        for (CartItem item : cartItems) {
            if (!isStockAvailable(item.getProduct().getId(), item.getQuantity())) {
                throw new RuntimeException("Insufficient stock for product: " + item.getProduct().getName());
            }
        }
        
        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            totalAmount = totalAmount.add(
                item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
            );
        }
        
        // Create order
        User user = new User();
        user.setId(userId);
        Order order = new Order(user, totalAmount, shippingAddress, paymentMethod);
        
        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            OrderItem orderItem = new OrderItem(
                order, 
                item.getProduct(), 
                item.getQuantity(), 
                item.getProduct().getPrice()
            );
            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);
        
        // Save order
        Order savedOrder = orderDAO.saveOrder(order);
        
        if (savedOrder != null) {
            // Update product stock
            for (CartItem item : cartItems) {
                productDAO.updateStock(item.getProduct().getId(), item.getQuantity());
            }
            
            // Clear cart
            cartService.clearCart(userId);
        }
        
        return savedOrder;
    }
    
    public Order getOrderById(Long orderId) {
        return orderDAO.getOrderById(orderId);
    }
    
    public List<Order> getUserOrders(Long userId) {
        return orderDAO.getOrdersByUser(userId);
    }
    
    public List<Order> getAllOrders() {
        return orderDAO.getAllOrders();
    }
    
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderDAO.getOrderItems(orderId);
    }
    
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        return orderDAO.updateOrderStatus(orderId, status);
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderDAO.getOrdersByStatus(status);
    }
    
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderDAO.getOrderById(orderId);
        
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }
        
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel shipped or delivered orders");
        }
        
        // Restore stock if order was confirmed
        if (order.getStatus() == Order.OrderStatus.CONFIRMED) {
            List<OrderItem> orderItems = getOrderItems(orderId);
            for (OrderItem item : orderItems) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productDAO.updateProduct(product);
            }
        }
        
        return updateOrderStatus(orderId, Order.OrderStatus.CANCELLED);
    }
    
    private boolean isStockAvailable(Long productId, Integer quantity) {
        Product product = productDAO.getProductById(productId);
        return product != null && product.getStockQuantity() >= quantity;
    }
    
    public BigDecimal calculateOrderTotal(List<CartItem> cartItems) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            total = total.add(
                item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
            );
        }
        return total;
    }
}