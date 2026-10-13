const mongoose = require('mongoose');
const Product = require('../models/product.model');

/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Public
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate presence of mandatory fields
    if (
      name === undefined || name === null || name === '' ||
      description === undefined || description === null || description === '' ||
      price === undefined || price === null || price === '' ||
      category === undefined || category === null || category === '' ||
      image === undefined || image === null || image === '' ||
      stock === undefined || stock === null || stock === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field. All fields (name, description, price, category, image, stock) are mandatory.',
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validate price > 0
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price. Price must be greater than 0.',
      });
    }

    // Validate stock >= 0
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock. Stock cannot be negative.',
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all products (with optional search, category filter, and sorting)
 * @route   GET /products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const queryFilter = {};

    // Search filter: case-insensitive match on product name
    if (search && typeof search === 'string' && search.trim() !== '') {
      queryFilter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter: match specified category (ignore 'All' or 'All Categories')
    if (
      category &&
      typeof category === 'string' &&
      category.trim() !== '' &&
      category.trim().toLowerCase() !== 'all' &&
      category.trim().toLowerCase() !== 'all categories'
    ) {
      queryFilter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Sorting filter
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(queryFilter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate Mongoose ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
