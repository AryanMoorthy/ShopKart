const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

dotenv.config();

// Initialize express app
const app = express();

// CORS middleware for frontend development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body parser and cookie parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'ShopKart Authentication API is running...' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server if executed directly
if (require.main === module) {
  connectDB().then(async () => {
    try {
      const Product = require('./models/product.model');
      const count = await Product.countDocuments();
      if (count === 0) {
        const seedProducts = require('./utils/seedProducts');
        // If imported directly, seedProducts has its own connectDB/exit when run directly
        // Here we insert default sample products directly if 0
        const sampleProducts = [
          {
            name: 'Mechanical Gaming Keyboard',
            description: 'Ultra-responsive RGB mechanical keyboard with custom blue clicky switches, aircraft-grade aluminum frame, and detachable USB-C cable.',
            price: 2999,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            stock: 24,
          },
          {
            name: 'Noise Cancelling Headphones',
            description: 'Wireless over-ear headphones with hybrid active noise cancellation, 40-hour battery life, and crystal-clear voice microphones.',
            price: 4999,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            stock: 15,
          },
          {
            name: 'Ergonomic Wireless Mouse',
            description: 'Precision wireless ergonomic mouse with 4000 DPI sensor, quiet click buttons, and dual Bluetooth / 2.4GHz USB connectivity.',
            price: 1499,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
            stock: 30,
          },
          {
            name: 'Classic Denim Jacket',
            description: 'Premium heavyweight cotton denim jacket with tailored fit, vintage copper buttons, and dual chest pockets.',
            price: 3499,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
            stock: 12,
          },
          {
            name: 'Urban Streetwear Hoodie',
            description: 'Heavyweight organic fleece hoodie with kangaroo pocket, ribbed cuffs, and minimalist urban silhouette.',
            price: 1999,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
            stock: 8,
          },
          {
            name: 'Designing Data-Intensive Applications',
            description: 'The definitive guide to the architecture, storage engines, distributed consensus, and reliability of modern data systems.',
            price: 1899,
            category: 'Books',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
            stock: 45,
          },
          {
            name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
            description: 'Master practical principles of writing robust, maintainable, and readable code from software engineering luminary Robert C. Martin.',
            price: 1299,
            category: 'Books',
            image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?w=800&auto=format&fit=crop&q=80',
            stock: 20,
          },
          {
            name: 'Minimalist Ceramic Coffee Mug Set',
            description: 'Set of 2 handcrafted ceramic mugs with matte glazed finish, heat-retention walls, and comfortable ergonomic handles.',
            price: 899,
            category: 'Home',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            stock: 18,
          },
          {
            name: 'Aroma Diffuser & Humidifier',
            description: 'Ultrasonic cool mist essential oil diffuser with ambient LED mood lighting, auto-shutoff, and whisper-quiet operation.',
            price: 1599,
            category: 'Home',
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
            stock: 0,
          },
        ];
        await Product.insertMany(sampleProducts);
        console.log(`Auto-seeded ${sampleProducts.length} initial products.`);
      }
    } catch (e) {
      console.warn('Initial product check warning:', e.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

module.exports = app;
