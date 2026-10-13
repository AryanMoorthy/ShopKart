const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../index');
const Customer = require('../models/customer.model');

const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let mongoServer;
let authCookie = '';

test.before(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (err) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopkart_test';
    await mongoose.connect(mongoUri);
  }

  await Customer.deleteMany({}); // Clean test DB

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
});

test.after(async () => {
  await Customer.deleteMany({});
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Task 1 — Register customer with valid details', async () => {
  const res = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'secretpassword123',
      phone: '9876543210'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Customer registered successfully');
  assert.ok(data.customer._id);
  assert.strictEqual(data.customer.fullName, 'John Doe');
  assert.strictEqual(data.customer.email, 'john.doe@example.com');
  assert.strictEqual(data.customer.phone, '9876543210');
  assert.strictEqual(data.customer.password, undefined); // Password must never be returned
});

test('Task 1 — Reject duplicate email registration with 409', async () => {
  const res = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'John Doe Duplicate',
      email: 'john.doe@example.com',
      password: 'anotherpassword',
      phone: '9876543210'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 409);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Email already exists');
});

test('Task 1 — Reject missing field registration with 400', async () => {
  const res = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123'
      // missing phone
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 1 — Reject short password (< 6 chars) with 400', async () => {
  const res = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Short Pass',
      email: 'shortpass@example.com',
      password: '123',
      phone: '9876543210'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Task 2 — Reject invalid login credentials with 401 without exposing details', async () => {
  const res = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@example.com',
      password: 'wrongpassword'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Invalid credentials');
});

test('Task 2 — Successful login returns HttpOnly cookie', async () => {
  const res = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@example.com',
      password: 'secretpassword123'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Login successful');

  const setCookieHeader = res.headers.get('set-cookie');
  assert.ok(setCookieHeader);
  assert.ok(setCookieHeader.includes('token='));
  assert.ok(setCookieHeader.toLowerCase().includes('httponly'));

  // Save cookie for subsequent protected route tests
  authCookie = setCookieHeader.split(';')[0];
});

test('Task 3 — Reject profile access without authentication cookie with 401', async () => {
  const res = await fetch(`${BASE_URL}/customers/me`, {
    method: 'GET'
  });

  const data = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(data.success, false);
});

test('Task 3 — Access authenticated profile with HttpOnly cookie', async () => {
  const res = await fetch(`${BASE_URL}/customers/me`, {
    method: 'GET',
    headers: {
      Cookie: authCookie
    }
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.fullName, 'John Doe');
  assert.strictEqual(data.email, 'john.doe@example.com');
  assert.strictEqual(data.phone, '9876543210');
  assert.strictEqual(data.password, undefined); // Password must not be exposed
});

test('Bonus — Change Password API', async () => {
  const res = await fetch(`${BASE_URL}/customers/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie
    },
    body: JSON.stringify({
      oldPassword: 'secretpassword123',
      newPassword: 'newsecurepassword456'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Password changed successfully');

  // Verify login with new password
  const newLoginRes = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@example.com',
      password: 'newsecurepassword456'
    })
  });
  assert.strictEqual(newLoginRes.status, 200);
});

test('Task 4 — Logout clears token cookie', async () => {
  const res = await fetch(`${BASE_URL}/customers/logout`, {
    method: 'POST',
    headers: {
      Cookie: authCookie
    }
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.message, 'Logged out successfully');

  const setCookieHeader = res.headers.get('set-cookie');
  assert.ok(setCookieHeader);
  assert.ok(setCookieHeader.includes('token=;'));
});
