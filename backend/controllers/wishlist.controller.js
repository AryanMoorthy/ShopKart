const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add a product to user's wishlist
 * @route   POST /wishlist/:productId
 * @access  Private (Protected by auth middleware)
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify that the product actually exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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

    // Check for duplicate entry
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product reference to user's wishlist
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's wishlist with populated product details
 * @route   GET /wishlist
 * @access  Private (Protected by auth middleware)
 */
const getWishlist = async (req, res, next) => {
  try {
    // Find current user and populate wishlist reference array
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out any referenced products that might have been deleted from database
    const activeWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: activeWishlist.length,
      wishlist: activeWishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a product from user's wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private (Protected by auth middleware)
 */
const removeFromWishlist = async (req, res, next) => {
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

    // Find the product in wishlist
    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove the product reference
    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle a product in user's wishlist (Bonus)
 * @route   PATCH /wishlist/:productId/toggle or POST /wishlist/:productId/toggle
 * @access  Private (Protected by auth middleware)
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex !== -1) {
      // Remove
      user.wishlist.splice(itemIndex, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        isWishlisted: false,
        message: 'Product removed from wishlist'
      });
    } else {
      // Add
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        isWishlisted: true,
        message: 'Product added to wishlist'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
};
