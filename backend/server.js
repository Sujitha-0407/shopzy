const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// ---------- PostgreSQL ----------
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
pgPool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL!'))
  .catch(err => console.log('❌ PostgreSQL connection error:', err.message));

// ---------- Redis ----------
const redisClient = redis.createClient({
  socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});
redisClient.on('error', (err) => console.log('❌ Redis error:', err.message));
redisClient.connect()
  .then(() => console.log('✅ Connected to Redis!'))
  .catch(err => console.log('❌ Redis connection failed:', err.message));

// ---------- MinIO ----------
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// ---------- Helpers ----------
function attachImageUrl(product) {
  if (product && product.image_key) {
    product.image_url = product.image_key.startsWith('http')
      ? product.image_key
      : `http://localhost:9000/product/${product.image_key}`;
  }
  return product;
}

function attachImageUrls(products) {
  return products.map(attachImageUrl);
}

// ---------- Auth Middleware ----------
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------- Admin Middleware ----------
async function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pgPool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id]);
    if (!result.rows[0]?.is_admin)
      return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  try {
    const existing = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const result = await pgPool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, phone',
      [name, email, hashed, phone]
    );
    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  try {
    const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid email or password' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      user: { user_id: user.user_id, name: user.name, email: user.email, phone: user.phone },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1 AND is_admin = true',
      [email]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid admin credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Invalid admin credentials' });
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, is_admin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      user: { user_id: user.user_id, name: user.name, email: user.email, is_admin: true },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const [orders, users, products, revenue] = await Promise.all([
      pgPool.query('SELECT COUNT(*) FROM orders'),
      pgPool.query('SELECT COUNT(*) FROM users WHERE is_admin = false OR is_admin IS NULL'),
      pgPool.query('SELECT COUNT(*) FROM products'),
      pgPool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders'),
    ]);
    res.json({
      total_orders: parseInt(orders.rows[0].count),
      total_users: parseInt(users.rows[0].count),
      total_products: parseInt(products.rows[0].count),
      total_revenue: parseFloat(revenue.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', adminMiddleware, async (req, res) => {
  try {
    const result = await pgPool.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id', adminMiddleware, async (req, res) => {
  const { tracking_status, status } = req.body;
  try {
    const result = await pgPool.query(
      'UPDATE orders SET tracking_status = $1, status = $2 WHERE order_id = $3 RETURNING *',
      [tracking_status, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT user_id, name, email, phone, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    await pgPool.query(
      'DELETE FROM users WHERE user_id = $1 AND is_admin = false',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', adminMiddleware, async (req, res) => {
  const { name, description, price, stock, category_id, discount, image_key } = req.body;
  try {
    const result = await pgPool.query(
      `INSERT INTO products (name, description, price, stock, category_id, discount, image_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, stock, category_id, discount || 0, image_key || '']
    );
    await redisClient.del('products');
    res.json(attachImageUrl(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/products/:id', adminMiddleware, async (req, res) => {
  const { name, description, price, stock, category_id, discount, image_key } = req.body;
  try {
    const result = await pgPool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4,
       category_id=$5, discount=$6, image_key=$7 WHERE product_id=$8 RETURNING *`,
      [name, description, price, stock, category_id, discount || 0, image_key || '', req.params.id]
    );
    await redisClient.del('products');
    res.json(attachImageUrl(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', adminMiddleware, async (req, res) => {
  try {
    await pgPool.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);
    await redisClient.del('products');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', adminMiddleware, async (req, res) => {
  const { category_name, icon } = req.body;
  try {
    const result = await pgPool.query(
      'INSERT INTO categories (category_name, icon) VALUES ($1, $2) RETURNING *',
      [category_name, icon || '🛍️']
    );
    await redisClient.del('categories');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', adminMiddleware, async (req, res) => {
  try {
    await pgPool.query('DELETE FROM categories WHERE category_id = $1', [req.params.id]);
    await redisClient.del('categories');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CATEGORY ROUTES
// ==========================================

app.get('/api/categories', async (req, res) => {
  try {
    const cached = await redisClient.get('categories');
    if (cached) return res.json(JSON.parse(cached));
    const result = await pgPool.query('SELECT * FROM categories ORDER BY category_id');
    await redisClient.setEx('categories', 60, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PRODUCT ROUTES
// ==========================================

app.get('/api/products', async (req, res) => {
  try {
    const cached = await redisClient.get('products');
    if (cached) return res.json(attachImageUrls(JSON.parse(cached)));
    const result = await pgPool.query('SELECT * FROM products ORDER BY product_id');
    await redisClient.setEx('products', 60, JSON.stringify(result.rows));
    res.json(attachImageUrls(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/category/:id', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM products WHERE category_id = $1 ORDER BY product_id',
      [req.params.id]
    );
    res.json(attachImageUrls(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(attachImageUrl(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CART ROUTES
// ==========================================

app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const result = await pgPool.query(
      `SELECT c.cart_id, c.quantity, p.*
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = $1`,
      [req.user.user_id]
    );
    res.json(attachImageUrls(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    await pgPool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart.quantity + $3`,
      [req.user.user_id, product_id, quantity || 1]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
  try {
    await pgPool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.user_id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    await pgPool.query('DELETE FROM cart WHERE user_id = $1', [req.user.user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REVIEWS ROUTES
// ==========================================

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const result = await pgPool.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    const existing = await pgPool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.user_id, product_id]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'You have already reviewed this product' });
    const result = await pgPool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.user_id, product_id, rating, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ORDERS ROUTES
// ==========================================

app.post('/api/orders', authMiddleware, async (req, res) => {
  const {
    total_amount, payment_method, address, landmark,
    delivery_name, delivery_email, delivery_phone, items,
  } = req.body;

  if (!total_amount || !payment_method || !address || !delivery_name)
    return res.status(400).json({ error: 'Missing required order fields' });

  try {
    const result = await pgPool.query(
      `INSERT INTO orders
        (user_id, total_amount, payment_method, delivery_address, landmark,
         delivery_name, delivery_email, delivery_phone,
         estimated_delivery, tracking_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
               NOW() + INTERVAL '5 days', 'Order Placed', 'Pending')
       RETURNING *`,
      [req.user.user_id, total_amount, payment_method, address,
       landmark || null, delivery_name, delivery_email || null, delivery_phone || null]
    );
    const order = result.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        const itemPrice = item.discount
          ? Math.round(item.price - (item.price * item.discount) / 100)
          : parseFloat(item.price);
        await pgPool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.order_id, item.product_id, item.quantity, itemPrice]
        );
      }
    }
    console.log(`✅ New order placed: #${order.order_id} for user ${req.user.user_id}`);
    res.json(order);
  } catch (err) {
    console.error('❌ Order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const orderResult = await pgPool.query(
      'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
      [req.params.id, req.user.user_id]
    );
    if (!orderResult.rows[0])
      return res.status(404).json({ error: 'Order not found' });
    const itemsResult = await pgPool.query(
      `SELECT oi.*, p.name, p.image_key
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Backend is running!', timestamp: new Date().toISOString() });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});