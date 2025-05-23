
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Shopping cart table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Chat messages table
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, email, password, full_name, role) VALUES 
('admin', 'admin@grocery.com', 'admin123', 'System Administrator', 'ADMIN'),
('john_doe', 'john@email.com', 'password123', 'John Doe', 'USER');

INSERT INTO categories (name, description, image_url) VALUES 
('Fruits', 'Fresh fruits and seasonal produce', 'images/fruits.jpg'),
('Vegetables', 'Fresh vegetables and greens', 'images/vegetables.jpg'),
('Dairy', 'Milk, cheese, yogurt and dairy products', 'images/dairy.jpg'),
('Bakery', 'Fresh bread, cakes and baked goods', 'images/bakery.jpg'),
('Beverages', 'Drinks, juices and beverages', 'images/beverages.jpg');

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES 
('Fresh Apples', 'Red delicious apples - 1kg', 3.99, 100, 1, 'images/apples.jpg'),
('Bananas', 'Fresh bananas - 1kg', 2.49, 150, 1, 'images/bananas.jpg'),
('Carrots', 'Fresh carrots - 500g', 1.99, 80, 2, 'images/carrots.jpg'),
('Spinach', 'Fresh spinach leaves - 250g', 2.99, 50, 2, 'images/spinach.jpg'),
('Whole Milk', 'Fresh whole milk - 1L', 2.79, 200, 3, 'images/milk.jpg'),
('Cheddar Cheese', 'Aged cheddar cheese - 200g', 4.99, 30, 3, 'images/cheese.jpg'),
('White Bread', 'Fresh white bread loaf', 2.49, 60, 4, 'images/bread.jpg'),
('Orange Juice', 'Fresh orange juice - 1L', 3.99, 75, 5, 'images/orange_juice.jpg');