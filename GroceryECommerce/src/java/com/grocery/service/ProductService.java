package com.grocery.service;

import com.grocery.dao.ProductDAO;
import com.grocery.dao.CategoryDAO;
import com.grocery.model.Product;
import com.grocery.model.Category;
import java.math.BigDecimal;
import java.util.List;

public class ProductService {
    private ProductDAO productDAO;
    private CategoryDAO categoryDAO;
    
    public ProductService() {
        this.productDAO = new ProductDAO();
        this.categoryDAO = new CategoryDAO();
    }
    
    public Product addProduct(String name, String description, BigDecimal price, 
                             Integer stockQuantity, Long categoryId, String imageUrl) {
        Category category = categoryDAO.getCategoryById(categoryId);
        if (category == null) {
            throw new RuntimeException("Category not found");
        }
        
        Product product = new Product(name, description, price, stockQuantity, category);
        product.setImageUrl(imageUrl);
        
        return productDAO.saveProduct(product);
    }
    
    public Product getProductById(Long id) {
        return productDAO.getProductById(id);
    }
    
    public List<Product> getAllProducts() {
        return productDAO.getAllProducts();
    }
    
    public List<Product> getProductsByCategory(Long categoryId) {
        return productDAO.getProductsByCategory(categoryId);
    }
    
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        return productDAO.searchProducts(keyword.trim());
    }
    
    public Product updateProduct(Long id, String name, String description, BigDecimal price, 
                                Integer stockQuantity, Long categoryId, String imageUrl) {
        Product product = productDAO.getProductById(id);
        if (product == null) {
            throw new RuntimeException("Product not found");
        }
        
        Category category = categoryDAO.getCategoryById(categoryId);
        if (category == null) {
            throw new RuntimeException("Category not found");
        }
        
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        
        return productDAO.updateProduct(product);
    }
    
    public boolean deleteProduct(Long id) {
        return productDAO.deleteProduct(id);
    }
    
    public boolean isProductAvailable(Long productId, Integer quantity) {
        Product product = productDAO.getProductById(productId);
        return product != null && product.getIsActive() && 
               product.getStockQuantity() >= quantity;
    }
    
    public boolean updateStock(Long productId, Integer quantity) {
        return productDAO.updateStock(productId, quantity);
    }
    
    public List<Product> getFeaturedProducts(int limit) {
        List<Product> allProducts = getAllProducts();
        return allProducts.subList(0, Math.min(limit, allProducts.size()));
    }
    
    public List<Product> getNewArrivals(int limit) {
        // This could be enhanced to sort by creation date
        List<Product> allProducts = getAllProducts();
        return allProducts.subList(0, Math.min(limit, allProducts.size()));
    }
}