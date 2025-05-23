package com.grocery.dao;

import com.grocery.model.Order;
import com.grocery.model.OrderItem;
import com.grocery.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import java.util.List;

public class OrderDAO {
    
    public Order saveOrder(Order order) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.save(order);
            
            // Save order items
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    item.setOrder(order);
                    session.save(item);
                }
            }
            
            transaction.commit();
            return order;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
    public Order getOrderById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Order.class, id);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public List<Order> getOrdersByUser(Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Order> query = session.createQuery(
                "FROM Order WHERE user.id = :userId ORDER BY createdAt DESC", 
                Order.class
            );
            query.setParameter("userId", userId);
            return query.list();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public List<Order> getAllOrders() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Order> query = session.createQuery("FROM Order ORDER BY createdAt DESC", Order.class);
            return query.list();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public List<OrderItem> getOrderItems(Long orderId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<OrderItem> query = session.createQuery(
                "FROM OrderItem oi JOIN FETCH oi.product WHERE oi.order.id = :orderId", 
                OrderItem.class
            );
            query.setParameter("orderId", orderId);
            return query.list();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            Order order = session.get(Order.class, orderId);
            if (order != null) {
                order.setStatus(status);
                session.update(order);
                transaction.commit();
                return order;
            }
            return null;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Order> query = session.createQuery(
                "FROM Order WHERE status = :status ORDER BY createdAt DESC", 
                Order.class
            );
            query.setParameter("status", status);
            return query.list();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}