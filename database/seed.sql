-- Categories
INSERT INTO categories (category_name, icon) VALUES
('Electronics', '📱'),
('Fashion', '👕'),
('Home & Kitchen', '🍳'),
('Books', '📚'),
('Beauty & Personal Care', '💄'),
('Sports & Fitness', '🏋️'),
('Toys & Games', '🧸'),
('Grocery', '🛒');

-- Products (Electronics)
INSERT INTO products (name, description, price, stock, category_id) VALUES
('Wireless Bluetooth Earbuds', 'Noise-cancelling earbuds with 24hr battery', 1999.00, 50, 1),
('Smartphone 128GB', 'Latest Android smartphone with 5G support', 18999.00, 30, 1),
('Laptop 15.6 inch', 'Intel i5, 8GB RAM, 512GB SSD', 45999.00, 15, 1),
('Smartwatch', 'Fitness tracker with heart rate monitor', 2499.00, 40, 1),
('Bluetooth Speaker', 'Portable waterproof speaker', 1499.00, 60, 1),
('Power Bank 20000mAh', 'Fast charging power bank', 1299.00, 70, 1),
('Wireless Mouse', 'Ergonomic wireless mouse', 599.00, 90, 1),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard', 2999.00, 35, 1),

-- Fashion
('Men Cotton T-Shirt', 'Comfortable round neck t-shirt', 499.00, 100, 2),
('Women Kurti', 'Printed cotton kurti for daily wear', 799.00, 80, 2),
('Denim Jeans', 'Slim fit stretchable jeans', 1299.00, 60, 2),
('Running Shoes', 'Lightweight sports shoes', 1899.00, 45, 2),
('Leather Wallet', 'Genuine leather bifold wallet', 899.00, 55, 2),
('Sunglasses', 'UV protected stylish sunglasses', 699.00, 65, 2),

-- Home & Kitchen
('Non-Stick Cookware Set', '5-piece non-stick cookware set', 2199.00, 25, 3),
('LED Table Lamp', 'Adjustable brightness LED lamp', 699.00, 70, 3),
('Mixer Grinder', '750W mixer grinder with 3 jars', 2999.00, 20, 3),
('Bedsheet Set', 'King size cotton bedsheet with pillow covers', 1199.00, 40, 3),
('Air Fryer', '4L digital air fryer', 3499.00, 18, 3),

-- Books
('The Alchemist', 'Bestselling novel by Paulo Coelho', 299.00, 90, 4),
('Atomic Habits', 'Self-help book by James Clear', 399.00, 75, 4),
('Rich Dad Poor Dad', 'Personal finance classic', 349.00, 60, 4),
('Sapiens', 'A brief history of humankind', 449.00, 50, 4),

-- Beauty & Personal Care
('Face Wash 100ml', 'Herbal face wash for all skin types', 199.00, 120, 5),
('Hair Serum', 'Anti-frizz hair serum 50ml', 349.00, 65, 5),
('Sunscreen SPF 50', 'Broad spectrum sunscreen lotion', 449.00, 80, 5),
('Lipstick Set', 'Matte finish lipstick combo pack', 599.00, 45, 5),

-- Sports & Fitness
('Yoga Mat', 'Anti-slip yoga mat 6mm thick', 599.00, 55, 6),
('Dumbbells Set 10kg', 'Adjustable dumbbell pair', 1599.00, 30, 6),
('Resistance Bands', 'Set of 5 resistance bands', 499.00, 70, 6),
('Cricket Bat', 'English willow cricket bat', 2499.00, 20, 6),

-- Toys & Games
('Remote Control Car', 'Rechargeable RC car for kids', 1199.00, 35, 7),
('Building Blocks Set', '200-piece creative building blocks', 899.00, 50, 7),
('Puzzle Game 1000pc', 'Jigsaw puzzle for adults', 599.00, 40, 7),

-- Grocery
('Basmati Rice 5kg', 'Premium long grain basmati rice', 549.00, 100, 8),
('Organic Honey 500g', 'Pure organic honey', 299.00, 80, 8),
('Cold Pressed Coconut Oil', '1L cold pressed coconut oil', 399.00, 60, 8),
('Mixed Dry Fruits 500g', 'Premium quality dry fruits combo', 899.00, 45, 8);