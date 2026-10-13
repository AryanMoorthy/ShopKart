const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../index');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

const PORT = 5058;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let mongoServer;
let userACookie = '';
let userBCookie = '';
let productAId = '';
let productBId = '';
let productLowStockId = '';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key_2026';

test.before(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (err) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart_order_test';
    await mongoose.connect(mongoUri);
  }

  // Clean DB
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Seed sample products
  const p1 = await Product.create({
    name: 'Mechanical Keyboard',
    description: 'RGB Mechanical Gaming Keyboard',
    price: 2999,
    category: 'Electronics',
    image: 'https://example.com/keyboard.jpg',
    stock: 10
  });
  productAId = p1._id.toString();

  const p2 = await Product.create({
    name: 'Ergonomic Mouse',
    description: 'Wireless Precision Mouse',
    price: 1499,
    category: 'Electronics',
    image: 'https://example.com/mouse.jpg',
    stock: 20
  });
  productBId = p2._id.toString();

  const p3 = await Product.create({
    name: 'Limited Edition Deskmat',
    description: 'Custom stitched deskmat',
    price: 899,
    category: 'Electronics',
    image: 'https://example.com/deskmat.jpg',
    stock: 2 // Low stock
  });
  productLowStockId = p3._id.toString();

  // Start HTTP test server
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });

  // Register and Login User A
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Aarav Sharma',
      email: 'aarav@shopkart.com',
      password: 'password123',
      phone: '9876543210'
    })
  });

  const loginResA = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav@shopkart.com',
      password: 'password123'
    })
  });
  userACookie = loginResA.headers.get('set-cookie') || '';

  // Register and Login User B
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Bhavna Patel',
      email: 'bhavna@shopkart.com',
      password: 'password123',
      phone: '9876543211'
    })
  });

  const loginResB = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bhavna@shopkart.com',
      password: 'password123'
    })
  });
  userBCookie = loginResB.headers.get('set-cookie') || '';
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('Test 1 — Unauthenticated request is rejected with 401', async () => {
  const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });

  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Test 2 — Empty cart checkout returns 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.match(data.message, /empty/i);
});

test('Test 3 — Invalid shipping address is rejected with 400 Bad Request', async () => {
  // Add item to User A cart first
  await fetch(`${BASE_URL}/cart/${productAId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });

  // Test with invalid pincode (only 4 digits)
  const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '5600' // Invalid 4 digits
      }
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.match(data.message, /pincode/i);
});

test('Test 4 — Insufficient stock rejects order creation with 400 Bad Request', async () => {
  // Add 1 deskmat to User A cart
  await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });

  // Artificially change product stock in DB to 0
  await Product.findByIdAndUpdate(productLowStockId, { stock: 0 });

  const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.match(data.message, /insufficient stock/i);

  // Restore stock and clean user cart for next tests
  await Product.findByIdAndUpdate(productLowStockId, { stock: 2 });
  await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
});

test('Test 5 — Create payment order creates pending order, calculates server total & ignores fake total', async () => {
  // Clear cart and add 2x Keyboard (2 * 2999 = 5998) + 1x Mouse (1499) -> Total = 7497
  await fetch(`${BASE_URL}/cart`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  await fetch(`${BASE_URL}/cart/${productAId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  await fetch(`${BASE_URL}/cart/${productAId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 2 })
  });
  await fetch(`${BASE_URL}/cart/${productBId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });

  // Client attempts to send malicious totalAmount: 1
  const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      totalAmount: 1, // Fake total - MUST BE IGNORED
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.shopKartOrderId);
  assert.ok(data.razorpayOrderId);
  assert.strictEqual(data.amount, 749700); // 7497 * 100 paise
  assert.strictEqual(data.currency, 'INR');

  // Verify DB state of order
  const dbOrder = await Order.findById(data.shopKartOrderId);
  assert.ok(dbOrder);
  assert.strictEqual(dbOrder.totalAmount, 7497); // Server calculated total
  assert.strictEqual(dbOrder.paymentStatus, 'PENDING');
  assert.strictEqual(dbOrder.status, 'PENDING_PAYMENT');
  assert.strictEqual(dbOrder.items.length, 2);
  assert.strictEqual(dbOrder.items[0].name, 'Mechanical Keyboard');
  assert.strictEqual(dbOrder.items[0].price, 2999);
  assert.strictEqual(dbOrder.items[0].quantity, 2);
});

test('Test 6 — Cart remains populated before payment verification', async () => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cart.length, 2); // 2 distinct items still in cart
});

test('Test 7 — Fake payment verification signature is rejected with 400', async () => {
  // Get the latest pending order
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const ordersData = await ordersRes.json();
  const pendingOrder = ordersData.orders[0];

  const res = await fetch(`${BASE_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      shopKartOrderId: pendingOrder._id,
      razorpay_order_id: pendingOrder.razorpayOrderId,
      razorpay_payment_id: 'pay_fake_123',
      razorpay_signature: 'invalid_tampered_signature'
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.match(data.message, /invalid payment signature/i);

  // Cart must still be intact
  const cartRes = await fetch(`${BASE_URL}/cart`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const cartData = await cartRes.json();
  assert.strictEqual(cartData.cart.length, 2);
});

test('Test 8 — Valid signature marks order PAID/PLACED and clears user cart', async () => {
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const ordersData = await ordersRes.json();
  const pendingOrder = ordersData.orders[0];

  // Generate valid HMAC SHA256 signature
  const fakePaymentId = `pay_${Date.now()}`;
  const signatureBody = `${pendingOrder.razorpayOrderId}|${fakePaymentId}`;
  const validSignature = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(signatureBody)
    .digest('hex');

  const res = await fetch(`${BASE_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({
      shopKartOrderId: pendingOrder._id,
      razorpay_order_id: pendingOrder.razorpayOrderId,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSignature
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.order.paymentStatus, 'PAID');
  assert.strictEqual(data.order.status, 'PLACED');
  assert.strictEqual(data.order.razorpayPaymentId, fakePaymentId);

  // Verify user cart in DB is now empty
  const cartRes = await fetch(`${BASE_URL}/cart`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const cartData = await cartRes.json();
  assert.strictEqual(cartData.cart.length, 0);
});

test('Test 9 — Get Orders returns authenticated user orders sorted newest first', async () => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.orders));
  assert.ok(data.orders.length >= 1);
  assert.strictEqual(data.orders[0].paymentStatus, 'PAID');
  assert.strictEqual(data.orders[0].status, 'PLACED');
});

test('Test 10 — Access another user’s order returns 403 Forbidden', async () => {
  // Get User A's order ID
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const ordersData = await ordersRes.json();
  const userAOrderId = ordersData.orders[0]._id;

  // Attempt to access User A's order using User B's cookie
  const res = await fetch(`${BASE_URL}/orders/${userAOrderId}`, {
    method: 'GET',
    headers: { Cookie: userBCookie }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.match(data.message, /access denied/i);
});

test('Test 11 — Single order fetch for owner returns order details with snapshots', async () => {
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const ordersData = await ordersRes.json();
  const userAOrderId = ordersData.orders[0]._id;

  const res = await fetch(`${BASE_URL}/orders/${userAOrderId}`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.order._id, userAOrderId);
  assert.strictEqual(data.order.items.length, 2);
  assert.strictEqual(data.order.items[0].name, 'Mechanical Keyboard');
  assert.strictEqual(data.order.totalAmount, 7497);
});

test('Test 12 — Bonus: Update order status succeeds for valid status', async () => {
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const ordersData = await ordersRes.json();
  const userAOrderId = ordersData.orders[0]._id;

  const res = await fetch(`${BASE_URL}/orders/${userAOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userACookie
    },
    body: JSON.stringify({ status: 'CONFIRMED' })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.order.status, 'CONFIRMED');
});
