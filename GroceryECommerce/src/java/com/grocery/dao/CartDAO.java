package com.grocery.dao;

import com.grocery.model.CartItem;
import com.grocery.model.User;
import com.grocery.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import java.util.List;

public class CartDAO {
    
    public CartItem addToCart(CartItem cartItem) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            
            // Check if item already exists in cart
            Query<CartItem> query = session.createQuery(
                "FROM CartItem WHERE user.id = :userId AND product.id = :productId", 
                CartItem.class
            );
            query.setParameter("userId", cartItem.getUser().getId());
            query.setParameter("productId", cartItem.getProduct().getId());
            
            CartItem existingItem = query.uniqueResult();
            
            if (existingItem != null) {
                // Update quantity if item exists
                existingItem.setQuantity(existingItem.getQuantity() + cartItem.getQuantity());
                session.update(existingItem);
                transaction.commit();
                return existingItem;
            } else {
                // Add new item to cart
                session.save(cartItem);
                transaction.commit();
                return cartItem;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
    public List<CartItem> getCartItems(Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<CartItem> query = session.createQuery(
                "FROM CartItem c JOIN FETCH c.product WHERE c.user.id = :userId", 
                CartItem.class
            );
            query.setParameter("userId", userId);
            return query.list();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public CartItem updateCartItem(CartItem cartItem) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.update(cartItem);
            transaction.commit();
            return cartItem;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
    public boolean removeFromCart(Long cartItemId) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            CartItem cartItem = session.get(CartItem.class, cartItemId);
            if (cartItem != null) {
                session.delete(cartItem);
                transaction.commit();
                return true;
            }
            return false;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean clearCart(Long userId) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            Query query = session.createQuery("DELETE FROM CartItem WHERE user.id = :userId");
            query.setParameter("userId", userId);
            query.executeUpdate();
            transaction.commit();
            return true;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return false;
        }
    }
    
    public int getCartItemCount(Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Long> query = session.createQuery(
                "SELECT SUM(quantity) FROM CartItem WHERE user.id = :userId", 
                Long.class
            );
            query.setParameter("userId", userId);
            Long count = query.uniqueResult();
            return count != null ? count.intValue() : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}