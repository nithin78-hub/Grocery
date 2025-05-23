package com.grocery.service;

import com.grocery.dao.UserDAO;
import com.grocery.model.User;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

public class UserService {
    private UserDAO userDAO;
    
    public UserService() {
        this.userDAO = new UserDAO();
    }
    
    public User registerUser(String username, String email, String password, String fullName) {
        // Check if username or email already exists
        if (userDAO.getUserByUsername(username) != null) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userDAO.getUserByEmail(email) != null) {
            throw new RuntimeException("Email already exists");
        }
        
        // Hash password (simple implementation - in production use bcrypt or similar)
        String hashedPassword = hashPassword(password);
        
        User user = new User(username, email, hashedPassword, fullName);
        return userDAO.saveUser(user);
    }
    
    public User loginUser(String username, String password) {
        String hashedPassword = hashPassword(password);
        User user = userDAO.authenticateUser(username, hashedPassword);
        
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }
        
        return user;
    }
    
    public User getUserById(Long id) {
        return userDAO.getUserById(id);
    }
    
    public User getUserByUsername(String username) {
        return userDAO.getUserByUsername(username);
    }
    
    public List<User> getAllUsers() {
        return userDAO.getAllUsers();
    }
    
    public User updateUser(User user) {
        return userDAO.updateUser(user);
    }
    
    public User updateUserProfile(Long userId, String fullName, String phone, String address) {
        User user = userDAO.getUserById(userId);
        if (user != null) {
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setAddress(address);
            return userDAO.updateUser(user);
        }
        return null;
    }
    
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userDAO.getUserById(userId);
        if (user != null && user.getPassword().equals(hashPassword(oldPassword))) {
            user.setPassword(hashPassword(newPassword));
            userDAO.updateUser(user);
            return true;
        }
        return false;
    }
    
    public boolean deleteUser(Long id) {
        return userDAO.deleteUser(id);
    }
    
    public boolean isAdmin(User user) {
        return user != null && user.getRole() == User.Role.ADMIN;
    }
    
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}