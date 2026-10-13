const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Product = require('../models/product.model');
const {
  createProduct,
  getProducts,
  getProductById,
} = require('../controllers/product.controller');

// Helper to create mock res object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

test('Product Model — Validation for positive price and non-negative stock', async () => {
  const invalidPriceProduct = new Product({
    name: 'Test Item',
    description: 'Test description',
    price: -10,
    category: 'Electronics',
    image: 'https://example.com/test.jpg',
    stock: 5,
  });

  const priceErr = invalidPriceProduct.validateSync();
  assert.ok(priceErr.errors.price);

  const invalidStockProduct = new Product({
    name: 'Test Item',
    description: 'Test description',
    price: 100,
    category: 'Electronics',
    image: 'https://example.com/test.jpg',
    stock: -5,
  });

  const stockErr = invalidStockProduct.validateSync();
  assert.ok(stockErr.errors.stock);
});

test('Create Product Controller — Missing required field returns 400', async () => {
  const req = {
    body: {
      name: 'Mechanical Keyboard',
      price: 2999,
      category: 'Electronics',
      // missing description, image, stock
    },
  };
  const res = createMockRes();

  await createProduct(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Invalid price (<= 0) returns 400', async () => {
  const req = {
    body: {
      name: 'Wireless Mouse',
      description: 'Ergonomic mouse',
      price: 0,
      category: 'Electronics',
      image: 'https://example.com/mouse.jpg',
      stock: 10,
    },
  };
  const res = createMockRes();

  await createProduct(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Invalid stock (< 0) returns 400', async () => {
  const req = {
    body: {
      name: 'Wireless Mouse',
      description: 'Ergonomic mouse',
      price: 499,
      category: 'Electronics',
      image: 'https://example.com/mouse.jpg',
      stock: -1,
    },
  };
  const res = createMockRes();

  await createProduct(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Successful product creation returns 201', async () => {
  const originalCreate = Product.create;

  Product.create = async (doc) => ({
    _id: '66d123abc456789012345678',
    ...doc,
    createdAt: new Date(),
  });

  const req = {
    body: {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches.',
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/keyboard.jpg',
      stock: 10,
    },
  };
  const res = createMockRes();

  try {
    await createProduct(req, res, () => {});
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product.name, 'Mechanical Keyboard');
    assert.strictEqual(res.body.product.price, 2999);
  } finally {
    Product.create = originalCreate;
  }
});

test('Get All Products Controller — Returns product list with count', async () => {
  const originalFind = Product.find;

  Product.find = (filter) => ({
    sort: (sortOptions) => [
      { _id: '1', name: 'Mechanical Keyboard', price: 2999, category: 'Electronics' },
      { _id: '2', name: 'Noise Cancelling Headphones', price: 4999, category: 'Electronics' },
    ],
  });

  const req = { query: {} };
  const res = createMockRes();

  try {
    await getProducts(req, res, () => {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 2);
    assert.strictEqual(res.body.products.length, 2);
  } finally {
    Product.find = originalFind;
  }
});

test('Get All Products Controller — Filter by search and category query params', async () => {
  const originalFind = Product.find;
  let capturedFilter = null;
  let capturedSort = null;

  Product.find = (filter) => {
    capturedFilter = filter;
    return {
      sort: (sortOptions) => {
        capturedSort = sortOptions;
        return [
          { _id: '1', name: 'Mechanical Keyboard', price: 2999, category: 'Electronics' },
        ];
      },
    };
  };

  const req = {
    query: {
      search: 'keyboard',
      category: 'Electronics',
      sort: 'price_asc',
    },
  };
  const res = createMockRes();

  try {
    await getProducts(req, res, () => {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(capturedFilter.name);
    assert.ok(capturedFilter.category);
    assert.deepStrictEqual(capturedSort, { price: 1 });
  } finally {
    Product.find = originalFind;
  }
});

test('Get Single Product Controller — Invalid product ID returns 400', async () => {
  const req = { params: { id: 'invalid-id-123' } };
  const res = createMockRes();

  await getProductById(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Invalid product ID');
});

test('Get Single Product Controller — Product not found returns 404', async () => {
  const originalFindById = Product.findById;
  Product.findById = async () => null;

  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId } };
  const res = createMockRes();

  try {
    await getProductById(req, res, () => {});
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Product not found');
  } finally {
    Product.findById = originalFindById;
  }
});

test('Get Single Product Controller — Valid ID returns product (200)', async () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const mockProduct = {
    _id: validId,
    name: 'Mechanical Keyboard',
    price: 2999,
    category: 'Electronics',
    description: 'Awesome keyboard',
    stock: 10,
  };

  const originalFindById = Product.findById;
  Product.findById = async (id) => mockProduct;

  const req = { params: { id: validId } };
  const res = createMockRes();

  try {
    await getProductById(req, res, () => {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product.name, 'Mechanical Keyboard');
  } finally {
    Product.findById = originalFindById;
  }
});
