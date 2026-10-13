const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/product.model');
const connectDB = require('../config/db');

dotenv.config();

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
    stock: 0, // Tests out of stock
  },
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    console.log('Cleared existing products...');

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} sample products into ShopKart!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
