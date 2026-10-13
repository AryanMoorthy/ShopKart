const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(protect);

// GET /cart - Get current user's cart
router.get('/', getCart);

// POST /cart/:productId - Add product to cart (or increment quantity)
router.post('/:productId', addToCart);

// PATCH /cart/:productId - Update product quantity in cart
router.patch('/:productId', updateCartQuantity);

// DELETE /cart/:productId - Remove product from cart
router.delete('/:productId', removeFromCart);

// DELETE /cart - Clear user's entire cart
router.delete('/', clearCart);

module.exports = router;
