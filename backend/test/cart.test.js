const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../index');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const PORT = 5057;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let mongoServer;
let userACookie = '';
let userBCookie = '';
let productLowStockId = '';
let productNormalStockId = '';
let productOutOfStockId = '';

test.before(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (err) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart_cart_test';
    await mongoose.connect(mongoUri);
  }

  // Clean test DB
  await Customer.deleteMany({});
  await Product.deleteMany({});

  // Seed sample products
  const p1 = await Product.create({
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with clicky switches',
    price: 2999,
    category: 'Electronics',
    image: 'https://example.com/keyboard.jpg',
    stock: 5 // Low stock of 5 units for boundary testing
  });
  productLowStockId = p1._id.toString();

  const p2 = await Product.create({
    name: 'Noise Cancelling Headphones',
    description: 'Wireless ANC headphones with 40h battery',
    price: 4999,
    category: 'Electronics',
    image: 'https://example.com/headphones.jpg',
    stock: 20
  });
  productNormalStockId = p2._id.toString();

  const p3 = await Product.create({
    name: 'Aroma Diffuser',
    description: 'Ultrasonic cool mist essential oil diffuser',
    price: 1599,
    category: 'Home',
    image: 'https://example.com/diffuser.jpg',
    stock: 0 // Out of stock product
  });
  productOutOfStockId = p3._id.toString();

  // Start HTTP Server
  await new Promise((resolve) => {
    server = app.listen(PORT, () => resolve());
  });

  // Register & login User A
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Alice Walker',
      email: 'alice.cart@example.com',
      password: 'Password123',
      phone: '9876543210'
    })
  });

  const resLoginA = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alice.cart@example.com',
      password: 'Password123'
    })
  });
  userACookie = resLoginA.headers.get('set-cookie')?.split(';')[0] || '';

  // Register & login User B
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Bob Smith',
      email: 'bob.cart@example.com',
      password: 'Password123',
      phone: '9876543211'
    })
  });

  const resLoginB = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bob.cart@example.com',
      password: 'Password123'
    })
  });
  userBCookie = resLoginB.headers.get('set-cookie')?.split(';')[0] || '';
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

// ==========================================
// 1. User Schema Verification
// ==========================================
test('Task 1 — User schema contains cart field with product reference and quantity', async () => {
  const schemaPath = Customer.schema.path('cart');
  assert.ok(schemaPath, 'cart field must exist in Customer schema');
  assert.strictEqual(schemaPath.instance, 'Array', 'cart field must be an Array');

  const user = await Customer.findOne({ email: 'alice.cart@example.com' });
  assert.ok(Array.isArray(user.cart), 'User cart must initialize as an array');
});

// ==========================================
// 2. Authentication & Route Security
// ==========================================
test('Security — Cart endpoints reject unauthenticated requests with 401', async () => {
  const resGet = await fetch(`${BASE_URL}/cart`);
  assert.strictEqual(resGet.status, 401, 'GET /cart without token should return 401');

  const resPost = await fetch(`${BASE_URL}/cart/${productLowStockId}`, { method: 'POST' });
  assert.strictEqual(resPost.status, 401, 'POST /cart/:productId without token should return 401');

  const resPatch = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 2 })
  });
  assert.strictEqual(resPatch.status, 401, 'PATCH /cart/:productId without token should return 401');

  const resDelete = await fetch(`${BASE_URL}/cart/${productLowStockId}`, { method: 'DELETE' });
  assert.strictEqual(resDelete.status, 401, 'DELETE /cart/:productId without token should return 401');
});

// ==========================================
// 3. Task 2 — Add Product to Cart API (POST /cart/:productId)
// ==========================================
test('Task 2 — Add to Cart: Reject invalid product ID with 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/cart/invalid-id-format`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Add to Cart: Reject non-existent product with 404 Not Found', async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const res = await fetch(`${BASE_URL}/cart/${fakeId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Add to Cart: Reject out-of-stock product with 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productOutOfStockId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Add to Cart: Successfully add product with initial quantity = 1', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.cart));

  const item = data.cart.find((i) => i.product._id.toString() === productLowStockId);
  assert.ok(item, 'Added product must be present in returned cart');
  assert.strictEqual(item.quantity, 1, 'Initial quantity must be 1');
});

test('Task 2 — Add to Cart: Re-adding the same product increments quantity to 2', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);

  const item = data.cart.find((i) => i.product._id.toString() === productLowStockId);
  assert.strictEqual(item.quantity, 2, 'Quantity must increment to 2');
});

test('Task 2 — Add to Cart: Adding second distinct product creates separate cart entry', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productNormalStockId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.cart.length, 2, 'Cart should now contain 2 distinct items');
});

// ==========================================
// 4. Task 3 — Get Current User Cart (GET /cart)
// ==========================================
test('Task 3 — Get Cart: Returns populated product objects and quantities for authenticated user', async () => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cart.length, 2);

  const keyboardItem = data.cart.find((i) => i.product.name === 'Mechanical Gaming Keyboard');
  assert.ok(keyboardItem, 'Populated product name must match');
  assert.strictEqual(keyboardItem.product.price, 2999, 'Populated product price must match');
  assert.strictEqual(keyboardItem.quantity, 2, 'Quantity must match current state');
});

test('Task 3 — Isolation: User B cart is empty and isolated from User A', async () => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'GET',
    headers: { Cookie: userBCookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cart.length, 0, 'User B cart should be completely empty');
});

// ==========================================
// 5. Task 4 — Update Product Quantity (PATCH /cart/:productId)
// ==========================================
test('Task 4 — Update Quantity: Reject invalid product ID with 400', async () => {
  const res = await fetch(`${BASE_URL}/cart/invalid-id`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 3 })
  });
  assert.strictEqual(res.status, 400);
});

test('Task 4 — Update Quantity: Reject non-integer or invalid quantity with 400', async () => {
  const resNonInt = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 2.5 })
  });
  assert.strictEqual(resNonInt.status, 400);

  const resString = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 'three' })
  });
  assert.strictEqual(resString.status, 400);
});

test('Task 4 — Update Quantity: Reject quantity < 1 with 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 0 })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 4 — Update Quantity: Reject quantity exceeding product stock with 400 Bad Request', async () => {
  // ProductLowStock has stock = 5
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 10 })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 4 — Update Quantity: Reject product not in cart with 404 Not Found', async () => {
  // User B does not have productLowStockId in cart
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userBCookie },
    body: JSON.stringify({ quantity: 3 })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
});

test('Task 4 — Update Quantity: Successfully update product quantity to valid amount (200)', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({ quantity: 4 })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);

  const updatedItem = data.cart.find((i) => i.product._id.toString() === productLowStockId);
  assert.strictEqual(updatedItem.quantity, 4, 'Quantity should be updated to 4');
});

// ==========================================
// 6. Task 5 — Remove Product from Cart (DELETE /cart/:productId)
// ==========================================
test('Task 5 — Remove Product: Reject invalid product ID with 400', async () => {
  const res = await fetch(`${BASE_URL}/cart/invalid-id`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  assert.strictEqual(res.status, 400);
});

test('Task 5 — Remove Product: Reject product not in cart with 404 Not Found', async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const res = await fetch(`${BASE_URL}/cart/${fakeId}`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
});

test('Task 5 — Remove Product: Successfully remove product from user cart (200)', async () => {
  const res = await fetch(`${BASE_URL}/cart/${productLowStockId}`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cart.length, 1, 'Cart should only contain 1 item now');

  const removedExists = data.cart.some((i) => i.product._id.toString() === productLowStockId);
  assert.strictEqual(removedExists, false, 'Removed product must not be in cart');
});

test('Bonus — Clear Cart: Successfully empty entire cart (DELETE /cart)', async () => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cart.length, 0, 'Cart should be empty after clear');
});
