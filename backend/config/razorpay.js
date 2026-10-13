const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173ShopKart01',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key_2026'
});

module.exports = razorpay;
