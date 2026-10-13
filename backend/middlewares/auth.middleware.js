const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
  let token;

  // Read JWT from cookies (or optional Authorization header fallback)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026');

    // Find customer in database (excluding password)
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    // Attach customer object to req.user
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired'
    });
  }
};

module.exports = { protect };
