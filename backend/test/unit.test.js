const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middlewares/auth.middleware');
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword
} = require('../controllers/customer.controller');

// Helper to create mock res object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    cookies: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    }
  };
  return res;
};

test('Customer Model — Password Hashing Pre-Save Hook & matchPassword', async () => {
  const rawPassword = 'mySecretPassword123';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const mockCustomer = new Customer({
    fullName: 'Test User',
    email: 'test@example.com',
    password: rawPassword,
    phone: '1234567890'
  });

  // Test matchPassword method
  mockCustomer.password = hashedPassword;
  const isMatch = await mockCustomer.matchPassword(rawPassword);
  assert.strictEqual(isMatch, true);

  const isWrong = await mockCustomer.matchPassword('wrongpassword');
  assert.strictEqual(isWrong, false);
});

test('generateToken Utility — Creates valid JWT and HttpOnly cookie', () => {
  const res = createMockRes();
  const customerId = '660000000000000000000001';
  const token = generateToken(res, customerId);

  assert.ok(token);
  assert.ok(res.cookies.token);
  assert.strictEqual(res.cookies.token.value, token);
  assert.strictEqual(res.cookies.token.options.httpOnly, true);
  assert.strictEqual(res.cookies.token.options.sameSite, 'strict');

  // Verify decoded payload
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026');
  assert.strictEqual(decoded.id, customerId);
});

test('Register Controller — Missing mandatory field returns 400', async () => {
  const req = {
    body: {
      fullName: 'John',
      email: 'john@example.com',
      password: 'password123'
      // missing phone
    }
  };
  const res = createMockRes();

  await registerCustomer(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Register Controller — Short password (< 6 chars) returns 400', async () => {
  const req = {
    body: {
      fullName: 'John',
      email: 'john@example.com',
      password: '123',
      phone: '9876543210'
    }
  };
  const res = createMockRes();

  await registerCustomer(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Password must contain at least 6 characters');
});

test('Register Controller — Duplicate email returns 409 Conflict', async () => {
  const originalFindOne = Customer.findOne;
  Customer.findOne = async () => ({ _id: '123', email: 'existing@example.com' });

  const req = {
    body: {
      fullName: 'John',
      email: 'existing@example.com',
      password: 'password123',
      phone: '9876543210'
    }
  };
  const res = createMockRes();

  try {
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Email already exists');
  } finally {
    Customer.findOne = originalFindOne;
  }
});

test('Register Controller — Successful registration returns 201 without password field', async () => {
  const originalFindOne = Customer.findOne;
  const originalCreate = Customer.create;

  Customer.findOne = async () => null;
  Customer.create = async (doc) => ({
    _id: '507f1f77bcf86cd799439011',
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    createdAt: new Date()
  });

  const req = {
    body: {
      fullName: 'John Doe',
      email: 'newuser@example.com',
      password: 'password123',
      phone: '9876543210'
    }
  };
  const res = createMockRes();

  try {
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.customer.fullName, 'John Doe');
    assert.strictEqual(res.body.customer.email, 'newuser@example.com');
    assert.strictEqual(res.body.customer.phone, '9876543210');
    assert.strictEqual(res.body.customer.password, undefined);
  } finally {
    Customer.findOne = originalFindOne;
    Customer.create = originalCreate;
  }
});

test('Login Controller — Invalid email/password returns generic 401 Unauthorized', async () => {
  const originalFindOne = Customer.findOne;
  Customer.findOne = async () => null;

  const req = {
    body: {
      email: 'nonexistent@example.com',
      password: 'password123'
    }
  };
  const res = createMockRes();

  try {
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Invalid credentials');
  } finally {
    Customer.findOne = originalFindOne;
  }
});

test('Login Controller — Valid credentials returns 200 and sets cookie', async () => {
  const originalFindOne = Customer.findOne;
  Customer.findOne = async () => ({
    _id: '507f1f77bcf86cd799439011',
    email: 'valid@example.com',
    matchPassword: async (pwd) => pwd === 'correctpassword'
  });

  const req = {
    body: {
      email: 'valid@example.com',
      password: 'correctpassword'
    }
  };
  const res = createMockRes();

  try {
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Login successful');
    assert.ok(res.cookies.token);
  } finally {
    Customer.findOne = originalFindOne;
  }
});

test('Auth Middleware — Missing token returns 401', async () => {
  const req = { cookies: {}, headers: {} };
  const res = createMockRes();
  let nextCalled = false;

  await protect(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.body.message, 'Not authorized, token missing');
});

test('Auth Middleware — Valid token attaches customer to req.user', async () => {
  const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026');
  const req = { cookies: { token } };
  const res = createMockRes();
  let nextCalled = false;

  const originalFindById = Customer.findById;
  Customer.findById = (id) => ({
    select: (fields) => {
      assert.strictEqual(fields, '-password');
      return {
        _id: '507f1f77bcf86cd799439011',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210'
      };
    }
  });

  try {
    await protect(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.fullName, 'John Doe');
  } finally {
    Customer.findById = originalFindById;
  }
});

test('Profile Controller — Returns user profile without password', async () => {
  const req = {
    user: {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210'
    }
  };
  const res = createMockRes();

  await getProfile(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body._id, '507f1f77bcf86cd799439011');
  assert.strictEqual(res.body.fullName, 'John Doe');
  assert.strictEqual(res.body.email, 'john@example.com');
  assert.strictEqual(res.body.phone, '9876543210');
  assert.strictEqual(res.body.password, undefined);
});

test('Logout Controller — Clears token cookie', async () => {
  const req = {};
  const res = createMockRes();

  await logoutCustomer(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Logged out successfully');
  assert.strictEqual(res.cookies.token.value, '');
});

test('Change Password Controller — Successfully updates password', async () => {
  const originalFindById = Customer.findById;
  let saved = false;

  Customer.findById = async () => ({
    _id: '507f1f77bcf86cd799439011',
    password: 'hashedoldpassword',
    matchPassword: async (pwd) => pwd === 'oldpassword123',
    save: async () => {
      saved = true;
    }
  });

  const req = {
    user: { _id: '507f1f77bcf86cd799439011' },
    body: {
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456'
    }
  };
  const res = createMockRes();

  try {
    await changePassword(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Password changed successfully');
    assert.strictEqual(saved, true);
  } finally {
    Customer.findById = originalFindById;
  }
});
