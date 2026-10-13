const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All order routes are protected by auth middleware
router.use(protect);

// POST /orders/create-payment-order (and alias POST /orders)
router.post('/create-payment-order', createPaymentOrder);
router.post('/', createPaymentOrder);

// POST /orders/verify-payment
router.post('/verify-payment', verifyPayment);

// GET /orders (Get all orders of current user)
router.get('/', getMyOrders);

// GET /orders/:id (Get single order by ID)
router.get('/:id', getOrderById);

// PATCH /orders/:id/status (Bonus development status progression)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
