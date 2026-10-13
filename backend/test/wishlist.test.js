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

const PORT = 5056;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let mongoServer;
let userACookie = '';
let userBCookie = '';
let sampleProductId1 = '';
let sampleProductId2 = '';

test.before(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (err) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart_wishlist_test';
    await mongoose.connect(mongoUri);
  }

  // Clean test DB
  await Customer.deleteMany({});
  await Product.deleteMany({});

  // Seed sample products
  const p1 = await Product.create({
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard',
    price: 2999,
    category: 'Electronics',
    image: 'https://example.com/keyboard.jpg',
    stock: 15
  });
  sampleProductId1 = p1._id.toString();

  const p2 = await Product.create({
    name: 'Noise Cancelling Headphones',
    description: 'Wireless ANC headphones',
    price: 4999,
    category: 'Electronics',
    image: 'https://example.com/headphones.jpg',
    stock: 8
  });
  sampleProductId2 = p2._id.toString();

  // Start HTTP Server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  // Register and login User A
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Alice Tester',
      email: 'alice@example.com',
      password: 'password123',
      phone: '9999999991'
    })
  });
  const resLoginA = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alice@example.com',
      password: 'password123'
    })
  });
  const cookieAHeader = resLoginA.headers.get('set-cookie');
  userACookie = cookieAHeader.split(';')[0];

  // Register and login User B
  await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Bob Tester',
      email: 'bob@example.com',
      password: 'password123',
      phone: '9999999992'
    })
  });
  const resLoginB = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bob@example.com',
      password: 'password123'
    })
  });
  const cookieBHeader = resLoginB.headers.get('set-cookie');
  userBCookie = cookieBHeader.split(';')[0];
});

test.after(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Task 1 — User schema contains wishlist referencing Product', () => {
  const schemaPath = Customer.schema.path('wishlist');
  assert.ok(schemaPath, 'wishlist field must exist on Customer schema');
  assert.strictEqual(schemaPath.caster.instance.toLowerCase(), 'objectid', 'wishlist items should be ObjectIds');
  assert.strictEqual(schemaPath.caster.options.ref, 'Product', 'wishlist items should reference Product');
});

test('Security — Wishlist endpoints reject unauthenticated requests with 401', async () => {
  const getRes = await fetch(`${BASE_URL}/wishlist`);
  assert.strictEqual(getRes.status, 401);

  const postRes = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'POST'
  });
  assert.strictEqual(postRes.status, 401);

  const deleteRes = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'DELETE'
  });
  assert.strictEqual(deleteRes.status, 401);
});

test('Task 2 — Add Product to Wishlist: Reject invalid product ID with 400', async () => {
  const res = await fetch(`${BASE_URL}/wishlist/invalid-id-xyz`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Add Product to Wishlist: Reject non-existent product with 404', async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const res = await fetch(`${BASE_URL}/wishlist/${fakeId}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Add Product to Wishlist: Successfully save product reference (200/201)', async () => {
  const res = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Product added to wishlist');
});

test('Task 2 — Add Product to Wishlist: Reject duplicate product with 409 Conflict', async () => {
  const res = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 409);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Product already in wishlist');
});

test('Task 3 — Get Wishlist: Returns populated products for authenticated user', async () => {
  // Add second product to Alice's wishlist
  await fetch(`${BASE_URL}/wishlist/${sampleProductId2}`, {
    method: 'POST',
    headers: { Cookie: userACookie }
  });

  const res = await fetch(`${BASE_URL}/wishlist`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.count, 2);
  assert.strictEqual(data.wishlist.length, 2);

  // Check populated fields
  const item1 = data.wishlist.find((p) => p._id === sampleProductId1);
  assert.ok(item1);
  assert.strictEqual(item1.name, 'Mechanical Gaming Keyboard');
  assert.strictEqual(item1.price, 2999);
  assert.strictEqual(item1.category, 'Electronics');
  assert.strictEqual(item1.stock, 15);
});

test('Isolation — User B wishlist is empty and isolated from User A', async () => {
  const res = await fetch(`${BASE_URL}/wishlist`, {
    method: 'GET',
    headers: { Cookie: userBCookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.count, 0);
  assert.strictEqual(data.wishlist.length, 0);
});

test('Task 4 — Remove Product from Wishlist: Reject invalid ID with 400', async () => {
  const res = await fetch(`${BASE_URL}/wishlist/not-a-valid-id`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 4 — Remove Product from Wishlist: Reject product not in wishlist with 404', async () => {
  // User B tries to remove a product they haven't saved
  const res = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'DELETE',
    headers: { Cookie: userBCookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Product not found in wishlist');
});

test('Task 4 — Remove Product from Wishlist: Successfully remove product (200)', async () => {
  const res = await fetch(`${BASE_URL}/wishlist/${sampleProductId1}`, {
    method: 'DELETE',
    headers: { Cookie: userACookie }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Product removed from wishlist');

  // Verify it is removed from GET /wishlist
  const getRes = await fetch(`${BASE_URL}/wishlist`, {
    method: 'GET',
    headers: { Cookie: userACookie }
  });
  const getData = await getRes.json();
  assert.strictEqual(getData.count, 1);
  assert.strictEqual(getData.wishlist[0]._id, sampleProductId2);
});

test('Bonus — Wishlist Toggle API (PATCH /wishlist/:productId/toggle)', async () => {
  // Toggle remove remaining sampleProductId2
  const toggleOffRes = await fetch(`${BASE_URL}/wishlist/${sampleProductId2}/toggle`, {
    method: 'PATCH',
    headers: { Cookie: userACookie }
  });
  const toggleOffData = await toggleOffRes.json();
  assert.strictEqual(toggleOffRes.status, 200);
  assert.strictEqual(toggleOffData.isWishlisted, false);

  // Toggle on sampleProductId2
  const toggleOnRes = await fetch(`${BASE_URL}/wishlist/${sampleProductId2}/toggle`, {
    method: 'PATCH',
    headers: { Cookie: userACookie }
  });
  const toggleOnData = await toggleOnRes.json();
  assert.strictEqual(toggleOnRes.status, 200);
  assert.strictEqual(toggleOnData.isWishlisted, true);
});
