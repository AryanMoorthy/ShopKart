const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add a product to user's cart (or increment quantity if already present)
 * @route   POST /cart/:productId
 * @access  Private (Protected by auth middleware)
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify product exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // Get current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is already in the cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // If already present, validate stock before incrementing
      const currentQty = user.cart[existingItemIndex].quantity;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} units available)`
        });
      }
      user.cart[existingItemIndex].quantity += 1;
    } else {
      // Add new cart entry with quantity = 1
      user.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await user.save();

    // Populate product details for response
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock'
    });

    const activeCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: activeCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's cart with populated product details
 * @route   GET /cart
 * @access  Private (Protected by auth middleware)
 */
const getCart = async (req, res, next) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out any referenced products that might have been deleted from database
    const activeCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      count: activeCart.length,
      cart: activeCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product quantity in user's cart
 * @route   PATCH /cart/:productId
 * @access  Private (Protected by auth middleware)
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Validate quantity is a valid integer number
    if (typeof quantity !== 'number' || isNaN(quantity) || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid integer number'
      });
    }

    // Validate quantity is at least 1
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate quantity against product stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} available)`
      });
    }

    // Get current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Locate product in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    // Update quantity
    user.cart[itemIndex].quantity = quantity;
    await user.save();

    // Populate product details for response
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock'
    });

    const activeCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: activeCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a product from user's cart
 * @route   DELETE /cart/:productId
 * @access  Private (Protected by auth middleware)
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Locate product in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    // Remove the product entry
    user.cart.splice(itemIndex, 1);
    await user.save();

    // Populate product details for response
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock'
    });

    const activeCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: activeCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all products from current user's cart (Bonus helper)
 * @route   DELETE /cart
 * @access  Private (Protected by auth middleware)
 */
const clearCart = async (req, res, next) => {
  try {
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
